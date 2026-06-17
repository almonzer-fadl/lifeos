# 13 — Project Dashboard Module

**Current Completeness:** 0% (does not exist — currently only `Project` model is a thin label)  
**Target Completeness:** 100%  
**Priority:** P1 — High  
**Depends On:** Tasks module (project tasks), Finance module (project MRR), CRM module (client pipeline)  
**Feeds Into:** Finance module (income from projects), Tasks module (pipeline tasks)

---

## 1. Rationale

Almonzer has 5 active projects at different stages:

| Project | Type | Status | Revenue |
|---|---|---|---|
| **VantLaunch** | Agency | Outreach phase (sending DMs, booking calls) | $0 → target $1,500+/mo |
| **Gari** | SaaS/Marketplace | 87-95% complete, maintenance | ~$100/mo (underpaid) |
| **SpeakBill** | SaaS | Launched, observe mode | $0 |
| **The Firm** | Internal Tool | Built, manual launch on port 3010 | N/A (personal) |
| **TeraMotors** | Client App | Live, ~70% done, critical bugs remain | Part of father's support |

Additionally, he has **Project Zenith** (personal digital ecosystem) and **Project Origin** (Uruguay off-grid community) as long-term visions that need tracking.

Currently managed via Obsidian notes. No structured way to:
- See all projects at a glance with status, revenue, next actions
- Track VantLaunch pipeline (leads → calls → proposals → closed)
- Monitor project profitability (Gari earns ~$100/mo but cost in time?)
- Know what to work on next across all projects

---

## 2. Models

### Project (Expand existing)

The existing `Project` model in the schema is thin — just name, description, status, color. Expand it significantly:

```prisma
model Project {
  id              String   @id @default(uuid())
  name            String   // "VantLaunch", "Gari", "SpeakBill"
  description     String?
  type            String   // agency, saas, internal_tool, client_app, personal_vision
  status          String   // ideation, building, launched, active, maintenance, paused, completed, archived
  
  // Revenue
  revenueModel    String?  // "project_based", "retainer", "subscription", "commission", "none"
  mrr             Int      @default(0) // monthly recurring revenue (cents)
  arr             Int      @default(0) // annual recurring revenue (cents)
  totalRevenue    Int      @default(0) // lifetime revenue (cents)
  
  // Pipeline (for agency/sales projects)
  pipelineStages  Json?    // ["Lead", "Contacted", "Call Booked", "Proposal", "Won", "Lost"]
  activeDeals     Int      @default(0)
  dealsWon        Int      @default(0)
  dealValue       Int      @default(0) // total won deal value (cents)
  
  // Tech
  stack           String?  // "Next.js 16, Prisma, PostgreSQL", "Expo, Hono.js, Bun"
  repoUrl         String?
  deployUrl       String?
  port            Int?     // for self-hosted: 3010 (The Firm)
  
  // Time
  startedAt       DateTime?
  launchedAt      DateTime?
  completedAt     DateTime?
  estimatedEffort String?  // "5h/week", "maintenance only", "full-time"
  
  // Priority
  priority        Int      @default(3) // 1-5, 1 = highest
  nextAction      String?  // "Send 5 DMs today", "Fix critical bug #42"
  weeklyGoal      String?  // "Book 2 discovery calls"
  
  // Links
  color           String?
  icon            String?
  notes           String?  // markdown
  
  // Relations
  tasks           Task[]
  invoices        Invoice[]
  milestones      ProjectMilestone[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([status])
  @@index([priority])
}
```

### ProjectMilestone
```prisma
model ProjectMilestone {
  id          String   @id @default(uuid())
  projectId   String
  title       String   // "First paying client", "MVP launched", "100 users"
  description String?
  targetDate  DateTime?
  achievedAt  DateTime?
  status      String   @default("pending") // pending, achieved, missed
  sortOrder   Int      @default(0)
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@index([projectId])
}
```

### MRRSnapshot (Monthly Revenue Tracking)
```prisma
model MRRSnapshot {
  id          String   @id @default(uuid())
  date        DateTime @default(now()) // first of month
  projectId   String
  mrr         Int      // cents
  notes       String?
  
  @@unique([projectId, date])
}
```

---

## 3. API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/projects` | GET, POST, PATCH, DELETE | Project CRUD (expanded) |
| `/api/projects/[id]` | GET | Single project with tasks, milestones, revenue history |
| `/api/projects/[id]/milestones` | GET, POST, PATCH | Milestone CRUD |
| `/api/projects/[id]/mrr` | GET, POST | MRR snapshots |
| `/api/projects/dashboard` | GET | All projects overview with key metrics |
| `/api/projects/next-actions` | GET | Next action for each active project |

---

## 4. UI/UX

### 4.1 Project Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ Projects                                                    │
│ ┌───────────┬───────────┬───────────┬──────────────────────┐ │
│ │ Total MRR │ Active    │ Deals Won │ Next Action         │ │
│ │ $100/mo   │ 5 projects│ 0         │ Send 5 VantLaunch DMs│ │
│ └───────────┴───────────┴───────────┴──────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🚀 Active Projects                          [New Project]│ │
│ │                                                          │ │
│ │ 🔴 VantLaunch        Agency · Outreach · Priority 1      │ │
│ │    MRR: $0  ·  Target: $1,500/mo  ·  0 deals won        │ │
│ │    Pipeline: 3 Leads · 2 Contacted · 0 Calls             │ │
│ │    Next: Send 5 DMs to KL repair shops                   │ │
│ │    ████░░░░░░  20% to MRR target                        │ │
│ │                                                          │ │
│ │ 🟡 Gari              SaaS · Maintenance · Priority 3     │ │
│ │    MRR: $100/mo  ·  87-95% complete                     │ │
│ │    Stack: Expo, Hono.js, Bun, Prisma, PostgreSQL         │ │
│ │    Next: Fix workshop onboarding flow                    │ │
│ │                                                          │ │
│ │ 🟢 SpeakBill         SaaS · Observe · Priority 4         │ │
│ │    MRR: $0  ·  Launched on Product Hunt                 │ │
│ │    Next: No active development (observe mode)            │ │
│ │                                                          │ │
│ │ ⚪ The Firm          Internal · Active · Priority 3      │ │
│ │    8 agents ·  port 3010 ·  manual launch               │ │
│ │    Next: Test COO agent chain                            │ │
│ │                                                          │ │
│ │ 🔵 TeraMotors        Client · Maintenance · Priority 2   │ │
│ │    ~70% done ·  Live in Saudi                            │ │
│ │    Next: Fix critical bug — invoice PDF generation       │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🗺 Long-Term Visions                                     │ │
│ │ 🌍 Project Origin    Uruguay off-grid · $250-430K target │ │
│ │ 🌐 Project Zenith    Personal digital ecosystem          │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Project Detail (VantLaunch)

```
┌──────────────────────────────────────────────────────────────┐
│ ← VantLaunch                                     [Edit]     │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Agency · Outreach Phase · Priority 1 (Highest)           │ │
│ │ Tagline: "Your business runs on too many tools."         │ │
│ │ Pricing: $1,500 / $3,000 / $5,000 / custom               │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Pipeline (Kanban)                                        │ │
│ │ LEAD (3)    CONTACTED(2)  CALL(0)  PROPOSAL(0)  WON(0)  │ │
│ │ Hwa Xia     KL Motor                                     │ │
│ │ Pang Auto   Ahmad Garage                                 │ │
│ │ Tan Auto                                                │ │
│ │                                   [New Lead]              │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ MRR Progress                                             │ │
│ │ $0 ─────────────────────────────── $1,500/mo             │ │
│ │ ████████████████████████████████████████░░░░░░░░░░  100%│ │
│ │ 0/1 clients at $1,500                                    │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Milestones                                               │ │
│ │ ○ First outreach DM sent         ✓ Jun 15               │ │
│ │ ○ First discovery call booked    ○ Pending              │ │
│ │ ○ First proposal sent            ○ Pending              │ │
│ │ ○ First client closed ($1,500)   ○ Pending              │ │
│ │ ○ 3 clients ($4,500 MRR)         ○ Pending              │ │
│ │ ○ RM 100,000 checkpoint          ○ Pending              │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Tasks                                     [View All]     │ │
│ │ □ Send 5 outreach DMs today                              │ │
│ │ □ Follow up with KL Motor Works                          │ │
│ │ □ Prepare proposal template                              │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Implementation Steps

1. Expand existing `Project` model with revenue, pipeline, tech, priority fields
2. Add `ProjectMilestone`, `MRRSnapshot` models
3. API routes for projects (expanded), milestones, MRR, dashboard
4. UI: project dashboard with all projects, project detail with pipeline + milestones
5. Integration: link project tasks to Tasks module, project revenue to Finance module
6. Seed current projects (VantLaunch, Gari, SpeakBill, The Firm, TeraMotors, Origin, Zenith)
7. Tests

---

## 6. Acceptance Criteria

1. Dashboard shows all 5 active projects with status, MRR, next action — sorted by priority
2. VantLaunch detail: pipeline Kanban with 3 leads + 2 contacted, MRR progress bar toward $1,500
3. Milestone tracking: "First outreach DM sent ✓" → "First call booked ○" → "First client closed ○"
4. MRR snapshot: total across all projects = $100/mo (Gari only currently), goal = $1,500+
5. Next actions aggregated: "Send 5 VantLaunch DMs · Fix TeraMotors bug · Test Firm COO chain"
6. Long-term visions (Origin, Zenith) visible but separated from active projects
