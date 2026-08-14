// src/validators/ventilation-config.validator.ts
import { z } from "zod";

const subAccountSchema = z.object({
  accountNumber: z.string().min(1, "Account number is required").max(20),
  accountName: z.string().min(1, "Account name is required").max(255),
  debitAmount: z.number().min(0).optional(),
  creditAmount: z.number().min(0).optional(),
});

export const createVentilationConfigSchema = z.object({
  body: z.object({
    clientId: z.string().min(1, "clientId is required"),
    folderId: z.string().optional(),
    mainAccountNumber: z.string().min(1, "Main account number is required").max(20),
    mainAccountName: z.string().min(1, "Main account name is required").max(255),
    subAccounts: z
      .array(subAccountSchema)
      .min(1, "At least one sub-account is required"),
  }),
});

export const updateVentilationConfigSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Invalid ventilation config id"),
  }),
  body: z.object({
    mainAccountNumber: z.string().min(1).max(20).optional(),
    mainAccountName: z.string().min(1).max(255).optional(),
    subAccounts: z.array(subAccountSchema).min(1).optional(),
  }),
});

export const ventilationConfigIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Invalid ventilation config id"),
  }),
});

export const ventilationConfigQuerySchema = z.object({
  query: z.object({
    clientId: z.string().min(1, "clientId is required"),
    folderId: z.string().optional(),
  }),
});
