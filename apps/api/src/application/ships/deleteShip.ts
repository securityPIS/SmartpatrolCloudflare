import type { Actor } from "../../domain/authz";
import { assertAdmin } from "../../domain/authz";
import { NotFoundError } from "../../domain/errors";
import type { ShipDeps } from "./deps";

export function makeDeleteShip(deps: ShipDeps) {
  return async (actor: Actor, shipId: string): Promise<void> => {
    assertAdmin(actor);
    const ship = await deps.ships.findById(shipId);
    if (!ship) throw new NotFoundError(`Ship ${shipId} not found`);
    await deps.ships.delete(shipId);
  };
}
