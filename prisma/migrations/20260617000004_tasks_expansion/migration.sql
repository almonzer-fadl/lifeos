-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "defaultView" TEXT NOT NULL DEFAULT 'list';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "energyLevel" TEXT,
ADD COLUMN     "estimatedMinutes" INTEGER,
ADD COLUMN     "isQuickCapture" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentTaskId" TEXT,
ADD COLUMN     "pipelineStage" TEXT,
ADD COLUMN     "timeBlockSlot" TEXT;

-- CreateTable
CREATE TABLE "Subtask" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringTaskTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "projectId" TEXT,
    "energyLevel" TEXT,
    "timeBlockSlot" TEXT,
    "frequency" TEXT NOT NULL,
    "frequencyCount" INTEGER NOT NULL DEFAULT 1,
    "timeOfDay" TEXT,
    "estimatedMinutes" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringTaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTimeBlock" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "blockSlot" TEXT NOT NULL,
    "estimatedMinutes" INTEGER,
    "actualMinutes" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TaskTimeBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "prayer" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'on_time',
    "prayedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuranProgress" (
    "id" TEXT NOT NULL,
    "totalPages" INTEGER NOT NULL DEFAULT 604,
    "pagesMemorized" INTEGER NOT NULL DEFAULT 0,
    "currentSurah" TEXT,
    "currentJuz" INTEGER,
    "currentPage" INTEGER,
    "targetDate" TIMESTAMP(3),
    "method" TEXT,
    "teacher" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuranProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuranSession" (
    "id" TEXT NOT NULL,
    "quranProgressId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "startPage" INTEGER,
    "endPage" INTEGER,
    "pagesMemorized" DOUBLE PRECISION,
    "pagesRevised" DOUBLE PRECISION,
    "duration" INTEGER,
    "quality" INTEGER,
    "teacherVerified" BOOLEAN,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuranSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TafsirEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "surah" TEXT NOT NULL,
    "ayahRange" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TafsirEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DhikrLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DhikrLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subtask_taskId_idx" ON "Subtask"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskTimeBlock_taskId_key" ON "TaskTimeBlock"("taskId");

-- CreateIndex
CREATE INDEX "TaskTimeBlock_scheduledDate_idx" ON "TaskTimeBlock"("scheduledDate");

-- CreateIndex
CREATE INDEX "TaskTimeBlock_blockSlot_idx" ON "TaskTimeBlock"("blockSlot");

-- CreateIndex
CREATE INDEX "PrayerLog_date_idx" ON "PrayerLog"("date");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerLog_date_prayer_key" ON "PrayerLog"("date", "prayer");

-- CreateIndex
CREATE INDEX "QuranSession_date_idx" ON "QuranSession"("date");

-- CreateIndex
CREATE INDEX "TafsirEntry_date_idx" ON "TafsirEntry"("date");

-- CreateIndex
CREATE INDEX "TafsirEntry_surah_idx" ON "TafsirEntry"("surah");

-- CreateIndex
CREATE INDEX "DhikrLog_date_idx" ON "DhikrLog"("date");

-- CreateIndex
CREATE INDEX "Task_energyLevel_idx" ON "Task"("energyLevel");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTaskTemplate" ADD CONSTRAINT "RecurringTaskTemplate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTimeBlock" ADD CONSTRAINT "TaskTimeBlock_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuranSession" ADD CONSTRAINT "QuranSession_quranProgressId_fkey" FOREIGN KEY ("quranProgressId") REFERENCES "QuranProgress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

