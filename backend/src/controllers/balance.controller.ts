// src/controllers/balance.controller.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { BadRequestError, NotFoundError, ForbiddenError } from "../lib/errors";
import { BalanceType, BalanceStatus } from "@prisma/client";
import { BalanceProcessor } from "../services/balance-processor.service";
import { ExcelService } from "../services/excel.service";
import { planComptableService } from "../services/plan-comptable.service";
import * as path from "path";
import { config } from "../config";

class BalanceController {
  private balanceProcessor: BalanceProcessor;

  constructor() {
    this.balanceProcessor = new BalanceProcessor();
    console.log("✅ BalanceController initialized with balanceProcessor");
  }

  async uploadBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      console.log("Upload balance request received:");
      console.log("Body:", req.body);
      console.log("Raw body keys:", Object.keys(req.body || {}));
      console.log("Files:", req.files);

      const file = req.files && "file" in req.files ? req.files.file[0] : null;
      console.log(
        "File:",
        file
          ? {
              filename: file.filename,
              size: file.size,
              originalname: file.originalname,
            }
          : "No file",
      );

      if (!file) {
        throw new BadRequestError("No file uploaded");
      }

      const { folderId, type } = req.body;

      console.log("Parsed data:", {
        folderId,
        type,
        folderIdType: typeof folderId,
        typeType: typeof type,
      });

      if (!folderId || !type) {
        throw new BadRequestError("Folder ID and balance type are required");
      }

      // Validate folder access
      console.log("Checking folder with ID:", folderId);
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        include: { owner: true },
      });

      console.log("Folder found:", folder);

      if (!folder) {
        throw new NotFoundError("Exercise not found");
      }

      // Check if user owns the folder
      if (folder.ownerId !== req.user?.userId) {
        throw new ForbiddenError("You don't have access to this exercise");
      }

      // Map frontend type to database enum
      let balanceType: BalanceType;
      let balancePeriod: string;

      if (type === "current") {
        balanceType = BalanceType.CURRENT_YEAR;
        balancePeriod = folder.fiscalYear.toString();
      } else if (type === "previous") {
        balanceType = BalanceType.PREVIOUS_YEAR;
        balancePeriod = (folder.fiscalYear - 1).toString();
      } else {
        throw new BadRequestError(
          "Invalid balance type. Must be 'current' or 'previous'",
        );
      }

      // Check if balance already exists
      console.log("Checking for existing balance:", {
        folderId,
        type: balanceType,
      });
      const existingBalance = await prisma.balance.findFirst({
        where: {
          folderId,
          type: balanceType,
        },
      });

      console.log("Existing balance:", existingBalance);

      if (existingBalance) {
        // Allow replacement of existing balance
        console.log("Replacing existing balance:", existingBalance.id);
        // Delete related records first to avoid foreign key constraint violations
        await prisma.accountIssue.deleteMany({
          where: { balanceId: existingBalance.id },
        });
        await prisma.fixedAsset.deleteMany({
          where: { balanceId: existingBalance.id },
        });
        await prisma.balanceEquilibrium.deleteMany({
          where: { balanceId: existingBalance.id },
        });
        // Now delete the existing balance
        await prisma.balance.delete({
          where: { id: existingBalance.id },
        });
      }

      // Read and parse Excel file
      console.log("Parsing Excel file:", file.path);
      // Optional column mapping can be supplied in the request body as `mapping`.
      // mapping keys: accountNumber, accountName, openingDebit, openingCredit,
      // movementDebit, movementCredit, closingDebit, closingCredit
      const mapping = req.body?.mapping as
        | { [key: string]: number | string }
        | undefined;
      const data = await ExcelService.parseBalanceFile(file.path, mapping);
      console.log("Parsed data successfully:", {
        rowCount: data.rows?.length || 0,
      });

      console.log(balancePeriod);

      // Validate accounts against plan comptable (existence check)
      const accountValidation = await ExcelService.validateBalanceAccounts(
        data.rows || [],
      );
      if (!accountValidation.valid) {
        await prisma.balance
          .delete({ where: { id: existingBalance?.id } })
          .catch(() => {});
        throw new BadRequestError(
          "Erreur de validation:\n- " +
            accountValidation.errors.slice(0, 10).join("\n- ") +
            (accountValidation.errors.length > 10
              ? `\n... et ${accountValidation.errors.length - 10} autres erreurs`
              : ""),
        );
      }

      // Validate debit/credit positions against plan comptable rules
      const positionValidation = ExcelService.validateBalanceWithPosition(
        data.rows || [],
      );
      if (!positionValidation.valid) {
        await prisma.balance
          .delete({ where: { id: existingBalance?.id } })
          .catch(() => {});
        throw new BadRequestError(
          "Erreur de position (débit/crédit):\n- " +
            positionValidation.errors.slice(0, 10).join("\n- ") +
            (positionValidation.errors.length > 10
              ? `\n... et ${positionValidation.errors.length - 10} autres erreurs`
              : ""),
        );
      }

      // Create balance record
      const balance = await prisma.balance.create({
        data: {
          type: balanceType,
          period: balancePeriod,
          folderId,
          fileName: file.originalname,
          filePath: file.path,
          originalData: data,
          status: BalanceStatus.PENDING,
        },
      });

      // Process balance synchronously for now
      try {
        await this.balanceProcessor.processBalance(balance.id);
        console.log(`Balance ${balance.id} processed successfully`);
      } catch (processError) {
        console.error("Balance processing error:", processError);
        // Update status but don't fail the upload
        await prisma.balance.update({
          where: { id: balance.id },
          data: {
            status: BalanceStatus.INVALID,
            validationErrors:
              processError instanceof Error
                ? processError.message
                : "Processing failed",
          },
        });
      }

      res.status(201).json({
        message: "Balance uploaded and processed successfully",
        balance: {
          id: balance.id,
          type: balance.type,
          status: balance.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createFromTemplate(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { folderId, type } = req.body;

      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
      });

      if (!folder) {
        throw new NotFoundError("Exercise not found");
      }

      // Determine year based on type
      let year = folder.fiscalYear;
      if (type === "previous") {
        year = folder.fiscalYear - 1;
      }

      // Get balance template from database
      const template = await ExcelService.getBalanceTemplate();

      // Create Excel file from template
      const filePath = await ExcelService.createBalanceFromTemplate(
        template,
        year,
      );

      res.json({
        message: "Balance created from template",
        downloadUrl: `/api/files/download/${config.upload.subDirectories.balance}/${path.basename(filePath)}`,
        year: year,
      });
    } catch (error) {
      next(error);
    }
  }

  async validateAccounts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { accounts } = req.body;

      if (!accounts || !Array.isArray(accounts)) {
        throw new BadRequestError("Accounts array is required");
      }

      const errors: string[] = [];
      const warnings: string[] = [];

      for (const row of accounts) {
        if (!row.accountNumber) continue;

        const accountNum = String(row.accountNumber).trim();
        const accountName = String(row.accountName || "").trim();

        if (!/^[1-8]\d{2,}$/.test(accountNum)) {
          errors.push(`Numéro de compte invalide: ${accountNum}`);
          continue;
        }

        const validation = planComptableService.validateAccount(
          accountNum,
          accountName,
        );
        if (!validation.valid && validation.error) {
          errors.push(validation.error);
        }
      }

      res.json({
        valid: errors.length === 0,
        errors,
        warnings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBalancesByFolder(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { folderId } = req.params;

      if (!folderId) {
        throw new BadRequestError("Folder ID is required");
      }

      // Check if user has access to the folder
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
      });

      if (!folder) {
        throw new NotFoundError("Folder not found");
      }

      if (folder.ownerId !== req.user?.userId) {
        throw new ForbiddenError("You don't have access to this folder");
      }

      const balances = await prisma.balance.findMany({
        where: { folderId },
        include: {
          equilibrium: true,
          accountIssues: {
            orderBy: { severity: "desc" },
          },
          fixedAssets: true,
          folder: {
            include: {
              client: true,
            },
          },
        },
        orderBy: { importedAt: "desc" },
      });

      // Map balances to include originalData (strip the 'rows' wrapper for cleaner API)
      const balancesWithOriginalData = balances.map((balance) => ({
        ...balance,
        originalData: balance.originalData,
      }));

      res.json({ balances: balancesWithOriginalData });
    } catch (error) {
      next(error);
    }
  }

  async getBalanceById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const balance = await prisma.balance.findUnique({
        where: { id },
        include: {
          equilibrium: true,
          accountIssues: {
            orderBy: { severity: "desc" },
          },
          fixedAssets: true,
          folder: true,
        },
      });

      if (!balance) {
        throw new NotFoundError("Balance not found");
      }

      // Check if user has access to the balance through the folder
      if (balance.folder.ownerId !== req.user?.userId) {
        throw new ForbiddenError("You don't have access to this balance");
      }

      res.json({ balance: { ...balance, originalData: balance.originalData } });
    } catch (error) {
      next(error);
    }
  }

  // async checkEquilibrium(req: AuthRequest, res: Response, next: NextFunction) {
  //   try {
  //     const { clientId, folderId } = req.params;

  //     console.log("🔍 Checking equilibrium for:", { clientId, folderId });

  //     if (!clientId || !folderId) {
  //       throw new BadRequestError("Client ID and Folder ID are required");
  //     }

  //     // Vérifier que le contrôleur est correctement initialisé
  //     if (!this.balanceProcessor) {
  //       console.error("❌ balanceProcessor is not initialized");
  //       // Réinitialiser en cas de problème
  //       this.balanceProcessor = new BalanceProcessor();
  //       console.log("✅ balanceProcessor reinitialized");
  //     }

  //     // Vérifier l'accès au dossier
  //     const folder = await prisma.folder.findUnique({
  //       where: { id: folderId },
  //       include: {
  //         balances: {
  //           include: {
  //             equilibrium: true,
  //           },
  //         },
  //       },
  //     });

  //     if (!folder) {
  //       throw new NotFoundError("Exercise not found");
  //     }

  //     // Vérifier que l'utilisateur a accès à ce client/dossier
  //     if (folder.ownerId !== req.user?.userId) {
  //       throw new ForbiddenError("You don't have access to this exercise");
  //     }

  //     console.log("📊 Folder balances:", folder.balances.length);

  //     // Vérifier s'il y a des balances
  //     if (!folder.balances || folder.balances.length === 0) {
  //       return res.json({
  //         isBalanced: false,
  //         message: "Aucune balance trouvée pour cet exercice",
  //         details: {
  //           hasBalances: false,
  //           currentYear: null,
  //           previousYear: null,
  //         },
  //       });
  //     }

  //     // Récupérer les balances actuelles et précédentes
  //     const currentBalance = folder.balances.find(
  //       (b) => b.type === BalanceType.CURRENT_YEAR
  //     );

  //     const previousBalance = folder.balances.find(
  //       (b) => b.type === BalanceType.PREVIOUS_YEAR
  //     );

  //     console.log("📈 Balances found:", {
  //       current: currentBalance?.id,
  //       previous: previousBalance?.id,
  //     });

  //     // Vérifier l'équilibre
  //     let equilibrium;

  //     if (currentBalance) {
  //       console.log(
  //         "🔄 Checking equilibrium for current balance:",
  //         currentBalance.id
  //       );
  //       equilibrium =
  //         await this.balanceProcessor.checkEquilibrium(currentBalance);
  //       console.log("✅ Equilibrium result:", equilibrium);
  //     } else {
  //       equilibrium = {
  //         isBalanced: false,
  //         message: "Balance de l'année courante manquante",
  //         details: {
  //           totalDebit: 0,
  //           totalCredit: 0,
  //           difference: 0,
  //           tolerance: 0.01,
  //         },
  //       };
  //     }

  //     res.json({
  //       isBalanced: equilibrium.isBalanced,
  //       message: equilibrium.message,
  //       details: {
  //         hasBalances: !!currentBalance,
  //         currentYear: currentBalance
  //           ? {
  //               id: currentBalance.id,
  //               type: currentBalance.type,
  //               status: currentBalance.status,
  //               isBalanced: equilibrium.isBalanced,
  //               totals: equilibrium.details,
  //             }
  //           : null,
  //         previousYear: previousBalance
  //           ? {
  //               id: previousBalance.id,
  //               type: previousBalance.type,
  //               status: previousBalance.status,
  //             }
  //           : null,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("❌ Error in checkEquilibrium:", error);

  //     // En cas d'erreur, retourner une réponse d'erreur structurée
  //     if (error instanceof NotFoundError || error instanceof ForbiddenError) {
  //       next(error);
  //     } else {
  //       // Pour les autres erreurs, retourner un statut non équilibré avec le message d'erreur
  //       res.json({
  //         isBalanced: false,
  //         message: `Erreur lors de la vérification: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
  //         details: {
  //           hasBalances: false,
  //           error: true,
  //           errorMessage:
  //             error instanceof Error ? error.message : "Unknown error",
  //         },
  //       });
  //     }
  //   }
  // }

  async performVentilation(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      const balance = await prisma.balance.findUnique({
        where: { id },
      });

      if (!balance) {
        throw new NotFoundError("Balance not found");
      }

      // Perform ventilation (breakdown of accounts)
      const result = await this.balanceProcessor.performVentilation(balance);

      res.json({
        message: "Ventilation completed successfully",
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBalanceIssues(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const issues = await prisma.accountIssue.findMany({
        where: { balanceId: id },
        orderBy: [{ severity: "desc" }, { isResolved: "asc" }],
      });

      res.json({ issues });
    } catch (error) {
      next(error);
    }
  }

  async resolveIssue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { issueId, resolution } = req.body;

      if (!issueId) {
        throw new BadRequestError("Issue ID is required");
      }

      const issue = await prisma.accountIssue.update({
        where: { id: issueId },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolution,
        },
      });

      res.json({
        message: "Issue resolved successfully",
        issue,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError("Balance ID is required");
      }

      // Check if balance exists and user has access
      const balance = await prisma.balance.findUnique({
        where: { id },
        include: {
          folder: true,
        },
      });

      if (!balance) {
        throw new NotFoundError("Balance not found");
      }

      // Check if user owns the folder
      if (balance.folder.ownerId !== req.user?.userId) {
        throw new ForbiddenError("You don't have access to this balance");
      }

      // Delete related records first to avoid foreign key constraint violations
      await prisma.accountIssue.deleteMany({
        where: { balanceId: id },
      });
      await prisma.fixedAsset.deleteMany({
        where: { balanceId: id },
      });
      await prisma.balanceEquilibrium.deleteMany({
        where: { balanceId: id },
      });

      // Hard delete
      await prisma.balance.delete({
        where: { id },
      });

      res.json({
        message: "Balance deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBalanceRows(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { rows } = req.body;

      if (!id) {
        throw new BadRequestError("Balance ID is required");
      }

      if (!rows || !Array.isArray(rows)) {
        throw new BadRequestError("Rows array is required");
      }

      // Check if balance exists and user has access
      const balance = await prisma.balance.findUnique({
        where: { id },
        include: {
          folder: true,
        },
      });

      if (!balance) {
        throw new NotFoundError("Balance not found");
      }

      // Check if user owns the folder
      if (balance.folder.ownerId !== req.user?.userId) {
        throw new ForbiddenError("You don't have access to this balance");
      }

      // Get current original data
      const currentData = balance.originalData as any;
      let currentRows = currentData?.rows || [];

      if (!Array.isArray(currentRows)) {
        currentRows = [];
      }

      // Create a map of existing rows for quick lookup
      const rowsMap = new Map(
        currentRows.map((row: any) => [row.accountNumber, row]),
      );

      // Update with new values
      rows.forEach((updatedRow: any) => {
        if (updatedRow.accountNumber) {
          rowsMap.set(updatedRow.accountNumber, updatedRow);
        }
      });

      // Convert map back to array
      const updatedRows = Array.from(rowsMap.values());

      // Update the balance
      await prisma.balance.update({
        where: { id },
        data: {
          originalData: JSON.stringify({ rows: updatedRows }),
          status: BalanceStatus.UPDATED,
        },
      });

      res.json({
        message: "Balance rows updated successfully",
        updatedCount: rows.length,
      });
    } catch (error) {
      next(error);
    }
  }

  // Helper to process balance asynchronously
  private processBalanceAsync = async (balanceId: string) => {
    try {
      await this.balanceProcessor.processBalance(balanceId);
    } catch (error) {
      console.error("Balance processing error:", error);
      await prisma.balance.update({
        where: { id: balanceId },
        data: {
          status: BalanceStatus.INVALID,
          validationErrors:
            error instanceof Error ? error.message : "Processing failed",
        },
      });
    }
  };
}

// Créer une instance avec initialisation explicite
export const balanceController = new BalanceController();
console.log("✅ BalanceController instance created");
