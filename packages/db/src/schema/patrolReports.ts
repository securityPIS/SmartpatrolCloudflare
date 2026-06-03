import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { PatrolMedia } from "@smartpatrol/contracts";
import { profiles } from "./profiles";
import { ships } from "./ships";

/**
 * One checkpoint visit within a shift. Natural key
 * (`shift_key`, `ship_id`, `checkpoint_id`) is upserted by `savePatrolReport`.
 * `deleted_at` is the tombstone for the anti-resurrection guard (Phase 4.2).
 */
export const patrolReports = sqliteTable(
  "patrol_reports",
  {
    id: text("id").primaryKey(),
    shiftKey: text("shift_key").notNull(),
    shipId: text("ship_id")
      .notNull()
      .references(() => ships.id, { onDelete: "cascade" }),
    checkpointId: text("checkpoint_id").notNull(),
    checkpointName: text("checkpoint_name").notNull(),
    status: text("status", { enum: ["PENDING", "DONE", "SKIPPED"] }).notNull(),
    note: text("note"),
    media: text("media", { mode: "json" }).$type<PatrolMedia[]>().notNull(),
    lat: real("lat"),
    lng: real("lng"),
    reportedBy: text("reported_by")
      .notNull()
      .references(() => profiles.id),
    completedAt: integer("completed_at"),
    deletedAt: integer("deleted_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [uniqueIndex("patrol_natural_key").on(t.shiftKey, t.shipId, t.checkpointId)],
);
