import type { Clock } from "../ports/Clock";
import type { IdGenerator } from "../ports/IdGenerator";
import type { Notifier } from "../ports/Notifier";
import type { IncidentRepository } from "../ports/IncidentRepository";

export interface IncidentDeps {
  incidents: IncidentRepository;
  clock: Clock;
  ids: IdGenerator;
  /** Optional fan-out: when present, a new incident notifies admins + crew. */
  notifier?: Notifier;
}
