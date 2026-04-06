-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('WELCOME', 'GUIDE', 'BALANCE_IMPORTED', 'DSF_GENERATED', 'DEADLINE_APPROACHING', 'SYSTEM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'USER_ACTION';
ALTER TYPE "AuditAction" ADD VALUE 'FOLDER_STATUS_CHANGED';
ALTER TYPE "AuditAction" ADD VALUE 'DSF_IMPORTED';
ALTER TYPE "AuditAction" ADD VALUE 'REPORT_GENERATED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BalanceStatus" ADD VALUE 'UPDATED';
ALTER TYPE "BalanceStatus" ADD VALUE 'DELETED';

-- AlterTable
ALTER TABLE "balances" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT;

-- AlterTable
ALTER TABLE "dsf" ADD COLUMN     "reports" JSONB;

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dsf_mapping_fields" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "sheetName" TEXT NOT NULL,
    "cellAddress" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "defaultValue" JSONB,

    CONSTRAINT "dsf_mapping_fields_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "dsf_mapping_fields_configId_idx" ON "dsf_mapping_fields"("configId");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dsf_mapping_fields" ADD CONSTRAINT "dsf_mapping_fields_configId_fkey" FOREIGN KEY ("configId") REFERENCES "dsf_mapping_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
