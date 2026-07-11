-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "hijriDate" TEXT,
ADD COLUMN     "isPrayerTime" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRecurringParent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTimeBlock" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prayerName" TEXT,
ADD COLUMN     "recurringRule" TEXT,
ADD COLUMN     "timeBlockTemplateId" TEXT;

-- CreateTable
CREATE TABLE "TimeBlockTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "daysOfWeek" TEXT NOT NULL,
    "color" TEXT,
    "type" TEXT NOT NULL DEFAULT 'fixed',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeBlockTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockCompliance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "blockName" TEXT NOT NULL,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "compliance" DOUBLE PRECISION,
    "activity" TEXT,
    "notes" TEXT,

    CONSTRAINT "BlockCompliance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlockCompliance_date_idx" ON "BlockCompliance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "BlockCompliance_date_blockName_key" ON "BlockCompliance"("date", "blockName");

