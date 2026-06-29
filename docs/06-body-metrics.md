# 06 — Body Metrics Module

**Current Completeness:** 25%  
**Target Completeness:** 100%  
**Priority:** P2 — Medium  
**Depends On:** T1D module (HbA1c, ketones), Activity module (weight/measurement trends)  
**Feeds Into:** T1D module (lab result trends), Activity module (weight progression)

---

## 1. Current State Analysis

### 1.1 Existing Models

| Model | Fields | Assessment |
|---|---|---|
| `BodyMeasurement` | id, date, weight(kg), bodyFatPct, waist, chest, bicepLeft, bicepRight, thighLeft, thighRight, neck, notes | **Good for circumference tracking.** Missing: blood pressure, progress photos, body composition breakdown. |
| `LabResult` | id, date, testName, value, unit, refRangeLow, refRangeHigh, labName, notes, attachmentPath | **Basic but functional.** Missing: panel grouping (thyroid panel has 3+ tests that should be viewed together), panel ordering, trend flagging. |
| `Supplement` | id, name, brand, servingSize, servingUnit, nutrients (JSON), notes | **Good.** |
| `SupplementLog` | id, date, supplementId, dosage, dosageUnit, timeOfDay, notes | **Functional.** |

### 1.2 Why 25%?

Almonzer manages two chronic conditions (T1D + thyroid) and tracks body composition for athletic goals.

Critical gaps:
1. **HbA1c is not a first-class concept.** His most important lab — the 3-month average glucose — should be front and center with a trend line, not buried as "LabResult where testName = 'HbA1c'."
2. **No thyroid panel grouping.** TSH, Free T3, Free T4 are individual LabResults but belong together as a panel.
3. **No skin condition tracking.** He has eczema and hyperpigmentation. What cream works? What triggers breakouts?
4. **No medication tracking.** Thyroid medication, insulin brands — separate from supplements, these are prescriptions.
5. **No blood pressure.** Important for an endurance athlete.
6. **No progress photos.** Calisthenics physique tracking is primarily visual.

---

## 2. Target State — Functional Requirements

### 2.1 New Models

#### HbA1cRecord
```prisma
model HbA1cRecord {
  id          String   @id @default(uuid())
  date        DateTime
  value       Float    // percentage (e.g., 6.8)
  method      String   @default("lab") // lab, estimated_from_cgm, estimated_from_readings
  labResultId String?  // FK to LabResult (if from blood test)
  notes       String?
  createdAt   DateTime @default(now())
  
  @@index([date])
}
```

#### ThyroidPanel
```prisma
model ThyroidPanel {
  id          String   @id @default(uuid())
  date        DateTime
  tsh         Float    // mIU/L
  ft3         Float?   // pmol/L
  ft4         Float?   // pmol/L
  labName     String?
  notes       String?
  createdAt   DateTime @default(now())
  
  @@index([date])
}
```

#### SkinCondition
```prisma
model SkinCondition {
  id          String   @id @default(uuid())
  date        DateTime
  condition   String   // eczema_flare, hyperpigmentation, dryness, acne
  severity    Int      @default(3) // 1-5
  location    String?  // face, arms, legs, etc.
  treatment   String?  // "Ceradan cream", "niacinamide", "VCO"
  trigger     String?  // "weather change", "stress", "diet", "unknown"
  photoPath   String?  // visual tracking
  notes       String?
  createdAt   DateTime @default(now())
  
  @@index([date])
  @@index([condition])
}
```

#### Medication
```prisma
model Medication {
  id              String   @id @default(uuid())
  name            String   // "Levothyroxine", "Novorapid", "Lantus"
  type            String   // prescription, otc, insulin
  dosage          String   // "50mcg", "100 units/mL"
  frequency       String   // "daily", "twice_daily", "as_needed"
  timeOfDay       String?  // "morning", "bedtime", "before_meals"
  startDate       DateTime
  endDate         DateTime? // if discontinued
  prescribingDoctor String?
  pharmacy        String?
  cost            Int?     // cents, per refill
  refillReminder  Boolean  @default(false)
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  logs            MedicationLog[]
  
  @@index([type])
}
```

#### MedicationLog
```prisma
model MedicationLog {
  id           String   @id @default(uuid())
  medicationId String
  date         DateTime @default(now())
  taken        Boolean  @default(true)
  time         DateTime? // actual time taken
  dosage       String?   // override if different from prescription
  notes        String?
  medication   Medication @relation(fields: [medicationId], references: [id], onDelete: Cascade)
  
  @@index([medicationId])
  @@index([date])
}
```

### 2.2 Changes to Existing Models

#### BodyMeasurement — Add:
```prisma
bloodPressureSystolic   Int?
bloodPressureDiastolic  Int?
photoPath               String?  // progress photo
muscleMass              Float?   // if available from scale
boneMass                Float?
waterWeight             Float?
```

#### LabResult — Add:
```prisma
panelGroup  String?  // "Thyroid", "CBC", "Lipid", "HbA1c", "Kidney", "Liver", "Vitamin"
panelOrder  Int?     // display order within panel
isAbnormal  Boolean? // computed: value outside refRange
```

---

## 3. Target State — Technical Requirements

### 3.1 New API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health/hba1c` | GET, POST, DELETE | HbA1c record CRUD |
| `/api/health/hba1c/trend` | GET | HbA1c trend with estimated trajectory |
| `/api/health/thyroid` | GET, POST, DELETE | Thyroid panel CRUD |
| `/api/health/skin` | GET, POST, PATCH, DELETE | Skin condition tracking |
| `/api/health/medications` | GET, POST, PATCH, DELETE | Medication CRUD |
| `/api/health/medications/log` | POST, DELETE | Medication adherence logging |
| `/api/health/medications/refill` | GET | List medications needing refill soon |

### 3.2 Panel Grouping Logic

```typescript
// When fetching thyroid-related results:
const thyroidPanel = await db.labResult.findMany({
  where: { panelGroup: "Thyroid" },
  orderBy: [{ date: "desc" }, { panelOrder: "asc" }]
});
// Returns TSH, FT3, FT4 grouped by date, sorted by panel order
```

### 3.3 Abnormal Flag

```typescript
function flagAbnormal(result: LabResult): boolean {
  if (result.refRangeLow != null && result.value < result.refRangeLow) return true;
  if (result.refRangeHigh != null && result.value > result.refRangeHigh) return true;
  return false;
}
```

---

## 4. UI/UX Requirements

### 4.1 Body Dashboard (Redesigned)

```
┌──────────────────────────────────────────────────────────────┐
│ Body                                        Last Update      │
│ ┌───────────┬───────────┬───────────┬──────────────────────┐ │
│ │ Weight    │ Body Fat  │ HbA1c     │ Blood Pressure      │ │
│ │ 70.2 kg   │ 14.5%     │ 6.8%      │ 118/76              │ │
│ │ ↓ 1.2kg   │ ↓ 0.5%    │ ↓ 0.3%    │ Normal ✓            │ │
│ └───────────┴───────────┴───────────┴──────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ HbA1c Trend (18 months)                                  │ │
│ │ 7.2 ┤      ●                                             │ │
│ │ 7.0 ┤        ●                                           │ │
│ │ 6.8 ┤          ●──●──●  ← current: 6.8                  │ │
│ │ 6.6 ┤                   ─ ─ ─ projected: 6.5 (Oct 2026)│ │
│ │ 6.4 ┤                                                   │ │
│ │ Target < 7.0% ✓                                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────┬──────────────────────────────────┐ │
│ │ Thyroid Panel (Latest)│ Medications                     │ │
│ │ TSH:   2.1 mIU/L ✓   │ Levothyroxine 50mcg ✓ Today     │ │
│ │ FT3:   4.8 pmol/L ✓  │ Refill in 12 days                │ │
│ │ FT4:   15.2 pmol/L ✓ │                                  │ │
│ │ Jun 10, 2026          │ [Log Medication]                 │ │
│ └───────────────────────┴──────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Supplements                                             │ │
│ │ VCO 1 capsule ✓ Morning     Niacinamide ✓ Evening       │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Skin Condition Log

Simple image + notes tracker:
- Date
- Condition type (eczema/pigmentation/dryness)
- Severity slider (1-5)
- Photo upload
- Treatment used
- Suspected trigger
- Notes

Review over time: "Ceradan cream applied → severity reduced from 4 to 2 in 5 days"

---

## 5. Implementation Steps

1. Add `HbA1cRecord`, `ThyroidPanel`, `SkinCondition`, `Medication`, `MedicationLog` models
2. Add fields to `BodyMeasurement`, `LabResult`
3. API routes for all new resources
4. UI: HbA1c trend chart, thyroid panel view, skin condition gallery, medication reminder
5. Tests

---

## 6. Acceptance Criteria

1. HbA1c dashboard shows trend: 7.2 → 7.0 → 6.8 → projected 6.5 by October
2. Thyroid panel: TSH, FT3, FT4 displayed together as a group for each test date
3. Medication reminder: "Levothyroxine 50mcg — take now" at configured time
4. Skin log: photo of eczema patch → severity 4 → "Ceradan applied" → 5 days later severity 2
5. Lab result flagged: "TSH: 5.2 (HIGH, ref: 0.5-4.5)" shown in rose color
6. Weight trend overlayed with training blocks: weight stable during base building, slight drop during race prep
