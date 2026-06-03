import type { Incident } from "@smartpatrol/contracts";
import type { IncidentRecord } from "../ports/IncidentRepository";

/** Map an internal incident record to the public DTO. */
export function toIncident(r: IncidentRecord): Incident {
  return {
    id: r.id,
    shipId: r.shipId,
    title: r.title,
    description: r.description,
    severity: r.severity,
    status: r.status,
    payload: r.payload,
    reportedBy: r.reportedBy,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}
