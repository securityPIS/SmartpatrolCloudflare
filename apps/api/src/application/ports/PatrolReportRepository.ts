import type { CheckpointVisitStatus, PatrolMedia } from "@smartpatrol/contracts";

export interface PatrolReportRecord {
  id: string;
  shiftKey: string;
  shipId: string;
  checkpointId: string;
  checkpointName: string;
  status: CheckpointVisitStatus;
  note: string | null;
  media: PatrolMedia[];
  lat: number | null;
  lng: number | null;
  reportedBy: string;
  completedAt: number | null;
  /** Tombstone — set when soft-deleted (anti-resurrection guard). */
  deletedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export type NewPatrolReport = PatrolReportRecord;

export interface PatrolReportRepository {
  /** Lookup by the natural key (shiftKey, shipId, checkpointId), including tombstoned rows. */
  findByNaturalKey(
    shiftKey: string,
    shipId: string,
    checkpointId: string,
  ): Promise<PatrolReportRecord | null>;
  findById(id: string): Promise<PatrolReportRecord | null>;
  /** All live (non-tombstoned) reports for a ship's shift. */
  listByShipAndShift(shipId: string, shiftKey: string): Promise<PatrolReportRecord[]>;
  /** Insert-or-update on the natural key. */
  upsert(report: NewPatrolReport): Promise<void>;
  /** Set the tombstone (soft delete). */
  softDelete(id: string, deletedAt: number): Promise<void>;
}
