import type { Incident } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertCanAccessShip } from "../../domain/authz";
import type { IncidentDeps } from "./deps";
import { toIncident } from "./toIncident";

export function makeListIncidents(deps: IncidentDeps) {
  return async (
    actor: Actor,
    shipId: string,
    status?: "OPEN" | "ACKNOWLEDGED" | "RESOLVED",
  ): Promise<Incident[]> => {
    assertCanAccessShip(actor, shipId);

    const records = await deps.incidents.listByShip(shipId, status ? { status } : undefined);
    return records.map(toIncident);
  };
}
