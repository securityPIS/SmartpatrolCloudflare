import type { Clock } from "../ports/Clock";
import type { NotificationRepository } from "../ports/NotificationRepository";

export interface NotificationDeps {
  notifications: NotificationRepository;
  clock: Clock;
}
