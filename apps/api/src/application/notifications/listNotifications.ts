import type { Notification } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import type { NotificationDeps } from "./deps";
import { toNotification } from "./toNotification";

const PAGE_LIMIT = 50;

/** List the signed-in actor's own notifications, newest first. */
export function makeListNotifications(deps: NotificationDeps) {
  return async (actor: Actor): Promise<Notification[]> => {
    const records = await deps.notifications.listByUser(actor.id, { limit: PAGE_LIMIT });
    return records.map(toNotification);
  };
}
