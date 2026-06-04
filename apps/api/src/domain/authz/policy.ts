import { ForbiddenError } from "../errors";
import type { Actor } from "./actor";

/**
 * Authorization policy — the explicit replacement for the legacy Postgres RLS.
 *
 * Rules mirrored from the old RLS, 1:1:
 *  - ADMIN has full access to every ship and every management surface.
 *  - PIC / PETUGAS may only touch ships they are assigned to.
 *  - A pending registration is visible to an ADMIN or to its owner.
 *  - Storage objects are ship-scoped (`ships/<shipId>/...`).
 *
 * Every predicate is a pure function of the {@link Actor}; the `assert*`
 * wrappers throw {@link ForbiddenError} for use inside use-cases (Phase 2.2).
 */

export function isAdmin(actor: Actor): boolean {
  return actor.role === "ADMIN";
}

/**
 * Ship-scoped access — the heart of the RLS rules. ADMIN sees every ship;
 * PIC / PETUGAS only the ships explicitly assigned to them.
 */
export function canAccessShip(actor: Actor, shipId: string): boolean {
  return isAdmin(actor) || actor.shipIds.includes(shipId);
}

// --- Admin-only management surfaces (users, ships, approvals) ---
export function canManageShips(actor: Actor): boolean {
  return isAdmin(actor);
}

export function canManageUsers(actor: Actor): boolean {
  return isAdmin(actor);
}

export function canApproveRegistrations(actor: Actor): boolean {
  return isAdmin(actor);
}

/** The management dashboard / Daily Report is open to ADMIN and PIC. */
export function canAccessDashboard(actor: Actor): boolean {
  return actor.role === "ADMIN" || actor.role === "PIC";
}

/** A pending registration is visible to an admin or to the owner who created it. */
export function canViewPendingRegistration(actor: Actor, ownerId: string): boolean {
  return isAdmin(actor) || actor.id === ownerId;
}

// --- Ship-scoped feature policies (compose canAccessShip) ---
export function canSubmitPatrol(actor: Actor, shipId: string): boolean {
  return canAccessShip(actor, shipId);
}

export function canViewPatrol(actor: Actor, shipId: string): boolean {
  return canAccessShip(actor, shipId);
}

export function canManageIncident(actor: Actor, shipId: string): boolean {
  return canAccessShip(actor, shipId);
}

export function canRaiseSos(actor: Actor, shipId: string): boolean {
  return canAccessShip(actor, shipId);
}

/**
 * Storage object keys are ship-scoped (`ships/<shipId>/...`). Mirrors the
 * legacy storage RLS: only an admin, or a member of that ship, may read/write.
 */
export function canAccessStorageKey(actor: Actor, key: string): boolean {
  if (isAdmin(actor)) return true;
  const match = /^ships\/([^/]+)\//.exec(key);
  return match !== null && actor.shipIds.includes(match[1]);
}

// --- assert wrappers: throw ForbiddenError when the predicate fails ---

export function assertCanAccessShip(actor: Actor, shipId: string): void {
  if (!canAccessShip(actor, shipId)) {
    throw new ForbiddenError(`You are not assigned to ship ${shipId}`);
  }
}

export function assertAdmin(actor: Actor): void {
  if (!isAdmin(actor)) {
    throw new ForbiddenError("Administrator role required");
  }
}

export function assertCanAccessDashboard(actor: Actor): void {
  if (!canAccessDashboard(actor)) {
    throw new ForbiddenError("Dashboard access requires ADMIN or PIC");
  }
}

export function assertCanViewPendingRegistration(actor: Actor, ownerId: string): void {
  if (!canViewPendingRegistration(actor, ownerId)) {
    throw new ForbiddenError("You may only view your own registration");
  }
}

export function assertCanAccessStorageKey(actor: Actor, key: string): void {
  if (!canAccessStorageKey(actor, key)) {
    throw new ForbiddenError("You may not access this object");
  }
}
