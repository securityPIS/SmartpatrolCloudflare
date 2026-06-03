import type { Clock } from "../ports/Clock";
import type { EmailGateway } from "../ports/EmailGateway";
import type { IdGenerator } from "../ports/IdGenerator";
import type { PasswordHasher } from "../ports/PasswordHasher";
import type { PendingRegistrationRepository } from "../ports/PendingRegistrationRepository";
import type { ProfileRepository } from "../ports/ProfileRepository";

export interface AdminConfig {
  appUrl: string;
  emailFrom: string;
}

export interface AdminDeps {
  profiles: ProfileRepository;
  pending: PendingRegistrationRepository;
  hasher: PasswordHasher;
  email: EmailGateway;
  clock: Clock;
  ids: IdGenerator;
  config: AdminConfig;
}
