import type { AuthResponse, LoginRequest } from "@smartpatrol/contracts";
import { AccountDisabledError, InvalidCredentialsError } from "../../domain/errors";
import type { AuthDeps } from "./deps";
import { issueSession } from "./issueSession";

export function makeLogin(deps: AuthDeps) {
  return async (input: LoginRequest, userAgent: string | null = null): Promise<AuthResponse> => {
    const profile = await deps.profiles.findByEmail(input.email);
    if (!profile) throw new InvalidCredentialsError();

    const ok = await deps.hasher.verify(input.password, profile.passwordHash);
    if (!ok) throw new InvalidCredentialsError();

    if (!profile.enabled) throw new AccountDisabledError();

    return issueSession(deps, profile, userAgent);
  };
}
