import type { UserDto } from "@smartpatrol/contracts";
import { NotFoundError } from "../../domain/errors";
import type { AuthDeps } from "./deps";
import { toUserDto } from "./deps";

export function makeMe(deps: AuthDeps) {
  return async (userId: string): Promise<UserDto> => {
    const profile = await deps.profiles.findById(userId);
    if (!profile) throw new NotFoundError("User not found");
    return toUserDto(profile);
  };
}
