# infra — Cloudflare resources

The Worker config lives in [`apps/api/wrangler.toml`](../apps/api/wrangler.toml). The
resources below are provisioned by **you** (account-level); paste the returned ids into
that file (the `REPLACE_WITH_*` placeholders).

## 1. Authenticate

```bash
pnpm --filter @smartpatrol/api exec wrangler login
```

## 2. Create resources

```bash
# D1 database
pnpm --filter @smartpatrol/api exec wrangler d1 create smartpatrol
# → copy database_id into wrangler.toml [[d1_databases]].database_id

# R2 bucket (media)
pnpm --filter @smartpatrol/api exec wrangler r2 bucket create smartpatrol-media

# KV namespace
pnpm --filter @smartpatrol/api exec wrangler kv namespace create KV
# → copy id into wrangler.toml [[kv_namespaces]].id
```

Durable Objects (`ShipChannel`) use the **SQLite-backed** class declared in the
`[[migrations]]` block — available on the Workers free plan; consider Workers Paid
($5/mo) for production realtime.

## 3. Apply D1 migrations

Migrations are generated from the Drizzle schema (`packages/db`) into
`packages/db/migrations` and applied via wrangler:

```bash
pnpm db:generate                       # regenerate from schema
pnpm --filter @smartpatrol/db migrate:local    # local D1
pnpm --filter @smartpatrol/db migrate:remote   # production D1
```

## 4. Secrets

```bash
pnpm --filter @smartpatrol/api exec wrangler secret put JWT_SECRET
pnpm --filter @smartpatrol/api exec wrangler secret put RESEND_API_KEY
pnpm --filter @smartpatrol/api exec wrangler secret put FCM_SERVICE_ACCOUNT
```

For local dev, copy `apps/api/.dev.vars.example` → `apps/api/.dev.vars`.

## 5. Pages (web)

Create a Pages project pointing at this repo:

- Build command: `pnpm --filter @smartpatrol/web build`
- Build output directory: `apps/web/dist`
- Environment variable: `VITE_API_URL` = your Worker URL

## Cron

`[triggers].crons` in `wrangler.toml` drives the `scheduled()` handler (Phase 8 jobs).
