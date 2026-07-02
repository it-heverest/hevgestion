// src/controllers/balance.controller.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { BadRequestError, NotFoundError, ForbiddenError } from "../lib/errors";
import { BalanceType, BalanceStatus, DSFStatus } from "@prisma/client";
import { BalanceProcessor } from "../services/balance-processor.service";
import { ExcelService } from "../services/excel.service";
import { planComptableService } from "../services/plan-comptable.service";
import * as path from "path";
import { config } from "../config";
import { auditService } from "../services/audit.service";

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

      // If a DSF has already been generated, reset it to DRAFT so it stays in sync
      const existingDSF = await prisma.dSF.findUnique({
        where: { folderId },
        select: { id: true, lastGeneratedAt: true },
      });
      let dsfWasReset = false;
      if (existingDSF?.lastGeneratedAt) {
        await prisma.dSF.update({
          where: { folderId },
          data: { status: DSFStatus.DRAFT, lastGeneratedAt: null },
        });
        dsfWasReset = true;
      }

      // For PREVIOUS_YEAR: auto-sync originalData from the previous year's N balance
      // so N-1 is always coherent with the actual N of the prior exercise.
      let syncedData: any = null;
      if (balanceType === BalanceType.PREVIOUS_YEAR) {
        const prevYearFolder = await prisma.folder.findFirst({
          where: {
            clientId: folder.clientId,
            fiscalYear: folder.fiscalYear - 1,
          },
        });
        if (prevYearFolder) {
          const prevNBalance = await prisma.balance.findFirst({
            where: {
              folderId: prevYearFolder.id,
              type: BalanceType.CURRENT_YEAR,
              archived: false,
              status: { in: [BalanceStatus.PROCESSED, BalanceStatus.UPDATED] },
            },
          });
          if (prevNBalance?.originalData) {
            syncedData = prevNBalance.originalData;
          }
        }
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
          archived: false,
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

      // Read and parse Excel file (skipped when syncing N-1 from previous year)
      let data: any;
      if (syncedData) {
        data = syncedData;
      } else {
        console.log("Parsing Excel file:", file.path);
        const mapping = req.body?.mapping as
          | { [key: string]: number | string }
          | undefined;
        data = await ExcelService.parseBalanceFile(file.path, mapping, { useIndexMapping: true });
        console.log("Parsed data successfully:", { rowCount: data.rows?.length || 0 });
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

      await auditService.logBalanceUploaded(req.user!.userId, folderId, {
        fileName: file.originalname,
        type,
      });

      // Process balance synchronously for now
      try {
        await this.balanceProcessor.processBalance(balance.id);
        console.log(`Balance ${balance.id} processed successfully`);
        await auditService.logBalanceProcessed(req.user!.userId, folderId, {
          balanceId: balance.id,
        });
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
        message: syncedData
          ? "Balance N-1 synchronisée depuis la balance N de l'exercice précédent"
          : "Balance uploaded and processed successfully",
        balance: { id: balance.id, type: balance.type, status: balance.status },
        syncedFromPreviousYear: !!syncedData,
        dsfWasReset,
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

      const isAdmin = req.user?.role === "ADMIN";
      if (!isAdmin && folder.ownerId !== req.user?.userId) {
        throw new ForbiddenError("You don't have access to this folder");
      }

      const balances = await prisma.balance.findMany({
        where: isAdmin ? { folderId } : { folderId, archived: false },
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
      const balancesWithOriginalData: any[] = balances.map((balance) => ({
        ...balance,
        originalData: balance.originalData,
      }));

      // If no PREVIOUS_YEAR balance is stored in this folder, derive N-1 from the
      // previous fiscal year's CURRENT_YEAR balance (same client) so the DSF always
      // has coherent N-1 data.
      const hasPreviousYear = balancesWithOriginalData.some(
        (b) => b.type === BalanceType.PREVIOUS_YEAR && !b.archived,
      );
      if (!hasPreviousYear) {
        const prevYearFolder = await prisma.folder.findFirst({
          where: { clientId: folder.clientId, fiscalYear: folder.fiscalYear - 1 },
        });
        if (prevYearFolder) {
          const prevNBalance = await prisma.balance.findFirst({
            where: {
              folderId: prevYearFolder.id,
              type: BalanceType.CURRENT_YEAR,
              archived: false,
              status: { in: [BalanceStatus.PROCESSED, BalanceStatus.UPDATED] },
            },
            include: {
              equilibrium: true,
              accountIssues: { orderBy: { severity: "desc" } },
              fixedAssets: true,
              folder: { include: { client: true } },
            },
          });
          if (prevNBalance) {
            balancesWithOriginalData.push({
              ...prevNBalance,
              type: BalanceType.PREVIOUS_YEAR,
              isDerived: true,
              derivedFromFolderYear: prevYearFolder.fiscalYear,
              derivedFromFolderId: prevYearFolder.id,
              originalData: prevNBalance.originalData,
            });
          }
        }
      }

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

  async checkEquilibrium(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const balance = await prisma.balance.findUnique({
        where: { id },
        include: { folder: true },
      });

      if (!balance) {
        throw new NotFoundError("Balance not found");
      }

      if (balance.folder.ownerId !== req.user?.userId) {
        throw new ForbiddenError("You don't have access to this balance");
      }

      const equilibrium = await this.balanceProcessor.checkEquilibrium(
        balance,
      );

      res.json({
        isBalanced: equilibrium.isBalanced,
        message: equilibrium.isBalanced
          ? "La balance est équilibrée"
          : equilibrium.anomalies || "La balance n'est pas équilibrée",
        details: equilibrium,
      });
    } catch (error) {
      next(error);
    }
  }

  async applyVentilation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { mainAccountNumber, allocations } = req.body as {
        mainAccountNumber: string;
        allocations: Array<{ accountNumber: string; amount: number }>;
      };

      if (
        !mainAccountNumber ||
        !Array.isArray(allocations) ||
        allocations.length === 0
      ) {
        throw new BadRequestError(
          "Le compte principal et la répartition sont requis",
        );
      }

      const balance = await prisma.balance.findUnique({
        where: { id },
        include: { folder: true },
      });

      if (!balance) {
        throw new NotFoundError("Balance not found");
      }

      if (balance.folder.ownerId !== req.user?.userId) {
        throw new ForbiddenError("You don't have access to this balance");
      }

      // Block ventilation if DSF has already been generated
      await this.checkDSFGenerated(balance.folderId);

      const config = await prisma.ventilationConfig.findUnique({
        where: {
          clientId_mainAccountNumber: {
            clientId: balance.folder.clientId,
            mainAccountNumber,
          },
        },
        include: { subAccounts: true },
      });

      if (!config) {
        throw new NotFoundError(
          `Aucune configuration de ventilation pour le compte ${mainAccountNumber}`,
        );
      }

      const subAccountsByNumber = new Map(
        config.subAccounts.map((sub) => [sub.accountNumber, sub]),
      );
      for (const allocation of allocations) {
        if (!subAccountsByNumber.has(allocation.accountNumber)) {
          throw new BadRequestError(
            `Le compte ${allocation.accountNumber} n'est pas un sous-compte configuré pour ${mainAccountNumber}`,
          );
        }
      }

      let currentData: any;
      try {
        currentData =
          typeof balance.originalData === "string"
            ? JSON.parse(balance.originalData)
            : balance.originalData || {};
      } catch {
        currentData = {};
      }

      const currentRows: any[] = Array.isArray(currentData?.rows)
        ? currentData.rows
        : [];

      const mainRowIndex = currentRows.findIndex(
        (row) => row.accountNumber === mainAccountNumber,
      );
      if (mainRowIndex === -1) {
        throw new NotFoundError(
          `Le compte ${mainAccountNumber} n'existe pas dans cette balance`,
        );
      }

      const mainRow = currentRows[mainRowIndex];

      // Calculate total balance amount to validate
      const totalBalance =
        (Number(mainRow.closingDebit) || 0) - (Number(mainRow.closingCredit) || 0);
      const allocatedSum = allocations.reduce(
        (sum, a) => sum + (Number(a.amount) || 0),
        0,
      );
      if (Math.abs(allocatedSum - Math.abs(totalBalance)) > 0.01) {
        throw new BadRequestError(
          `Les montants alloués doivent totaliser ${Math.abs(totalBalance).toLocaleString()}`,
        );
      }

      // The main account's balance sits on whichever side carries its net
      // total; allocated amounts are booked as movement on that same side.
      const isDebitSide = totalBalance >= 0;
      const allocatedAccountNumbers = new Set(
        allocations.map((a) => a.accountNumber),
      );

      // Each sub-account keeps its own pre-existing opening/movement (it may
      // already exist as its own row in the balance); the allocated amount
      // is added as additional movement, and closing is recomputed from it.
      const newRows = allocations.map((allocation) => {
        const sub = subAccountsByNumber.get(allocation.accountNumber)!;
        const existing = currentRows.find(
          (row) => row.accountNumber === allocation.accountNumber,
        );

        const openingDebit = Number(existing?.openingDebit) || 0;
        const openingCredit = Number(existing?.openingCredit) || 0;
        const movementDebit =
          (Number(existing?.movementDebit) || 0) +
          (isDebitSide ? allocation.amount : 0);
        const movementCredit =
          (Number(existing?.movementCredit) || 0) +
          (isDebitSide ? 0 : allocation.amount);

        return {
          accountNumber: sub.accountNumber,
          accountName: sub.accountName,
          openingDebit,
          openingCredit,
          movementDebit,
          movementCredit,
          closingDebit: openingDebit + movementDebit,
          closingCredit: openingCredit + movementCredit,
        };
      });

      const updatedRows = [
        ...currentRows.filter(
          (row) =>
            row.accountNumber !== mainAccountNumber &&
            !allocatedAccountNumbers.has(row.accountNumber),
        ),
        ...newRows,
      ];

      await prisma.balance.update({
        where: { id },
        data: {
          originalData: { rows: updatedRows },
        },
      });

      await auditService.logBalanceCorrected(
        req.user!.userId,
        balance.folderId,
        id,
        {
          action: 'ventilation',
          mainAccount: {
            accountNumber: mainRow.accountNumber,
            accountName: mainRow.accountName,
            closingDebit: mainRow.closingDebit,
            closingCredit: mainRow.closingCredit,
          },
        },
        {
          summary: `Compte ${mainAccountNumber} ventilé en ${allocations.length} sous-compte(s)`,
          mainAccountNumber,
          subAccounts: newRows.map((r) => ({
            accountNumber: r.accountNumber,
            accountName: r.accountName,
            movementDebit: r.movementDebit,
            movementCredit: r.movementCredit,
            closingDebit: r.closingDebit,
            closingCredit: r.closingCredit,
          })),
        },
      );

      await this.balanceProcessor.processBalance(id);

      const refreshed = await prisma.balance.findUnique({
        where: { id },
        include: { equilibrium: true, accountIssues: true, fixedAssets: true },
      });

      res.json({
        message: `Compte ${mainAccountNumber} ventilé avec succès`,
        balance: refreshed,
      });
    } catch (error) {
      next(error);
    }
  }

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

      await auditService.logUserAction(
        req.user!.userId,
        "BALANCE_ISSUE_RESOLVED",
        `Résolution d'un problème de balance`,
        { issueId },
      );

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

      await auditService.logUserAction(
        req.user!.userId,
        "BALANCE_DELETED",
        `Suppression de la balance ${id}`,
        { balanceId: id },
      );

      res.json({
        message: "Balance deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async archiveBalance(req: AuthRequest, res: Response, next: NextFunction) {
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

      const isAdmin = req.user?.role === "ADMIN";
      if (!isAdmin && balance.folder.ownerId !== req.user?.userId) {
        throw new ForbiddenError("You don't have access to this balance");
      }

      const archivedBalance = await prisma.balance.update({
        where: { id },
        data: {
          archived: true,
          archivedAt: new Date(),
        },
      });

      await auditService.logUserAction(
        req.user!.userId,
        "BALANCE_ARCHIVED",
        `Archivage de la balance ${id}`,
        { balanceId: id },
      );

      res.json({
        message: "Balance archivée avec succès",
        balance: archivedBalance,
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

      // Block row edits if DSF has already been generated
      await this.checkDSFGenerated(balance.folderId);

      // Get current original data
      console.log("Raw originalData type:", typeof balance.originalData);
      console.log("Raw originalData:", balance.originalData);

      let currentData: any = {};
      try {
        currentData = typeof balance.originalData === 'string'
          ? JSON.parse(balance.originalData)
          : balance.originalData || {};
      } catch (parseError) {
        console.error("Error parsing originalData:", parseError);
        console.error("Raw originalData that failed to parse:", balance.originalData);
        currentData = {};
      }

      console.log("Parsed currentData:", currentData);

      let currentRows = currentData?.rows || [];

      if (!Array.isArray(currentRows)) {
        console.warn("currentRows is not an array:", currentRows);
        currentRows = [];
      }

      console.log("Current rows count:", currentRows.length);
      console.log("Rows to update count:", rows.length);

      if (currentRows.length === 0) {
        console.error("No existing rows found! This will cause data loss.");
        throw new BadRequestError("Aucune donnée existante trouvée pour cette balance. Impossible de mettre à jour.");
      }

      // Create a map of existing rows for quick lookup
      const rowsMap = new Map(
        currentRows.map((row: any) => [row.accountNumber, row]),
      );

      // --- Field-level diff (computed before mutating rowsMap) ---
      const NUMERIC_FIELDS = [
        'openingDebit', 'openingCredit',
        'movementDebit', 'movementCredit',
        'closingDebit', 'closingCredit',
      ];
      const FIELD_LABELS: Record<string, string> = {
        openingDebit: 'Ouverture Débit', openingCredit: 'Ouverture Crédit',
        movementDebit: 'Mouvement Débit', movementCredit: 'Mouvement Crédit',
        closingDebit: 'Clôture Débit',   closingCredit: 'Clôture Crédit',
        accountName: 'Libellé',
      };
      const changes: Array<{
        accountNumber: string;
        accountName: string;
        field: string;
        label: string;
        from: any;
        to: any;
      }> = [];

      rows.forEach((updatedRow: any) => {
        if (!updatedRow.accountNumber) return;
        const oldRow: any = rowsMap.get(updatedRow.accountNumber);
        if (!oldRow) return; // new account added, not an edit

        NUMERIC_FIELDS.forEach((field) => {
          const from = Number(oldRow[field]) || 0;
          const to   = Number(updatedRow[field]) || 0;
          if (Math.abs(from - to) > 0.001) {
            changes.push({
              accountNumber: updatedRow.accountNumber,
              accountName: updatedRow.accountName || oldRow.accountName || '',
              field,
              label: FIELD_LABELS[field] || field,
              from,
              to,
            });
          }
        });

        if (
          updatedRow.accountName != null &&
          updatedRow.accountName !== oldRow.accountName
        ) {
          changes.push({
            accountNumber: updatedRow.accountNumber,
            accountName: updatedRow.accountName,
            field: 'accountName',
            label: FIELD_LABELS.accountName,
            from: oldRow.accountName,
            to: updatedRow.accountName,
          });
        }
      });

      // Update with new values
      rows.forEach((updatedRow: any) => {
        if (updatedRow.accountNumber) {
          console.log("Updating row:", updatedRow.accountNumber);
          rowsMap.set(updatedRow.accountNumber, updatedRow);
        }
      });

      // Convert map back to array
      const updatedRows = Array.from(rowsMap.values());
      console.log("Final rows count:", updatedRows.length);

      // Update the balance, then reprocess it so equilibrium, account
      // issues and status reflect the edited rows (otherwise the balance
      // is left in a stale state that downstream features like DSF
      // generation won't recognize as processed).
      await prisma.balance.update({
        where: { id },
        data: {
          originalData: { rows: updatedRows } as any,
        },
      });

      await this.balanceProcessor.processBalance(id);

      // Log with full field-level diff so every changed value is traceable
      if (changes.length > 0) {
        const affectedAccounts = [...new Set(changes.map((c) => c.accountNumber))];
        await auditService.logBalanceCorrected(
          req.user!.userId,
          balance.folderId,
          id,
          null,
          {
            summary: `${changes.length} champ(s) modifié(s) sur ${affectedAccounts.length} compte(s)`,
            affectedAccounts,
            changes,
          },
        );
      }

      res.json({
        message: "Balance rows updated successfully",
        updatedCount: rows.length,
      });
    } catch (error) {
      next(error);
    }
  }

  private async checkDSFGenerated(folderId: string): Promise<void> {
    const dsf = await prisma.dSF.findUnique({
      where: { folderId },
      select: { status: true, lastGeneratedAt: true },
    });
    if (dsf?.lastGeneratedAt || (dsf && dsf.status !== DSFStatus.DRAFT)) {
      throw new ForbiddenError(
        'Modification refusée : une DSF a déjà été générée pour cet exercice. ' +
        'Veuillez régénérer la DSF après vos modifications.',
      );
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
