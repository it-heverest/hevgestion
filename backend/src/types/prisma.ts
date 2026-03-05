// backend/src/types/prisma.ts
import { Prisma, Client as PrismaClient } from "@prisma/client";

// This creates a type that includes the Client AND their related Folders
export type ClientWithFolders = Prisma.ClientGetPayload<{
  include: {
    folders: true;
    audits: true;
    dsfConfigs: true;
    balance: true;
    dsfImports: true;
    dsfs: true;
    user: true;
    clients: true;
  };
}>;

export const clientInclude = {
  select: {
    id: true,
    name: true,
    legalForm: true, // This ensures it uses the Enum, not 'any'
    clientType: true,
    taxNumber: true,
    address: true,
    city: true,
    phone: true,
    country: true,
    currency: true,
    createdBy: true,
    createdAt: true,
    updatedAt: true,
  },
};

// 2. Define FolderWithRelations
export type FolderWithRelations = Prisma.FolderGetPayload<{
  include: {
    client: typeof clientInclude;
    balances: { include: { equilibrium: true; fixedAssets: true } };
  };
}>;

// 3. Define FolderWithFullRelations by extending the same logic
export type FolderWithFullRelations = Prisma.FolderGetPayload<{
  include: {
    client: typeof clientInclude; // Re-using the same definition fixes the mismatch
    balances: { include: { equilibrium: true; fixedAssets: true } };
    dsfs: true;
    dsfConfigs: true;
  };
}>;
