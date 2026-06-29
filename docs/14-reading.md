# 14 — Reading List Module

**Current Completeness:** 0% (does not exist)  
**Target Completeness:** 100%  
**Priority:** P3 — Low  
**Depends On:** None  
**Feeds Into:** Journal module (book notes as journal prompts), Insights engine (reading consistency)

---

## 1. Rationale

Almonzer has read and summarized 14 books in his Obsidian vault:
- Think and Grow Rich, Essentialism, Man's Search for Meaning, Deep Work, Atomic Habits, and others
- He has a physical book buying strategy for KL
- He applies book lessons to his life (Hormozi principles, Cal Newport's Deep Work)

Currently tracked as individual markdown files in Obsidian. No:
- Reading queue (what to read next)
- Action items from each book (what to apply)
- Reading progress tracking
- Notes search across all books

---

## 2. Models

### Book
```prisma
model Book {
  id              String   @id @default(uuid())
  title           String
  author          String
  isbn            String?
  coverUrl        String?
  
  // Status
  status          String   @default("to_read") // to_read, reading, completed, abandoned, re_reading
  startedAt       DateTime?
  completedAt     DateTime?
  
  // Rating
  rating          Int?     // 1-5
  difficulty      Int?     // 1-5 (how hard was it to read)
  
  // Content
  summary         String?  // markdown — key takeaways
  keyQuote        String?  // most impactful quote
  category        String?  // business, psychology, philosophy, biography, technology, self_help, fiction
  format          String?  // physical, kindle, audiobook, pdf
  pageCount       Int?
  currentPage     Int?
  
  // Application
  actionItems     String?  // markdown — what to apply from this book
  
  // Relations
  notes           BookNote[]
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([status])
  @@index([category])
}
```

### BookNote
```prisma
model BookNote {
  id          String   @id @default(uuid())
  bookId      String
  chapter     String?  // chapter or page reference
  quote       String?  // exact quote
  note        String   // your thought, reflection, or application
  type        String   @default("highlight") // highlight, reflection, question, action_item
  page        Int?
  createdAt   DateTime @default(now())
  book        Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  
  @@index([bookId])
}
```

---

## 3. API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/reading/books` | GET, POST, PATCH, DELETE | Book CRUD, filter by status/category |
| `/api/reading/books/[id]` | GET | Single book with all notes |
| `/api/reading/books/[id]/notes` | GET, POST, DELETE | Book notes CRUD |
| `/api/reading/queue` | GET | Reading queue (to_read, sorted by priority) |
| `/api/reading/stats` | GET | Books read this year, pages read, avg rating, categories breakdown |
| `/api/reading/random-note` | GET | Random book note for daily inspiration |

---

## 4. UI/UX

```
┌──────────────────────────────────────────────────────────────┐
│ Reading                                     14 books read    │
│ ┌───────────┬───────────┬───────────┬──────────────────────┐ │
│ │ Reading   │ Completed │ This Year │ Favorite             │ │
│ │ Deep Work │ 14 books  │ 3 books   │ Man's Search...      │ │
│ │ 45% done  │ avg 4.2★  │ avg 3.8★  │ by Viktor Frankl     │ │
│ └───────────┴───────────┴───────────┴──────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 📖 Currently Reading                                     │ │
│ │ Deep Work — Cal Newport                                 │ │
│ │ ████████████████████░░░░░░░░░░░░  45% (page 134/296)    │ │
│ │ [Update Progress]                                        │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 📚 Reading Queue                           [Add Book]    │ │
│ │ 1. The Lean Startup — Eric Ries                         │ │
│ │ 2. Zero to One — Peter Thiel                            │ │
│ │ 3. The Hard Thing About Hard Things — Ben Horowitz      │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ✅ Completed                                           │ │
│ │ Atomic Habits         ★★★★★  "You do not rise to..."   │ │
│ │ Essentialism          ★★★★☆  "Essentialism is not..."  │ │
│ │ Think and Grow Rich   ★★★★☆  "Whatever the mind..."    │ │
│ │ Man's Search for...   ★★★★★  "Everything can be..."    │ │
│ │                                         [View All 14]   │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 💡 Random Note                                          │ │
│ │ "Action alleviates anxiety." — from Atomic Habits      │ │
│ │ Applied: "Started sending outreach DMs immediately      │ │
│ │ instead of perfecting the website."                     │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Implementation Steps

1. Add `Book`, `BookNote` models
2. API routes for books, notes, queue, stats
3. UI: reading dashboard, book detail with notes, reading queue, reading progress tracker
4. Seed existing books from Obsidian vault summaries
5. Tests

---

## 6. Acceptance Criteria

1. Reading dashboard shows: "Currently reading: Deep Work (45%)", queue of 3 books, 14 completed
2. Book detail: Atomic Habits → notes, key quote, action items applied
3. Update progress: Deep Work → page 200 → progress bar at 67%
4. Random note widget: shows a different highlight each visit
5. Stats: "3 books read this year, avg rating 3.8★, mostly business/psychology"
