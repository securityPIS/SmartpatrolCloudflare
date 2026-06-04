import type { ShiftSummary } from "@smartpatrol/contracts";
import type { ShiftSummaryRow } from "../ports/PatrolReportRepository";

/** Map an internal shift-summary row to the public DTO. */
export function toShiftSummary(r: ShiftSummaryRow): ShiftSummary {
  return {
    shipId: r.shipId,
    shiftKey: r.shiftKey,
    total: r.total,
    done: r.done,
    skipped: r.skipped,
    pending: r.pending,
    lastActivityAt: r.lastActivityAt,
  };
}
