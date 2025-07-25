import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { getDb, eq, desc } from "../utils/db";
import { errors } from "../middleware/error-handler";
import { uploadRateLimiter, readRateLimiter } from "../middleware/rate-limiter";

const media = new Hono();

// JWT Secret (should match auth.ts)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Validation schemas
const uploadMetadataSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  size: z
    .number()
    .min(1)
    .max(100 * 1024 * 1024), // 100MB max
  alt: z.string().max(500).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(["public", "private", "unlisted"]).default("public"),
});

const searchMediaSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  type: z.enum(["image", "video", "audio", "document", "other"]).optional(),
  tag: z.string().max(50).optional(),
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

// Optional auth middleware
const optionalAuth = async (c: any, next: any) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      c.set("userId", decoded.userId);
      c.set("username", decoded.username);
      c.set("userEmail", decoded.email);
    }
    await next();
  } catch (error) {
    // Ignore auth errors for optional auth
    await next();
  }
};

// Helper function to determine media type from MIME type
function getMediaType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("text")
  )
    return "document";
  return "other";
}

// Helper function to validate file type
function isAllowedFileType(mimeType: string): boolean {
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Videos
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/mp3",
    // Documents
    "application/pdf",
    "text/plain",
    "text/markdown",
  ];

  return allowedTypes.includes(mimeType);
}

// Apply rate limiting
media.use("/upload", uploadRateLimiter);
media.use("/search", readRateLimiter);

// Upload media file (protected)
media.post("/upload", requireAuth, async (c) => {
  try {
    const userId = c.get("userId");

    // TODO: Implement actual file upload logic
    // This will involve:
    // 1. Receiving multipart/form-data
    // 2. Validating file type and size
    // 3. Storing file using storage adapter
    // 4. Creating database record
    // 5. Generating thumbnails for images/videos

    // For now, return placeholder response
    return c.tson(
      {
        message: "File upload endpoint (placeholder)",
        note: "This endpoint will be implemented with the storage abstraction layer",
        expectedFlow: [
          "Receive multipart form data",
          "Validate file type and size",
          "Store file using storage adapter",
          "Create database record",
          "Generate thumbnails if applicable",
          "Return media metadata",
        ],
      },
      501
    ); // Not Implemented
  } catch (error) {
    throw error;
  }
});

// Get media metadata by ID (public with optional auth)
media.get("/:id", optionalAuth, async (c) => {
  try {
    const mediaId = c.req.param("id");
    const userId = c.get("userId");

    // TODO: Replace with actual database query
    if (mediaId === "sample") {
      return c.tson({
        media: {
          id: "sample",
          filename: "sample.jpg",
          originalFilename: "my-photo.jpg",
          mimeType: "image/jpeg",
          size: 1024000,
          type: "image",
          url: "/api/media/sample/file",
          thumbnailUrl: "/api/media/sample/thumbnail",
          alt: "Sample image",
          description: "This is a sample media file",
          tags: ["sample", "placeholder"],
          visibility: "public",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          uploadedBy: {
            id: "system",
            username: "system",
          },
          metadata: {
            width: 1920,
            height: 1080,
            duration: null, // for videos
          },
        },
      });
    }

    throw errors.notFound("Media file");
  } catch (error) {
    throw error;
  }
});

// Serve media file (public with access control)
media.get("/:id/file", optionalAuth, async (c) => {
  try {
    const mediaId = c.req.param("id");
    const userId = c.get("userId");

    // TODO: Implement actual file serving logic
    // This will involve:
    // 1. Check media exists and user has access
    // 2. Get file path from storage adapter
    // 3. Stream file with appropriate headers
    // 4. Handle range requests for video streaming

    return c.tson(
      {
        error: "Not Implemented",
        message:
          "File serving endpoint will be implemented with storage abstraction layer",
        mediaId,
      },
      501
    );
  } catch (error) {
    throw error;
  }
});

// Serve media thumbnail (public with access control)
media.get("/:id/thumbnail", optionalAuth, async (c) => {
  try {
    const mediaId = c.req.param("id");
    const userId = c.get("userId");

    // TODO: Implement thumbnail serving
    return c.tson(
      {
        error: "Not Implemented",
        message:
          "Thumbnail serving endpoint will be implemented with storage abstraction layer",
        mediaId,
      },
      501
    );
  } catch (error) {
    throw error;
  }
});

// Search media files (public with optional auth)
media.get(
  "/search",
  zValidator("query", searchMediaSchema),
  optionalAuth,
  async (c) => {
    try {
      const { q, type, tag, limit = 20, offset = 0 } = c.req.valid("query");
      const userId = c.get("userId");

      // TODO: Replace with actual search implementation
      return c.tson({
        media: [], // Placeholder
        pagination: {
          limit,
          offset,
          total: 0,
          hasMore: false,
        },
        filters: {
          query: q,
          type,
          tag,
        },
      });
    } catch (error) {
      throw error;
    }
  }
);

// Update media metadata (protected, owner only)
media.patch(
  "/:id",
  requireAuth,
  zValidator(
    "json",
    z.object({
      alt: z.string().max(500).optional(),
      description: z.string().max(1000).optional(),
      tags: z.array(z.string()).optional(),
      visibility: z.enum(["public", "private", "unlisted"]).optional(),
    })
  ),
  async (c) => {
    try {
      const mediaId = c.req.param("id");
      const updates = c.req.valid("json");
      const userId = c.get("userId");

      // TODO: Implement metadata update
      // 1. Check if media exists
      // 2. Check if user owns the media
      // 3. Update metadata in database

      return c.tson({
        message: "Media metadata updated (placeholder)",
        mediaId,
        updates,
      });
    } catch (error) {
      throw error;
    }
  }
);

// Delete media file (protected, owner only)
media.delete("/:id", requireAuth, async (c) => {
  try {
    const mediaId = c.req.param("id");
    const userId = c.get("userId");

    // TODO: Implement media deletion
    // 1. Check if media exists
    // 2. Check if user owns the media
    // 3. Delete file from storage
    // 4. Delete thumbnails
    // 5. Delete database record
    // 6. Update any posts that reference this media

    return c.tson({
      message: "Media deleted (placeholder)",
      mediaId,
    });
  } catch (error) {
    throw error;
  }
});

// Get user's media files (protected)
media.get(
  "/me/files",
  requireAuth,
  zValidator("query", searchMediaSchema),
  async (c) => {
    try {
      const userId = c.get("userId");
      const { type, tag, limit = 20, offset = 0 } = c.req.valid("query");

      // TODO: Replace with actual user media query
      return c.tson({
        media: [], // Placeholder
        pagination: {
          limit,
          offset,
          total: 0,
          hasMore: false,
        },
        userId,
      });
    } catch (error) {
      throw error;
    }
  }
);

// Get media usage statistics (protected, owner only)
media.get("/:id/stats", requireAuth, async (c) => {
  try {
    const mediaId = c.req.param("id");
    const userId = c.get("userId");

    // TODO: Implement media statistics
    // - View count
    // - Download count
    // - Usage in posts
    // - Bandwidth usage

    return c.tson({
      stats: {
        views: 0,
        downloads: 0,
        usedInPosts: 0,
        bandwidthUsed: 0,
      },
      mediaId,
    });
  } catch (error) {
    throw error;
  }
});

// Bulk operations for media (protected)
media.post(
  "/bulk",
  requireAuth,
  zValidator(
    "json",
    z.object({
      action: z.enum(["delete", "updateVisibility", "addTags", "removeTags"]),
      mediaIds: z.array(z.string()).min(1).max(50),
      data: z.record(z.any()).optional(), // Additional data based on action
    })
  ),
  async (c) => {
    try {
      const { action, mediaIds, data } = c.req.valid("json");
      const userId = c.get("userId");

      // TODO: Implement bulk operations
      return c.tson({
        message: `Bulk ${action} operation (placeholder)`,
        processedCount: mediaIds.length,
        mediaIds,
      });
    } catch (error) {
      throw error;
    }
  }
);

export { media as mediaRoutes };
