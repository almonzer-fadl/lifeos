-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "isRace" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "perceivedExertion" INTEGER,
ADD COLUMN     "raceId" TEXT,
ADD COLUMN     "routeData" JSONB,
ADD COLUMN     "trainingBlockId" TEXT,
ADD COLUMN     "trainingLoadScore" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "GymSet" ADD COLUMN     "bodyweightKg" DOUBLE PRECISION,
ADD COLUMN     "isBodyweight" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isWarmup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "restSeconds" INTEGER;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "activeDeals" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "arr" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "dealValue" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dealsWon" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deployUrl" TEXT,
ADD COLUMN     "estimatedEffort" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "launchedAt" TIMESTAMP(3),
ADD COLUMN     "mrr" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nextAction" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "pipelineStages" JSONB,
ADD COLUMN     "port" INTEGER,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "repoUrl" TEXT,
ADD COLUMN     "revenueModel" TEXT,
ADD COLUMN     "stack" TEXT,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "totalRevenue" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'saas',
ADD COLUMN     "weeklyGoal" TEXT;

-- CreateTable
CREATE TABLE "ProjectMilestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3),
    "achievedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MRRSnapshot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,
    "mrr" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "MRRSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalRecord" (
    "id" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "distance" DOUBLE PRECISION,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL,
    "activityId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingBlock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "goal" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "notes" TEXT,
    "parentBlockId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Race" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "raceType" TEXT NOT NULL,
    "distance" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "targetTime" INTEGER,
    "targetPace" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "actualTime" INTEGER,
    "notes" TEXT,
    "trainingBlockId" TEXT,
    "activityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseProgression" (
    "id" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "progressionStep" TEXT NOT NULL,
    "currentReps" INTEGER NOT NULL,
    "targetReps" INTEGER NOT NULL,
    "achievedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseProgression_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectMilestone_projectId_idx" ON "ProjectMilestone"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "MRRSnapshot_projectId_date_key" ON "MRRSnapshot"("projectId", "date");

-- CreateIndex
CREATE INDEX "PersonalRecord_activityType_idx" ON "PersonalRecord"("activityType");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalRecord_activityType_distance_metric_key" ON "PersonalRecord"("activityType", "distance", "metric");

-- CreateIndex
CREATE INDEX "TrainingBlock_startDate_idx" ON "TrainingBlock"("startDate");

-- CreateIndex
CREATE INDEX "TrainingBlock_status_idx" ON "TrainingBlock"("status");

-- CreateIndex
CREATE INDEX "Race_date_idx" ON "Race"("date");

-- CreateIndex
CREATE INDEX "Race_status_idx" ON "Race"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseProgression_exerciseName_progressionStep_key" ON "ExerciseProgression"("exerciseName", "progressionStep");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_priority_idx" ON "Project"("priority");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_trainingBlockId_fkey" FOREIGN KEY ("trainingBlockId") REFERENCES "TrainingBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MRRSnapshot" ADD CONSTRAINT "MRRSnapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

