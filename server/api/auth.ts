import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb, eq } from "../utils/db";
import { usersTable } from "../../lib/schema/users.sql";
import { errors } from "../middleware/error-handler";
import { strictRateLimiter } from "../middleware/rate-limiter";

const auth = new Hono();

// JWT Secret (in production this should be from environment variables)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Validation schemas
const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

// Apply strict rate limiting to auth endpoints
auth.use("*", strictRateLimiter);

// Register endpoint
auth.post("/register", zValidator("json", registerSchema), async (c) => {
  try {
    const { username, email, password } = c.req.valid("json");
    const db = await getDb();

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw errors.conflict("User with this email already exists");
    }

    // Check if username is taken
    const existingUsername = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (existingUsername.length > 0) {
      throw errors.conflict("Username is already taken");
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await db
      .insert(usersTable)
      .values({
        username,
        email,
        passwordHash,
      })
      .returning({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
      });

    const user = newUser[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return c.json(
      {
        message: "User registered successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
      201
    );
  } catch (error) {
    throw error;
  }
});

// Login endpoint
auth.post("/login", zValidator("json", loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid("json");
    const db = await getDb();

    // Find user by email
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (users.length === 0) {
      throw errors.unauthorized("Invalid email or password");
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw errors.unauthorized("Invalid email or password");
    }

    // Update last login
    await db
      .update(usersTable)
      .set({ lastLoginAt: new Date() })
      .where(eq(usersTable.id, user.id));

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return c.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        lastLoginAt: new Date(),
      },
      token,
    });
  } catch (error) {
    throw error;
  }
});

// Verify token endpoint
auth.get("/verify", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw errors.unauthorized("No token provided");
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const db = await getDb();
    const users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
        lastLoginAt: usersTable.lastLoginAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    if (users.length === 0) {
      throw errors.unauthorized("User not found");
    }

    return c.json({
      valid: true,
      user: users[0],
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw errors.unauthorized("Invalid token");
    }
    throw error;
  }
});

// Logout endpoint (for completeness, JWT is stateless so this is mainly for client-side cleanup)
auth.post("/logout", async (c) => {
  // In a stateless JWT setup, logout is handled client-side by removing the token
  // In the future, we could implement token blacklisting here
  return c.json({
    message: "Logout successful",
  });
});

// Get current user profile
auth.get("/me", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw errors.unauthorized("No token provided");
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const db = await getDb();
    const users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
        lastLoginAt: usersTable.lastLoginAt,
        emailVerifiedAt: usersTable.emailVerifiedAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    if (users.length === 0) {
      throw errors.unauthorized("User not found");
    }

    return c.json({
      user: users[0],
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw errors.unauthorized("Invalid token");
    }
    throw error;
  }
});

export { auth as authRoutes };
