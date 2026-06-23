# Backend Plan

Backend architecture for Life OS. Single-user, local-first, PostgreSQL-backed.

## Stack

- **Runtime**: Node.js 22, Next.js 16 App Router (`output: "standalone"`)
- **Database**: PostgreSQL 17
- **ORM**: Prisma v7 with `@prisma/adapter-pg` (direct connection, no pg-pool nesting)
- **Deployment**: Docker Compose (db + app)
- **Money**: Integer cents only. No floats anywhere near money.

## Data model

23 models across 6 domains. Schema at `prisma/schema.prisma`.

### Money (non-negotiable)
- All amounts stored as `Int` (cents).
- Convert at the UI boundary only: `lib/money.ts` (`dollarsToCents`, `centsToDollars`, `formatCents`, `parseMoneyInput`).
- Transfers are paired entries in a single Prisma `$transaction`.
- Splits: parent transaction + children in a single `$transaction`.
- Never compute balances in JavaScript — use Prisma aggregate queries (`_sum` on `amountCents`).
- Account balances derive from the full ledger, not a stored balance field.

### Transactions
- `amountCents`: positive = credit (income), negative = debit (spending). This matches double-entry convention.
- `isTransfer`: true when moving between accounts. Requires `transferAccountId`.
- `parentTransactionId`: for splits. Parent has `parentTransactionId: null`, children point to parent.
- Status: `pending` → `cleared` → `reconciled`.
- `date`: the actual transaction date (not `createdAt`).
- `createdAt`/`updatedAt`: Prisma-managed timestamps.

### Accounts
- `type`: `checking`, `savings`, `credit`, `investment`, `cash`, `loan`, `mortgage`
- `isActive`: soft delete, never hard delete an account with transactions
- Debt fields: `interestRate`, `minimumPaymentCents`, `creditLimitCents`, `paymentDueDay`, `payoffTargetCents`
- `displayOrder`: manual sort
- Balance = `SELECT SUM(amountCents) FROM Transaction WHERE accountId = ? AND isActive = true`

### Budget
- Simple envelope model: one `Budget` row per category per month.
- `month` stored as `DateTime` (first day of the month).
- `amountCents`: the budgeted amount for that category/month.
- Spending = sum of transaction amounts in that category for that month.

### Categories
- `type`: `income`, `expense`
- `parentId`: self-relation for subcategories (max 1 level deep)
- `isActive`: soft delete
- `displayOrder`: manual sort

## API design

### Route handlers (Next.js App Router)

All routes under `app/api/`. Pattern: single file per resource, exports `GET`/`POST`/`PATCH`/`DELETE`.

```
app/api/
├── finance/
│   ├── accounts/route.ts           GET (list), POST (create)
│   ├── accounts/[id]/route.ts      GET, PATCH, DELETE
│   ├── transactions/route.ts       GET (list, with filters), POST (create)
│   ├── transactions/[id]/route.ts  GET, PATCH, DELETE
│   ├── categories/route.ts         GET, POST
│   ├── budget/route.ts             GET (by month), POST/PATCH (set budget)
│   ├── assets/route.ts             GET, POST
│   ├── assets/[id]/route.ts        GET, PATCH, DELETE
│   ├── goals/route.ts              GET, POST
│   ├── goals/[id]/route.ts         GET, PATCH, DELETE
│   ├── recurring/route.ts          GET, POST
│   ├── recurring/[id]/route.ts     GET, PATCH, DELETE
│   ├── import/route.ts             POST (CSV/OFX import)
│   └── reports/route.ts            GET (aggregate queries)
├── health/
│   ├── glucose/route.ts            GET, POST
│   ├── insulin/route.ts            GET, POST
│   ├── activity/route.ts           GET, POST
│   ├── activity/[id]/route.ts      GET, PATCH, DELETE
│   ├── workouts/route.ts           GET, POST
│   ├── workouts/[id]/route.ts      GET, PATCH, DELETE
│   ├── sleep/route.ts              GET, POST
│   ├── body-measurements/route.ts  GET, POST
│   ├── lab-results/route.ts        GET, POST
│   ├── nutrition/route.ts          GET, POST
│   ├── nutrition/[id]/route.ts     GET, PATCH, DELETE
│   └── water/route.ts              GET, POST
├── productivity/
│   ├── habits/route.ts             GET, POST
│   ├── habits/[id]/route.ts        GET, PATCH, DELETE
│   ├── habits/log/route.ts         POST (toggle completion)
│   ├── tasks/route.ts              GET, POST
│   ├── tasks/[id]/route.ts         GET, PATCH, DELETE
│   ├── journal/route.ts            GET, POST
│   └── journal/[id]/route.ts       GET, PATCH, DELETE
└── backup/
    ├── export/route.ts             GET (full DB export as JSON)
    └── import/route.ts             POST (restore from JSON)
```

### Conventions

- Every route is `export const dynamic = "force-dynamic"` (no caching for local-first data).
- Request validation: check required fields, type check enums, parse dates, sanitize strings.
- Response envelope: `{ data } | { error: string } | { results: T[], total: number }`.
- Pagination: `?limit=50&offset=0`, max limit 1000. Return `total` count for lists.
- Sorting: `?orderBy=date&order=desc`.
- Filtering: `?accountId=uuid&categoryId=uuid&startDate=ISO&endDate=ISO`.
- Error codes: 400 (validation), 404 (not found), 409 (conflict, e.g. duplicate), 500 (server).
- No `try/catch` that swallows errors — let Next.js error boundary handle unexpected failures.

### Transaction creation (critical path)

```
POST /api/finance/transactions
{
  accountId, date, description, amountCents, categoryId, type (income|expense), status
}
```

- Validate account exists and is active.
- If `amountCents > 0` → type must be `income`. If `< 0` → type must be `expense`.
- If `isTransfer: true` → require `transferAccountId`, create paired entries in `$transaction`.
- If `parentTransactionId` → validate parent exists, not itself a child, same account.

### Budget query

```
GET /api/finance/budget?month=2026-06-01
```

Returns:
```
[
  {
    category: { id, name, type, parentId },
    budgeted: 50000,           // cents
    spent: -42350,             // sum of transactions in this category/month (negative)
    remaining: 7650,           // budgeted - |spent|
    transactions: [...]        // optional, if include=transactions
  }
]
```

Budget not set → `budgeted: null, spent: X, remaining: null`.

## Infrastructure

### Docker
- `docker-compose.yml`: db (postgres:17-alpine, port 5433, health check) + app (build from Dockerfile)
- `Dockerfile`: multi-stage (deps → builder → runner), Node 22 Alpine
- Startup: `prisma migrate deploy && node server.js`
- Volumes: `pgdata` (database), `uploads` (user files), `seeds` (seed data)
- Health check on db: `pg_isready -U lifeos`

### Database connection
- `lib/db.ts`: singleton Prisma client with `@prisma/adapter-pg`.
- Proxy wrapper catches `P1010`/`P1001` errors and returns empty results for reads.
- `DATABASE_URL` from environment, never hardcoded.

## What's missing (priority order)

### 1. Tests
Zero tests. Start with integration tests on critical paths:
- Transaction creation (including transfers and splits)
- Budget calculation (budgeted vs actual)
- Account balance from full ledger

Use `vitest` + `@prisma/client` against a test database. Docker compose test profile.

### 2. Audit trail
- Add `TransactionAudit` table: `id, transactionId, action (created|updated|deleted), changes (JSON), timestamp`.
- Or add `createdBy`, `updatedBy`, `deletedAt` to Transaction (simpler for single-user).

### 3. Reconciliation
- Schema already supports `status: reconciled`.
- Need: reconciliation endpoint that marks a batch of transactions as reconciled + stores a snapshot of the cleared balance at that point.
- `Reconciliation` table: `id, accountId, date, statementBalanceCents, clearedBalanceCents, differenceCents`.

### 4. Import
- CSV import: parse rows, map columns, validate, create transactions.
- OFX/QFX import: parse OFX XML, extract transactions.
- Duplicate detection: match on (accountId, date, amountCents, description) within 3-day window.

### 5. Backup / restore
- Export: serialize all tables to JSON, download as file.
- Import: validate JSON structure, upsert by ID, run in transaction.
- Routes already stubbed at `api/backup/`.

### 6. Input validation layer
- Shared validation utilities (not inline in each route).
- `validateUUID`, `validateDate`, `validateEnum`, `validateRequired`.
- Return structured errors: `{ field: string, message: string }[]`.
