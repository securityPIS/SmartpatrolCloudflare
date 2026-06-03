import type { ShipDeps } from "./deps";
import { makeCreateShip } from "./createShip";
import { makeDeleteShip } from "./deleteShip";
import { makeGetShip } from "./getShip";
import { makeListShips } from "./listShips";
import { makeUpdateShip } from "./updateShip";

export type { ShipDeps } from "./deps";

export function createShipUseCases(deps: ShipDeps) {
  return {
    list: makeListShips(deps),
    get: makeGetShip(deps),
    create: makeCreateShip(deps),
    update: makeUpdateShip(deps),
    delete: makeDeleteShip(deps),
  };
}

export type ShipUseCases = ReturnType<typeof createShipUseCases>;
