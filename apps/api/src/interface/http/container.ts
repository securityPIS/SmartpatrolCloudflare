import { createDb } from "@smartpatrol/db";
import { createAuthUseCases, type AuthConfig, type AuthUseCases } from "../../application/auth";
import { createAdminUseCases, type AdminUseCases } from "../../application/admin";
import { createShipUseCases, type ShipUseCases } from "../../application/ships";
import { createUserUseCases, type UserUseCases } from "../../application/users";
import { createPatrolUseCases, type PatrolUseCases } from "../../application/patrol";
import type { TokenService } from "../../application/ports/TokenService";
import { JoseTokenService } from "../../infrastructure/crypto/joseTokenService";
import { ScryptPasswordHasher } from "../../infrastructure/crypto/scryptPasswordHasher";
import { DrizzleProfileRepository } from "../../infrastructure/db/drizzleProfileRepository";
import { DrizzleSessionRepository } from "../../infrastructure/db/drizzleSessionRepository";
import { DrizzlePendingRegistrationRepository } from "../../infrastructure/db/drizzlePendingRegistrationRepository";
import { DrizzleShipRepository } from "../../infrastructure/db/drizzleShipRepository";
import { DrizzlePatrolReportRepository } from "../../infrastructure/db/drizzlePatrolReportRepository";
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
  ships: ShipUseCases;
  users: UserUseCases;
  admin: AdminUseCases;
  patrol: PatrolUseCases;
}

export function createContainer(env: Env): Container {
  if (!env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");

  const db = createDb(env.DB);
  const tokens = new JoseTokenService(env.JWT_SECRET, { clock: systemClock });
  const emailFrom = env.EMAIL_FROM ?? DEFAULT_EMAIL_FROM;
  const email = env.RESEND_API_KEY
    ? new ResendEmailGateway(env.RESEND_API_KEY, emailFrom)
    : new NoopEmailGateway();

  const appUrl = env.APP_URL ?? "http://localhost:5173";
  const config: AuthConfig = {
    appUrl,
    emailFrom,
    refreshTtlSec: REFRESH_TTL_SEC,
  };

  const profileRepo = new DrizzleProfileRepository(db);
  const pendingRepo = new DrizzlePendingRegistrationRepository(db);
  const shipRepo = new DrizzleShipRepository(db);

  const auth = createAuthUseCases({
    profiles: profileRepo,
    sessions: new DrizzleSessionRepository(db),
    pending: pendingRepo,
    hasher: new ScryptPasswordHasher(),
    tokens,
    email,
    clock: systemClock,
    ids: uuidGenerator,
    config,
  });

  const ships = createShipUseCases({ ships: shipRepo, clock: systemClock, ids: uuidGenerator });
  const users = createUserUseCases({ profiles: profileRepo, clock: systemClock });
  const patrol = createPatrolUseCases({
    patrols: new DrizzlePatrolReportRepository(db),
    ships: shipRepo,
    clock: systemClock,
    ids: uuidGenerator,
  });
  const admin = createAdminUseCases({
    profiles: profileRepo,
    pending: pendingRepo,
    hasher: new ScryptPasswordHasher(),
    email,
    clock: systemClock,
    ids: uuidGenerator,
    config: { appUrl, emailFrom },
  });

  return { tokens, auth, ships, users, admin, patrol };
}
