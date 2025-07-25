import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import {
  type AppLoadContext,
  createCookieSessionStorage,
  type ServerBuild,
} from "@remix-run/node";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { remix } from "remix-hono/handler";
import { session } from "remix-hono/session";

// Import API routes
import { authRoutes } from "./api/auth";
import { usersRoutes } from "./api/users";
import { postsRoutes } from "./api/posts";
import { mediaRoutes } from "./api/media";

// Import middleware
import { cache, errorHandler, rateLimiter } from "./middleware";
import { importDevBuild } from "./dev/server";

const mode =
  process.env.NODE_ENV === "test" ? "development" : process.env.NODE_ENV;

const isProductionMode = mode === "production";

const app = new Hono();

/**
 * Serve assets files from build/client/assets (production only)
 */
if (isProductionMode) {
  app.use(
    "/assets/*",
    cache(60 * 60 * 24 * 365), // 1 year
    serveStatic({ root: "./build/client" })
  );

  /**
   * Serve public files (production only)
   */
  app.use("*", cache(60 * 60), serveStatic({ root: "./build/client" })); // 1 hour
} else {
  /**
   * Serve public files in development - let Vite handle most assets
   */
  app.use("*", async (c, next) => {
    const path = c.req.path;
    // Only serve specific static assets that exist in public folder
    if (path.match(/\.(png|jpg|jpeg|gif|svg|ico|pdf|txt|xml)$/)) {
      return serveStatic({ root: "./public" })(c, next);
    }
    return next();
  });
}

/**
 * Add logger middleware
 */
app.use("*", logger());

/**
 * Add security headers
 */
app.use("*", secureHeaders());

/**
 * Add CORS for API routes
 */
app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"], // Remix dev servers
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/**
 * Pretty JSON for API responses
 */
app.use("/api/*", prettyJSON());

/**
 * Rate limiting for API routes
 */
app.use("/api/*", rateLimiter);

/**
 * Add session middleware (https://github.com/sergiodxa/remix-hono?tab=readme-ov-file#session-management)
 */
app.use(
  session({
    autoCommit: true,
    createSessionStorage() {
      if (!process.env.SESSION_SECRET) {
        throw new Error("SESSION_SECRET is not defined");
      }

      const sessionStorage = createCookieSessionStorage({
        cookie: {
          name: "session",
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secrets: [process.env.SESSION_SECRET],
          secure: process.env.NODE_ENV === "production",
        },
      });

      return {
        ...sessionStorage,
        // If a user doesn't come back to the app within 30 days, their session will be deleted.
        async commitSession(session) {
          return sessionStorage.commitSession(session, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
          });
        },
      };
    },
  })
);

// Health check endpoint (before API routes to avoid session middleware)
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// API routes
app.route("/api/auth", authRoutes);
app.route("/api/users", usersRoutes);
app.route("/api/posts", postsRoutes);
app.route("/api/media", mediaRoutes);

// Root API endpoint
app.get("/api", (c) => {
  return c.json({
    message: "Open Fans API Server",
    version: "1.0.0",
    documentation: "/api/docs",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      posts: "/api/posts",
      media: "/api/media",
      health: "/health",
    },
  });
});

// 404 handler for API routes only
app.notFound((c) => {
  if (c.req.path.startsWith("/api")) {
    return c.json(
      {
        error: "Not Found",
        message: `API endpoint ${c.req.path} not found`,
        path: c.req.path,
        method: c.req.method,
      },
      404
    );
  }
  // Let other middleware handle non-API routes
  return c.text("Not Found", 404);
});

/**
 * Add remix middleware to Hono server
 */
app.use(async (c, next) => {
  const build = (isProductionMode
    ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line import/no-unresolved -- this expected until you build the app
      await import("../build/server/remix.js")
    : await importDevBuild()) as unknown as ServerBuild;

  return remix({
    build,
    mode,
    getLoadContext() {
      return {
        appVersion: isProductionMode ? build.assets.version : "dev",
      } satisfies AppLoadContext;
    },
  })(c, next);
});

// Global error handler
app.onError(errorHandler);

/**
 * Start the production server
 */
if (isProductionMode) {
  serve(
    {
      ...app,
      port: Number(process.env.PORT) || 3000,
    },
    async (info) => {
      console.log(`🚀 Server started on port ${info.port}`);
      console.log(`📝 Frontend available at http://localhost:${info.port}`);
      console.log(`🔌 API available at http://localhost:${info.port}/api`);
    }
  );
} else {
  console.log(`🚀 Development server will start on port 3000`);
  console.log(`📝 Frontend will be available at http://localhost:3000`);
  console.log(`🔌 API will be available at http://localhost:3000/api`);
}

export default app;

/**
 * Declare our loaders and actions context type
 */
declare module "@remix-run/node" {
  interface AppLoadContext {
    /**
     * The app version from the build assets
     */
    readonly appVersion: string;
  }
}
