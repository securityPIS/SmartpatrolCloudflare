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

    // Best-effort fan-out: a new finding notifies admins + shipmates without
    // ever failing the report itself.
    if (deps.notifier) {
      await deps.notifier
        .notifyShip({
          shipId: input.shipId,
          kind: "INCIDENT",
          title: `Temuan: ${input.title}`,
          body: input.description ?? null,
          data: { incidentId: record.id, shipId: input.shipId, severity: input.severity },
          excludeUserId: actor.id,
        })
        .catch((err) => console.error("notifyShip (incident) failed", err));
    }

    return toIncident(record);
  };
}
