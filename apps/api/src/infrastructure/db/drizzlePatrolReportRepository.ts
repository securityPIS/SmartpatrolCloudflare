import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { patrolReports, type Database } from "@smartpatrol/db";
import type {
  NewPatrolReport,
  PatrolReportRecord,
  PatrolReportRepository,
  ShiftSummaryFilter,
  ShiftSummaryRow,
} from "../../application/ports/PatrolReportRepository";

const SUMMARY_LIMIT = 60;

export class DrizzlePatrolReportRepository implements PatrolReportRepository {
  constructor(private readonly db: Database) {}

  async findByNaturalKey(
    shiftKey: string,
    shipId: string,
    checkpointId: string,
  ): Promise<PatrolReportRecord | null> {
    const rows = await this.db
      .select()
      .from(patrolReports)
      .where(
        and(
          eq(patrolReports.shiftKey, shiftKey),
          eq(patrolReports.shipId, shipId),
          eq(patrolReports.checkpointId, checkpointId),
        ),
      )
      .limit(1);
    return rows[0] ?? null;
  }

  async findById(id: string): Promise<PatrolReportRecord | null> {
    const rows = await this.db
      .select()
      .from(patrolReports)
      .where(eq(patrolReports.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  async listByShipAndShift(shipId: string, shiftKey: string): Promise<PatrolReportRecord[]> {
    return this.db
      .select()
      .from(patrolReports)
      .where(
        and(
          eq(patrolReports.shipId, shipId),
          eq(patrolReports.shiftKey, shiftKey),
          isNull(patrolReports.deletedAt),
        ),
      );
  }

  async listShiftSummaries(filter?: ShiftSummaryFilter): Promise<ShiftSummaryRow[]> {
    const conditions = [isNull(patrolReports.deletedAt)];
    if (filter?.shipIds) {
      if (filter.shipIds.length === 0) return [];
      conditions.push(inArray(patrolReports.shipId, filter.shipIds));
    }

    const rows = await this.db
      .select({
        shipId: patrolReports.shipId,
        shiftKey: patrolReports.shiftKey,
        total: sql<number>`count(*)`,
        done: sql<number>`sum(case when ${patrolReports.status} = 'DONE' then 1 else 0 end)`,
        skipped: sql<number>`sum(case when ${patrolReports.status} = 'SKIPPED' then 1 else 0 end)`,
        pending: sql<number>`sum(case when ${patrolReports.status} = 'PENDING' then 1 else 0 end)`,
        lastActivityAt: sql<number | null>`max(${patrolReports.updatedAt})`,
      })
      .from(patrolReports)
      .where(and(...conditions))
      .groupBy(patrolReports.shipId, patrolReports.shiftKey)
      .orderBy(sql`max(${patrolReports.updatedAt}) desc`)
      .limit(filter?.limit ?? SUMMARY_LIMIT);

    return rows.map((r) => ({
      shipId: r.shipId,
      shiftKey: r.shiftKey,
      total: Number(r.total),
      done: Number(r.done),
      skipped: Number(r.skipped),
      pending: Number(r.pending),
      lastActivityAt: r.lastActivityAt == null ? null : Number(r.lastActivityAt),
    }));
  }

  async upsert(report: NewPatrolReport): Promise<void> {
    await this.db
      .insert(patrolReports)
      .values(report)
      .onConflictDoUpdate({
        target: [patrolReports.shiftKey, patrolReports.shipId, patrolReports.checkpointId],
        set: {
          checkpointName: report.checkpointName,
          status: report.status,
          note: report.note,
          media: report.media,
          lat: report.lat,
          lng: report.lng,
          reportedBy: report.reportedBy,
          completedAt: report.completedAt,
          deletedAt: report.deletedAt,
          updatedAt: report.updatedAt,
        },
      });
  }

  async softDelete(id: string, deletedAt: number): Promise<void> {
    await this.db
      .update(patrolReports)
      .set({ deletedAt, updatedAt: deletedAt })
      .where(eq(patrolReports.id, id));
  }
}
