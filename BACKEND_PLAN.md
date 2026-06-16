# Backend — 8/10 → 10/10

## Current state
- 23-model Prisma schema, integer-cent money, transfers/splits in `$transaction`
- Zod validation on all 17 POST routes
- Transaction audit trail (created/updated/deleted)
- 54 unit tests on pure functions
- Docker Compose with health checks, multi-stage build
- Reconciliation endpoint, CSV import with duplicate detection

## What blocks 10/10

### 1. API integration tests (no DB-level tests exist)
Unit tests cover pure functions. Zero tests verify the actual API behavior, database writes, or transactional integrity. Without this, every deploy is a gamble.
- Spin up a test DB container in CI
- Test: POST /api/finance/transactions (standard, transfer, split)
- Test: PATCH/DELETE with audit trail verification
- Test: GET /api/finance/budget?month= with real data — verify envelope math end-to-end
- Test: DELETE cascade (split parent → children deleted)
- Test: Account soft delete (isActive=false, transactions preserved)

### 2. Idempotency for money mutations
Double-clicking "Save" creates two transactions. Every POST needs an idempotency key.
- Add `idempotencyKey` field to Transaction (unique index)
- Client generates a UUID, sends it in the request
- Server returns existing transaction if key already used
- Applies to: transactions, transfers, splits

### 3. Rate limiting
No protection against rapid-fire requests. A stuck script or buggy loop can flood the DB.
- Add `rateLimit(requests, windowMs)` middleware
- Apply at route level: 20 req/min for mutations, 60 req/min for reads
- Return 429 with `Retry-After` header

### 4. Request logging
Zero observability. If something breaks in production, there's no trace.
- Structured JSON logging per request: method, path, status, duration, userId (future)
- Log all 4xx/5xx with request body (sanitized)
- Use `console.log` for now (Docker captures stdout); swap for pino/winston later

### 5. Graceful shutdown
`docker-compose down` kills the process mid-request. Need to drain connections.
- Handle SIGTERM: stop accepting new requests, wait for inflight to finish (max 10s), close Prisma
- This is 3 lines in the Next.js server entry point

### 6. Backup integrity
`api/backup/export` and `import` routes are stubbed but not tested for roundtrip. A backup that can't restore is worse than no backup.
- Export → Import → verify all tables match (record counts, checksums)
- Test with real data (accounts, transactions with transfers/splits, budgets)

## Priority order
1. API integration tests (the biggest gap — deploy confidence)
2. Idempotency (data integrity)
3. Rate limiting (abuse protection)
4. Request logging (debuggability)
5. Graceful shutdown (production hygiene)
6. Backup roundtrip (data safety)
