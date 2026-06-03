import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Append-only audit trail (Phase 9.4). */
export const auditEvents = sqliteTable(
  "audit_events",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id"),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("audit_events_entity_idx").on(t.entity, t.entityId)],
);
