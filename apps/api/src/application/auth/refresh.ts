import type { AuthTokens, RefreshRequest } from "@smartpatrol/contracts";
import { AccountDisabledError, InvalidTokenError } from "../../domain/errors";
import type { AuthDeps } from "./deps";

/** Validate a refresh token, rotate it, and issue a new access token. */
export function makeRefresh(deps: AuthDeps) {
  return async (input: RefreshRequest): Promise<AuthTokens> => {
    const parsed = deps.tokens.parseRefreshToken(input.refreshToken);
    if (!parsed) throw new InvalidTokenError();

    const session = await deps.sessions.findById(parsed.sessionId);
    const now = deps.clock.now();
    if (!session || session.revokedAt !== null || session.expiresAt <= now) {
      throw new InvalidTokenError();
    }

    const secretHash = await deps.tokens.hashRefreshSecret(parsed.secret);
    if (secretHash !== session.refreshTokenHash) throw new InvalidTokenError();

    const profile = await deps.profiles.findById(session.userId);
    if (!profile) throw new InvalidTokenError();
    if (!profile.enabled) throw new AccountDisabledError();

    // Rotate the refresh secret in place (old token becomes invalid).
    const rotated = await deps.tokens.createRefreshToken(session.id);
    await deps.sessions.rotate(
      session.id,
      rotated.secretHash,
      now + deps.config.refreshTtlSec * 1000,
    );

    const access = await deps.tokens.issueAccessToken({
      sub: profile.id,
      role: profile.role,
      shipIds: profile.shipIds,
    });

    return {
      accessToken: access.token,
      refreshToken: rotated.token,
      expiresAt: access.expiresAt,
    };
  };
}
