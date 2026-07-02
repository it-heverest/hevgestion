-- AlterTable
ALTER TABLE "balances" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "balances_folderId_archived_idx" ON "balances"("folderId", "archived");
