import type { RaiseSosRequest, SosAlert } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertCanAccessShip } from "../../domain/authz";
import type { SosDeps } from "./deps";
import { toSosAlert } from "./toSos";

export function makeRaiseSos(deps: SosDeps) {
  return async (actor: Actor, input: RaiseSosRequest): Promise<SosAlert> => {
    assertCanAccessShip(actor, input.shipId);

    const now = deps.clock.now();
    const record = {
      id: deps.ids.uuid(),
      shipId: input.shipId,
      raisedBy: actor.id,
      status: "ACTIVE" as const,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      message: input.message ?? null,
      resolvedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await deps.sos.create(record);

    // Fan out an SOS notification to admins + shipmates. Best-effort: a
    // notification failure must never sink the alert itself.
    if (deps.notifier) {
      await deps.notifier
        .notifyShip({
          shipId: input.shipId,
          kind: "SOS",
          title: "SOS Darurat",
          body: input.message ?? "Sinyal darurat diaktifkan dari kapal.",
          data: { sosId: record.id, shipId: input.shipId, lat: record.lat, lng: record.lng },
          excludeUserId: actor.id,
        })
        .catch((err) => console.error("notifyShip (SOS) failed", err));
    }

    return toSosAlert(record);
  };
}
