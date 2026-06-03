import type { SosAlert } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertAdmin, assertCanAccessShip } from "../../domain/authz";
import type { SosDeps } from "./deps";
import { toSosAlert } from "./toSos";

export function makeListSosAlerts(deps: SosDeps) {
  return async (actor: Actor, shipId?: string): Promise<SosAlert[]> => {
    if (shipId) {
      assertCanAccessShip(actor, shipId);
      const records = await deps.sos.listByShip(shipId);
      return records.map(toSosAlert);
    }

    assertAdmin(actor);
    const records = await deps.sos.listActive();
    return records.map(toSosAlert);
  };
}
