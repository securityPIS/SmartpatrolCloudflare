import type { NotificationKind } from "./NotificationRepository";

export interface NotifyShipInput {
  shipId: string;
  kind: NotificationKind;
  title: string;
  body?: string | null;
  data?: Record<string, unknown>;
  /** Skip this recipient (e.g. the actor who triggered the event). */
  excludeUserId?: string;
}

/**
 * Fan-out side-effect port: turns a ship-level event into per-user
 * notifications for everyone who should hear about it (admins + ship members).
 * Use-cases depend on this abstraction, never on the notification repository
 * directly, so the alerting policy stays in one place and is easy to stub.
 */
export interface Notifier {
  notifyShip(input: NotifyShipInput): Promise<void>;
}
