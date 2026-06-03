import type { CreateShipRequest, Ship } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertAdmin } from "../../domain/authz";
import { DomainError } from "../../domain/errors";
import type { ShipDeps } from "./deps";

export function makeCreateShip(deps: ShipDeps) {
  return async (actor: Actor, input: CreateShipRequest): Promise<Ship> => {
    assertAdmin(actor);
    const existing = await deps.ships.findByName(input.name);
    if (existing)
      throw new DomainError("SHIP_NAME_TAKEN", `Ship name "${input.name}" is already in use`, 409);
    const now = deps.clock.now();
    const ship = {
      id: deps.ids.uuid(),
      name: input.name,
      customCheckpoints: input.customCheckpoints ?? [],
      createdAt: now,
      updatedAt: now,
    };
    await deps.ships.create(ship);
    return { ...ship };
  };
}
