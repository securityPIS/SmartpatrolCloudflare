import type { CreateIncidentRequest, Incident } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertCanAccessShip } from "../../domain/authz";
import type { IncidentDeps } from "./deps";
import { toIncident } from "./toIncident";

export function makeCreateIncident(deps: IncidentDeps) {
  return async (actor: Actor, input: CreateIncidentRequest): Promise<Incident> => {
    assertCanAccessShip(actor, input.shipId);

    const now = deps.clock.now();
    const record = {
      id: deps.ids.uuid(),
      shipId: input.shipId,
      title: input.title,
      description: input.description ?? null,
      severity: input.severity,
      status: "OPEN" as const,
      payload: input.payload,
      reportedBy: actor.id,
      createdAt: now,
      updatedAt: now,
    };

    await deps.incidents.create(record);
    return toIncident(record);
  };
}
