import type { Notification } from "@smartpatrol/contracts";
import type { NotificationRecord } from "../ports/NotificationRepository";

/** Map an internal notification record to the public DTO. */
export function toNotification(r: NotificationRecord): Notification {
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
