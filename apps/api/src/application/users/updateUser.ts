import type { UpdateProfileRequest, UserDto } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertAdmin } from "../../domain/authz";
import { NotFoundError } from "../../domain/errors";
import { toUserDto } from "../auth/deps";
import type { UserDeps } from "./deps";

export function makeUpdateUser(deps: UserDeps) {
  return async (actor: Actor, userId: string, input: UpdateProfileRequest): Promise<UserDto> => {
    assertAdmin(actor);
    const profile = await deps.profiles.findById(userId);
    if (!profile) throw new NotFoundError("User not found");
    const patch = {
      ...(input.fullName !== undefined && { fullName: input.fullName }),
      ...(input.role !== undefined && { role: input.role }),
      ...(input.enabled !== undefined && { enabled: input.enabled }),
      ...(input.shipIds !== undefined && { shipIds: input.shipIds }),
      updatedAt: deps.clock.now(),
    };
    await deps.profiles.update(userId, patch);
    return toUserDto({ ...profile, ...patch });
  };
}
