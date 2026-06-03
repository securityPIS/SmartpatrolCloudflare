import type { PendingRegistrationStatus } from "@smartpatrol/contracts";

export interface PendingRegistrationRecord {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  requestedShipName: string | null;
  status: PendingRegistrationStatus;
  emailVerifiedAt: number | null;
  verificationTokenHash: string | null;
  createdAt: number;
  updatedAt: number;
}

export type NewPendingRegistration = PendingRegistrationRecord;

export interface PendingRegistrationRepository {
  findByEmail(email: string): Promise<PendingRegistrationRecord | null>;
  findById(id: string): Promise<PendingRegistrationRecord | null>;
  create(pending: NewPendingRegistration): Promise<void>;
  markEmailVerified(id: string, verifiedAt: number): Promise<void>;
}
