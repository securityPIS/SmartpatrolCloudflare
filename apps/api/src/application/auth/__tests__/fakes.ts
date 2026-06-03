import type { PendingRegistrationStatus } from "@smartpatrol/contracts";
import type { Clock } from "../../ports/Clock";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { PasswordHasher } from "../../ports/PasswordHasher";
import type { EmailGateway, EmailMessage } from "../../ports/EmailGateway";
import type {
  NewProfile,
  ProfilePatch,
  ProfileRecord,
  ProfileRepository,
} from "../../ports/ProfileRepository";
import type { NewSession, SessionRecord, SessionRepository } from "../../ports/SessionRepository";
import type {
  NewPendingRegistration,
  PendingRegistrationRecord,
  PendingRegistrationRepository,
} from "../../ports/PendingRegistrationRepository";
import { JoseTokenService } from "../../../infrastructure/crypto/joseTokenService";
import type { AuthDeps } from "../deps";

export class InMemoryProfileRepository implements ProfileRepository {
  readonly rows = new Map<string, ProfileRecord>();

  async findAll(): Promise<ProfileRecord[]> {
    return Array.from(this.rows.values());
  }
  async findByEmail(email: string): Promise<ProfileRecord | null> {
    for (const p of this.rows.values()) if (p.email === email) return p;
    return null;
  }
  async findById(id: string): Promise<ProfileRecord | null> {
    return this.rows.get(id) ?? null;
  }
  async create(profile: NewProfile): Promise<void> {
    this.rows.set(profile.id, profile);
  }
  async update(id: string, patch: ProfilePatch): Promise<void> {
    const p = this.rows.get(id);
    if (p) this.rows.set(id, { ...p, ...patch });
  }
}

export class InMemorySessionRepository implements SessionRepository {
  readonly rows = new Map<string, SessionRecord>();

  async create(session: NewSession): Promise<void> {
    this.rows.set(session.id, { ...session, revokedAt: null });
  }
  async findById(id: string): Promise<SessionRecord | null> {
    return this.rows.get(id) ?? null;
  }
  async rotate(id: string, refreshTokenHash: string, expiresAt: number): Promise<void> {
    const s = this.rows.get(id);
    if (s) this.rows.set(id, { ...s, refreshTokenHash, expiresAt });
  }
  async revoke(id: string, revokedAt: number): Promise<void> {
    const s = this.rows.get(id);
    if (s) this.rows.set(id, { ...s, revokedAt });
  }
}

export class InMemoryPendingRepository implements PendingRegistrationRepository {
  readonly rows = new Map<string, PendingRegistrationRecord>();

  async findAll(status?: PendingRegistrationStatus): Promise<PendingRegistrationRecord[]> {
    const all = Array.from(this.rows.values());
    return status ? all.filter((r) => r.status === status) : all;
  }
  async findByEmail(email: string): Promise<PendingRegistrationRecord | null> {
    for (const p of this.rows.values()) if (p.email === email) return p;
    return null;
  }
  async findById(id: string): Promise<PendingRegistrationRecord | null> {
    return this.rows.get(id) ?? null;
  }
  async create(pending: NewPendingRegistration): Promise<void> {
    this.rows.set(pending.id, pending);
  }
  async markEmailVerified(id: string, verifiedAt: number): Promise<void> {
    const p = this.rows.get(id);
    if (p) this.rows.set(id, { ...p, emailVerifiedAt: verifiedAt, updatedAt: verifiedAt });
  }
  async updateStatus(
    id: string,
    status: PendingRegistrationStatus,
    updatedAt: number,
  ): Promise<void> {
    const p = this.rows.get(id);
    if (p) this.rows.set(id, { ...p, status, updatedAt });
  }
}

/** Fast, deterministic hasher for use-case tests (real scrypt tested separately). */
export class FakePasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return `hashed:${password}`;
  }
  async verify(password: string, encoded: string): Promise<boolean> {
    return encoded === `hashed:${password}`;
  }
}

export class CollectingEmailGateway implements EmailGateway {
  readonly sent: EmailMessage[] = [];
  async send(message: EmailMessage): Promise<void> {
    this.sent.push(message);
  }
}

export class MutableClock implements Clock {
  constructor(public current: number) {}
  now(): number {
    return this.current;
  }
  advance(ms: number): void {
    this.current += ms;
  }
}

export class SequentialIds implements IdGenerator {
  private n = 0;
  /** Deterministic but valid UUID v4 strings (sub is uuid-validated in JWTs). */
  uuid(): string {
    this.n += 1;
    const hex = this.n.toString(16).padStart(12, "0");
    return `00000000-0000-4000-8000-${hex}`;
  }
}

export interface TestDeps extends AuthDeps {
  profiles: InMemoryProfileRepository;
  sessions: InMemorySessionRepository;
  pending: InMemoryPendingRepository;
  email: CollectingEmailGateway;
  clock: MutableClock;
}

export function buildTestDeps(overrides: Partial<AuthDeps> = {}): TestDeps {
  // Base on real time so issued JWTs verify against jose's wall-clock check.
  const clock = new MutableClock(Date.now());
  const deps: TestDeps = {
    profiles: new InMemoryProfileRepository(),
    sessions: new InMemorySessionRepository(),
    pending: new InMemoryPendingRepository(),
    hasher: new FakePasswordHasher(),
    tokens: new JoseTokenService("test-secret-please-ignore", { clock }),
    email: new CollectingEmailGateway(),
    clock,
    ids: new SequentialIds(),
    config: { appUrl: "https://app.test", emailFrom: "noreply@test", refreshTtlSec: 2_592_000 },
    ...overrides,
  } as TestDeps;
  return deps;
}

export async function seedProfile(
  deps: TestDeps,
  partial: Partial<ProfileRecord> & { email: string; password: string },
): Promise<ProfileRecord> {
  const now = deps.clock.now();
  const profile: ProfileRecord = {
    id: partial.id ?? deps.ids.uuid(),
    email: partial.email,
    passwordHash: await deps.hasher.hash(partial.password),
    fullName: partial.fullName ?? "Test User",
    role: partial.role ?? "PETUGAS",
    enabled: partial.enabled ?? true,
    shipIds: partial.shipIds ?? [],
    createdAt: now,
    updatedAt: now,
  };
  await deps.profiles.create(profile);
  return profile;
}
