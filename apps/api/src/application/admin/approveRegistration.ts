import type { UserDto } from "@smartpatrol/contracts";
import type { Actor } from "../../domain/authz";
import { assertAdmin } from "../../domain/authz";
import { DomainError, NotFoundError } from "../../domain/errors";
import { toUserDto } from "../auth/deps";
import type { AdminDeps } from "./deps";

export function makeApproveRegistration(deps: AdminDeps) {
  return async (actor: Actor, pendingId: string): Promise<UserDto> => {
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
    if (!pending.emailVerifiedAt) {
      throw new DomainError(
        "EMAIL_NOT_VERIFIED",
        "The applicant has not verified their email address",
        422,
      );
    }

    const conflict = await deps.profiles.findByEmail(pending.email);
    if (conflict) {
      throw new DomainError("AUTH_EMAIL_TAKEN", "A profile with this email already exists", 409);
    }

    const now = deps.clock.now();
    const profile = {
      id: deps.ids.uuid(),
      email: pending.email,
      passwordHash: pending.passwordHash,
      fullName: pending.fullName,
      role: "PETUGAS" as const,
      enabled: true,
      shipIds: [] as string[],
      createdAt: now,
      updatedAt: now,
    };

    await deps.profiles.create(profile);
    await deps.pending.updateStatus(pendingId, "APPROVED", now);

    await deps.email.send({
      to: pending.email,
      subject: "Your SmartPatrol account has been approved",
      html: `<p>Hi ${pending.fullName},</p><p>Your account has been approved. <a href="${deps.config.appUrl}/login">Sign in here</a>.</p>`,
      text: `Hi ${pending.fullName}, your account has been approved. Sign in at ${deps.config.appUrl}/login`,
    });

    return toUserDto(profile);
  };
}
