import type { Clock } from "../ports/Clock";
import type { IdGenerator } from "../ports/IdGenerator";
import type { IncidentRepository } from "../ports/IncidentRepository";

export interface IncidentDeps {
  incidents: IncidentRepository;
  clock: Clock;
  ids: IdGenerator;
}
