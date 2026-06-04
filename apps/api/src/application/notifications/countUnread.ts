import type { Actor } from "../../domain/authz";
import type { NotificationDeps } from "./deps";

/** Count the signed-in actor's unread notifications (drives the nav badge). */
export function makeCountUnread(deps: NotificationDeps) {
  return async (actor: Actor): Promise<number> => {
    return deps.notifications.countUnread(actor.id);
  };
}
