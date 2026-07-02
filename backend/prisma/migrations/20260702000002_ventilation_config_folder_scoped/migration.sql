-- Add folderId column to ventilation_configs (nullable — existing configs remain client-scoped)
ALTER TABLE "ventilation_configs" ADD COLUMN "folderId" TEXT;

-- Foreign key: ventilation_configs.folderId → folders.id (cascade delete)
ALTER TABLE "ventilation_configs" ADD CONSTRAINT "ventilation_configs_folderId_fkey"
  FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old unique constraint (clientId, mainAccountNumber)
ALTER TABLE "ventilation_configs" DROP CONSTRAINT IF EXISTS "ventilation_configs_clientId_mainAccountNumber_key";

-- New unique constraint (clientId, folderId, mainAccountNumber)
-- NULL folderId entries are still distinguishable per Postgres NULL semantics
ALTER TABLE "ventilation_configs" ADD CONSTRAINT "ventilation_configs_clientId_folderId_mainAccountNumber_key"
  UNIQUE ("clientId", "folderId", "mainAccountNumber");

-- Index on folderId for fast lookup by exercise
CREATE INDEX "ventilation_configs_folderId_idx" ON "ventilation_configs"("folderId");
