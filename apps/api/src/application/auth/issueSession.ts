import type { AuthResponse } from "@smartpatrol/contracts";
import type { AuthDeps } from "./deps";
import { toUserDto } from "./deps";
import type { ProfileRecord } from "../ports/ProfileRepository";

/** Create a fresh session for a profile and return the auth response (login). */
export async function issueSession(
  deps: AuthDeps,
  profile: ProfileRecord,
  userAgent: string | null = null,
): Promise<AuthResponse> {
  const now = deps.clock.now();
  const sessionId = deps.ids.uuid();
  const refresh = await deps.tokens.createRefreshToken(sessionId);

  await deps.sessions.create({
    id: sessionId,
    userId: profile.id,
    refreshTokenHash: refresh.secretHash,
    userAgent,
    expiresAt: now + deps.config.refreshTtlSec * 1000,
    createdAt: now,
  });

  const access = await deps.tokens.issueAccessToken({
    sub: profile.id,
    role: profile.role,
    shipIds: profile.shipIds,
  });

  return {
    user: toUserDto(profile),
    tokens: {
      accessToken: access.token,
      refreshToken: refresh.token,
      expiresAt: access.expiresAt,
    },
  };
}
