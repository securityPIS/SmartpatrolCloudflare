import type { UpdateIncidentRequest, Incident } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertCanAccessShip } from "../../domain/authz";
import { NotFoundError } from "../../domain/errors";
import type { IncidentUpdate } from "../ports/IncidentRepository";
import type { IncidentDeps } from "./deps";
import { toIncident } from "./toIncident";

export function makeUpdateIncident(deps: IncidentDeps) {
  return async (actor: Actor, id: string, input: UpdateIncidentRequest): Promise<Incident> => {
    const existing = await deps.incidents.findById(id);
    if (!existing) throw new NotFoundError(`Incident ${id} not found`);

    assertCanAccessShip(actor, existing.shipId);

    const now = deps.clock.now();
    const patch: IncidentUpdate = { updatedAt: now };
    if (input.title !== undefined) patch.title = input.title;
    if (input.description !== undefined) patch.description = input.description;
    if (input.severity !== undefined) patch.severity = input.severity;
    if (input.status !== undefined) patch.status = input.status;
    if (input.payload !== undefined) patch.payload = input.payload;

    await deps.incidents.update(id, patch);
    return toIncident({ ...existing, ...patch });
  };
}
