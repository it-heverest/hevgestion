/*
  Warnings:

  - You are about to drop the column `balanceSheet` on the `dsf` table. All the data in the column will be lost.
  - You are about to drop the column `incomeStatement` on the `dsf` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `dsf` table. All the data in the column will be lost.
  - You are about to drop the column `reports` on the `dsf` table. All the data in the column will be lost.
  - You are about to drop the column `signaletics` on the `dsf` table. All the data in the column will be lost.
  - You are about to drop the column `taxTables` on the `dsf` table. All the data in the column will be lost.
  - You are about to drop the `dsf_account_mappings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dsf_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dsf_entry_corrections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dsf_field_mappings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dsf_sheets` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[clientId,folderId,fileName]` on the table `dsf_imports` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientId` to the `dsf_imports` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "dsf_account_mappings" DROP CONSTRAINT "dsf_account_mappings_configId_fkey";

-- DropForeignKey
ALTER TABLE "dsf_entries" DROP CONSTRAINT "dsf_entries_importId_fkey";

-- DropForeignKey
ALTER TABLE "dsf_entries" DROP CONSTRAINT "dsf_entries_sheetId_fkey";

-- DropForeignKey
ALTER TABLE "dsf_entry_corrections" DROP CONSTRAINT "dsf_entry_corrections_entryId_fkey";

-- DropForeignKey
ALTER TABLE "dsf_field_mappings" DROP CONSTRAINT "dsf_field_mappings_configId_fkey";

-- DropForeignKey
ALTER TABLE "dsf_sheets" DROP CONSTRAINT "dsf_sheets_importId_fkey";

-- AlterTable
ALTER TABLE "dsf" DROP COLUMN "balanceSheet",
DROP COLUMN "incomeStatement",
DROP COLUMN "notes",
DROP COLUMN "reports",
DROP COLUMN "signaletics",
DROP COLUMN "taxTables",
ADD COLUMN     "bilan_paysage" JSONB,
ADD COLUMN     "cf1" JSONB,
ADD COLUMN     "cf1_bis" JSONB,
ADD COLUMN     "cf1_quater" JSONB,
ADD COLUMN     "cf1_ter" JSONB,
ADD COLUMN     "cf2" JSONB,
ADD COLUMN     "cf2_bis" JSONB,
ADD COLUMN     "cf2_ter" JSONB,
ADD COLUMN     "compte_de_resultat" JSONB,
ADD COLUMN     "entete" JSONB,
ADD COLUMN     "fiche1" JSONB,
ADD COLUMN     "fiche2" JSONB,
ADD COLUMN     "fiche3" JSONB,
ADD COLUMN     "grille_analyse_des_notes" JSONB,
ADD COLUMN     "importId" TEXT,
ADD COLUMN     "importedAt" TIMESTAMP(3),
ADD COLUMN     "importedBy" TEXT,
ADD COLUMN     "informations_generales" JSONB,
ADD COLUMN     "isImported" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "note1" JSONB,
ADD COLUMN     "note10" JSONB,
ADD COLUMN     "note11" JSONB,
ADD COLUMN     "note12" JSONB,
ADD COLUMN     "note13" JSONB,
ADD COLUMN     "note14" JSONB,
ADD COLUMN     "note15a" JSONB,
ADD COLUMN     "note15b" JSONB,
ADD COLUMN     "note16a" JSONB,
ADD COLUMN     "note16b" JSONB,
ADD COLUMN     "note16b_bis" JSONB,
ADD COLUMN     "note16c" JSONB,
ADD COLUMN     "note17" JSONB,
ADD COLUMN     "note17_c1" JSONB,
ADD COLUMN     "note18" JSONB,
ADD COLUMN     "note19" JSONB,
ADD COLUMN     "note2" JSONB,
ADD COLUMN     "note20" JSONB,
ADD COLUMN     "note21" JSONB,
ADD COLUMN     "note22" JSONB,
ADD COLUMN     "note23" JSONB,
ADD COLUMN     "note24" JSONB,
ADD COLUMN     "note25_c1" JSONB,
ADD COLUMN     "note25_c2" JSONB,
ADD COLUMN     "note26" JSONB,
ADD COLUMN     "note27a" JSONB,
ADD COLUMN     "note27b" JSONB,
ADD COLUMN     "note28_c1" JSONB,
ADD COLUMN     "note28_c2" JSONB,
ADD COLUMN     "note29" JSONB,
ADD COLUMN     "note30" JSONB,
ADD COLUMN     "note31" JSONB,
ADD COLUMN     "note32" JSONB,
ADD COLUMN     "note33" JSONB,
ADD COLUMN     "note35" JSONB,
ADD COLUMN     "note3a" JSONB,
ADD COLUMN     "note3b" JSONB,
ADD COLUMN     "note3c" JSONB,
ADD COLUMN     "note3c_co1" JSONB,
ADD COLUMN     "note3d" JSONB,
ADD COLUMN     "note3e" JSONB,
ADD COLUMN     "note3f" JSONB,
ADD COLUMN     "note4" JSONB,
ADD COLUMN     "note5" JSONB,
ADD COLUMN     "note6" JSONB,
ADD COLUMN     "note7" JSONB,
ADD COLUMN     "note8" JSONB,
ADD COLUMN     "note9" JSONB,
ADD COLUMN     "page_de_garde" JSONB,
ADD COLUMN     "sommaire" JSONB,
ADD COLUMN     "statistiques_et_syntheses" JSONB,
ADD COLUMN     "tableau_des_flux_tresorerie" JSONB;

-- AlterTable
ALTER TABLE "dsf_imports" ADD COLUMN     "clientId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "dsf_mapping_configs" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "dsf_account_mappings";

-- DropTable
DROP TABLE "dsf_entries";

-- DropTable
DROP TABLE "dsf_entry_corrections";

-- DropTable
DROP TABLE "dsf_field_mappings";

-- DropTable
DROP TABLE "dsf_sheets";

-- DropEnum
DROP TYPE "BalanceSource";

-- CreateTable
CREATE TABLE "excel_file_uploads" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "clientId" TEXT,
    "folderId" TEXT,
    "sheetCount" INTEGER NOT NULL DEFAULT 0,
    "sheets" TEXT[],
    "fileType" TEXT NOT NULL DEFAULT 'excel',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "excel_file_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "excel_file_uploads_uploadedBy_idx" ON "excel_file_uploads"("uploadedBy");

-- CreateIndex
CREATE INDEX "excel_file_uploads_clientId_idx" ON "excel_file_uploads"("clientId");

-- CreateIndex
CREATE INDEX "excel_file_uploads_folderId_idx" ON "excel_file_uploads"("folderId");

-- CreateIndex
CREATE INDEX "excel_file_uploads_uploadedAt_idx" ON "excel_file_uploads"("uploadedAt");

-- CreateIndex
CREATE INDEX "dsf_folderId_idx" ON "dsf"("folderId");

-- CreateIndex
CREATE INDEX "dsf_importId_idx" ON "dsf"("importId");

-- CreateIndex
CREATE INDEX "dsf_isImported_idx" ON "dsf"("isImported");

-- CreateIndex
CREATE INDEX "dsf_imports_clientId_idx" ON "dsf_imports"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "dsf_imports_clientId_folderId_fileName_key" ON "dsf_imports"("clientId", "folderId", "fileName");

-- CreateIndex
CREATE INDEX "dsf_mapping_configs_ownerId_idx" ON "dsf_mapping_configs"("ownerId");

-- AddForeignKey
ALTER TABLE "excel_file_uploads" ADD CONSTRAINT "excel_file_uploads_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excel_file_uploads" ADD CONSTRAINT "excel_file_uploads_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excel_file_uploads" ADD CONSTRAINT "excel_file_uploads_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dsf_imports" ADD CONSTRAINT "dsf_imports_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dsf_mapping_configs" ADD CONSTRAINT "dsf_mapping_configs_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
