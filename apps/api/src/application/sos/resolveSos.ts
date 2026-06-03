import type { SosAlert } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertCanAccessShip } from "../../domain/authz";
import { NotFoundError } from "../../domain/errors";
import type { SosDeps } from "./deps";
import { toSosAlert } from "./toSos";

export function makeResolveSos(deps: SosDeps) {
  return async (actor: Actor, sosId: string): Promise<SosAlert> => {
    const alert = await deps.sos.findById(sosId);
    if (!alert) throw new NotFoundError(`SOS alert ${sosId} not found`);

    assertCanAccessShip(actor, alert.shipId);

    const now = deps.clock.now();
    const patch = { status: "RESOLVED" as const, resolvedAt: now, updatedAt: now };
    await deps.sos.update(sosId, patch);

    return toSosAlert({ ...alert, ...patch });
  };
}
