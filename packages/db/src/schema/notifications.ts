import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { profiles } from "./profiles";

export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    kind: text("kind", {
      enum: ["CHECKPOINT_PENDING", "SHIFT_WRAP_UP", "INCIDENT", "SOS", "SYSTEM"],
    }).notNull(),
    title: text("title").notNull(),
    body: text("body"),
    data: text("data", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    readAt: integer("read_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [index("notifications_user_idx").on(t.userId)],
);

/** Firebase FCM tokens per user/device (Phase 8.2). */
export const pushSubscriptions = sqliteTable(
  "push_subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    platform: text("platform", { enum: ["web", "android"] })
      .notNull()
      .default("web"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [index("push_subscriptions_user_idx").on(t.userId)],
);
