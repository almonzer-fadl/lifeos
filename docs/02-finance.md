# 02 — Finance Module

**Current Completeness:** 50%  
**Target Completeness:** 100%  
**Priority:** P0 — Critical  
**Depends On:** CRM module (client invoicing), Projects module (project income)  
**Feeds Into:** Nutrition module (food budget), Projects module (MRR tracking)

---

## 1. Current State Analysis

### 1.1 Existing Models

| Model | Fields | Assessment |
|---|---|---|
| `Account` | id, name, currency, type (8 types), initialBalance (cents), isDebt, interestRate, minimumPayment, creditLimit, paymentDueDay, payoffTarget, notes, isActive | **Strong.** Covers all account types needed (checking, savings, cash, credit, investment, crypto, loan, mortgage). |
| `Transaction` | id, date, accountId, categoryId, amount (cents), currency, description, notes, type (income/expense/transfer), status (pending/cleared/reconciled), isTransfer, transferAccountId, parentTransactionId, idempotencyKey | **Excellent.** Splits, transfers, idempotency, audit trail. Production-grade. |
| `TransactionAudit` | id, transactionId, action, changes (JSON), timestamp | **Excellent.** Full audit trail with before/after snapshots. |
| `Category` | id, name, parentId (self-ref), type, color, icon | **Good.** Hierarchical categories. |
| `Budget` | id, categoryId, month, amount (cents), currency | **Good.** YNAB envelope style. |
| `RecurringTransaction` | id, type, amount, currency, accountId, categoryId, description, frequency, frequencyCount, startDate, endDate, nextDate, isActive | **Good.** Covers subscriptions and recurring bills. |
| `FinancialGoal` | id, name, targetAmount, currentAmount, currency, targetDate, accountId, status | **Good.** Goal tracking with progress. |
| `Asset` | id, name, type (7 types), purchaseValue, currentValue, currency, purchaseDate | **Adequate.** Covers physical and digital assets. |
| `ExchangeRate` | id, fromCurrency, toCurrency, rate, date | **Good.** Multi-currency support with historical rates. |

### 1.2 Existing API Routes

| Route | Assessment |
|---|---|
| `/api/finance/accounts` | Full CRUD, soft-delete. Good. |
| `/api/finance/transactions` | Full CRUD with filtering, transfers, splits, idempotency. **Excellent.** |
| `/api/finance/categories` | List + create. Good. |
| `/api/finance/budget` | YNAB envelope math with income/assigned/activity/available. **Excellent.** |
| `/api/finance/recurring` | CRUD + billing cycle advancement + 30-day cashflow. **Excellent.** |
| `/api/finance/goals` | CRUD. Good. |
| `/api/finance/assets` | CRUD. Good. |
| `/api/finance/reports` | Multi-month summaries, category breakdowns, net worth trends. Good. |
| `/api/finance/reconciliation` | Statement reconciliation. Good. |
| `/api/finance/import` | Bulk import with dedup. Good. |
| `/api/finance/exchange-rates` | Fetch + create rates. Good. |
| `/api/finance/rules` | Auto-categorization rules. Good. |

### 1.3 Existing UI

| Component | Assessment |
|---|---|
| `transaction-form.tsx` | Type toggle, amount, currency, account, category. Functional. |
| `transaction-ledger.tsx` | Transaction table. Needs: filters, bulk actions. |
| `date-range-switch.tsx` | Date range filter. Good but hardcoded options. |

---

## 2. Why 50%? — Gap Analysis

The finance module is the **strongest** in the OS — it has YNAB-style budgeting, multi-currency, transaction splits, transfers, audit trail, recurring transactions with cashflow forecasting. For a generic personal finance app, this would be ~70%.

But for **Almonzer specifically**, there are critical gaps:

### Critical Gaps

1. **No client invoicing.** Almonzer's primary income strategy is VantLaunch — a product studio charging $1,500-$5,000 per client. The finance module cannot track invoices, payment status, or client revenue. This is the single most important feature for his immediate goal (RM 1,500/month independence).

2. **No runway calculator.** His survival math is: current savings / monthly burn rate = months of freedom. Currently calculated manually. The OS should show this as a primary metric.

3. **No subscription tracking view.** His recurring costs (RM 950 rent, RM 45 phone, RM 99.90 ChatGPT) are in RecurringTransactions but there's no dedicated view showing "monthly obligations."

4. **No father support tracking.** RM 2,088/month from father is his current income. His goal is to replace this. The OS should track the transition — "father support: RM 2,088 → RM 1,500 → RM 0."

5. **MYR not first-class.** The system defaults to USD. Almonzer lives in MYR, receives SAR, and may invoice in USD/EUR. Multi-currency exists (ExchangeRate model) but MYR should be the default for his instance.

6. **No income projection.** "If I close 1 VantLaunch client at RM 1,500/month, and 1 at RM 3,000/month, my runway extends by X months."

### Not Needed (Explicitly Out of Scope)

- Bank sync / Plaid integration (manual entry only for now)
- Investment portfolio tracking (no investments yet)
- Tax preparation (Polar.sh handles this)
- Credit score monitoring (no credit cards)
- Debt snowball calculator (his rule: no debt)

---

## 3. Target State — Functional Requirements

### 3.1 New Models

#### Invoice
```prisma
model Invoice {
  id             String   @id @default(uuid())
  invoiceNumber  String   @unique // INV-001, INV-002
  clientId       String   // FK to Contact (CRM module)
  projectId      String?  // FK to Project
  status         String   @default("draft") // draft, sent, paid, overdue, cancelled
  currency       String   @default("MYR")
  subtotal       Int      // cents
  taxRate        Float    @default(0)
  taxAmount      Int      // cents
  total          Int      // cents
  issuedDate     DateTime @default(now())
  dueDate        DateTime
  paidDate       DateTime?
  notes          String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  lineItems      InvoiceLineItem[]
  payments       PaymentReceived[]
  
  @@index([clientId])
  @@index([status])
  @@index([dueDate])
}
```

#### InvoiceLineItem
```prisma
model InvoiceLineItem {
  id          String   @id @default(uuid())
  invoiceId   String
  description String
  quantity    Float    @default(1)
  unitPrice   Int      // cents
  amount      Int      // cents (quantity * unitPrice)
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  @@index([invoiceId])
}
```

#### PaymentReceived
```prisma
model PaymentReceived {
  id            String   @id @default(uuid())
  invoiceId     String
  amount        Int      // cents
  currency      String   @default("MYR")
  paymentDate   DateTime @default(now())
  method        String?  // bank_transfer, wise, paypal, cash
  reference     String?  // transaction reference number
  notes         String?
  invoice       Invoice  @relation(fields: [invoiceId], references: [id])
  transactionId String?  // link to Transaction in ledger
  
  @@index([invoiceId])
}
```

#### RunwaySnapshot
```prisma
model RunwaySnapshot {
  id              String   @id @default(uuid())
  date            DateTime @default(now())
  totalSavings    Int      // cents — sum of all non-debt account balances
  monthlyBurnRate Int      // cents — average monthly expenses (last 90 days)
  runwayMonths    Float    // computed: savings / burn rate
  monthlyIncome   Int      // cents — average monthly income (last 90 days)
  notes           String?
  
  @@index([date])
}
```

#### Subscription
```prisma
model Subscription {
  id              String   @id @default(uuid())
  name            String
  provider        String
  amount          Int      // cents
  currency        String   @default("MYR")
  billingCycle    String   // monthly, yearly, weekly
  nextBillingDate DateTime
  category        String?  // software, rent, phone, health, education
  isActive        Boolean  @default(true)
  notes           String?
  recurringTxId   String?  // link to RecurringTransaction
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([nextBillingDate])
  @@index([isActive])
}
```

### 3.2 Changes to Existing Models

#### Account — Add:
```prisma
isFatherSupport Boolean @default(false) // track accounts receiving father's money
```

#### Transaction — Add:
```prisma
invoiceId     String?  // link to Invoice (for client payments)
contactId     String?  // link to Contact (CRM)
isFatherSupport Boolean @default(false) // flag transactions from father
```

#### RecurringTransaction — Add:
```prisma
subscriptionId String? // link to Subscription
```

---

## 4. Target State — Technical Requirements

### 4.1 New API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/finance/invoices` | GET, POST | List invoices (filter by status, client). Create invoice with line items. Auto-generate invoice number (INV-XXX). |
| `/api/finance/invoices/[id]` | GET, PATCH, DELETE | Single invoice CRUD. PATCH: mark as sent/paid. |
| `/api/finance/invoices/[id]/pay` | POST | Record payment. Creates PaymentReceived + optional Transaction entry. |
| `/api/finance/subscriptions` | GET, POST, PATCH, DELETE | CRUD for subscriptions. GET: filter by active, sort by next billing date. |
| `/api/finance/runway` | GET | Calculate and return current runway. Optionally create a snapshot. |
| `/api/finance/runway/history` | GET | List runway snapshots over time. |
| `/api/finance/projection` | GET | Income projection: "if you add these hypothetical incomes, runway changes to X" |
| `/api/finance/dashboard` | GET | Aggregated dashboard data: net worth, runway, monthly burn, upcoming bills, invoice status summary. |

### 4.2 Runway Calculation Logic

```typescript
// lib/runway.ts
interface RunwayData {
  totalSavings: number;       // cents
  monthlyBurnRate: number;    // cents (avg expenses over lookback period)
  monthlyIncome: number;      // cents (avg income over lookback period)
  cashflowPositive: boolean;  // income > expenses
  runwayMonths: number;       // savings / burn rate (if negative cashflow)
  monthsToGoal: number;       // months to reach 100,000 MYR at current savings rate
  subscriptionTotal: number;  // total monthly obligations
  fatherSupport: number;      // income from father
  fatherSupportPct: number;   // % of income from father
  clientIncome: number;       // income from VantLaunch clients
  clientIncomePct: number;    // % of income from clients
}

async function calculateRunway(): Promise<RunwayData> {
  // 1. Sum all non-debt account balances = totalSavings
  // 2. Average monthly expenses over last 90 days = monthlyBurnRate
  // 3. Average monthly income over last 90 days = monthlyIncome
  // 4. runwayMonths = totalSavings / (monthlyBurnRate - monthlyIncome) if negative
  // 5. monthsToGoal = (100000 * 100 - totalSavings) / (monthlyIncome - monthlyBurnRate) if positive
  // 6. Break down income by source (father vs clients)
}
```

### 4.3 Invoice Automation

When a `PaymentReceived` is recorded:
1. Mark invoice as `paid` (or `partially_paid` if not full amount)
2. Create a corresponding `Transaction` in the ledger (type: income, category: "Client Work")
3. Update `FinancialGoal` progress (100K MYR checkpoint)
4. Recalculate `RunwaySnapshot`
5. Emit `finance:payment_received` event

Invoice status lifecycle:
```
draft → sent → paid
draft → sent → overdue → paid
draft → cancelled
```

---

## 5. UI/UX Requirements

### 5.1 Finance Dashboard (Redesigned)

```
┌──────────────────────────────────────────────────────────────┐
│ Finance                                       June 2026      │
│ ┌───────────┬───────────┬───────────┬──────────────────────┐ │
│ │ Net Worth │  Runway   │ Mthly Burn│ Father Support       │ │
│ │ RM 3,200  │ 2.3 mos   │ RM 1,350  │ RM 2,088 → goal: 0  │ │
│ │           │           │           │ ████████░░ 68%→0%    │ │
│ └───────────┴───────────┴───────────┴──────────────────────┘ │
│ ┌───────────────────────┬──────────────────────────────────┐ │
│ │ Invoices              │ Subscriptions                    │ │
│ │ 0 sent · 0 paid       │ RM 950 Rent (Jun 28)            │ │
│ │ 0 overdue             │ RM 99.90 ChatGPT (Jul 3)        │ │
│ │ [Create Invoice]      │ RM 45 U Mobile (Jul 1)          │ │
│ │                       │ Total: RM 1,094.90/mo           │ │
│ └───────────────────────┴──────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Cashflow (30 days)                                      │ │
│ │ Income: RM 2,088  ·  Expenses: RM 1,350  ·  Net: +738  │ │
│ │ ████████████████████████████████████████████████████████ │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Recent Transactions                     [7D|30D|90D|All]│ │
│ │ Jun 15  ChatGP...  Expense  RM 99.90   Software         │ │
│ │ Jun 12  Father     Income   RM 2,088   Family Support   │ │
│ │ Jun 10  Grocery    Expense  RM 85.50   Food             │ │
│ │ Jun 1   Rent       Expense  RM 950     Housing          │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Invoice Creation Flow

1. Tap "Create Invoice"
2. Select client (from CRM contacts — or "New Client" inline)
3. Add line items (description, quantity, unit price)
4. Optional: tax rate, notes, custom due date
5. Preview → "Send Invoice"
6. Invoice status: draft → sent
7. When client pays: tap "Record Payment" → enters amount → invoice marked paid → transaction created automatically

### 5.3 Budget View (Enhanced)

The envelope budgeting system already exists and is strong. Add:
- Budget category color coding (green = under, red = over, gold = at limit)
- Quick-add budget amounts from the budget screen
- "Available to assign" prominently displayed at top
- Father's income automatically categorized as "Family Support" income

### 5.4 Runway Widget (Home Dashboard)

Always-visible widget on the main dashboard:
```
┌──────────────────────┐
│ Runway               │
│ 2.3 months           │
│ RM 3,200 / RM 1,350  │
│ Target: 100K MYR     │
│ Need: 1 VantLaunch   │
│ client at RM 1,500   │
│ to break even        │
└──────────────────────┘
```

---

## 6. Implementation Steps

### Step 1: Database
1. Add `Invoice`, `InvoiceLineItem`, `PaymentReceived`, `RunwaySnapshot`, `Subscription` models
2. Add new fields to `Account`, `Transaction`, `RecurringTransaction`
3. Run migration

### Step 2: Utilities
1. Create `lib/runway.ts` — runway calculation
2. Create `lib/invoice.ts` — invoice number generation, status management
3. Expand `lib/money.ts` — add MYR formatting (RM prefix, Malaysian number format)

### Step 3: API Routes
1. `/api/finance/invoices` + `[id]` + `[id]/pay`
2. `/api/finance/subscriptions`
3. `/api/finance/runway` + `/history`
4. `/api/finance/projection`
5. `/api/finance/dashboard` (aggregated endpoint)

### Step 4: UI Components
1. `components/modules/finance/invoice-form.tsx`
2. `components/modules/finance/invoice-list.tsx`
3. `components/modules/finance/subscription-list.tsx`
4. `components/modules/finance/runway-widget.tsx`
5. Update `transaction-ledger.tsx` — add filters, bulk actions
6. Update finance dashboard page with new layout

### Step 5: Integration
1. Link invoices to CRM contacts
2. Link invoice payments to transactions
3. Auto-update runway on transaction creation
4. Emit `finance:payment_received` event for insights engine

### Step 6: Tests
1. `__tests__/lib/runway.test.ts`
2. `__tests__/lib/invoice.test.ts`
3. `__tests__/api/finance/invoices.test.ts`

---

## 7. Acceptance Criteria

1. Create invoice for VantLaunch client → auto-generates INV-001 → mark as sent → record payment → invoice marked paid → transaction auto-created in ledger
2. Dashboard shows: "Runway: 2.3 months. Burn: RM 1,350/mo. Need RM 1,500 MRR to break even."
3. Subscription view shows: Rent RM 950 (due Jun 28), ChatGPT RM 99.90 (due Jul 3), Phone RM 45 (due Jul 1)
4. Budget: assign RM 400 to Food → spend RM 320 → shows RM 80 remaining (green)
5. Father's incoming transfer flagged as "Family Support" → dashboard tracks support dependency %
6. Multi-currency: SAR income → auto-converted to MYR at current exchange rate
7. Projection: "Add 1 client at RM 1,500/mo → runway extends to 8.5 months → 100K MYR in 52 months"
