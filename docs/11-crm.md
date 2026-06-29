# 11 — Relationship CRM Module

**Current Completeness:** 0% (does not exist)  
**Target Completeness:** 100%  
**Priority:** P0 — Critical  
**Depends On:** Finance module (client invoicing), Tasks module (follow-up reminders)  
**Feeds Into:** Finance module (client payments), Projects module (client pipeline), Tasks module (relationship tasks)

---

## 1. Rationale — Why This Module Exists

Almonzer has complex, multi-threaded relationships that are critical to his life goals:

| Person | Role | Stakes |
|---|---|---|
| **Melek** (girlfriend) | Long-distance relationship, 4,770+ messages in 20 days, deep emotional investment, complex history | Very high — emotional wellbeing, life planning |
| **Father** | Financial supporter (RM 2,088/mo), business partner (Gari, TeraMotors, Arslan), parent | Very high — income source, business, family duty |
| **VantLaunch clients** (future) | Income source, professional reputation | High — financial independence |
| **Aunt** | Quran teacher, spiritual accountability | Medium — spiritual growth |
| **Sister Jumana** | Family, friend of Melek | Medium — family connection |
| **University professors** | Academic success, references, industrial placement | Medium — career leverage |

Currently, all of this lives in his head and scattered Obsidian notes (like Melek's 552-line psychological profile). There is no system for:
- Tracking when he last spoke to each person
- Remembering important details (birthdays, preferences, past conversations)
- Following up on commitments made to people
- Managing the emotional bandwidth of relationships
- Seeing all threads with one person in one place

---

## 2. Models (All New)

### Contact
```prisma
model Contact {
  id              String   @id @default(uuid())
  firstName       String
  lastName        String?
  fullName        String   // computed: firstName + lastName
  
  // Relationship
  type            String   // family, partner, friend, client, mentor, colleague, acquaintance
  subType         String?  // "girlfriend", "father", "client_leads", "client_active", "university_lecturer"
  groupId         String?  // FK to ContactGroup
  
  // Personal
  birthday        DateTime?
  birthYear       Int?
  nationality     String?
  location        String?  // "Sapanca, Turkey", "Riyadh, Saudi Arabia"
  languages       String?  // comma-separated
  
  // Contact info
  email           String?
  phone           String?
  whatsapp        String?
  telegram        String?
  socialLinks     Json?    // { twitter: "...", linkedin: "...", instagram: "..." }
  
  // Notes
  bio             String?  // markdown — key context about this person
  preferences     String?  // things they like/dislike, communication preferences
  importantDates  Json?    // [{ date, label: "anniversary", "started dating" }]
  
  // Status
  relationshipHealth String? // strong, good, needs_attention, strained, dormant
  lastContactedAt   DateTime?
  nextFollowUpAt    DateTime?
  followUpFrequency String? // daily, weekly, biweekly, monthly, quarterly
  isKeyPerson       Boolean @default(false) // appears on dashboard
  isActive          Boolean @default(true)
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  interactions    Interaction[]
  invoices        Invoice[]     // from Finance module
  transactions    Transaction[] // from Finance module
  
  @@index([type])
  @@index([relationshipHealth])
  @@index([nextFollowUpAt])
}
```

### Interaction
```prisma
model Interaction {
  id          String   @id @default(uuid())
  contactId   String
  date        DateTime @default(now())
  type        String   // call, message, meeting, email, video_call, in_person
  direction   String   // outgoing, incoming
  platform    String?  // whatsapp, telegram, phone, zoom, in_person
  summary     String   // brief note about what was discussed
  actionItems String?  // things to follow up on
  mood        String?  // positive, neutral, negative (how the interaction felt)
  duration    Int?     // minutes
  tags        String?  // comma-separated for filtering
  contact     Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  
  @@index([contactId])
  @@index([date])
}
```

### ContactGroup
```prisma
model ContactGroup {
  id          String   @id @default(uuid())
  name        String   // "Family", "Clients", "University", "VantLaunch Leads"
  color       String?
  icon        String?
  sortOrder   Int      @default(0)
  contacts    Contact[]
  
  @@unique([name])
}
```

---

## 3. API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/crm/contacts` | GET, POST, PATCH, DELETE | Contact CRUD with filtering (type, group, health, keyPerson) |
| `/api/crm/contacts/[id]` | GET | Single contact with recent interactions |
| `/api/crm/contacts/[id]/interactions` | GET, POST | Interaction history + log new |
| `/api/crm/groups` | GET, POST, DELETE | Contact group CRUD |
| `/api/crm/dashboard` | GET | Key people overview, overdue follow-ups, relationship health summary |
| `/api/crm/follow-ups` | GET | Contacts needing follow-up (nextFollowUpAt <= today) |
| `/api/crm/birthdays` | GET | Upcoming birthdays (next 30 days) |
| `/api/crm/important-dates` | GET | Anniversaries, special dates |

---

## 4. UI/UX

### 4.1 CRM Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ People                                      Key Relationships │
│ ┌───────────┬───────────┬───────────┬──────────────────────┐ │
│ │ Melek     │ Father    │ Aunt      │ Follow-ups           │ │
│ │ 💚 Strong │ 💛 Good   │ 💚 Strong │ 2 overdue            │ │
│ │ Last: 2h  │ Last: 1d  │ Last: 3d  │ Father, KL Motor    │ │
│ └───────────┴───────────┴───────────┴──────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ⚠️ Needs Attention                                       │ │
│ │ Father — Last contact 1 day ago (follow-up due)         │ │
│ │ KL Motor Works — No response to proposal (3 days)        │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ All Contacts                           [+ Add Contact]   │ │
│ │ 👤 Melek Abuqasim          💚 Strong     Sapanca, TR     │ │
│ │ 👤 Father                  💛 Good       Riyadh, SA      │ │
│ │ 👤 Aunt                    💚 Strong     —               │ │
│ │ 👤 Jumana (Sister)         💛 Good       —               │ │
│ │ 👤 KL Motor Works (Client) 🟡 Lead       KL, MY          │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Contact Profile (e.g., Melek)

```
┌──────────────────────────────────────────────────────────────┐
│ ← Melek Abuqasim                           [Edit] [Log Int.] │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 💚 Strong  ·  Partner  ·  Sapanca, Turkey               │ │
│ │ Last contact: 2 hours ago (WhatsApp)                     │ │
│ │ Next follow-up: — (in constant contact)                  │ │
│ │ Birthday: July 26 (39 days)                              │ │
│ │ Anniversary: — (undefined relationship status)           │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Recent Interactions                         [Log New]    │ │
│ │ Jun 17  💬 WhatsApp  Incoming  "Good morning..."         │ │
│ │ Jun 16  📞 Call       Outgoing  45 min  "Talked about..."│ │
│ │ Jun 16  💬 WhatsApp  Incoming  "Sent photo of..."       │ │
│ │ Jun 15  💬 WhatsApp  Outgoing  "Sent her the..."        │ │
│ │                                       [View All 2K+]     │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Notes & Context                                          │ │
│ │ • Palestinian origin, raised in Saudi + Turkey           │ │
│ │ • Studying dentistry, targets Hacettepe University       │ │
│ │ • Speaks Turkish, Arabic, English; wants to learn Spanish│ │
│ │ • Known each other 4+ years, complex history             │ │
│ │ • [View Full Profile]                                    │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Important Dates                                          │ │
│ │ Jul 26  🎂 Birthday                                      │ │
│ │ Feb 14  💝 Valentine's Day                               │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 Log Interaction (Quick)

Simple form to log after a significant interaction:
- Type: Call / Message / Meeting / In-person
- Direction: Outgoing / Incoming
- Platform: WhatsApp / Telegram / Phone / etc.
- Summary: brief note
- Action items: things to remember for next time
- Mood: how did it feel? (Positive / Neutral / Negative)

This takes <10 seconds to fill out.

---

## 5. Implementation Steps

1. Add `Contact`, `Interaction`, `ContactGroup` models
2. API routes for contacts, interactions, groups, dashboard
3. UI: CRM dashboard, contact profile, interaction logger, follow-up reminders
4. Integration: link contacts to transactions (father's support), invoices (clients), tasks (follow-ups)
5. Seed initial contacts from vault data (Melek, Father, Aunt, Jumana)
6. Tests

---

## 6. Acceptance Criteria

1. CRM dashboard shows 4 key people with relationship health indicators
2. Open Melek's profile → see last interaction 2h ago, full interaction timeline, important dates
3. Log interaction: "Called father about TeraMotors bug fix" → logged, lastContactedAt updated
4. Follow-up alert: "Father — no contact in 3 days" if nextFollowUpAt passes
5. Birthday reminder: "Melek's birthday in 39 days (July 26)"
6. Client contact linked to invoice: KL Motor Works → Invoices tab shows INV-001
