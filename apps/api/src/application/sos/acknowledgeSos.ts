import type { SosAlert } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertCanAccessShip } from "../../domain/authz";
import { NotFoundError } from "../../domain/errors";
import type { SosDeps } from "./deps";
import { toSosAlert } from "./toSos";

export function makeAcknowledgeSos(deps: SosDeps) {
  return async (actor: Actor, sosId: string): Promise<SosAlert> => {
    const alert = await deps.sos.findById(sosId);
    if (!alert) throw new NotFoundError(`SOS alert ${sosId} not found`);

    assertCanAccessShip(actor, alert.shipId);

    const existing = await deps.sos.findAcknowledgement(sosId, actor.id);
    if (!existing) {
      const now = deps.sos !== undefined ? deps.clock.now() : Date.now();
      const ack = {
        id: deps.ids.uuid(),
        sosId,
        acknowledgedBy: actor.id,
        createdAt: now,
        updatedAt: now,
      };
      await deps.sos.createAcknowledgement(ack);
    }

    const now = deps.clock.now();
    const patch = { status: "ACKNOWLEDGED" as const, updatedAt: now };
    await deps.sos.update(sosId, patch);

    return toSosAlert({ ...alert, ...patch });
  };
}
