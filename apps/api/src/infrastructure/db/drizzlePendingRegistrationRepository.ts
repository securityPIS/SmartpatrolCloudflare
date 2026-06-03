import { eq } from "drizzle-orm";
import { pendingRegistrations, type Database } from "@smartpatrol/db";
import type {
  NewPendingRegistration,
  PendingRegistrationRecord,
  PendingRegistrationRepository,
} from "../../application/ports/PendingRegistrationRepository";

export class DrizzlePendingRegistrationRepository implements PendingRegistrationRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string): Promise<PendingRegistrationRecord | null> {
    const rows = await this.db
      .select()
      .from(pendingRegistrations)
      .where(eq(pendingRegistrations.email, email))
      .limit(1);
    return rows[0] ?? null;
  }

  async findById(id: string): Promise<PendingRegistrationRecord | null> {
    const rows = await this.db
      .select()
      .from(pendingRegistrations)
      .where(eq(pendingRegistrations.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  async create(pending: NewPendingRegistration): Promise<void> {
    await this.db.insert(pendingRegistrations).values(pending);
  }

  async markEmailVerified(id: string, verifiedAt: number): Promise<void> {
    await this.db
      .update(pendingRegistrations)
      .set({ emailVerifiedAt: verifiedAt, updatedAt: verifiedAt })
      .where(eq(pendingRegistrations.id, id));
  }
}
