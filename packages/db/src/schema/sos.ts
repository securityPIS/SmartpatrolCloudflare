import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { profiles } from "./profiles";
import { ships } from "./ships";

export const sosAlerts = sqliteTable("sos_alerts", {
  id: text("id").primaryKey(),
  shipId: text("ship_id")
    .notNull()
    .references(() => ships.id, { onDelete: "cascade" }),
  raisedBy: text("raised_by")
    .notNull()
    .references(() => profiles.id),
  status: text("status", { enum: ["ACTIVE", "ACKNOWLEDGED", "RESOLVED"] })
    .notNull()
    .default("ACTIVE"),
  lat: real("lat"),
  lng: real("lng"),
  message: text("message"),
  resolvedAt: integer("resolved_at"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const sosAcknowledgements = sqliteTable("sos_acknowledgements", {
  id: text("id").primaryKey(),
  sosId: text("sos_id")
    .notNull()
    .references(() => sosAlerts.id, { onDelete: "cascade" }),
  acknowledgedBy: text("acknowledged_by")
    .notNull()
    .references(() => profiles.id),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
