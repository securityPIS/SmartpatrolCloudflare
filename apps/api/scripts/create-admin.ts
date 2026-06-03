/**
 * Generate an INSERT for the first ADMIN profile (bootstrap).
 * Registration normally lands in `pending_registrations` and needs admin
 * approval (Phase 3) — but there is no admin yet, so seed one here.
 *
 * Usage:
 *   pnpm --filter @smartpatrol/api create-admin -- \
 *     --email you@example.com --password 'StrongPass123' --name 'Administrator'
 *
 * Then apply the generated SQL:
 *   Local : npx wrangler d1 execute smartpatrol --local  --file=scripts/seed-admin.sql
 *   Remote: npx wrangler d1 execute smartpatrol --remote --file=scripts/seed-admin.sql
 */
import { writeFileSync } from "node:fs";
import { ScryptPasswordHasher } from "../src/infrastructure/crypto/scryptPasswordHasher";

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const inline = process.argv.find((a) => a.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return undefined;
}

const email = arg("email")?.trim().toLowerCase();
const password = arg("password");
const name = arg("name") ?? "Administrator";

if (!email || !password) {
  console.error(
    "Usage: pnpm --filter @smartpatrol/api create-admin -- --email you@example.com --password 'StrongPass123' [--name 'Full Name']",
  );
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const hasher = new ScryptPasswordHasher();
const id = crypto.randomUUID();
const now = Date.now();
const passwordHash = await hasher.hash(password);
const safeName = name.replace(/'/g, "''");

const sql = `-- SmartPatrol admin seed (generated ${new Date(now).toISOString()})
INSERT INTO profiles (id, email, password_hash, full_name, role, enabled, ship_ids, created_at, updated_at)
VALUES ('${id}', '${email}', '${passwordHash}', '${safeName}', 'ADMIN', 1, '[]', ${now}, ${now});
`;

const outUrl = new URL("./seed-admin.sql", import.meta.url);
writeFileSync(outUrl, sql);

console.log(`Wrote apps/api/scripts/seed-admin.sql for admin <${email}>.\n`);
console.log("Apply it from apps/api:");
console.log("  Local : npx wrangler d1 execute smartpatrol --local  --file=scripts/seed-admin.sql");
console.log("  Remote: npx wrangler d1 execute smartpatrol --remote --file=scripts/seed-admin.sql");
