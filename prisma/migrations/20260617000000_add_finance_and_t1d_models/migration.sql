-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "isFatherSupport" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "BasalRate" ADD COLUMN     "isWorkoutDay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileName" TEXT,
ADD COLUMN     "validFrom" TIMESTAMP(3),
ADD COLUMN     "validUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "GlucoseReading" ADD COLUMN     "carbEntryId" TEXT,
ADD COLUMN     "exerciseContext" TEXT,
ADD COLUMN     "insulinOnBoard" DOUBLE PRECISION,
ADD COLUMN     "timeInRange" BOOLEAN;

-- AlterTable
ALTER TABLE "InsulinDose" ADD COLUMN     "carbEntryId" TEXT,
ADD COLUMN     "insulinOnBoardAfter" DOUBLE PRECISION,
ADD COLUMN     "site" TEXT;

-- AlterTable
ALTER TABLE "RecurringTransaction" ADD COLUMN     "subscriptionId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "contactId" TEXT,
ADD COLUMN     "idempotencyKey" TEXT,
ADD COLUMN     "invoiceId" TEXT,
ADD COLUMN     "isFatherSupport" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TransactionAudit" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "icon" TEXT,
    "sourceData" JSONB,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "actedOn" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "pushed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "subtotal" INTEGER NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLineItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "InvoiceLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReceived" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "transactionId" TEXT,

    CONSTRAINT "PaymentReceived_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunwaySnapshot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalSavings" INTEGER NOT NULL,
    "monthlyBurnRate" INTEGER NOT NULL,
    "runwayMonths" DOUBLE PRECISION NOT NULL,
    "monthlyIncome" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "RunwaySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "billingCycle" TEXT NOT NULL,
    "nextBillingDate" TIMESTAMP(3) NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "recurringTxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarbEntry" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "foodDiaryEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarbEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsulinCarbRatio" (
    "id" TEXT NOT NULL,
    "ratio" DOUBLE PRECISION NOT NULL,
    "timeOfDay" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "InsulinCarbRatio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectionFactor" (
    "id" TEXT NOT NULL,
    "factor" DOUBLE PRECISION NOT NULL,
    "timeOfDay" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "CorrectionFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetRange" (
    "id" TEXT NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "timeOfDay" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),

    CONSTRAINT "TargetRange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KetoneReading" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'blood',
    "context" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KetoneReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InjectionSite" (
    "id" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL,
    "insulinType" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "InjectionSite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransactionAudit_transactionId_idx" ON "TransactionAudit"("transactionId");

-- CreateIndex
CREATE INDEX "TransactionAudit_timestamp_idx" ON "TransactionAudit"("timestamp");

-- CreateIndex
CREATE INDEX "Insight_type_idx" ON "Insight"("type");

-- CreateIndex
CREATE INDEX "Insight_urgency_idx" ON "Insight"("urgency");

-- CreateIndex
CREATE INDEX "Insight_dismissed_idx" ON "Insight"("dismissed");

-- CreateIndex
CREATE INDEX "Insight_createdAt_idx" ON "Insight"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_pushed_idx" ON "Notification"("pushed");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_clientId_idx" ON "Invoice"("clientId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_dueDate_idx" ON "Invoice"("dueDate");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_invoiceId_idx" ON "InvoiceLineItem"("invoiceId");

-- CreateIndex
CREATE INDEX "PaymentReceived_invoiceId_idx" ON "PaymentReceived"("invoiceId");

-- CreateIndex
CREATE INDEX "RunwaySnapshot_date_idx" ON "RunwaySnapshot"("date");

-- CreateIndex
CREATE INDEX "Subscription_nextBillingDate_idx" ON "Subscription"("nextBillingDate");

-- CreateIndex
CREATE INDEX "Subscription_isActive_idx" ON "Subscription"("isActive");

-- CreateIndex
CREATE INDEX "CarbEntry_timestamp_idx" ON "CarbEntry"("timestamp");

-- CreateIndex
CREATE INDEX "InsulinCarbRatio_validFrom_idx" ON "InsulinCarbRatio"("validFrom");

-- CreateIndex
CREATE INDEX "CorrectionFactor_validFrom_idx" ON "CorrectionFactor"("validFrom");

-- CreateIndex
CREATE INDEX "TargetRange_validFrom_idx" ON "TargetRange"("validFrom");

-- CreateIndex
CREATE INDEX "KetoneReading_timestamp_idx" ON "KetoneReading"("timestamp");

-- CreateIndex
CREATE INDEX "InjectionSite_usedAt_idx" ON "InjectionSite"("usedAt");

-- CreateIndex
CREATE INDEX "InjectionSite_site_idx" ON "InjectionSite"("site");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_idempotencyKey_key" ON "Transaction"("idempotencyKey");

-- AddForeignKey
ALTER TABLE "RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionAudit" ADD CONSTRAINT "TransactionAudit_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

