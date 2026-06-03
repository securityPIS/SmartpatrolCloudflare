import type { Actor } from "../../domain/authz";
import { assertAdmin } from "../../domain/authz";
import { DomainError, NotFoundError } from "../../domain/errors";
import type { AdminDeps } from "./deps";

export function makeRejectRegistration(deps: AdminDeps) {
  return async (actor: Actor, pendingId: string): Promise<void> => {
    assertAdmin(actor);
    const pending = await deps.pending.findById(pendingId);
    if (!pending) throw new NotFoundError("Registration not found");
    if (pending.status !== "PENDING") {
      throw new DomainError(
        "REGISTRATION_ALREADY_RESOLVED",
        `Registration is already ${pending.status}`,
        409,
      );
    }
    await deps.pending.updateStatus(pendingId, "REJECTED", deps.clock.now());
  };
}
