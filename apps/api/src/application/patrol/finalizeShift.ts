import type { PatrolReport } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertCanAccessShip } from "../../domain/authz";
import { NotFoundError } from "../../domain/errors";
import { normalizeCheckpointName, type PatrolDeps } from "./deps";
import { toPatrolReport } from "./toPatrolReport";

/**
 * Reconstruct the full snapshot of a shift from the ship's authoritative
 * `customCheckpoints`. For every configured checkpoint with no live report,
 * a PENDING placeholder is created (matched by id, falling back to normalized
 * name). Reports for checkpoints no longer in the config ("orphans") are
 * preserved in the returned snapshot — never silently dropped.
 *
 * This is the logic the `finalize_shift` cron will drive in Phase 8.
 */
export function makeFinalizeShift(deps: PatrolDeps) {
  return async (actor: Actor, shipId: string, shiftKey: string): Promise<PatrolReport[]> => {
    assertCanAccessShip(actor, shipId);

    const ship = await deps.ships.findById(shipId);
    if (!ship) throw new NotFoundError(`Ship ${shipId} not found`);

    const existing = await deps.patrols.listByShipAndShift(shipId, shiftKey);
    const byId = new Map(existing.map((r) => [r.checkpointId, r]));
    const byName = new Map(existing.map((r) => [normalizeCheckpointName(r.checkpointName), r]));

    const now = deps.clock.now();
    for (const cp of ship.customCheckpoints) {
      const matched = byId.get(cp.id) ?? byName.get(normalizeCheckpointName(cp.name));
      if (matched) continue;
      await deps.patrols.upsert({
        id: deps.ids.uuid(),
        shiftKey,
        shipId,
        checkpointId: cp.id,
        checkpointName: cp.name,
        status: "PENDING",
        note: null,
        media: [],
        lat: null,
        lng: null,
        reportedBy: actor.id,
        completedAt: null,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    const full = await deps.patrols.listByShipAndShift(shipId, shiftKey);
    return full.map(toPatrolReport);
  };
}
