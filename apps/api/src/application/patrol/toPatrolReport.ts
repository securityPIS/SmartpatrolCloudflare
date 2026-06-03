import type { PatrolReport } from "@smartpatrol/contracts";
import type { PatrolReportRecord } from "../ports/PatrolReportRepository";

/** Map an internal patrol record to the public DTO. */
export function toPatrolReport(r: PatrolReportRecord): PatrolReport {
  return {
    id: r.id,
    shiftKey: r.shiftKey,
    shipId: r.shipId,
    checkpointId: r.checkpointId,
    checkpointName: r.checkpointName,
    status: r.status,
    note: r.note,
    media: r.media,
    lat: r.lat,
    lng: r.lng,
    reportedBy: r.reportedBy,
    completedAt: r.completedAt,
    deletedAt: r.deletedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}
