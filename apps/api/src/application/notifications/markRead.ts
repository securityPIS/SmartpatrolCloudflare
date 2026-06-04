import type { Actor } from "../../domain/authz";
import { NotFoundError } from "../../domain/errors";
import type { NotificationDeps } from "./deps";

/**
 * Mark one notification read. A notification is private to its owner, so a
 * foreign or unknown id is reported as Not Found rather than leaking existence.
 */
export function makeMarkRead(deps: NotificationDeps) {
  return async (actor: Actor, id: string): Promise<void> => {
    const record = await deps.notifications.findById(id);
    if (!record || record.userId !== actor.id) {
      throw new NotFoundError(`Notification ${id} not found`);
    }
    await deps.notifications.markRead(id, actor.id, deps.clock.now());
  };
}
