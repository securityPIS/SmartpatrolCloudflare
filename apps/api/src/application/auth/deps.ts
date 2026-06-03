import type { UserDto } from "@smartpatrol/contracts";
import type { Clock } from "../ports/Clock";
import type { IdGenerator } from "../ports/IdGenerator";
import type { PasswordHasher } from "../ports/PasswordHasher";
import type { TokenService } from "../ports/TokenService";
import type { ProfileRepository, ProfileRecord } from "../ports/ProfileRepository";
import type { SessionRepository } from "../ports/SessionRepository";
import type { PendingRegistrationRepository } from "../ports/PendingRegistrationRepository";
import type { EmailGateway } from "../ports/EmailGateway";

export interface AuthConfig {
  /** Public web app URL, used to build email links. */
  appUrl: string;
  /** From address for outbound email. */
  emailFrom: string;
  /** Refresh-token lifetime in seconds (default 30 days). */
  refreshTtlSec: number;
}

export interface AuthDeps {
  profiles: ProfileRepository;
  sessions: SessionRepository;
  pending: PendingRegistrationRepository;
  hasher: PasswordHasher;
  tokens: TokenService;
  email: EmailGateway;
  clock: Clock;
  ids: IdGenerator;
  config: AuthConfig;
}

/** Map an internal profile record to the public user DTO (never leaks the hash). */
export function toUserDto(p: ProfileRecord): UserDto {
  return {
    id: p.id,
    email: p.email,
    fullName: p.fullName,
    role: p.role,
    enabled: p.enabled,
    shipIds: p.shipIds,
  };
}
