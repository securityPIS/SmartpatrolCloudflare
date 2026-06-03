import type { JwtPayload, Role } from "@smartpatrol/contracts";

export interface AccessTokenClaims {
  sub: string;
  role: Role;
  shipIds: string[];
}

export interface IssuedAccessToken {
  token: string;
  /** Expiry in epoch milliseconds. */
  expiresAt: number;
}

export interface CreatedRefreshToken {
  /** Opaque token handed to the client: `${sessionId}.${secret}`. */
  token: string;
  /** Hash of the secret part — this is what gets stored in the session row. */
  secretHash: string;
}

export interface ParsedRefreshToken {
  sessionId: string;
  secret: string;
}

/** Access-token (JWT) + opaque refresh-token operations. */
export interface TokenService {
  issueAccessToken(claims: AccessTokenClaims): Promise<IssuedAccessToken>;
  verifyAccessToken(token: string): Promise<JwtPayload>;
  createRefreshToken(sessionId: string): Promise<CreatedRefreshToken>;
  parseRefreshToken(token: string): ParsedRefreshToken | null;
  hashRefreshSecret(secret: string): Promise<string>;
}
