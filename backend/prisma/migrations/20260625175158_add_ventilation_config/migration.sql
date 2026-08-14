-- CreateTable
CREATE TABLE "ventilation_configs" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "mainAccountNumber" TEXT NOT NULL,
    "mainAccountName" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ventilation_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventilation_sub_accounts" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ventilation_sub_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ventilation_configs_clientId_idx" ON "ventilation_configs"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "ventilation_configs_clientId_mainAccountNumber_key" ON "ventilation_configs"("clientId", "mainAccountNumber");

-- CreateIndex
CREATE INDEX "ventilation_sub_accounts_configId_idx" ON "ventilation_sub_accounts"("configId");

-- CreateIndex
CREATE UNIQUE INDEX "ventilation_sub_accounts_configId_accountNumber_key" ON "ventilation_sub_accounts"("configId", "accountNumber");

-- AddForeignKey
ALTER TABLE "ventilation_configs" ADD CONSTRAINT "ventilation_configs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventilation_configs" ADD CONSTRAINT "ventilation_configs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventilation_sub_accounts" ADD CONSTRAINT "ventilation_sub_accounts_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ventilation_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
