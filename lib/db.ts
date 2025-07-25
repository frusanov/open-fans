import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

const client = new PGlite(join(__dirname, "../tmp/db"));
export const db = drizzle({ client });
