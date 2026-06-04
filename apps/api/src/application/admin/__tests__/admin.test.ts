import { describe, expect, it } from "vitest";
import { ForbiddenError } from "../../../domain/errors";
import { buildTestDeps, InMemoryPendingRepository } from "../../auth/__tests__/fakes";
import { createAdminUseCases } from "../index";
import type { Actor } from "../../../domain/authz";

const ADMIN: Actor = { id: "admin-1", role: "ADMIN", shipIds: [] };
const NON_ADMIN: Actor = { id: "pic-1", role: "PIC", shipIds: [] };

function buildAdminDeps() {
  const base = buildTestDeps();
  return {
    ...base,
    adminUc: createAdminUseCases({
      profiles: base.profiles,
      pending: base.pending,
      hasher: base.hasher,
      email: base.email,
      clock: base.clock,
      ids: base.ids,
      config: { appUrl: "https://app.test", emailFrom: "noreply@test" },
    }),
  };
}

async function seedPending(
  pending: InMemoryPendingRepository,
  overrides: Partial<{
    id: string;
    email: string;
    emailVerifiedAt: number | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
  }> = {},
) {
  const rec = {
    id: overrides.id ?? "pending-1",
    email: overrides.email ?? "applicant@example.com",
    fullName: "Applicant User",
    passwordHash: "hashed:password",
    requestedShipName: null,
    instansi: null,
    workerNumber: null,
    phone: null,
    photoUrl: null,
    status: overrides.status ?? ("PENDING" as const),
    emailVerifiedAt: ("emailVerifiedAt" in overrides ? overrides.emailVerifiedAt : Date.now()) as
      | number
      | null,
    verificationTokenHash: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await pending.create(rec);
  return rec;
}

describe("admin use-cases", () => {
  describe("listPending", () => {
    it("admin can list all pending registrations", async () => {
      const { adminUc, pending } = buildAdminDeps();
      await seedPending(pending);
      const list = await adminUc.listPending(ADMIN);
      expect(list.length).toBe(1);
      expect(list[0].email).toBe("applicant@example.com");
    });

    it("non-admin is forbidden", async () => {
      const { adminUc } = buildAdminDeps();
      await expect(adminUc.listPending(NON_ADMIN)).rejects.toThrow(ForbiddenError);
    });

    it("can filter by status", async () => {
      const { adminUc, pending } = buildAdminDeps();
      await seedPending(pending, { id: "p1", email: "a@test.com", status: "PENDING" });
      await seedPending(pending, { id: "p2", email: "b@test.com", status: "APPROVED" });
      const pending_ = await adminUc.listPending(ADMIN, "PENDING");
      expect(pending_.length).toBe(1);
      expect(pending_[0].email).toBe("a@test.com");
    });
  });

  describe("approveRegistration", () => {
    it("creates a profile and marks pending as APPROVED", async () => {
      const { adminUc, pending, profiles } = buildAdminDeps();
      await seedPending(pending);
      const user = await adminUc.approve(ADMIN, "pending-1");
      expect(user.email).toBe("applicant@example.com");
      expect(user.role).toBe("PETUGAS");
      const rec = await profiles.findByEmail("applicant@example.com");
      expect(rec).not.toBeNull();
      const updated = await pending.findById("pending-1");
      expect(updated?.status).toBe("APPROVED");
    });

    it("non-admin is forbidden", async () => {
      const { adminUc, pending } = buildAdminDeps();
      await seedPending(pending);
      await expect(adminUc.approve(NON_ADMIN, "pending-1")).rejects.toThrow(ForbiddenError);
    });

    it("fails if email not verified", async () => {
      const { adminUc, pending } = buildAdminDeps();
      await seedPending(pending, { emailVerifiedAt: null });
      await expect(adminUc.approve(ADMIN, "pending-1")).rejects.toMatchObject({
        code: "EMAIL_NOT_VERIFIED",
        status: 422,
      });
    });

    it("fails if already resolved", async () => {
      const { adminUc, pending } = buildAdminDeps();
      await seedPending(pending, { status: "APPROVED" });
      await expect(adminUc.approve(ADMIN, "pending-1")).rejects.toMatchObject({
        code: "REGISTRATION_ALREADY_RESOLVED",
        status: 409,
      });
    });
  });

  describe("rejectRegistration", () => {
    it("marks pending as REJECTED", async () => {
      const { adminUc, pending } = buildAdminDeps();
      await seedPending(pending);
      await adminUc.reject(ADMIN, "pending-1");
      const rec = await pending.findById("pending-1");
      expect(rec?.status).toBe("REJECTED");
    });

    it("non-admin is forbidden", async () => {
      const { adminUc, pending } = buildAdminDeps();
      await seedPending(pending);
      await expect(adminUc.reject(NON_ADMIN, "pending-1")).rejects.toThrow(ForbiddenError);
    });

    it("fails if already resolved", async () => {
      const { adminUc, pending } = buildAdminDeps();
      await seedPending(pending, { status: "REJECTED" });
      await expect(adminUc.reject(ADMIN, "pending-1")).rejects.toMatchObject({
        code: "REGISTRATION_ALREADY_RESOLVED",
      });
    });
  });
});
