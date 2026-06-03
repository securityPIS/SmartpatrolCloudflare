import type { VerifyEmailRequest } from "@smartpatrol/contracts";
import { InvalidTokenError } from "../../domain/errors";
import type { AuthDeps } from "./deps";

/** Confirm a pending registration's email via the one-time token. */
export function makeVerifyEmail(deps: AuthDeps) {
  return async (input: VerifyEmailRequest): Promise<{ verified: true }> => {
    const pending = await deps.pending.findById(input.id);
    if (!pending || !pending.verificationTokenHash) throw new InvalidTokenError();

    const hash = await deps.tokens.hashRefreshSecret(input.token);
    if (hash !== pending.verificationTokenHash) throw new InvalidTokenError();

    if (!pending.emailVerifiedAt) {
      await deps.pending.markEmailVerified(input.id, deps.clock.now());
    }
    return { verified: true };
  };
}
