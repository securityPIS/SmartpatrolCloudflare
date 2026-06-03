import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Users. Replaces Supabase `auth.users` + `profiles`. */
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name"),
  role: text("role", { enum: ["ADMIN", "PIC", "PETUGAS"] })
    .notNull()
    .default("PETUGAS"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  /** Ship ids the user is assigned to (empty for ADMIN = all). */
  shipIds: text("ship_ids", { mode: "json" }).$type<string[]>().notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
