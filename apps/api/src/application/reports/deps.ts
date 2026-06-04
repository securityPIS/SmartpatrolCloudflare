import type { Clock } from "../ports/Clock";
import type { PatrolReportRepository } from "../ports/PatrolReportRepository";
import type { SosRepository } from "../ports/SosRepository";
import type { IncidentRepository } from "../ports/IncidentRepository";
import type { ShipRepository } from "../ports/ShipRepository";

export interface ReportDeps {
  patrols: PatrolReportRepository;
  sos: SosRepository;
  incidents: IncidentRepository;
  ships: ShipRepository;
  clock: Clock;
}
