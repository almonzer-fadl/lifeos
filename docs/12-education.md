# 12 — Education Tracker Module

**Current Completeness:** 0% (does not exist)  
**Target Completeness:** 100%  
**Priority:** P1 — High  
**Depends On:** Tasks module (assignment tasks), Calendar module (class schedule)  
**Feeds Into:** Tasks module (assignment deadlines as tasks), Calendar module (class times as blocks)

---

## 1. Rationale

Almonzer is a full-time student at Universiti Malaya (Information Systems) with:
- 4 courses this semester (WIA2004 Operating Systems, WIX1001 Computing Mathematics, Java Programming, Malaysian Language)
- Target GPA: 3.5+ (First Class Honours)
- Industrial training placement (24 weeks at MNC)
- European Master's scholarship ambitions (Eiffel, DAAD)
- Custom specialization: Enterprise Product Engineer track
- 6 languages being learned at various levels
- Quran memorization: 35 pages memorized, target full Quran by 2030

Currently tracked via Obsidian notes and Cheet Sheets. No structured system for:
- Assignment deadlines and grades
- GPA calculation and projection
- Language learning progress tracking
- Quran memorization velocity

---

## 2. Models

### Course
```prisma
model Course {
  id              String   @id @default(uuid())
  code            String   // "WIA2004"
  name            String   // "Operating Systems"
  semester        String   // "2026-Sem1"
  credits         Int      // credit hours
  instructor      String?
  schedule        String?  // "Mon 10:00-12:00, Wed 14:00-16:00"
  color           String?
  targetGrade     String?  // "A", "A-"
  currentGrade    Float?   // computed from assignments/exams
  notes           String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  assignments     Assignment[]
  exams           Exam[]
  
  @@unique([code, semester])
}
```

### Assignment
```prisma
model Assignment {
  id              String   @id @default(uuid())
  courseId        String
  title           String
  description     String?
  dueDate         DateTime
  submittedDate   DateTime?
  weight          Float?   // % of final grade (e.g., 15%)
  score           Float?   // points received
  maxScore        Float    @default(100)
  percentage      Float?   // computed: score/maxScore * 100
  status          String   @default("pending") // pending, submitted, graded, late
  grade           String?  // letter grade if applicable
  notes           String?
  createdAt       DateTime @default(now())
  
  @@index([dueDate])
  @@index([courseId])
}
```

### Exam
```prisma
model Exam {
  id          String   @id @default(uuid())
  courseId    String
  title       String   // "Midterm", "Final Exam"
  date        DateTime
  duration    Int?     // minutes
  location    String?
  weight      Float?   // % of final grade
  score       Float?
  maxScore    Float    @default(100)
  percentage  Float?
  grade       String?
  notes       String?
  createdAt   DateTime @default(now())
  
  @@index([date])
  @@index([courseId])
}
```

### GPASnapshot
```prisma
model GPASnapshot {
  id          String   @id @default(uuid())
  semester    String   // "2026-Sem1"
  gpa         Float    // computed
  cgpa        Float    // computed cumulative
  totalCredits Int
  notes       String?
  createdAt   DateTime @default(now())
  
  @@unique([semester])
}
```

### LanguageProgress
```prisma
model LanguageProgress {
  id              String   @id @default(uuid())
  language        String   // malay, french, spanish, hindi, mandarin, turkish, arabic, english
  currentLevel    String   // A1, A2, B1, B2, C1, C2
  targetLevel     String
  targetDate      DateTime?  // e.g., B2 in Malay by Year 1
  streakDays      Int      @default(0)
  totalMinutes    Int      @default(0) // total study time
  totalSessions   Int      @default(0)
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  sessions        LanguageSession[]
  
  @@unique([language])
}
```

### LanguageSession
```prisma
model LanguageSession {
  id              String   @id @default(uuid())
  languageId      String
  date            DateTime @default(now())
  duration        Int      // minutes
  activity        String   // duolingo, textbook, conversation, listening, writing, vocabulary
  notes           String?
  language        LanguageProgress @relation(fields: [languageId], references: [id], onDelete: Cascade)
  
  @@index([languageId, date])
}
```

---

## 3. API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/education/courses` | GET, POST, PATCH, DELETE | Course CRUD |
| `/api/education/courses/[id]/assignments` | GET, POST, PATCH | Assignment CRUD per course |
| `/api/education/courses/[id]/exams` | GET, POST, PATCH | Exam CRUD per course |
| `/api/education/gpa` | GET | Current GPA calculation + history |
| `/api/education/gpa/project` | POST | "What GPA do I need on remaining assignments to get A-?" |
| `/api/education/dashboard` | GET | Aggregated: upcoming deadlines, current GPA, course progress |
| `/api/education/languages` | GET, POST, PATCH | Language progress CRUD |
| `/api/education/languages/sessions` | POST, DELETE | Log study session |
| `/api/education/languages/stats` | GET | Per-language: total hours, streak, level progress |

### GPA Calculation

```typescript
// lib/gpa.ts
// UM GPA Scale (approximate, verify with actual UM scale)
const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "F": 0.0,
};

function calculateGPA(courses: CourseWithGrades[]): { gpa: number; totalCredits: number } {
  let totalPoints = 0;
  let totalCredits = 0;
  for (const course of courses) {
    const gradePoint = GRADE_POINTS[course.finalGrade] || 0;
    totalPoints += gradePoint * course.credits;
    totalCredits += course.credits;
  }
  return { gpa: totalPoints / totalCredits, totalCredits };
}
```

---

## 4. UI/UX

### 4.1 Education Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ Education                                   Semester 1, 2026 │
│ ┌───────────┬───────────┬───────────┬──────────────────────┐ │
│ │ GPA       │ Credits   │ Rank      │ Industrial Training  │ │
│ │ 3.52      │ 16/120    │ Target 3.5│ 24 weeks (2028)     │ │
│ │ On track ✓│           │           │ Target: MNC          │ │
│ └───────────┴───────────┴───────────┴──────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Courses                                                  │ │
│ │ WIA2004 OS         ████████████░░  85%  Projected: A-   │ │
│ │ WIX1001 Math       ██████████░░░░  72%  Projected: B+   │ │
│ │ Java Programming   ████████████░░  88%  Projected: A    │ │
│ │ Malaysian Lang     ██████████████  92%  Projected: A    │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Upcoming Deadlines                                       │ │
│ │ Jun 20  WIA2004 Assignment 3       10% of grade  3 days  │ │
│ │ Jun 25  WIX1001 Quiz 4             5% of grade   8 days  │ │
│ │ Jul 5   Java Project Milestone 2   15% of grade  18 days │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Language Progress                                        │ │
│ │ Malay    A1 → B1    ████░░░░░░░░  35%   3.2h total      │ │
│ │ French   A1 → B2    ██░░░░░░░░░░  18%   8.5h total      │ │
│ │ Spanish  A0 → B2    █░░░░░░░░░░░   5%   4.1h total      │ │
│ │ Hindi    A0 → B1    █░░░░░░░░░░░   8%   2.0h total      │ │
│ │ Mandarin A0 → B1    ░░░░░░░░░░░░   0%   not started     │ │
│ │ Turkish  C1 → C2    ████████████  85%   native level    │ │
│ │ Arabic   C2 Native   ██████████████ 100%                 │ │
│ │ English  C2 Native   ██████████████ 100%                 │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Course Detail

Tapping a course shows:
- Assignments list with due dates, weights, grades
- Exams list
- Grade breakdown: "You have 85%. Remaining: Final Exam (40% weight). Need 62.5% on final to get A-."
- "What grade will I get?" calculator: adjust expected scores on remaining items → projected final grade

### 4.3 Language Session Logging

Quick log after study session:
- Language: French
- Duration: 15 min
- Activity: Duolingo / Conversation / Reading / Listening
- Notes (optional)

Auto-updates: streak, total hours, progress toward target level.

---

## 5. Implementation Steps

1. Add `Course`, `Assignment`, `Exam`, `GPASnapshot`, `LanguageProgress`, `LanguageSession` models
2. Create `lib/gpa.ts` — GPA calculation with UM scale
3. API routes for courses, assignments, exams, GPA, languages
4. UI: education dashboard, course detail with grade projection, language progress
5. Seed current courses from Obsidian Cheet Sheets data
6. Integration: assignment deadlines → auto-create Tasks, exam dates → Calendar events
7. Tests

---

## 6. Acceptance Criteria

1. Dashboard shows: GPA 3.52 (on track for First Class), 4 courses with progress bars
2. Course detail: WIA2004 → 85% → "Need 62.5% on final exam (40% weight) for A-"
3. Upcoming: 3 deadlines in next 30 days, sorted by urgency
4. Language dashboard: 6 languages with progress bars, streak counts, total hours
5. Log 15 min French session → streak updated, total hours incremented, progress bar advances
6. GPA projection: "If I get B+ on WIX1001 final, semester GPA will be 3.45."
