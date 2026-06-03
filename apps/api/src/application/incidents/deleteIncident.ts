import type { Actor } from "../../domain/authz";
import { assertAdmin } from "../../domain/authz";
import { NotFoundError } from "../../domain/errors";
import type { IncidentDeps } from "./deps";

export function makeDeleteIncident(deps: IncidentDeps) {
  return async (actor: Actor, id: string): Promise<void> => {
    const existing = await deps.incidents.findById(id);
    if (!existing) throw new NotFoundError(`Incident ${id} not found`);

    assertAdmin(actor);

    await deps.incidents.delete(id);
  };
}
