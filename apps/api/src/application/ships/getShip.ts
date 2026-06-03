import type { Ship } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertCanAccessShip } from "../../domain/authz";
import { NotFoundError } from "../../domain/errors";
import type { ShipDeps } from "./deps";

export function makeGetShip(deps: ShipDeps) {
  return async (actor: Actor, shipId: string): Promise<Ship> => {
    const ship = await deps.ships.findById(shipId);
    if (!ship) throw new NotFoundError(`Ship ${shipId} not found`);
    assertCanAccessShip(actor, ship.id);
    return { ...ship };
  };
}
