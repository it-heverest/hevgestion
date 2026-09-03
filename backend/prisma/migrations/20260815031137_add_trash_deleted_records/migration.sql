-- CreateTable
CREATE TABLE "deleted_records" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "clientId" TEXT,
    "folderId" TEXT,
    "deletedById" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "restoredById" TEXT,
    "restoredAt" TIMESTAMP(3),

    CONSTRAINT "deleted_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deleted_records_entityType_idx" ON "deleted_records"("entityType");

-- CreateIndex
CREATE INDEX "deleted_records_entityId_idx" ON "deleted_records"("entityId");

-- CreateIndex
CREATE INDEX "deleted_records_deletedAt_idx" ON "deleted_records"("deletedAt");

-- CreateIndex
CREATE INDEX "deleted_records_restoredAt_idx" ON "deleted_records"("restoredAt");

-- CreateIndex
CREATE INDEX "deleted_records_clientId_idx" ON "deleted_records"("clientId");

-- CreateIndex
CREATE INDEX "deleted_records_folderId_idx" ON "deleted_records"("folderId");

-- AddForeignKey
ALTER TABLE "deleted_records" ADD CONSTRAINT "deleted_records_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deleted_records" ADD CONSTRAINT "deleted_records_restoredById_fkey" FOREIGN KEY ("restoredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
