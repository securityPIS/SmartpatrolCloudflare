import { scryptAsync } from "@noble/hashes/scrypt";
import { bytesToHex, hexToBytes, randomBytes } from "@noble/hashes/utils";
import type { PasswordHasher } from "../../application/ports/PasswordHasher";

// scrypt parameters (OWASP-aligned, runs in a few tens of ms on the Worker).
const N = 32768; // CPU/memory cost (2^15)
const R = 8;
const P = 1;
const DK_LEN = 32;
const SALT_LEN = 16;

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

/** Password hasher backed by scrypt. Encoded form: `scrypt$N$r$p$saltHex$hashHex`. */
export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(SALT_LEN);
    const dk = await scryptAsync(password, salt, { N, r: R, p: P, dkLen: DK_LEN });
    return `scrypt$${N}$${R}$${P}$${bytesToHex(salt)}$${bytesToHex(dk)}`;
  }

  async verify(password: string, encoded: string): Promise<boolean> {
    const parts = encoded.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const N2 = Number(parts[1]);
    const r2 = Number(parts[2]);
    const p2 = Number(parts[3]);
    const salt = hexToBytes(parts[4]!);
    const expected = hexToBytes(parts[5]!);
    if (!N2 || !r2 || !p2) return false;
    const dk = await scryptAsync(password, salt, {
      N: N2,
      r: r2,
      p: p2,
      dkLen: expected.length,
    });
    return timingSafeEqual(dk, expected);
  }
}
