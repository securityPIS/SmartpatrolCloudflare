import type { NotificationDeps } from "./deps";
import { makeListNotifications } from "./listNotifications";
import { makeCountUnread } from "./countUnread";
import { makeMarkRead } from "./markRead";
import { makeMarkAllRead } from "./markAllRead";

export type { NotificationDeps } from "./deps";
export { makeNotifier, type NotifierDeps } from "./notifier";

export function createNotificationUseCases(deps: NotificationDeps) {
  return {
    list: makeListNotifications(deps),
    unreadCount: makeCountUnread(deps),
    markRead: makeMarkRead(deps),
    markAllRead: makeMarkAllRead(deps),
  };
}

export type NotificationUseCases = ReturnType<typeof createNotificationUseCases>;
