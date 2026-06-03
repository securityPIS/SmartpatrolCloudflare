import { makeApproveRegistration } from "./approveRegistration";
import type { AdminDeps } from "./deps";
import { makeListPending } from "./listPending";
import { makeRejectRegistration } from "./rejectRegistration";

export type { AdminDeps, AdminConfig } from "./deps";

export function createAdminUseCases(deps: AdminDeps) {
  return {
    listPending: makeListPending(deps),
    approve: makeApproveRegistration(deps),
    reject: makeRejectRegistration(deps),
  };
}

export type AdminUseCases = ReturnType<typeof createAdminUseCases>;
