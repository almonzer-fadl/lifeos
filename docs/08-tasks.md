# 08 — Tasks / Projects Module

**Current Completeness:** 25%  
**Target Completeness:** 100%  
**Priority:** P2 — Medium  
**Depends On:** Calendar module (time blocking), CRM module (client follow-ups), Projects module (project tasks)  
**Feeds Into:** Calendar module (scheduled tasks), Projects module (task completion → milestone progress)

---

## 1. Current State Analysis

### 1.1 Existing Models

| Model | Fields | Assessment |
|---|---|---|
| `Task` | id, title, description, dueDate, priority (low/medium/high/urgent), status (todo/in_progress/done/cancelled), projectId, tags (comma-separated), completedAt | **Basic task manager.** Functional for simple lists. |
| `Project` | id, name, description, status (active/completed/archived), color | **Thin.** Just a label for grouping tasks. |

### 1.2 Why 25%?

Almonzer runs **5+ concurrent projects** with a time-blocked schedule:
- VantLaunch (outreach phase — pipeline management)
- University (4 courses with assignments and exams)
- Gari (maintenance mode)
- The Firm (built, manual launch)
- TeraMotors (maintenance)
- Personal development (Elite Transformation plan)
- Language learning (6 languages)

His day is rigidly time-blocked: Deep Work 1 → University → Deep Work 2 → Admin → Free. Tasks need to know WHICH block they belong in.

Critical gaps:
1. **No subtasks.** VantLaunch outreach isn't one task — it's "research 10 repair shops" → "draft DM template" → "send 5 DMs" → "follow up" → "book call."
2. **No recurring tasks.** Daily prayers, daily gym, weekly review — these should auto-populate.
3. **No time-block integration.** Tasks should map to Deep Work 1 / Deep Work 2 / Admin blocks.
4. **No energy-level tagging.** Some tasks need deep focus, others are low-energy admin.
5. **No dependencies.** "Send proposal" depends on "client call completed."
6. **No pipeline view.** VantLaunch deals need: Lead → Contacted → Call Booked → Proposal Sent → Negotiation → Won/Lost.
7. **No quick capture.** Idea pops up → dump it fast → triage later.

### Not Needed
- Collaboration / team features
- Comments / activity feed
- File attachments
- Calendar integration beyond time blocks

---

## 2. Target State — Functional Requirements

### 2.1 New Models

#### Subtask
```prisma
model Subtask {
  id        String   @id @default(uuid())
  taskId    String
  title     String
  status    String   @default("todo") // todo, done
  sortOrder Int      @default(0)
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  @@index([taskId])
}
```

#### RecurringTaskTemplate
```prisma
model RecurringTaskTemplate {
  id              String   @id @default(uuid())
  title           String
  description     String?
  priority        String   @default("medium")
  projectId       String?
  energyLevel     String?  // deep, shallow, admin
  timeBlockSlot   String?  // deep_work_1, deep_work_2, admin, free, university
  frequency       String   // daily, weekly, monthly, weekdays
  frequencyCount  Int      @default(1)
  timeOfDay       String?  // morning, afternoon, evening
  estimatedMinutes Int?
  isActive        Boolean  @default(true)
  lastGeneratedAt DateTime?
  createdAt       DateTime @default(now())
}
```

#### TaskTimeBlock
```prisma
model TaskTimeBlock {
  id              String   @id @default(uuid())
  taskId          String   @unique
  scheduledDate   DateTime // which day
  blockSlot       String   // deep_work_1, deep_work_2, admin, free, university
  estimatedMinutes Int?
  actualMinutes   Int?
  startedAt       DateTime?
  completedAt     DateTime?
  task            Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  @@index([scheduledDate])
  @@index([blockSlot])
}
```

### 2.2 Changes to Existing Models

#### Task — Add:
```prisma
parentTaskId      String?  // FK to parent Task (alternative to Subtask model)
energyLevel       String?  // deep, shallow, admin
timeBlockSlot     String?  // deep_work_1, deep_work_2, admin, free
estimatedMinutes  Int?
pipelineStage     String?  // for project tasks: lead, contacted, call_booked, proposal, negotiation, won, lost
isQuickCapture    Boolean  @default(false) // captured but not yet triaged
```

#### Project — Add:
```prisma
pipelineStages  String?  // JSON array of stage names: ["Lead", "Contacted", "Call Booked", ...]
defaultView     String   @default("list") // list, kanban, timeline
```

---

## 3. Target State — Technical Requirements

### 3.1 New API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/productivity/tasks/[id]/subtasks` | GET, POST, PATCH | Subtask CRUD |
| `/api/productivity/tasks/recurring` | GET, POST, PATCH, DELETE | Recurring task template CRUD |
| `/api/productivity/tasks/generate` | POST | Generate today's tasks from recurring templates |
| `/api/productivity/tasks/inbox` | GET | Quick capture items needing triage |
| `/api/productivity/tasks/today` | GET | Today's tasks organized by time block |
| `/api/productivity/tasks/pipeline` | GET | Tasks grouped by pipeline stage for a project |

### 3.2 Recurring Task Generation

```typescript
// lib/recurring-tasks.ts
async function generateDailyTasks(date: Date): Promise<Task[]> {
  const templates = await db.recurringTaskTemplate.findMany({
    where: { isActive: true }
  });
  
  const tasks: Task[] = [];
  const dayOfWeek = date.getDay();
  
  for (const template of templates) {
    // Skip weekends for weekday tasks
    if (template.frequency === "weekdays" && (dayOfWeek === 0 || dayOfWeek === 6)) continue;
    // Skip non-matching days for weekly
    if (template.frequency === "weekly") { /* check if this day matches */ }
    
    // Check if already generated for this date
    const existing = await db.task.findFirst({
      where: {
        title: template.title,
        dueDate: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999))
        }
      }
    });
    if (existing) continue;
    
    const task = await db.task.create({
      data: {
        title: template.title,
        description: template.description,
        priority: template.priority,
        energyLevel: template.energyLevel,
        timeBlockSlot: template.timeBlockSlot,
        estimatedMinutes: template.estimatedMinutes,
        dueDate: date,
      }
    });
    tasks.push(task);
  }
  
  return tasks;
}
```

### 3.3 Pipeline Management

When a task has `pipelineStage` set on a Project with `pipelineStages`:
- Task moves through stages: Lead → Contacted → Call Booked → Proposal Sent → Won
- Each stage change logs a timestamp
- Pipeline view: columns for each stage, tasks as cards

---

## 4. UI/UX Requirements

### 4.1 Today View (Time-Block Organized)

```
┌──────────────────────────────────────────────────────────────┐
│ Today — Wednesday, June 17, 2026                            │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🌅 Deep Work 1 (07:30-09:00)                     [90 min]│ │
│ │ □ Draft VantLaunch outreach templates          [deep]    │ │
│ │ □ Research 5 target repair shops in KL         [deep]    │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🏫 University (09:00-13:00)                      [4 hrs]  │ │
│ │ □ WIA2004 Tutorial submission                    [uni]    │ │
│ │ □ WIX1001 Assignment 2                          [uni]    │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🌤 Deep Work 2 (14:00-16:00)                     [2 hrs]  │ │
│ │ □ Fix TeraMotors critical bug                    [deep]   │ │
│ │ □ Review Gari meeting feedback                   [deep]   │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 📋 Admin (16:00-17:00)                           [1 hr]   │ │
│ │ □ Reply to father's messages                    [admin]   │ │
│ │ □ Pay phone bill                                [admin]   │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 📥 Inbox (2 items to triage)                             │ │
│ │ □ "Check UM scholarship deadline"                        │ │
│ │ □ "Research Paraguay visa requirements"                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                          [+ Quick Capture]   │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Quick Capture

Cmd+Shift+N (or FAB long-press) → text input appears → type → enter → task goes to inbox with `isQuickCapture: true`. No fields, no friction. Triage later.

### 4.3 Pipeline View (Kanban)

For VantLaunch project:
```
┌─────────┬──────────┬──────────┬─────────┬─────────┬─────┐
│ LEAD    │CONTACTED │CALL BOOKD│PROPOSAL │ WON     │LOST │
├─────────┼──────────┼──────────┼─────────┼─────────┼─────┤
│Hwa Xia  │KL Motor  │Ahmed's  │         │         │     │
│Auto     │Works     │Garage   │         │         │     │
│         │          │         │         │         │     │
│Pang  │          │          │         │         │     │
│Auto     │          │          │         │         │     │
└─────────┴──────────┴──────────┴─────────┴─────────┴─────┘
```

Drag task card from stage to stage. Each move updates `pipelineStage` and logs timestamp.

---

## 5. Implementation Steps

1. Add `Subtask`, `RecurringTaskTemplate`, `TaskTimeBlock` models + new fields to `Task`, `Project`
2. Create `lib/recurring-tasks.ts` — daily task generation
3. API routes: subtasks, recurring, today view, pipeline view, quick capture
4. UI: time-block organized today view, Kanban pipeline view, quick capture input
5. Daily cron/timer: generate recurring tasks at midnight or on first login
6. Tests

---

## 6. Acceptance Criteria

1. Today view shows tasks grouped by time block: Deep Work 1, University, Deep Work 2, Admin
2. Quick capture: Cmd+Shift+N → type "research Uruguay visa" → enter → in inbox → triage later
3. Recurring tasks: daily prayers and gym auto-populate each morning
4. VantLaunch pipeline: 3 leads → drag "KL Motor Works" to Contacted → pipeline updates
5. Subtask: "VantLaunch outreach" has 5 subtasks → 3 done → parent shows 60% complete
6. Energy-level filter: "Show me deep work tasks only" → filters to high-focus items
