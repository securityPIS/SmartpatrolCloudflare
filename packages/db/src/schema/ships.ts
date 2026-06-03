import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { Checkpoint } from "@smartpatrol/contracts";

/**
 * Ships. `customCheckpoints` is the authoritative checkpoint list (JSON) —
 * cron jobs read THIS, never a separate `ship_checkpoints` table.
 */
export const ships = sqliteTable("ships", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  customCheckpoints: text("custom_checkpoints", { mode: "json" }).$type<Checkpoint[]>().notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
