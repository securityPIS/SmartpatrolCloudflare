import type {
  NewPatrolReport,
  PatrolReportRecord,
  PatrolReportRepository,
  ShiftSummaryFilter,
  ShiftSummaryRow,
} from "../../ports/PatrolReportRepository";

const key = (shiftKey: string, shipId: string, checkpointId: string) =>
  `${shiftKey}::${shipId}::${checkpointId}`;

export class InMemoryPatrolReportRepository implements PatrolReportRepository {
  /** keyed by natural key so upsert is idempotent on (shiftKey, shipId, checkpointId). */
  readonly rows = new Map<string, PatrolReportRecord>();

  async findByNaturalKey(
    shiftKey: string,
    shipId: string,
    checkpointId: string,
  ): Promise<PatrolReportRecord | null> {
    return this.rows.get(key(shiftKey, shipId, checkpointId)) ?? null;
  }

  async findById(id: string): Promise<PatrolReportRecord | null> {
    for (const r of this.rows.values()) if (r.id === id) return r;
    return null;
  }

  async listByShipAndShift(shipId: string, shiftKey: string): Promise<PatrolReportRecord[]> {
    return Array.from(this.rows.values()).filter(
      (r) => r.shipId === shipId && r.shiftKey === shiftKey && r.deletedAt == null,
    );
  }

  async listShiftSummaries(filter?: ShiftSummaryFilter): Promise<ShiftSummaryRow[]> {
    if (filter?.shipIds?.length === 0) return [];
    const live = Array.from(this.rows.values()).filter((r) => r.deletedAt == null);
    const allowed = filter?.shipIds ? new Set(filter.shipIds) : null;

    const byShift = new Map<string, ShiftSummaryRow>();
    for (const r of live) {
      if (allowed && !allowed.has(r.shipId)) continue;
      if (filter?.shiftDatePrefix && !r.shiftKey.startsWith(filter.shiftDatePrefix)) continue;
      const k = `${r.shipId}::${r.shiftKey}`;
      const acc = byShift.get(k) ?? {
        shipId: r.shipId,
        shiftKey: r.shiftKey,
        total: 0,
        done: 0,
        skipped: 0,
        pending: 0,
        lastActivityAt: null as number | null,
      };
      acc.total += 1;
      if (r.status === "DONE") acc.done += 1;
      else if (r.status === "SKIPPED") acc.skipped += 1;
      else if (r.status === "PENDING") acc.pending += 1;
      acc.lastActivityAt = Math.max(acc.lastActivityAt ?? 0, r.updatedAt);
      byShift.set(k, acc);
    }

    const summaries = Array.from(byShift.values()).sort(
      (a, b) => (b.lastActivityAt ?? 0) - (a.lastActivityAt ?? 0),
    );
    return filter?.limit ? summaries.slice(0, filter.limit) : summaries;
  }

  async upsert(report: NewPatrolReport): Promise<void> {
    this.rows.set(key(report.shiftKey, report.shipId, report.checkpointId), report);
  }

  async softDelete(id: string, deletedAt: number): Promise<void> {
    for (const [k, r] of this.rows) {
      if (r.id === id) this.rows.set(k, { ...r, deletedAt, updatedAt: deletedAt });
    }
  }
}
