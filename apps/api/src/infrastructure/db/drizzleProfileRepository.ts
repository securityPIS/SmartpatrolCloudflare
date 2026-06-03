import { eq } from "drizzle-orm";
import { profiles, type Database } from "@smartpatrol/db";
import type {
  NewProfile,
  ProfileRecord,
  ProfileRepository,
} from "../../application/ports/ProfileRepository";

export class DrizzleProfileRepository implements ProfileRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string): Promise<ProfileRecord | null> {
    const rows = await this.db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
    return rows[0] ?? null;
  }

  async findById(id: string): Promise<ProfileRecord | null> {
    const rows = await this.db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async create(profile: NewProfile): Promise<void> {
    await this.db.insert(profiles).values(profile);
  }
}
