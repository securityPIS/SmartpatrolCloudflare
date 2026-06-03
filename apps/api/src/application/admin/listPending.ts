import type { PendingRegistration, PendingRegistrationStatus } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertAdmin } from "../../domain/authz";
import type { AdminDeps } from "./deps";

export function makeListPending(deps: AdminDeps) {
  return async (
    actor: Actor,
    status?: PendingRegistrationStatus,
  ): Promise<PendingRegistration[]> => {
    assertAdmin(actor);
    const rows = await deps.pending.findAll(status);
    return rows.map((r) => ({
      id: r.id,
      email: r.email,
      fullName: r.fullName,
      requestedShipName: r.requestedShipName,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  };
}
