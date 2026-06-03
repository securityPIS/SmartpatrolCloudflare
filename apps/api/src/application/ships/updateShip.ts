import type { Ship, UpdateShipRequest } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertAdmin } from "../../domain/authz";
import { DomainError, NotFoundError } from "../../domain/errors";
import type { ShipDeps } from "./deps";

export function makeUpdateShip(deps: ShipDeps) {
  return async (actor: Actor, shipId: string, input: UpdateShipRequest): Promise<Ship> => {
    assertAdmin(actor);
    const ship = await deps.ships.findById(shipId);
    if (!ship) throw new NotFoundError(`Ship ${shipId} not found`);
    if (input.name && input.name !== ship.name) {
      const conflict = await deps.ships.findByName(input.name);
      if (conflict)
        throw new DomainError(
          "SHIP_NAME_TAKEN",
          `Ship name "${input.name}" is already in use`,
          409,
        );
    }
    const now = deps.clock.now();
    const patch = {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.customCheckpoints !== undefined && { customCheckpoints: input.customCheckpoints }),
      updatedAt: now,
    };
    await deps.ships.update(shipId, patch);
    return { ...ship, ...patch };
  };
}
