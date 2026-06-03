import type { LogoutRequest } from "@smartpatrol/contracts";
import type { AuthDeps } from "./deps";

/** Revoke the session behind a refresh token. Idempotent. */
export function makeLogout(deps: AuthDeps) {
  return async (input: LogoutRequest): Promise<void> => {
    const parsed = deps.tokens.parseRefreshToken(input.refreshToken);
    if (!parsed) return;

    const session = await deps.sessions.findById(parsed.sessionId);
    if (session && session.revokedAt === null) {
      await deps.sessions.revoke(session.id, deps.clock.now());
    }
  };
}
