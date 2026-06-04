import type { ShiftSummary } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertCanAccessShip, isAdmin } from "../../domain/authz";
import type { PatrolDeps } from "./deps";
import { toShiftSummary } from "./toShiftSummary";

/**
 * Per-shift history for the Laporan screen. With a `shipId` the caller must be
 * able to access that ship. Without one, admins span the whole fleet while
 * PIC/PETUGAS are scoped to the ships assigned to them.
 */
export function makeListShiftHistory(deps: PatrolDeps) {
  return async (actor: Actor, shipId?: string): Promise<ShiftSummary[]> => {
    if (shipId) {
      assertCanAccessShip(actor, shipId);
      const rows = await deps.patrols.listShiftSummaries({ shipIds: [shipId] });
      return rows.map(toShiftSummary);
    }

    const rows = await deps.patrols.listShiftSummaries(
      isAdmin(actor) ? {} : { shipIds: [...actor.shipIds] },
    );
    return rows.map(toShiftSummary);
  };
}
