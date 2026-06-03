import { defineConfig } from "drizzle-kit";

/**
 * Generates SQL migrations from the Drizzle schema. Applied to D1 via
 * `wrangler d1 migrations apply` (see package scripts).
 */
export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "sqlite",
});
