import type { UserDto } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertAdmin } from "../../domain/authz";
import { toUserDto } from "../auth/deps";
import type { UserDeps } from "./deps";

export function makeListUsers(deps: UserDeps) {
  return async (actor: Actor): Promise<UserDto[]> => {
    assertAdmin(actor);
    const rows = await deps.profiles.findAll();
    return rows.map(toUserDto);
  };
}
