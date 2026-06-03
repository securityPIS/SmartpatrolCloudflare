import { eq } from "drizzle-orm";
import { sessions, type Database } from "@smartpatrol/db";
import type {
  NewSession,
  SessionRecord,
  SessionRepository,
} from "../../application/ports/SessionRepository";

export class DrizzleSessionRepository implements SessionRepository {
  constructor(private readonly db: Database) {}

  async create(session: NewSession): Promise<void> {
    await this.db.insert(sessions).values({ ...session, revokedAt: null });
  }

  async findById(id: string): Promise<SessionRecord | null> {
    const rows = await this.db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async rotate(id: string, refreshTokenHash: string, expiresAt: number): Promise<void> {
    await this.db.update(sessions).set({ refreshTokenHash, expiresAt }).where(eq(sessions.id, id));
  }

  async revoke(id: string, revokedAt: number): Promise<void> {
    await this.db.update(sessions).set({ revokedAt }).where(eq(sessions.id, id));
  }
}
