-- AlterTable
ALTER TABLE "ventilation_configs" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ventilation_sub_accounts" ADD COLUMN     "debitAmount" DOUBLE PRECISION,
ADD COLUMN     "creditAmount" DOUBLE PRECISION;