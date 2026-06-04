import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Registration requests awaiting admin approval (Phase 3.3). */
export const pendingRegistrations = sqliteTable("pending_registrations", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  requestedShipName: text("requested_ship_name"),
  /** Public onboarding fields, captured for admin review (Phase 3). */
  instansi: text("instansi"),
  workerNumber: text("worker_number"),
  phone: text("phone"),
  photoUrl: text("photo_url"),
  status: text("status", { enum: ["PENDING", "APPROVED", "REJECTED"] })
    .notNull()
    .default("PENDING"),
  /** Set when the applicant confirms their email via the verification link. */
  emailVerifiedAt: integer("email_verified_at"),
  /** Hash of the one-time email-verification token. */
  verificationTokenHash: text("verification_token_hash"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
