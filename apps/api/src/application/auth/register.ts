import type { RegisterRequest, RegisterResponse } from "@smartpatrol/contracts";
import { EmailTakenError } from "../../domain/errors";
import type { AuthDeps } from "./deps";

/**
 * Register a new applicant. Creates a PENDING registration (awaiting admin
 * approval in Phase 3) and emails a verification link. Never issues tokens.
 */
export function makeRegister(deps: AuthDeps) {
  return async (input: RegisterRequest): Promise<RegisterResponse> => {
    const [existingProfile, existingPending] = await Promise.all([
      deps.profiles.findByEmail(input.email),
      deps.pending.findByEmail(input.email),
    ]);
    if (existingProfile) throw new EmailTakenError();
    if (existingPending && existingPending.status !== "REJECTED") throw new EmailTakenError();

    const now = deps.clock.now();
    const id = deps.ids.uuid();
    const passwordHash = await deps.hasher.hash(input.password);
    const verificationToken = deps.ids.uuid();
    const verificationTokenHash = await deps.tokens.hashRefreshSecret(verificationToken);

    await deps.pending.create({
      id,
      email: input.email,
      fullName: input.fullName,
      passwordHash,
      requestedShipName: input.shipName ?? null,
      instansi: input.instansi ?? null,
      workerNumber: input.workerNumber ?? null,
      phone: input.phone ?? null,
      photoUrl: input.photoUrl ?? null,
      status: "PENDING",
      emailVerifiedAt: null,
      verificationTokenHash,
      createdAt: now,
      updatedAt: now,
    });

    const link = `${deps.config.appUrl}/verify-email?id=${id}&token=${verificationToken}`;
    try {
      await deps.email.send({
        to: input.email,
        subject: "Verify your SmartPatrol registration",
        html: `<p>Hi ${input.fullName},</p>
<p>Confirm your email to complete your SmartPatrol registration:</p>
<p><a href="${link}">Verify email</a></p>
<p>After verification an administrator will review and approve your account.</p>`,
        text: `Verify your SmartPatrol email: ${link}`,
      });
    } catch (err) {
      // Email is best-effort; registration still succeeds.
      console.error("[register] verification email failed:", err);
    }

    return {
      status: "PENDING",
      message: "Registration received. Verify your email; an admin will approve your account.",
    };
  };
}
