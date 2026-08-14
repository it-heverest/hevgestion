-- CreateTable
CREATE TABLE "ventilation_logs" (
    "id" TEXT NOT NULL,
    "balanceId" TEXT NOT NULL,
    "mainAccountNumber" TEXT NOT NULL,
    "mainAccountName" TEXT NOT NULL,
    "replacedRows" JSONB NOT NULL,
    "newRows" JSONB NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedBy" TEXT NOT NULL,
    "reverted" BOOLEAN NOT NULL DEFAULT false,
    "revertedAt" TIMESTAMP(3),

    CONSTRAINT "ventilation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ventilation_logs_balanceId_idx" ON "ventilation_logs"("balanceId");

-- AddForeignKey
ALTER TABLE "ventilation_logs" ADD CONSTRAINT "ventilation_logs_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "balances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
