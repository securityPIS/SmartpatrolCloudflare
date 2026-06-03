import type { Clock } from "../ports/Clock";
import type { IdGenerator } from "../ports/IdGenerator";
import type { SosRepository } from "../ports/SosRepository";

export interface SosDeps {
  sos: SosRepository;
  clock: Clock;
  ids: IdGenerator;
}
