/**
 * Formats a raw phone string into the SmartPatrol grouping `xxxx-xxxx-xxxx-xxxxx`
 * (max 17 digits). Non-digits are stripped. Mirrors the original app's input UX.
 */
export function formatPhone(val: string): string {
  const clean = val.replace(/\D/g, "");
  const match = clean.slice(0, 17);
  const parts: string[] = [];
  if (match.length > 0) parts.push(match.slice(0, 4));
  if (match.length > 4) parts.push(match.slice(4, 8));
  if (match.length > 8) parts.push(match.slice(8, 12));
  if (match.length > 12) parts.push(match.slice(12, 17));
  return parts.join("-");
}

/** Digits only, used for validation and submission. */
export function phoneDigits(val: string): string {
  return val.replace(/\D/g, "");
}

/** A valid Indonesian-style phone is 10–17 digits. */
export function isValidPhone(val: string): boolean {
  const digits = phoneDigits(val);
  return digits.length >= 10 && digits.length <= 17;
}
