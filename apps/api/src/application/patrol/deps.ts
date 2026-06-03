import type { Clock } from "../ports/Clock";
import type { IdGenerator } from "../ports/IdGenerator";
import type { PatrolReportRepository } from "../ports/PatrolReportRepository";
import type { ShipRepository } from "../ports/ShipRepository";

export interface PatrolDeps {
  patrols: PatrolReportRepository;
  ships: ShipRepository;
  clock: Clock;
  ids: IdGenerator;
}

/** Normalize a checkpoint name for match-by-name (case/space-insensitive). */
export function normalizeCheckpointName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}
