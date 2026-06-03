import type { Ship } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { canAccessShip, isAdmin } from "../../domain/authz";
import type { ShipDeps } from "./deps";

export function makeListShips(deps: ShipDeps) {
  return async (actor: Actor): Promise<Ship[]> => {
    const rows = await deps.ships.findAll();
    const visible = isAdmin(actor) ? rows : rows.filter((s) => canAccessShip(actor, s.id));
    return visible.map((r) => ({ ...r }));
  };
}
