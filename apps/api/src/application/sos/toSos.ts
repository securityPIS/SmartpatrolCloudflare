import type { SosAlert } from "@smartpatrol/contracts";
import type { SosAlertRecord } from "../ports/SosRepository";

/** Map an internal SOS alert record to the public DTO. */
export function toSosAlert(r: SosAlertRecord): SosAlert {
  return {
    id: r.id,
    shipId: r.shipId,
    raisedBy: r.raisedBy,
    status: r.status,
    lat: r.lat,
    lng: r.lng,
    message: r.message,
    resolvedAt: r.resolvedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}
