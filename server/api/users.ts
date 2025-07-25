import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb, eq, like, ilike, desc } from "../utils/db.ts";
import { usersTable } from "../../lib/schema/users.sql.ts";
import { errors } from "../middleware/error-handler.ts";
import { readRateLimiter } from "../middleware/rate-limiter.ts";

const users = new Hono();

// JWT Secret (should match auth.ts)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Validation schemas
const updateProfileSchema = z
  .object({
    username: z
      .string()
      .min(3)
      .max(50)
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      )
      .optional(),
    email: z.string().email().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

const searchUsersSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 50, "Limit must be between 1 and 50")
    .optional(),
  offset: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => val >= 0, "Offset must be 0 or greater")
    .optional(),
});

// Authentication middleware
const requireAuth = async (c: any, next: any) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw errors.unauthorized("No token provided");
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Set user info in context
    c.set("userId", decoded.userId);
    c.set("username", decoded.username);
    c.set("userEmail", decoded.email);

    await next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw errors.unauthorized("Invalid token");
    }
    throw error;
  }
};

// Apply rate limiting to read operations
users.use("/search", readRateLimiter);
users.use("/:id", readRateLimiter);

// Get user by ID (public endpoint)
users.get("/:id", async (c) => {
  try {
    const userId = c.req.param("id");
    const db = await getDb();

    const userResults = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        createdAt: usersTable.createdAt,
        // Note: We don't return sensitive information like email in public endpoints
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (userResults.length === 0) {
      throw errors.notFound("User");
    }

    return c.json({
      user: userResults[0],
    });
  } catch (error) {
    throw error;
  }
});

// Get user by username (public endpoint)
users.get("/username/:username", async (c) => {
  try {
    const username = c.req.param("username");
    const db = await getDb();

    const userResults = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (userResults.length === 0) {
      throw errors.notFound("User");
    }

    return c.json({
      user: userResults[0],
    });
  } catch (error) {
    throw error;
  }
});

// Search users (public endpoint)
users.get("/search", zValidator("query", searchUsersSchema), async (c) => {
  try {
    const { q, limit = 10, offset = 0 } = c.req.valid("query");
    const db = await getDb();

    const searchResults = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(ilike(usersTable.username, `%${q}%`))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(usersTable.createdAt));

    return c.json({
      users: searchResults,
      query: q,
      limit,
      offset,
      count: searchResults.length,
    });
  } catch (error) {
    throw error;
  }
});

// Update user profile (protected)
users.patch(
  "/profile",
  requireAuth,
  zValidator("json", updateProfileSchema),
  async (c) => {
    try {
      const updates = c.req.valid("json");
      const userId = c.get("userId");
      const db = await getDb();

      // Check if username is being updated and if it's already taken
      if (updates.username) {
        const existingUser = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.username, updates.username))
          .limit(1);

        if (existingUser.length > 0 && existingUser[0].id !== userId) {
          throw errors.conflict("Username is already taken");
        }
      }

      // Check if email is being updated and if it's already taken
      if (updates.email) {
        const existingUser = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, updates.email))
          .limit(1);

        if (existingUser.length > 0 && existingUser[0].id !== userId) {
          throw errors.conflict("Email is already taken");
        }
      }

      // Update user
      const updatedUser = await db
        .update(usersTable)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userId))
        .returning({
          id: usersTable.id,
          username: usersTable.username,
          email: usersTable.email,
          updatedAt: usersTable.updatedAt,
        });

      if (updatedUser.length === 0) {
        throw errors.notFound("User");
      }

      return c.json({
        message: "Profile updated successfully",
        user: updatedUser[0],
      });
    } catch (error) {
      throw error;
    }
  }
);

// Change password (protected)
users.patch(
  "/password",
  requireAuth,
  zValidator("json", changePasswordSchema),
  async (c) => {
    try {
      const { currentPassword, newPassword } = c.req.valid("json");
      const userId = c.get("userId");
      const db = await getDb();

      // Get current user with password hash
      const userResults = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      if (userResults.length === 0) {
        throw errors.notFound("User");
      }

      const user = userResults[0];

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );
      if (!isValidPassword) {
        throw errors.unauthorized("Current password is incorrect");
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await db
        .update(usersTable)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userId));

      return c.json({
        message: "Password changed successfully",
      });
    } catch (error) {
      throw error;
    }
  }
);

// Delete user account (protected)
users.delete("/account", requireAuth, async (c) => {
  try {
    const userId = c.get("userId");
    const db = await getDb();

    // Delete user
    const deletedUsers = await db
      .delete(usersTable)
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id });

    if (deletedUsers.length === 0) {
      throw errors.notFound("User");
    }

    return c.json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    throw error;
  }
});

// Get user statistics (protected - returns own stats)
users.get("/stats", requireAuth, async (c) => {
  try {
    const userId = c.get("userId");
    const db = await getDb();

    // Get user info
    const userResults = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
        lastLoginAt: usersTable.lastLoginAt,
        emailVerifiedAt: usersTable.emailVerifiedAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (userResults.length === 0) {
      throw errors.notFound("User");
    }

    const user = userResults[0];

    // In the future, we'll add stats like:
    // - Post count
    // - Follower count
    // - Following count
    // - Total earnings
    // For now, return basic info

    return c.json({
      user,
      stats: {
        postsCount: 0, // Placeholder
        followersCount: 0, // Placeholder
        followingCount: 0, // Placeholder
        totalEarnings: 0, // Placeholder
        accountAge: Math.floor(
          (Date.now() - new Date(user.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        ), // Days since creation
        emailVerified: !!user.emailVerifiedAt,
      },
    });
  } catch (error) {
    throw error;
  }
});

export { users as usersRoutes };
