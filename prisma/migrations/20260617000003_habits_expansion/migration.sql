-- DropIndex
DROP INDEX "HabitLog_habitId_date_key";

-- AlterTable
ALTER TABLE "BodyMeasurement" ADD COLUMN     "bloodPressureDiastolic" INTEGER,
ADD COLUMN     "bloodPressureSystolic" INTEGER,
ADD COLUMN     "boneMass" DOUBLE PRECISION,
ADD COLUMN     "muscleMass" DOUBLE PRECISION,
ADD COLUMN     "photoPath" TEXT,
ADD COLUMN     "waterWeight" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "isNonNegotiable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "streakOn" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "targetCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "targetUnit" TEXT,
ADD COLUMN     "targetValue" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "HabitLog" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "timeOfDay" TEXT,
ADD COLUMN     "value" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "LabResult" ADD COLUMN     "isAbnormal" BOOLEAN,
ADD COLUMN     "panelGroup" TEXT,
ADD COLUMN     "panelOrder" INTEGER;

-- AlterTable
ALTER TABLE "SleepSession" ADD COLUMN     "compliance" DOUBLE PRECISION,
ADD COLUMN     "hrv" DOUBLE PRECISION,
ADD COLUMN     "latency" INTEGER,
ADD COLUMN     "nextDayGlucose" DOUBLE PRECISION,
ADD COLUMN     "restingHR" INTEGER,
ADD COLUMN     "trainingLoadDay" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "HabitStreak" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastCompletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HabitStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitSession" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeOfDay" TEXT,
    "value" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "HabitSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BedtimeRoutine" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "screensOffAt" TIMESTAMP(3),
    "inBedAt" TIMESTAMP(3),
    "lightsOutAt" TIMESTAMP(3),
    "wakeAt" TIMESTAMP(3),
    "whiteNoiseOn" BOOLEAN NOT NULL DEFAULT false,
    "preSleepActivity" TEXT,
    "caffeinatedAfter" TIMESTAMP(3),
    "lateMeal" BOOLEAN NOT NULL DEFAULT false,
    "compliance" DOUBLE PRECISION,
    "notes" TEXT,
    "sleepSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BedtimeRoutine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SleepDebt" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "targetHours" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "actualHours" DOUBLE PRECISION NOT NULL,
    "dailyDeficit" DOUBLE PRECISION NOT NULL,
    "cumulativeDeficit" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SleepDebt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HbA1cRecord" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'lab',
    "labResultId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HbA1cRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThyroidPanel" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tsh" DOUBLE PRECISION NOT NULL,
    "ft3" DOUBLE PRECISION,
    "ft4" DOUBLE PRECISION,
    "labName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThyroidPanel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkinCondition" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "condition" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 3,
    "location" TEXT,
    "treatment" TEXT,
    "trigger" TEXT,
    "photoPath" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkinCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "timeOfDay" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "prescribingDoctor" TEXT,
    "pharmacy" TEXT,
    "cost" INTEGER,
    "refillReminder" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationLog" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taken" BOOLEAN NOT NULL DEFAULT true,
    "time" TIMESTAMP(3),
    "dosage" TEXT,
    "notes" TEXT,

    CONSTRAINT "MedicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HabitStreak_habitId_key" ON "HabitStreak"("habitId");

-- CreateIndex
CREATE INDEX "HabitSession_habitId_date_idx" ON "HabitSession"("habitId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "BedtimeRoutine_date_key" ON "BedtimeRoutine"("date");

-- CreateIndex
CREATE INDEX "BedtimeRoutine_date_idx" ON "BedtimeRoutine"("date");

-- CreateIndex
CREATE UNIQUE INDEX "SleepDebt_date_key" ON "SleepDebt"("date");

-- CreateIndex
CREATE INDEX "SleepDebt_date_idx" ON "SleepDebt"("date");

-- CreateIndex
CREATE INDEX "HbA1cRecord_date_idx" ON "HbA1cRecord"("date");

-- CreateIndex
CREATE INDEX "ThyroidPanel_date_idx" ON "ThyroidPanel"("date");

-- CreateIndex
CREATE INDEX "SkinCondition_date_idx" ON "SkinCondition"("date");

-- CreateIndex
CREATE INDEX "SkinCondition_condition_idx" ON "SkinCondition"("condition");

-- CreateIndex
CREATE INDEX "Medication_type_idx" ON "Medication"("type");

-- CreateIndex
CREATE INDEX "MedicationLog_medicationId_idx" ON "MedicationLog"("medicationId");

-- CreateIndex
CREATE INDEX "MedicationLog_date_idx" ON "MedicationLog"("date");

-- AddForeignKey
ALTER TABLE "HabitStreak" ADD CONSTRAINT "HabitStreak_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitSession" ADD CONSTRAINT "HabitSession_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationLog" ADD CONSTRAINT "MedicationLog_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

