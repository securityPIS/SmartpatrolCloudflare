import type { UserDeps } from "./deps";
import { makeListUsers } from "./listUsers";
import { makeUpdateUser } from "./updateUser";

export type { UserDeps } from "./deps";

export function createUserUseCases(deps: UserDeps) {
  return {
    list: makeListUsers(deps),
    update: makeUpdateUser(deps),
  };
}

export type UserUseCases = ReturnType<typeof createUserUseCases>;
