import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { profiles } from "./profiles";
import { ships } from "./ships";

export const incidents = sqliteTable("incidents", {
  id: text("id").primaryKey(),
  shipId: text("ship_id")
    .notNull()
    .references(() => ships.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity", { enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] })
    .notNull()
    .default("MEDIUM"),
  status: text("status", { enum: ["OPEN", "ACKNOWLEDGED", "RESOLVED"] })
    .notNull()
    .default("OPEN"),
  payload: text("payload", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  reportedBy: text("reported_by")
    .notNull()
    .references(() => profiles.id),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
