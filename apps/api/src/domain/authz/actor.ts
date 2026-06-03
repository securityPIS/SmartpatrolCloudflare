import type { JwtPayload, Role } from "@smartpatrol/contracts";

/**
 * The authenticated principal, derived from a verified JWT. Authorization
 * decisions are made purely against this value — no I/O — so policies stay
 * deterministic and exhaustively testable (the Phase 2 RLS replacement).
 */
export interface Actor {
  readonly id: string;
  readonly role: Role;
  /** Ships assigned to the actor. Ignored for ADMIN (full access). */
  readonly shipIds: readonly string[];
}

/** Lift verified JWT claims into an {@link Actor}. */
export function actorFromClaims(claims: JwtPayload): Actor {
  return { id: claims.sub, role: claims.role, shipIds: claims.shipIds };
}
