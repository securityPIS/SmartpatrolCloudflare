import type { PatrolReport, SavePatrolReportRequest } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertCanAccessShip } from "../../domain/authz";
import { StalePatrolReportError } from "../../domain/errors";
import type { PatrolDeps } from "./deps";
import { toPatrolReport } from "./toPatrolReport";

export function makeSavePatrolReport(deps: PatrolDeps) {
  return async (actor: Actor, input: SavePatrolReportRequest): Promise<PatrolReport> => {
    assertCanAccessShip(actor, input.shipId);

    const now = deps.clock.now();
    // A DONE visit defaults its completion to now; PENDING/SKIPPED may have none.
    const completedAt = input.completedAt ?? (input.status === "DONE" ? now : null);

    const existing = await deps.patrols.findByNaturalKey(
      input.shiftKey,
      input.shipId,
      input.checkpointId,
    );

    // --- Anti-resurrection guard (Phase 4.2) ---
    // If the natural key is tombstoned, only a report captured strictly AFTER
    // the deletion may revive it. Stale replays (completedAt <= deletedAt) are
    // rejected so a late offline submission cannot resurrect a deleted visit.
    if (existing?.deletedAt != null) {
      const incomingTs = completedAt ?? now;
      if (incomingTs <= existing.deletedAt) {
        throw new StalePatrolReportError();
      }
    }

    const record = {
      id: existing?.id ?? deps.ids.uuid(),
      shiftKey: input.shiftKey,
      shipId: input.shipId,
      checkpointId: input.checkpointId,
      checkpointName: input.checkpointName,
      status: input.status,
      note: input.note ?? null,
      media: input.media,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      reportedBy: actor.id,
      completedAt,
      deletedAt: null, // a successful save always clears any tombstone
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await deps.patrols.upsert(record);
    return toPatrolReport(record);
  };
}
