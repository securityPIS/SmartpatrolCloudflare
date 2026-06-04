import type {
  NotificationListOptions,
  NotificationRecord,
  NotificationRepository,
} from "../../ports/NotificationRepository";
import type { Notifier, NotifyShipInput } from "../../ports/Notifier";

export class InMemoryNotificationRepository implements NotificationRepository {
  readonly rows = new Map<string, NotificationRecord>();

  async listByUser(userId: string, opts?: NotificationListOptions): Promise<NotificationRecord[]> {
    const all = Array.from(this.rows.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
    return opts?.limit ? all.slice(0, opts.limit) : all;
  }

  async countUnread(userId: string): Promise<number> {
    return Array.from(this.rows.values()).filter((r) => r.userId === userId && r.readAt === null)
      .length;
  }

  async findById(id: string): Promise<NotificationRecord | null> {
    return this.rows.get(id) ?? null;
  }

  async create(record: NotificationRecord): Promise<void> {
    this.rows.set(record.id, record);
  }

  async createMany(records: NotificationRecord[]): Promise<void> {
    for (const r of records) this.rows.set(r.id, r);
  }

  async markRead(id: string, userId: string, at: number): Promise<void> {
    const r = this.rows.get(id);
    if (r && r.userId === userId) this.rows.set(id, { ...r, readAt: at, updatedAt: at });
  }

  async markAllRead(userId: string, at: number): Promise<void> {
    for (const [id, r] of this.rows) {
      if (r.userId === userId && r.readAt === null) {
        this.rows.set(id, { ...r, readAt: at, updatedAt: at });
      }
    }
  }
}

/** Records the calls made to a {@link Notifier} so tests can assert fan-out. */
export class RecordingNotifier implements Notifier {
  readonly calls: NotifyShipInput[] = [];
  async notifyShip(input: NotifyShipInput): Promise<void> {
    this.calls.push(input);
  }
}
