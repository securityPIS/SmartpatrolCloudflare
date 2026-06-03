import type { Clock } from "../ports/Clock";
import type { ProfileRepository } from "../ports/ProfileRepository";

export interface UserDeps {
  profiles: ProfileRepository;
  clock: Clock;
}
