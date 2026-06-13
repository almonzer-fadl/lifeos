# Finance Design Plan

## Goal

Create a premium dark financial interface that feels institutional, expensive, and data-dense without using loud colors or decorative effects. The visual target is closer to a private Bloomberg-style command center than a consumer budgeting app.

This plan is design-only. It does not change finance calculations, API behavior, schema, imports, reconciliation, budgets, or backend logic.

## Design Positioning

The product should feel like:

- Private wealth dashboard.
- Institutional finance terminal.
- Quiet luxury software.
- Dense professional command center.
- Local-first money operating system.

The product should not feel like:

- A colorful budgeting toy.
- A wellness dashboard.
- A marketing SaaS landing page.
- A fintech app using bright gradients.
- A generic rounded-card admin template.

## Visual Principles

0. Phone/PWA first
   - The phone viewport is the primary daily-use surface.
   - Desktop should feel richer and wider, but not require different workflows.
   - Bottom navigation, thumb-reachable actions, compact metrics, and non-overlapping form controls are mandatory.

1. Dark as the default
   - Use near-black and graphite surfaces.
   - Avoid pure flat black everywhere; use small tonal steps for hierarchy.
   - Most of the screen should be dark.

2. Restraint over decoration
   - No gradients as primary visual language.
   - No decorative blobs, orbs, oversized illustration, or bright background treatments.
   - Accent colors should be rare and meaningful.

3. Dense but legible
   - More information per viewport.
   - Compact tables, metrics, and panels.
   - Avoid huge empty cards.
   - Use mono numerals for money and percentages.

4. Premium material
   - Thin graphite borders.
   - Subtle inner highlights.
   - Low, controlled shadows.
   - Small radius: 6-8px for panels and controls.

5. Market-terminal color semantics
   - Positive: restrained green.
   - Negative/liability: restrained red.
   - Warning/due/bills: muted amber.
   - Primary accent: champagne/gold, used sparingly.
   - Secondary data: cool blue/steel.

## Palette

Recommended token direction:

- Background: `#030405`
- Sidebar: `#07090b`
- Surface: `#0b0e11`
- Surface raised: `#101419`
- Surface hover: `#151a20`
- Border: `#20262e`
- Border strong: `#303844`
- Primary text: `#eef1f3`
- Secondary text: `#98a1ad`
- Tertiary text: `#5f6874`
- Gold accent: `#d7b56d`
- Gold soft: `rgba(215, 181, 109, 0.12)`
- Positive: `#42d392`
- Negative: `#ff5f6d`
- Amber: `#d99a2b`
- Steel/blue: `#73a7d8`

## Typography

- Keep the app's current font stack unless a later brand pass chooses otherwise.
- Use uppercase micro-labels for financial metrics.
- Use mono font for amounts, dates, ratios, and account codes.
- Avoid oversized headings inside dashboard panels.
- Use compact labels and strong numeric hierarchy.

## Layout Direction

### Mobile/PWA

- The first screen should show the key financial state without requiring horizontal scrolling.
- Metrics should use compact two-column cards on phone.
- Forms should be usable with thumbs and should not require tiny tap targets.
- Bottom navigation must not cover important page actions.
- Desktop-only density must not make the phone layout cramped.

### Shell

- Dark fixed sidebar.
- Active navigation should feel like a selected terminal command, not a pastel pill.
- Sidebar labels should be subdued.
- Finance should visually stand out as the main money command center, but not through loud color.

### Finance Page

First viewport should contain:

- Page title and context row.
- Net worth strip.
- Primary money metrics.
- Quick exposure composition: cash/assets/debts/cashflow.
- Add/import/action area should be secondary, not visually dominant.

Panel style:

- 8px radius.
- Thin dark border.
- Dark raised surface.
- Compact spacing.
- Money values in mono.
- Accent line or small signal chip instead of large colorful fills.

### Forms

- Forms should feel like terminal input controls.
- Dark fields.
- Thin borders.
- Compact segmented controls.
- Buttons should be dark/gold/steel, not bright pastel.
- Disable states should be visible but quiet.

### Tables and Lists

- Transactions should read like a ledger.
- Use row separators and hover states.
- Amount column right-aligned.
- Date/account/category metadata subdued.
- Avoid heavy card treatment for every row.

## Implementation Scope for First Design Pass

This pass should update:

- `app/globals.css`
- `components/layout/shell.tsx`
- `app/finance/page.tsx`
- `components/modules/finance/finance-forms.tsx`
- `components/modules/finance/transaction-form.tsx`
- `components/ui/delete-button.tsx` if necessary for dark surfaces

This pass should not update:

- Prisma schema.
- API routes.
- Database logic.
- Finance calculations.
- Budgeting behavior.
- Import/reconciliation behavior.

## Validation Checklist

- Finance page is dark by default.
- No pastel finance panels remain.
- Cards are compact and terminal-like.
- Numbers feel premium and legible.
- The dashboard looks useful even with no data.
- Buttons and inputs work visually on dark surfaces.
- Mobile layout does not overlap.
- Lint passes.
- Build passes.
- Browser screenshot confirms the first viewport has the intended direction.

## Later Design Phases

After backend functionality improves, design can add:

- Ledger table redesign.
- Budget command center.
- Reconciliation workspace.
- Import review workspace.
- Portfolio/net worth charts.
- Market-style ticker header.
- Keyboard command palette.
- Mobile wealth dashboard.
- Optional theme setting.
