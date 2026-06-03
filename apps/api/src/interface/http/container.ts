import { createDb } from "@smartpatrol/db";
import { createAuthUseCases, type AuthConfig, type AuthUseCases } from "../../application/auth";
import type { TokenService } from "../../application/ports/TokenService";
import { JoseTokenService } from "../../infrastructure/crypto/joseTokenService";
import { ScryptPasswordHasher } from "../../infrastructure/crypto/scryptPasswordHasher";
import { DrizzleProfileRepository } from "../../infrastructure/db/drizzleProfileRepository";
import { DrizzleSessionRepository } from "../../infrastructure/db/drizzleSessionRepository";
import { DrizzlePendingRegistrationRepository } from "../../infrastructure/db/drizzlePendingRegistrationRepository";
import { NoopEmailGateway } from "../../infrastructure/email/noopEmailGateway";
import { ResendEmailGateway } from "../../infrastructure/email/resendEmailGateway";
import { systemClock } from "../../infrastructure/system/systemClock";
import { uuidGenerator } from "../../infrastructure/system/uuidGenerator";
import type { Env } from "./env";

const DEFAULT_EMAIL_FROM = "SmartPatrol <onboarding@resend.dev>";
const REFRESH_TTL_SEC = 30 * 24 * 60 * 60; // 30 days

/** Composition root: concrete adapters wired into use-cases. */
export interface Container {
  tokens: TokenService;
  auth: AuthUseCases;
}

export function createContainer(env: Env): Container {
  if (!env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");

  const db = createDb(env.DB);
  const tokens = new JoseTokenService(env.JWT_SECRET, { clock: systemClock });
  const emailFrom = env.EMAIL_FROM ?? DEFAULT_EMAIL_FROM;
  const email = env.RESEND_API_KEY
    ? new ResendEmailGateway(env.RESEND_API_KEY, emailFrom)
    : new NoopEmailGateway();

  const config: AuthConfig = {
    appUrl: env.APP_URL ?? "http://localhost:5173",
    emailFrom,
    refreshTtlSec: REFRESH_TTL_SEC,
  };

  const auth = createAuthUseCases({
    profiles: new DrizzleProfileRepository(db),
    sessions: new DrizzleSessionRepository(db),
    pending: new DrizzlePendingRegistrationRepository(db),
    hasher: new ScryptPasswordHasher(),
    tokens,
    email,
    clock: systemClock,
    ids: uuidGenerator,
    config,
  });

  return { tokens, auth };
}
