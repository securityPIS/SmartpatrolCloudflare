import type { Role } from "@smartpatrol/contracts";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import type { Actor } from "../../../domain/authz";
import { ForbiddenError, InvalidTokenError } from "../../../domain/errors";
import type { HonoEnv } from "../env";

/**
 * Read the authenticated {@link Actor} populated by `requireAuth`. Throws if the
 * route was not guarded by `requireAuth` first (programmer error / missing auth).
 */
export function getActor(c: Context<HonoEnv>): Actor {
  const actor = c.var.actor;
  if (!actor) throw new InvalidTokenError("Not authenticated");
  return actor;
}

/**
 * Require the authenticated actor to hold one of the given roles. Must run
 * AFTER `requireAuth`. Use for coarse, role-based route guards; finer ship-scoped
 * checks belong in the use-cases via the policy `assert*` helpers.
 */
export function requireRole(...roles: Role[]) {
  return createMiddleware<HonoEnv>(async (c, next) => {
    const actor = getActor(c);
    if (!roles.includes(actor.role)) {
      throw new ForbiddenError(`Requires role: ${roles.join(" or ")}`);
    }
    await next();
  });
}
