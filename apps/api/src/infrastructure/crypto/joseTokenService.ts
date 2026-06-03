import { SignJWT, jwtVerify } from "jose";
import { bytesToHex, randomBytes } from "@noble/hashes/utils";
import { JwtPayload } from "@smartpatrol/contracts";
import type { Clock } from "../../application/ports/Clock";
import type {
  AccessTokenClaims,
  CreatedRefreshToken,
  IssuedAccessToken,
  ParsedRefreshToken,
  TokenService,
} from "../../application/ports/TokenService";
import { InvalidTokenError } from "../../domain/errors";

const ALG = "HS256";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(digest));
}

export interface JoseTokenServiceOptions {
  /** Access-token lifetime in seconds (default 15 min). */
  accessTtlSec?: number;
  clock?: Clock;
}

/** JWT (HS256) access tokens + opaque, session-bound refresh tokens. */
export class JoseTokenService implements TokenService {
  private readonly key: Uint8Array;
  private readonly accessTtlSec: number;
  private readonly clock: Clock;

  constructor(secret: string, opts: JoseTokenServiceOptions = {}) {
    if (!secret) throw new Error("JWT secret is required");
    this.key = new TextEncoder().encode(secret);
    this.accessTtlSec = opts.accessTtlSec ?? 15 * 60;
    this.clock = opts.clock ?? { now: () => Date.now() };
  }

  async issueAccessToken(claims: AccessTokenClaims): Promise<IssuedAccessToken> {
    const iat = Math.floor(this.clock.now() / 1000);
    const exp = iat + this.accessTtlSec;
    const token = await new SignJWT({ role: claims.role, shipIds: claims.shipIds })
      .setProtectedHeader({ alg: ALG })
      .setSubject(claims.sub)
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .sign(this.key);
    return { token, expiresAt: exp * 1000 };
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const { payload } = await jwtVerify(token, this.key, { algorithms: [ALG] });
      return JwtPayload.parse({
        sub: payload.sub,
        role: payload.role,
        shipIds: payload.shipIds,
        iat: payload.iat,
        exp: payload.exp,
      });
    } catch {
      throw new InvalidTokenError("Invalid or expired access token");
    }
  }

  async createRefreshToken(sessionId: string): Promise<CreatedRefreshToken> {
    const secret = bytesToHex(randomBytes(32));
    const secretHash = await sha256Hex(secret);
    return { token: `${sessionId}.${secret}`, secretHash };
  }

  parseRefreshToken(token: string): ParsedRefreshToken | null {
    const idx = token.indexOf(".");
    if (idx <= 0 || idx === token.length - 1) return null;
    return { sessionId: token.slice(0, idx), secret: token.slice(idx + 1) };
  }

  hashRefreshSecret(secret: string): Promise<string> {
    return sha256Hex(secret);
  }
}
