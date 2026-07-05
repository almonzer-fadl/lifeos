-- AlterTable
ALTER TABLE "FoodDiaryEntry" ADD COLUMN     "bolusSuggested" DOUBLE PRECISION,
ADD COLUMN     "bolusTaken" DOUBLE PRECISION,
ADD COLUMN     "carbEstimate" DOUBLE PRECISION,
ADD COLUMN     "costEstimate" INTEGER,
ADD COLUMN     "netCarbs" DOUBLE PRECISION,
ADD COLUMN     "postMealGlucose" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "FoodItem" ADD COLUMN     "isCommonFood" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isMalaysian" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "netCarbs" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "servings" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "prepTime" INTEGER,
    "cookTime" INTEGER,
    "instructions" TEXT,
    "notes" TEXT,
    "isMalaysian" BOOLEAN NOT NULL DEFAULT false,
    "totalCalories" DOUBLE PRECISION,
    "totalCarbs" DOUBLE PRECISION,
    "totalProtein" DOUBLE PRECISION,
    "totalFat" DOUBLE PRECISION,
    "totalFiber" DOUBLE PRECISION,
    "netCarbs" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "foodId" TEXT,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrequentFood" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "personalName" TEXT,
    "typicalCarbs" DOUBLE PRECISION,
    "typicalServing" DOUBLE PRECISION,
    "typicalGlucose" DOUBLE PRECISION,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "FrequentFood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodCost" (
    "id" TEXT NOT NULL,
    "foodId" TEXT,
    "foodName" TEXT NOT NULL,
    "store" TEXT,
    "price" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "pricePerUnit" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "FoodCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FastingSession" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ramadan',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" DOUBLE PRECISION,
    "preFastMealId" TEXT,
    "postFastMealId" TEXT,
    "preFastGlucose" DOUBLE PRECISION,
    "postFastGlucose" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FastingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "fullName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subType" TEXT,
    "groupId" TEXT,
    "birthday" TIMESTAMP(3),
    "birthYear" INTEGER,
    "nationality" TEXT,
    "location" TEXT,
    "languages" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "telegram" TEXT,
    "socialLinks" JSONB,
    "bio" TEXT,
    "preferences" TEXT,
    "importantDates" JSONB,
    "relationshipHealth" TEXT,
    "lastContactedAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "followUpFrequency" TEXT,
    "isKeyPerson" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "platform" TEXT,
    "summary" TEXT NOT NULL,
    "actionItems" TEXT,
    "mood" TEXT,
    "duration" INTEGER,
    "tags" TEXT,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ContactGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recipe_name_idx" ON "Recipe"("name");

-- CreateIndex
CREATE INDEX "RecipeIngredient_recipeId_idx" ON "RecipeIngredient"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "FrequentFood_foodId_key" ON "FrequentFood"("foodId");

-- CreateIndex
CREATE INDEX "FoodCost_foodId_idx" ON "FoodCost"("foodId");

-- CreateIndex
CREATE INDEX "FoodCost_date_idx" ON "FoodCost"("date");

-- CreateIndex
CREATE INDEX "FastingSession_date_idx" ON "FastingSession"("date");

-- CreateIndex
CREATE INDEX "FastingSession_type_idx" ON "FastingSession"("type");

-- CreateIndex
CREATE INDEX "Contact_type_idx" ON "Contact"("type");

-- CreateIndex
CREATE INDEX "Contact_relationshipHealth_idx" ON "Contact"("relationshipHealth");

-- CreateIndex
CREATE INDEX "Contact_nextFollowUpAt_idx" ON "Contact"("nextFollowUpAt");

-- CreateIndex
CREATE INDEX "Contact_isKeyPerson_idx" ON "Contact"("isKeyPerson");

-- CreateIndex
CREATE INDEX "Interaction_contactId_idx" ON "Interaction"("contactId");

-- CreateIndex
CREATE INDEX "Interaction_date_idx" ON "Interaction"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ContactGroup_name_key" ON "ContactGroup"("name");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ContactGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

