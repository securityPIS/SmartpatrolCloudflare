import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Registration requests awaiting admin approval (Phase 3.3). */
export const pendingRegistrations = sqliteTable("pending_registrations", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  requestedShipName: text("requested_ship_name"),
  status: text("status", { enum: ["PENDING", "APPROVED", "REJECTED"] })
    .notNull()
    .default("PENDING"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
