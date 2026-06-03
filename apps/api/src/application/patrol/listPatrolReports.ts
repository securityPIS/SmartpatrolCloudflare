import type { PatrolReport } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertCanAccessShip } from "../../domain/authz";
import type { PatrolDeps } from "./deps";
import { toPatrolReport } from "./toPatrolReport";

export function makeListPatrolReports(deps: PatrolDeps) {
  return async (actor: Actor, shipId: string, shiftKey: string): Promise<PatrolReport[]> => {
    assertCanAccessShip(actor, shipId);
    const rows = await deps.patrols.listByShipAndShift(shipId, shiftKey);
    return rows.map(toPatrolReport);
  };
}
