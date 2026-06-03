import type { Actor } from "../../domain/authz";
import { assertCanAccessShip } from "../../domain/authz";
import { NotFoundError } from "../../domain/errors";
import type { PatrolDeps } from "./deps";

export function makeDeletePatrolReport(deps: PatrolDeps) {
  return async (actor: Actor, reportId: string): Promise<void> => {
    const report = await deps.patrols.findById(reportId);
    if (!report || report.deletedAt != null) throw new NotFoundError("Patrol report not found");
    assertCanAccessShip(actor, report.shipId);
    await deps.patrols.softDelete(reportId, deps.clock.now());
  };
}
