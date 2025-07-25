import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "../../lib/schema/index.ts";

let db: ReturnType<typeof drizzle> | null = null;
let pglite: PGlite | null = null;

export async function getDb() {
  if (db) return db;

  try {
    // Initialize PGlite database
    pglite = new PGlite("./tmp/db");

    // Create Drizzle instance
    db = drizzle(pglite, { schema });

    console.log("✅ Database connection established");
    return db;
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    throw new Error("Database connection failed");
  }
}

export async function closeDb() {
  if (pglite) {
    await pglite.close();
    pglite = null;
    db = null;
    console.log("🔌 Database connection closed");
  }
}

// Health check function
export async function checkDbHealth(): Promise<{
  status: "healthy" | "unhealthy";
  message: string;
}> {
  try {
    const database = await getDb();

    // Simple query to test connection
    await database.execute("SELECT 1 as test");

    return {
      status: "healthy",
      message: "Database connection is working",
    };
  } catch (error) {
    console.error("Database health check failed:", error);
    return {
      status: "unhealthy",
      message:
        error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

// Export the schema for use in API routes
export { schema };

// Re-export common Drizzle utilities that might be needed
export { eq, and, or, like, ilike, desc, asc, sql } from "drizzle-orm";
