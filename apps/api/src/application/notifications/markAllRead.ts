import type { Actor } from "../../domain/authz";
import type { NotificationDeps } from "./deps";

/** Mark every unread notification for the signed-in actor read. */
export function makeMarkAllRead(deps: NotificationDeps) {
  return async (actor: Actor): Promise<void> => {
    await deps.notifications.markAllRead(actor.id, deps.clock.now());
  };
}
