import type { Clock } from "../ports/Clock";
import type { IdGenerator } from "../ports/IdGenerator";
import type { ShipRepository } from "../ports/ShipRepository";

export interface ShipDeps {
  ships: ShipRepository;
  clock: Clock;
  ids: IdGenerator;
}
