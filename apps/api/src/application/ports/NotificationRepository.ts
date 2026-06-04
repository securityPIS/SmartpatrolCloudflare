export type NotificationKind =
  | "CHECKPOINT_PENDING"
  | "SHIFT_WRAP_UP"
  | "INCIDENT"
  | "SOS"
  | "SYSTEM";

export interface NotificationRecord {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  readAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface NotificationListOptions {
  /** Max rows to return, newest first. Defaults to the repository's own cap. */
  limit?: number;
}

export interface NotificationRepository {
  listByUser(userId: string, opts?: NotificationListOptions): Promise<NotificationRecord[]>;
  countUnread(userId: string): Promise<number>;
  findById(id: string): Promise<NotificationRecord | null>;
  create(record: NotificationRecord): Promise<void>;
  createMany(records: NotificationRecord[]): Promise<void>;
  /** Mark a single notification read — scoped to its owner. */
  markRead(id: string, userId: string, at: number): Promise<void>;
  /** Mark every unread notification for a user read. */
  markAllRead(userId: string, at: number): Promise<void>;
}
