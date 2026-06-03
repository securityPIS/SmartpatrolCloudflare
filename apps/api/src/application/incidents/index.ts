import type { IncidentDeps } from "./deps";
import { makeCreateIncident } from "./createIncident";
import { makeUpdateIncident } from "./updateIncident";
import { makeDeleteIncident } from "./deleteIncident";
import { makeListIncidents } from "./listIncidents";
import { makeGetIncident } from "./getIncident";

export type { IncidentDeps } from "./deps";

export function createIncidentUseCases(deps: IncidentDeps) {
  return {
    create: makeCreateIncident(deps),
    update: makeUpdateIncident(deps),
    delete: makeDeleteIncident(deps),
    list: makeListIncidents(deps),
    get: makeGetIncident(deps),
  };
}

export type IncidentUseCases = ReturnType<typeof createIncidentUseCases>;
