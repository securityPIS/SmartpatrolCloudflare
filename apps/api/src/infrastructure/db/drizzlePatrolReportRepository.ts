import { and, eq, isNull } from "drizzle-orm";
import { patrolReports, type Database } from "@smartpatrol/db";
import type {
  NewPatrolReport,
  PatrolReportRecord,
  PatrolReportRepository,
} from "../../application/ports/PatrolReportRepository";

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
