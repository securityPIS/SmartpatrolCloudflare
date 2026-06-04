import type { Clock } from "../ports/Clock";
import type { IdGenerator } from "../ports/IdGenerator";
import type { Notifier, NotifyShipInput } from "../ports/Notifier";
import type { NotificationRecord, NotificationRepository } from "../ports/NotificationRepository";
import type { ProfileRepository } from "../ports/ProfileRepository";

export interface NotifierDeps {
  profiles: ProfileRepository;
  notifications: NotificationRepository;
  clock: Clock;
  ids: IdGenerator;
}

/**
 * Default {@link Notifier}: a ship event reaches every enabled admin (who
 * monitor the whole fleet) plus every enabled member assigned to that ship,
 * minus the actor who triggered it. One notification row is written per
 * recipient so each user owns and can independently mark-read their copy.
 */
export function makeNotifier(deps: NotifierDeps): Notifier {
  return {
    async notifyShip(input: NotifyShipInput): Promise<void> {
      const profiles = await deps.profiles.findAll();
      const recipients = profiles.filter(
        (p) =>
          p.enabled &&
          p.id !== input.excludeUserId &&
          (p.role === "ADMIN" || p.shipIds.includes(input.shipId)),
      );
      if (recipients.length === 0) return;

      const now = deps.clock.now();
      const records: NotificationRecord[] = recipients.map((p) => ({
        id: deps.ids.uuid(),
        userId: p.id,
        kind: input.kind,
        title: input.title,
        body: input.body ?? null,
        data: input.data ?? {},
        readAt: null,
        createdAt: now,
        updatedAt: now,
      }));
      await deps.notifications.createMany(records);
    },
  };
}
