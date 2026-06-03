import type {
  NewPatrolReport,
  PatrolReportRecord,
  PatrolReportRepository,
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

  async upsert(report: NewPatrolReport): Promise<void> {
    this.rows.set(key(report.shiftKey, report.shipId, report.checkpointId), report);
  }

  async softDelete(id: string, deletedAt: number): Promise<void> {
    for (const [k, r] of this.rows) {
      if (r.id === id) this.rows.set(k, { ...r, deletedAt, updatedAt: deletedAt });
    }
  }
}
