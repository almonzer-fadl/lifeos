# Finance Product Plan

## Purpose

This plan defines how to take the current Life OS finance module from an early manual tracker into a serious local-first finance product. It focuses on functionality, data correctness, and product workflows. Visual redesign and the premium Bloomberg-style dashboard experience are intentionally separated into a later design phase.

The target environment is:

- The app runs in Docker on the user's laptop.
- The laptop is the source of truth for the database.
- The phone can access the app as a client while the laptop/server is available.
- The product is primarily single-user/local-first unless multi-user access is added deliberately.

## Realistic Maximum

The app can become very strong, but not every commercial feature is realistically 100% achievable inside a local laptop-only Docker app without outside financial integrations.

### Finance Data Model Foundation

Maximum realistic target: 95-100%.

This is fully achievable locally. We can build a high-quality ledger, budgeting model, reconciliation records, imports, exchange rates, attachments, recurring rules, reports, backups, and audit trails. This does not require cloud infrastructure.

The only reason this may stop below 100% is if the product intentionally avoids complex accounting features such as full double-entry books, tax ledgers, or business accounting modules.

### Working Personal Finance Product

Maximum realistic target: 90-95%.

This is achievable for manual entry, CSV/import workflows, budgeting, reconciliation, accounts, debts, goals, reports, and mobile use on the local network.

The missing 5-10% versus mature commercial products is mainly:

- Automatic bank feeds unless Plaid, Teller, Salt Edge, GoCardless, or another provider is added.
- Always-on phone sync when the laptop is asleep/offline.
- Managed cloud backup and account recovery.
- External collaboration across households unless auth, sharing, and network exposure are added.
- Production-grade compliance posture for regulated financial data.

### YNAB-Style Parity

Maximum realistic target: 85-95%.

YNAB's public feature set emphasizes bank import, sync across devices, shared use, goal tracking, loan tools, scheduled transactions, reports, and the method of assigning every dollar a job. Official references:

- YNAB features: https://www.ynab.com/features
- YNAB scheduled transactions: https://support.ynab.com/en_us/scheduled-transactions-a-guide-BygrAIFA9
- YNAB reconciliation: https://www.ynab.com/blog/budget-reconciliation-in-ynab
- YNAB reports: https://www.ynab.com/blog/ynab-reports-and-data

For a local app, we can match the budgeting method and core workflows very closely:

- Give every dollar a job.
- Available-to-budget calculation.
- Category envelopes.
- Monthly rollover.
- Overspending treatment.
- Goals and targets.
- Scheduled transactions.
- Account reconciliation.
- Manual and CSV imports.
- Reports.
- Mobile-friendly entry.

The parts that keep it from true 100% YNAB parity are automatic bank sync, mature multi-device cloud sync, family sharing, and years of polish around edge cases.

### Kashoo-Style Parity

Maximum realistic target: 65-80% unless business accounting becomes a major product direction.

Kashoo is closer to small-business accounting than personal budgeting. Public Kashoo help material emphasizes reconciliation, reports, multiple currencies, export, client/supplier statements, and related business accounting workflows:

- Kashoo Classic help collection: https://help.kashoo.com/en/collections/2657592-kashoo-classic
- Kashoo reconciliation guidance: https://help.kashoo.com/en/articles/370407-kashoo-classic-bank-reconciliation-tips-and-tricks
- Kashoo bank reconciliation explainer: https://kashoo.com/blog/everything-small-businesses-need-to-know-about-bank-reconciliations/

We can build the useful personal-finance overlap:

- Account reconciliation.
- Bank statement import and matching.
- Multi-currency balances.
- Reports.
- CSV/PDF export.
- Expense tracking.
- Simple income tracking.

But full Kashoo parity would require:

- Double-entry accounting.
- Chart of accounts.
- Invoicing.
- Customers and vendors.
- Accounts receivable and accounts payable.
- Tax reporting.
- Accountant access.
- Business statements.
- Payment integrations.

Those are possible, but they are a separate accounting product. If the primary product is personal finance, Kashoo parity should be treated as partial overlap, not the main goal.

## Current State Assessment

The current module has useful nouns but not yet reliable finance semantics.

Already present:

- Accounts.
- Assets.
- Recurring transactions.
- Financial goals.
- Categories.
- Transactions.
- Budgets in the schema.
- Exchange rates in the schema.
- Basic finance dashboard.
- Manual account, asset, goal, recurring item, and transaction forms.

Current critical gaps:

- Account balances are calculated from only the last 30 days of transactions.
- Debt fields exist in the UI but are not persisted by the account API.
- Money is stored as floating point numbers.
- Multi-currency values are added together without conversion.
- Transfers are not modeled as paired ledger entries.
- Budgets exist in the database schema but do not power a real budgeting workflow.
- No reconciliation workflow.
- No import workflow.
- No duplicate detection.
- No rule engine.
- No audit trail.
- No backup/restore workflow.
- No authentication or privacy boundary.
- No serious mobile offline story.

## Product Direction

The best practical target is:

> A local-first personal finance operating system with YNAB-grade budgeting, serious reconciliation, manual/CSV import, debt payoff planning, assets, net worth, reports, and local network phone access.

The app should not initially try to be:

- A tax system.
- A payroll system.
- A full small-business accounting suite.
- A regulated bank-sync aggregator.
- A public SaaS finance platform.

## Core Principles

1. Correct money math comes before dashboards.
2. The ledger is the source of truth.
3. Budgets must reconcile to real account balances.
4. Imports must never silently corrupt the ledger.
5. Every mutation should be auditable or recoverable.
6. Multi-currency values require explicit conversion rules.
7. The product should work well manually before adding bank sync.
8. Local-first means backup/export is a core feature, not an afterthought.

## Phase 1: Money Correctness Foundation

Target readiness after phase: data model 65%, working product 40%, YNAB parity 25%, Kashoo overlap 20%.

### Schema Changes

Replace floating point money fields with integer minor units or Decimal.

Recommended approach:

- Store all transaction amounts as integer minor units, e.g. cents.
- Store currency code separately.
- Use a money helper layer for formatting and arithmetic.
- For currencies without 2 decimal places, use a currency metadata table or a library-backed scale.

Add or revise:

- `MoneyAmount` convention: `amountMinor`, `currency`.
- `AccountBalanceSnapshot`.
- `LedgerEntry` or stronger `Transaction` model.
- `Transfer` model or transaction group model.
- `TransactionStatus`: pending, cleared, reconciled, void.
- `ReconciliationSession`.
- `ReconciliationLine`.
- `ImportBatch`.
- `ImportedTransaction`.
- `TransactionMatch`.
- `AuditLog`.

### Required Fixes

- Calculate account balances from the full ledger, not the last 30 days.
- Persist debt fields from account creation.
- Validate all API inputs.
- Reject invalid currency, negative amount where not allowed, missing account, invalid category type, and impossible dates.
- Add unique and useful indexes for transaction lookup and import matching.
- Add created/updated timestamps where missing.

### Acceptance Criteria

- A checking account with 2 years of transactions shows the correct balance.
- A credit card account can store APR, due day, limit, and minimum payment.
- A transfer from checking to savings changes both balances correctly.
- Income, expense, and transfer semantics are unambiguous.
- A transaction can be marked pending, cleared, and reconciled.
- No money math uses JavaScript floating point arithmetic directly.

## Phase 2: Ledger and Account Register

Target readiness after phase: data model 75%, working product 55%, YNAB parity 40%, Kashoo overlap 30%.

### Features

- Account register page for every account.
- Full transaction history with filters.
- Add/edit/delete transaction.
- Split transactions.
- Transfer transactions.
- Search by amount, text, category, account, status, and date.
- Bulk edit.
- Running balance.
- Cleared/reconciled states.
- Pending transactions.
- Attach notes and optional receipt file references.

### User Workflows

- Open account.
- Enter transaction.
- Categorize transaction.
- Mark as cleared.
- Reconcile to bank statement.
- Search a historical payment.
- Correct a mistake without breaking reconciliation history.

### Acceptance Criteria

- The register can handle thousands of transactions.
- Running balance is stable and explainable.
- Deleting or editing reconciled transactions requires explicit confirmation or creates an adjustment.
- Transfers are visible from both account registers.

## Phase 3: Budgeting System

Target readiness after phase: data model 85%, working product 70%, YNAB parity 65%, Kashoo overlap 35%.

### Budgeting Model

Implement a YNAB-like envelope budget:

- Budget month.
- Category groups.
- Categories.
- Assigned amount.
- Activity amount.
- Available amount.
- Rollover.
- Overspending.
- Income available to assign.
- Hidden/archived categories.
- Category targets.
- Scheduled funding suggestions.

### Schema Additions

- `BudgetMonth`.
- `BudgetCategoryGroup`.
- `BudgetCategory`.
- `BudgetAssignment`.
- `BudgetTarget`.
- `BudgetRollover`.
- `BudgetAdjustment`.

The existing `Budget` table may be replaced or expanded because a single `categoryId/month/amount` table is not enough for a serious envelope budget.

### Budget Rules

- Income increases money available to assign.
- Assigning money moves it from available-to-assign into category envelopes.
- Expense activity reduces category available balance.
- Positive category balances roll forward.
- Cash overspending can reduce next month's available-to-assign.
- Credit card overspending should be handled explicitly.
- Transfers do not count as income or expense unless intentionally categorized as debt/payment behavior.

### Acceptance Criteria

- User can budget a month from scratch.
- User can assign income to categories.
- User can see available money per category.
- User can handle overspending.
- User can roll into next month.
- User can set target dates and monthly needed amounts.
- Reports reconcile budget activity to account transactions.

## Phase 4: Recurring and Scheduled Transactions

Target readiness after phase: data model 88%, working product 76%, YNAB parity 72%, Kashoo overlap 40%.

### Features

- Scheduled transaction templates.
- Repeating rules: daily, weekly, every N weeks, monthly, yearly, custom.
- Next occurrence generation.
- Skip occurrence.
- Approve occurrence.
- Auto-enter option.
- Upcoming bills calendar.
- Cashflow forecast.

### Acceptance Criteria

- Rent due on the first appears every month.
- Biweekly salary works correctly.
- Annual subscriptions are visible in monthly planning.
- Skipped instances do not destroy the schedule.
- Forecasts show upcoming account balances.

## Phase 5: Import, Matching, and Reconciliation

Target readiness after phase: data model 92%, working product 85%, YNAB parity 82%, Kashoo overlap 60%.

### Import Scope

Start with CSV and OFX/QFX if practical.

Supported workflow:

- Create import profile per bank/account.
- Upload or paste CSV.
- Map columns.
- Preview imported rows.
- Normalize dates, amounts, descriptions, and payees.
- Detect duplicates.
- Match imported rows to existing transactions.
- Create new transactions from unmatched rows.
- Save rules for future imports.

### Matching Logic

Match using:

- Account.
- Amount.
- Date window.
- Normalized payee/description.
- Existing imported transaction ID if available.
- Manual confirmed match.

### Reconciliation

Reconciliation workflow:

- Choose account.
- Enter statement date.
- Enter statement ending balance.
- Compare cleared transactions.
- Mark matched items cleared/reconciled.
- Show difference.
- Finish only when difference is zero or explicit adjustment is created.

### Acceptance Criteria

- Imported rows do not affect reports until accepted or matched.
- Duplicate imports are detected.
- User can reconcile a bank statement.
- Reconciled transaction history is protected.
- Import history can be audited.

## Phase 6: Rules, Payees, and Categorization

Target readiness after phase: data model 94%, working product 88%, YNAB parity 86%, Kashoo overlap 63%.

### Features

- Payee table.
- Merchant normalization.
- Category rules.
- Account-specific import rules.
- Split rules.
- Transfer detection.
- Auto-categorization suggestions.
- Rule priority and preview.

### Acceptance Criteria

- "STARBUCKS 1234 KUALA LUMPUR" normalizes to "Starbucks".
- A rule can categorize recurring grocery transactions.
- A rule can identify credit card payment transfers.
- User can preview and approve rule effects before applying them.

## Phase 7: Debt, Loans, and Assets

Target readiness after phase: data model 95%, working product 90%, YNAB parity 90%, Kashoo overlap 65%.

### Debt Features

- Credit cards.
- Loans.
- Mortgages.
- APR.
- Minimum payment.
- Payment due day.
- Credit limit.
- Utilization.
- Payoff target.
- Debt snowball and avalanche planner.
- Interest estimate.
- Extra payment simulation.

### Asset Features

- Manual assets.
- Purchase value.
- Current value.
- Valuation history.
- Net worth inclusion/exclusion.
- Asset categories.
- Optional ticker symbol for investments/crypto.

### Acceptance Criteria

- Credit utilization is calculated correctly.
- Debt payoff scenarios are explainable.
- Net worth includes assets and debts using selected currency conversion.
- Asset value history powers net worth charts.

## Phase 8: Multi-Currency

Target readiness after phase: data model 96%, working product 91%, YNAB parity 90%, Kashoo overlap 70%.

### Features

- Base currency setting.
- Per-account currency.
- Exchange rate table.
- Manual exchange rate entry.
- Exchange-rate source metadata.
- Historical conversion for net worth and reports.
- Realized/unrealized FX gains only if needed.

### Rules

- Never add different currencies without conversion.
- Reports must declare the rate date and base currency.
- Original transaction currency must remain unchanged.

### Acceptance Criteria

- USD and MYR accounts show native balances.
- Net worth can display in a selected base currency.
- Historical reports use the correct rate for the report date or defined policy.

## Phase 9: Reports and Analytics

Target readiness after phase: data model 96%, working product 93%, YNAB parity 92%, Kashoo overlap 75%.

### Personal Finance Reports

- Net worth over time.
- Income vs expenses.
- Spending by category.
- Spending by payee.
- Budget performance.
- Category trends.
- Cashflow forecast.
- Debt payoff forecast.
- Account balance history.
- Savings rate.

### Accounting-Adjacent Reports

- Transaction export.
- Category activity.
- Reconciliation report.
- Monthly summary.
- Currency exposure.

### Acceptance Criteria

- Every report can be traced back to ledger rows.
- Reports support date ranges.
- Reports support account/category filters.
- Exports are available as CSV.

## Phase 10: Backup, Restore, Security, and Reliability

Target readiness after phase: data model 98%, working product 95%, YNAB parity 93%, Kashoo overlap 78%.

### Local-First Requirements

- One-click encrypted backup.
- Restore from backup.
- Scheduled local backup.
- Export all data as JSON/CSV.
- Database migration safety checks.
- Health check page.
- Data integrity checks.
- Audit log viewer.

### Security Requirements

- Local app password/PIN.
- Session timeout.
- Optional biometric gate on phone only if implemented by wrapper/PWA capability.
- Encrypted secrets.
- Optional at-rest encryption strategy for backups.
- Clear warning if exposed on public network.

### Reliability Requirements

- Automated tests for money math.
- Automated tests for budget math.
- Automated tests for imports and matching.
- Automated tests for reconciliation.
- Seed data for demo and QA.
- Database migration tests.

### Acceptance Criteria

- User can recover after laptop loss if backup exists.
- User can export all money data.
- Corrupt or partial imports can be rolled back.
- Failed migrations do not silently destroy finance data.

## Phase 11: Optional Bank Sync

Target readiness after phase with integration: working product 97%, YNAB parity 95-98%, Kashoo overlap 80%.

This is optional because it changes the nature of the product. Bank sync requires external services, credentials, privacy review, and provider maintenance.

Possible providers:

- Plaid.
- Teller.
- GoCardless Bank Account Data.
- Salt Edge.
- Region-specific aggregators.

Risks:

- Provider cost.
- Bank coverage gaps.
- Broken connections.
- Authentication refresh.
- Sensitive credential handling.
- More security responsibility.

Recommended approach:

1. Build manual and CSV imports first.
2. Build a clean import abstraction.
3. Add provider sync later behind the same import/matching pipeline.

## Phase 12: Optional Kashoo/Accounting Expansion

Target readiness if pursued: Kashoo overlap 85-90%.

This should only be built if the app needs business accounting.

Required modules:

- Chart of accounts.
- Double-entry journal.
- Customers.
- Vendors.
- Invoices.
- Bills.
- Payments.
- Accounts receivable.
- Accounts payable.
- Sales tax/VAT handling.
- Accountant export.
- Profit and loss.
- Balance sheet.
- General ledger.

This is a major product branch. It should not be mixed casually into the personal finance budget model.

## Implementation Order

Recommended order:

1. Fix money math and balances.
2. Persist all account/debt fields.
3. Add strong validation.
4. Build account registers.
5. Build transfer semantics.
6. Build reconciliation.
7. Build CSV import and matching.
8. Build envelope budgeting.
9. Build scheduled transactions.
10. Build rules and payees.
11. Build debt payoff planning.
12. Build multi-currency.
13. Build reports.
14. Build backup/restore/security.
15. Consider bank sync.
16. Consider business accounting.
17. Apply premium Bloomberg-style design system.

## Testing Strategy

Minimum test suites:

- Money arithmetic.
- Currency conversion.
- Ledger balance calculation.
- Transfer creation.
- Split transactions.
- Budget month rollover.
- Overspending behavior.
- Credit card payment behavior.
- Reconciliation difference calculation.
- CSV import mapping.
- Duplicate detection.
- Rule application.
- Backup and restore.

Recommended fixtures:

- Empty user.
- One checking account.
- Checking plus credit card.
- Multi-currency accounts.
- Two years of transactions.
- Heavy recurring bills.
- Debt payoff scenario.
- Import file with duplicates.
- Import file with unmatched rows.
- Reconciled account with later correction.

## Definition of Done for a Serious Personal Finance Product

The finance product can be considered serious when:

- Account balances are trustworthy.
- Budget numbers are trustworthy.
- User can reconcile against a statement.
- User can import transactions without duplicates.
- User can recover from mistakes.
- User can back up and restore.
- User can understand where every number came from.
- User can use it from phone while the local server is available.
- User can manage bills, debts, assets, goals, and reports without leaving the app.

## Final Target Scores

Without external bank sync:

- Finance data model foundation: 95-100%.
- Working personal finance product: 90-95%.
- YNAB-style parity: 85-95%.
- Kashoo-style overlap: 65-80%.
- Premium Bloomberg-style visual experience: deferred.

With external bank sync and optional business accounting:

- Finance data model foundation: 98-100%.
- Working personal finance product: 95-98%.
- YNAB-style parity: 95-98%.
- Kashoo-style overlap: 85-90%.
- Premium Bloomberg-style visual experience: deferred.

## Recommended Product Boundary

The strongest version of this app is not "a clone of everything." The strongest version is:

> A private, local-first, high-trust personal finance command center with excellent budgeting, reconciliation, imports, reports, assets, debts, and backups.

That is realistic. That is useful. That can be built to a very high standard inside this repo.

