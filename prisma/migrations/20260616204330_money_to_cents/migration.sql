/*
  Warnings:

  - You are about to alter the column `initialBalance` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `creditLimit` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `minimumPayment` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `purchaseValue` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `currentValue` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `amount` on the `Budget` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `targetAmount` on the `FinancialGoal` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `currentAmount` on the `FinancialGoal` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `amount` on the `RecurringTransaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "initialBalance" SET DEFAULT 0,
ALTER COLUMN "initialBalance" SET DATA TYPE INTEGER,
ALTER COLUMN "creditLimit" SET DATA TYPE INTEGER,
ALTER COLUMN "minimumPayment" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "purchaseValue" SET DATA TYPE INTEGER,
ALTER COLUMN "currentValue" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Budget" ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "FinancialGoal" ALTER COLUMN "targetAmount" SET DATA TYPE INTEGER,
ALTER COLUMN "currentAmount" SET DEFAULT 0,
ALTER COLUMN "currentAmount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "RecurringTransaction" ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");
