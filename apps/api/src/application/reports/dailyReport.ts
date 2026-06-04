import type { DailyReport, DailyShipReport } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertCanAccessDashboard, isAdmin } from "../../domain/authz";
import type { ReportDeps } from "./deps";

interface Tally {
  total: number;
  done: number;
  skipped: number;
  pending: number;
}

const ZERO: Tally = { total: 0, done: 0, skipped: 0, pending: 0 };

/** UTC `YYYY-MM-DD`, used only as a fallback when the client omits the date. */
function utcDateKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/**
 * Compose the management Daily Report (ADMIN/PIC). Patrol completion is for the
 * given day; SOS and incident figures are live fleet counts. Admins span every
 * ship; a PIC is scoped to their assigned ships.
 */
export function makeDailyReport(deps: ReportDeps) {
  return async (actor: Actor, date?: string): Promise<DailyReport> => {
    assertCanAccessDashboard(actor);

    const reportDate =
      date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : utcDateKey(deps.clock.now());

    const allShips = await deps.ships.findAll();
    const ships = isAdmin(actor) ? allShips : allShips.filter((s) => actor.shipIds.includes(s.id));
    const shipIds = ships.map((s) => s.id);
    const scope = isAdmin(actor) ? undefined : shipIds;

    // Patrol tallies for the report day, summed per ship across its shifts.
    const summaries = await deps.patrols.listShiftSummaries({
      shipIds: scope,
      shiftDatePrefix: reportDate,
      limit: 500,
    });
    const tallyByShip = new Map<string, Tally>();
    for (const s of summaries) {
      const acc = tallyByShip.get(s.shipId) ?? { ...ZERO };
      acc.total += s.total;
      acc.done += s.done;
      acc.skipped += s.skipped;
      acc.pending += s.pending;
      tallyByShip.set(s.shipId, acc);
    }

    const perShip: DailyShipReport[] = ships
      .map((ship) => ({
        shipId: ship.id,
        shipName: ship.name,
        ...(tallyByShip.get(ship.id) ?? ZERO),
      }))
      .sort((a, b) => a.shipName.localeCompare(b.shipName));

    const patrol = perShip.reduce<Tally>(
      (acc, s) => ({
        total: acc.total + s.total,
        done: acc.done + s.done,
        skipped: acc.skipped + s.skipped,
        pending: acc.pending + s.pending,
      }),
      { ...ZERO },
    );
    const completionPct = patrol.total > 0 ? Math.round((patrol.done / patrol.total) * 100) : 0;

    // Live (not date-bound) fleet figures.
    const active = await deps.sos.listActive();
    const activeSos = isAdmin(actor)
      ? active.length
      : active.filter((a) => shipIds.includes(a.shipId)).length;
    const openIncidents = await deps.incidents.countOpen(scope);

    return {
      date: reportDate,
      generatedAt: deps.clock.now(),
      shipsTotal: ships.length,
      patrol: { ...patrol, completionPct },
      activeSos,
      openIncidents,
      perShip,
    };
  };
}
