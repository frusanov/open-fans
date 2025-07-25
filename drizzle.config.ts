import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/schema/*",
  out: "./drizzle",
  dialect: "postgresql",
  driver: "pglite",
  dbCredentials: {
    url: "./tmp/db",
  },
  verbose: true,
  strict: true,
});
