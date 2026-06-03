import type { Incident } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertCanAccessShip } from "../../domain/authz";
import { NotFoundError } from "../../domain/errors";
import type { IncidentDeps } from "./deps";
import { toIncident } from "./toIncident";

export function makeGetIncident(deps: IncidentDeps) {
  return async (actor: Actor, id: string): Promise<Incident> => {
    const record = await deps.incidents.findById(id);
    if (!record) throw new NotFoundError(`Incident ${id} not found`);

    assertCanAccessShip(actor, record.shipId);

    return toIncident(record);
  };
}
