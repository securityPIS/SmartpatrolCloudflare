import { createMiddleware } from "hono/factory";
import { actorFromClaims } from "../../../domain/authz";
import { InvalidTokenError } from "../../../domain/errors";
import type { HonoEnv } from "../env";

/** Require a valid Bearer access token; populates `userId`, `claims` + `actor`. */
export const requireAuth = createMiddleware<HonoEnv>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw new InvalidTokenError("Missing bearer token");
  }
  const token = header.slice("Bearer ".length).trim();
  const payload = await c.var.resolve().tokens.verifyAccessToken(token);
  c.set("userId", payload.sub);
  c.set("claims", payload);
  c.set("actor", actorFromClaims(payload));
  await next();
});
