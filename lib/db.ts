import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

const client = new PGlite(join(process.cwd(), "./tmp/db"));

export const db = drizzle({
  client,
  schema,
});
