import { and, count, desc, eq, isNull } from "drizzle-orm";
import { notifications, type Database } from "@smartpatrol/db";
import type {
  NotificationListOptions,
  NotificationRecord,
  NotificationRepository,
} from "../../application/ports/NotificationRepository";

const DEFAULT_LIMIT = 50;

export class DrizzleNotificationRepository implements NotificationRepository {
  constructor(private readonly db: Database) {}

  async listByUser(userId: string, opts?: NotificationListOptions): Promise<NotificationRecord[]> {
    const rows = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(opts?.limit ?? DEFAULT_LIMIT);
    return rows.map((r) => this.toRecord(r));
  }

  async countUnread(userId: string): Promise<number> {
    const rows = await this.db
      .select({ value: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    return rows[0]?.value ?? 0;
  }

  async findById(id: string): Promise<NotificationRecord | null> {
    const rows = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);
    const row = rows[0];
    return row ? this.toRecord(row) : null;
  }

  async create(record: NotificationRecord): Promise<void> {
    await this.db.insert(notifications).values(this.toRow(record));
  }

  async createMany(records: NotificationRecord[]): Promise<void> {
    if (records.length === 0) return;
    await this.db.insert(notifications).values(records.map((r) => this.toRow(r)));
  }

  async markRead(id: string, userId: string, at: number): Promise<void> {
    await this.db
      .update(notifications)
      .set({ readAt: at, updatedAt: at })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async markAllRead(userId: string, at: number): Promise<void> {
    await this.db
      .update(notifications)
      .set({ readAt: at, updatedAt: at })
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  }

  private toRow(r: NotificationRecord): typeof notifications.$inferInsert {
    return {
      id: r.id,
      userId: r.userId,
      kind: r.kind,
      title: r.title,
      body: r.body,
      data: r.data,
      readAt: r.readAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  private toRecord(row: typeof notifications.$inferSelect): NotificationRecord {
    return {
      id: row.id,
      userId: row.userId,
      kind: row.kind,
      title: row.title,
      body: row.body ?? null,
      data: (row.data ?? {}) as Record<string, unknown>,
      readAt: row.readAt ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
