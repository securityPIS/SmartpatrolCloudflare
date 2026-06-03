import { describe, expect, it } from "vitest";
import { ForbiddenError } from "../../errors";
import type { Actor } from "../actor";
import {
  assertAdmin,
  assertCanAccessShip,
  canAccessShip,
  canAccessStorageKey,
  canApproveRegistrations,
  canManageShips,
  canManageUsers,
  canViewPendingRegistration,
  isAdmin,
} from "../policy";

// Ships used across the matrix.
const SHIP_A = "11111111-1111-4111-8111-111111111111";
const SHIP_B = "22222222-2222-4222-8222-222222222222";
const SHIP_C = "33333333-3333-4333-8333-333333333333";

// Actors mirroring the three legacy RLS roles.
const admin: Actor = { id: "admin-1", role: "ADMIN", shipIds: [] };
const pic: Actor = { id: "pic-1", role: "PIC", shipIds: [SHIP_A] };
const petugas: Actor = { id: "petugas-1", role: "PETUGAS", shipIds: [SHIP_B] };

describe("authz policy — RLS replacement matrix", () => {
  describe("isAdmin", () => {
    it("is true only for ADMIN", () => {
      expect(isAdmin(admin)).toBe(true);
      expect(isAdmin(pic)).toBe(false);
      expect(isAdmin(petugas)).toBe(false);
    });
  });

  describe("canAccessShip — admin full; others only assigned ships", () => {
    const cases: Array<[Actor, string, boolean]> = [
      // ADMIN reaches every ship, even ones it has no assignment for.
      [admin, SHIP_A, true],
      [admin, SHIP_B, true],
      [admin, SHIP_C, true],
      // PIC assigned to A only.
      [pic, SHIP_A, true],
      [pic, SHIP_B, false],
      [pic, SHIP_C, false],
      // PETUGAS assigned to B only.
      [petugas, SHIP_A, false],
      [petugas, SHIP_B, true],
      [petugas, SHIP_C, false],
    ];

    it.each(cases)("%s vs ship → %s", (actor, shipId, expected) => {
      expect(canAccessShip(actor, shipId)).toBe(expected);
    });
  });

  describe("admin-only management surfaces", () => {
    const surfaces: Array<[string, (a: Actor) => boolean]> = [
      ["canManageShips", canManageShips],
      ["canManageUsers", canManageUsers],
      ["canApproveRegistrations", canApproveRegistrations],
    ];

    it.each(surfaces)("%s allows only ADMIN", (_name, fn) => {
      expect(fn(admin)).toBe(true);
      expect(fn(pic)).toBe(false);
      expect(fn(petugas)).toBe(false);
    });
  });

  describe("canViewPendingRegistration — admin or owner", () => {
    it("admin can view any registration", () => {
      expect(canViewPendingRegistration(admin, "someone-else")).toBe(true);
    });
    it("owner can view their own registration", () => {
      expect(canViewPendingRegistration(pic, pic.id)).toBe(true);
    });
    it("non-owner non-admin cannot view another's registration", () => {
      expect(canViewPendingRegistration(pic, petugas.id)).toBe(false);
    });
  });

  describe("canAccessStorageKey — ship-scoped objects", () => {
    it("admin reaches any object", () => {
      expect(canAccessStorageKey(admin, `ships/${SHIP_C}/photo.jpg`)).toBe(true);
    });
    it("member reaches objects under their ship", () => {
      expect(canAccessStorageKey(pic, `ships/${SHIP_A}/patrol/x.jpg`)).toBe(true);
    });
    it("member cannot reach objects under another ship", () => {
      expect(canAccessStorageKey(pic, `ships/${SHIP_B}/patrol/x.jpg`)).toBe(false);
    });
    it("non-admin rejected for keys outside the ship namespace", () => {
      expect(canAccessStorageKey(pic, `misc/x.jpg`)).toBe(false);
    });
  });

  describe("assert wrappers", () => {
    it("assertCanAccessShip throws ForbiddenError when denied", () => {
      expect(() => assertCanAccessShip(pic, SHIP_B)).toThrow(ForbiddenError);
      expect(() => assertCanAccessShip(pic, SHIP_A)).not.toThrow();
      expect(() => assertCanAccessShip(admin, SHIP_C)).not.toThrow();
    });
    it("assertAdmin throws ForbiddenError for non-admins", () => {
      expect(() => assertAdmin(pic)).toThrow(ForbiddenError);
      expect(() => assertAdmin(admin)).not.toThrow();
    });
  });
});
