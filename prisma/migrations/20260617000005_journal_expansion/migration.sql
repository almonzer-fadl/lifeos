-- DropIndex
DROP INDEX "JournalEntry_date_key";

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "audioPath" TEXT,
ADD COLUMN     "entryType" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "photoPath" TEXT,
ADD COLUMN     "structuredData" JSONB,
ADD COLUMN     "wordCount" INTEGER;

-- CreateTable
CREATE TABLE "JournalTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entryType" TEXT NOT NULL,
    "prompts" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JournalTemplate_entryType_key" ON "JournalTemplate"("entryType");

-- CreateIndex
CREATE INDEX "JournalEntry_date_idx" ON "JournalEntry"("date");

-- CreateIndex
CREATE INDEX "JournalEntry_entryType_idx" ON "JournalEntry"("entryType");

