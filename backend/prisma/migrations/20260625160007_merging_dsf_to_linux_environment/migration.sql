/*
  Warnings:

  - The values [DELETED] on the enum `BalanceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `deletedAt` on the `balances` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `balances` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RevueFiscalEval" AS ENUM ('NA', 'OK', 'ERR_MAT', 'ANOMALIE');

-- CreateEnum
CREATE TYPE "RevueFiscalPriority" AS ENUM ('HAUTE', 'NORMALE', 'BASSE');

-- AlterEnum
BEGIN;
CREATE TYPE "BalanceStatus_new" AS ENUM ('PENDING', 'VALIDATING', 'VALID', 'INVALID', 'PROCESSING', 'PROCESSED', 'UPDATED');
ALTER TABLE "balances" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "balances" ALTER COLUMN "status" TYPE "BalanceStatus_new" USING ("status"::text::"BalanceStatus_new");
ALTER TYPE "BalanceStatus" RENAME TO "BalanceStatus_old";
ALTER TYPE "BalanceStatus_new" RENAME TO "BalanceStatus";
DROP TYPE "BalanceStatus_old";
ALTER TABLE "balances" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'DAILY_GREETING';
ALTER TYPE "NotificationType" ADD VALUE 'INACTIVITY_REMINDER';
ALTER TYPE "NotificationType" ADD VALUE 'DSF_REMINDER';

-- AlterTable
ALTER TABLE "balances" DROP COLUMN "deletedAt",
DROP COLUMN "deletedBy";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastActivity" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "revue_fiscal_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT,
    "exercice" TEXT,
    "reviseur" TEXT,
    "chef" TEXT,
    "niu" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revue_fiscal_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revue_fiscal_question_states" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "eval" "RevueFiscalEval",
    "note" TEXT,
    "renvoi" TEXT,
    "priority" "RevueFiscalPriority" NOT NULL DEFAULT 'NORMALE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revue_fiscal_question_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revue_fiscal_questionnaires" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default Questionnaire',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revue_fiscal_questionnaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revue_fiscal_sections" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revue_fiscal_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revue_fiscal_subsections" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "subSectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "badge" TEXT,
    "info" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revue_fiscal_subsections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revue_fiscal_questions" (
    "id" TEXT NOT NULL,
    "subSectionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isNew2026" BOOLEAN NOT NULL DEFAULT false,
    "ref" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revue_fiscal_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "revue_fiscal_question_states_companyId_questionId_key" ON "revue_fiscal_question_states"("companyId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "revue_fiscal_sections_questionnaireId_sectionId_key" ON "revue_fiscal_sections"("questionnaireId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "revue_fiscal_subsections_sectionId_subSectionId_key" ON "revue_fiscal_subsections"("sectionId", "subSectionId");

-- CreateIndex
CREATE UNIQUE INDEX "revue_fiscal_questions_subSectionId_questionId_key" ON "revue_fiscal_questions"("subSectionId", "questionId");

-- AddForeignKey
ALTER TABLE "revue_fiscal_question_states" ADD CONSTRAINT "revue_fiscal_question_states_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "revue_fiscal_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revue_fiscal_sections" ADD CONSTRAINT "revue_fiscal_sections_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "revue_fiscal_questionnaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revue_fiscal_subsections" ADD CONSTRAINT "revue_fiscal_subsections_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "revue_fiscal_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revue_fiscal_questions" ADD CONSTRAINT "revue_fiscal_questions_subSectionId_fkey" FOREIGN KEY ("subSectionId") REFERENCES "revue_fiscal_subsections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
