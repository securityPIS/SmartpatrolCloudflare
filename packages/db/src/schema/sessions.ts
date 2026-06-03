import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { profiles } from "./profiles";

/** Refresh-token sessions (rotated on refresh, Phase 1.3). */
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    /** Hash of the refresh token — never store the raw token. */
    refreshTokenHash: text("refresh_token_hash").notNull(),
    userAgent: text("user_agent"),
    expiresAt: integer("expires_at").notNull(),
    createdAt: integer("created_at").notNull(),
    revokedAt: integer("revoked_at"),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);
