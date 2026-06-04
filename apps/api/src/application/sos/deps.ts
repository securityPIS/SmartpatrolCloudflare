import type { Clock } from "../ports/Clock";
import type { IdGenerator } from "../ports/IdGenerator";
import type { Notifier } from "../ports/Notifier";
import type { SosRepository } from "../ports/SosRepository";

export interface SosDeps {
  sos: SosRepository;
  clock: Clock;
  ids: IdGenerator;
  /** Optional fan-out: when present, raising an SOS notifies admins + crew. */
  notifier?: Notifier;
}
