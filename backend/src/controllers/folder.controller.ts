// src/controllers/folder.controller.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { BadRequestError, NotFoundError, ForbiddenError } from "../lib/errors";
import { FolderStatus } from "@prisma/client";
import { auditService } from "../services/audit.service";
import { trashService } from "../services/trash.service";

const VALID_STATUSES: string[] = [
  "DRAFT",
  "PROCESSING_BALANCE",
  "BALANCE_READY",
  "DSF_GENERATED",
  "DSF_VALIDATED",
  "COMPLETED",
];

class FolderController {
  // ─── READ ────────────────────────────────────────────────────────────────────

  getFolders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { clientId } = req.query;

      if (!clientId) throw new BadRequestError("clientId is required");

      await this.checkClientAccess(userId, clientId as string, req.user!.role);

      const folders = await prisma.folder.findMany({
        where: { clientId: clientId as string },
        include: {
          client: true,
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          balances: { select: { id: true, type: true, status: true } },
        },
        orderBy: { fiscalYear: "desc" },
      });

      res.json({ folders });
    } catch (error) {
      next(error);
    }
  };

  getCurrentFolder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.userId;
      const { clientId } = req.query;

      if (!clientId) throw new BadRequestError("clientId is required");

      await this.checkClientAccess(userId, clientId as string, req.user!.role);

      const currentFolder = await prisma.folder.findFirst({
        where: {
          clientId: clientId as string,
          status: { not: FolderStatus.COMPLETED },
        },
        include: {
          client: true,
          balances: { orderBy: { importedAt: "desc" } },
          dsf: true,
        },
        orderBy: { fiscalYear: "desc" },
      });

      res.json({ folder: currentFolder ?? null });
    } catch (error) {
      next(error);
    }
  };

  getFolderById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const folder = await prisma.folder.findUnique({
        where: { id },
        include: {
          client: true,
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          balances: {
            include: {
              equilibrium: true,
              accountIssues: { where: { isResolved: false } },
            },
          },
          dsf: true,
          taxDeclarations: true,
          assignments: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
        },
      });

      if (!folder) throw new NotFoundError("Folder not found");

      await this.checkFolderAccess(userId, id, req.user!.role);

      res.json({ folder });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /:id/details
   * Alias for getFolderById — satisfies frontend folderService.getFolderWithDetails()
   */
  getFolderWithDetails = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    return this.getFolderById(req, res, next);
  };

  /**
   * GET /:id/progress
   * Returns a step-based progress summary for a folder.
   */
  getFolderProgress = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const folder = await prisma.folder.findUnique({
        where: { id },
        include: {
          balances: { select: { id: true, status: true } },
          dsf: { select: { id: true, status: true } },
        },
      });

      if (!folder) throw new NotFoundError("Folder not found");
      await this.checkFolderAccess(userId, id, req.user!.role);

      const hasProcessedBalance = folder.balances.some(
        (b) => b.status === "PROCESSED"
      );
      const steps = {
        balanceImported: folder.balances.length > 0,
        balanceProcessed: hasProcessedBalance,
        dsfGenerated: !!folder.dsf,
        completed: folder.status === FolderStatus.COMPLETED,
      };

      res.json({
        progress: {
          folderId: id,
          status: folder.status,
          steps,
          percentComplete: Object.values(steps).filter(Boolean).length * 25,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /:id/timeline
   * Returns the 50 most recent audit events for a folder.
   */
  getFolderTimeline = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const folder = await prisma.folder.findUnique({ where: { id } });
      if (!folder) throw new NotFoundError("Folder not found");
      await this.checkFolderAccess(userId, id, req.user!.role);

      const timeline = await prisma.auditLog.findMany({
        where: { folderId: id },
        orderBy: { timestamp: "desc" },
        take: 50,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });

      res.json({ timeline });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /search?query=xxx&clientId=xxx
   * Full-text search on folder name / description.
   */
  searchFolders = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.userId;
      const { query = "", clientId } = req.query;

      // Build access scope
      const accessScope: any =
        req.user!.role === "ADMIN"
          ? {}
          : req.user!.role === "COMPTABLE"
          ? { ownerId: userId }
          : { assignments: { some: { userId } } };

      // If query is empty, return all folders without filtering by name/description
      const where: any = {
        ...accessScope,
      };

      // Only add name/description filter if query is not empty
      const queryStr = String(query || "");
      if (queryStr.trim() !== "") {
        where.OR = [
          { name: { contains: queryStr, mode: "insensitive" } },
          { description: { contains: queryStr, mode: "insensitive" } },
        ];
      }

      if (clientId) where.clientId = clientId;

      const folders = await prisma.folder.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, country: true } },
        },
        orderBy: { fiscalYear: "desc" },
        take: 100, // Increased limit to return more folders
      });

      res.json({ folders });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /stats/summary?clientId=xxx
   * Count of folders per status for a given client.
   */
  getFolderStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.userId;
      const { clientId } = req.query;

      if (!clientId) throw new BadRequestError("clientId is required");
      await this.checkClientAccess(userId, clientId as string, req.user!.role);

      const folders = await prisma.folder.findMany({
        where: { clientId: clientId as string },
        select: { status: true },
      });

      const stats = folders.reduce<Record<string, number>>((acc, f) => {
        acc[f.status] = (acc[f.status] ?? 0) + 1;
        return acc;
      }, {});

      res.json({ stats });
    } catch (error) {
      next(error);
    }
  };

  // ─── WRITE ───────────────────────────────────────────────────────────────────

  createFolder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.userId;
      const { name, description, clientId, fiscalYear, startDate, endDate } =
        req.body;

      await this.checkClientAccess(userId, clientId, req.user!.role);

      const existing = await prisma.folder.findFirst({
        where: { clientId, fiscalYear },
      });
      if (existing) {
        throw new BadRequestError(`Folder for year ${fiscalYear} already exists`);
      }

      const folder = await prisma.folder.create({
        data: {
          name,
          description,
          clientId,
          ownerId: userId,
          fiscalYear,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: FolderStatus.DRAFT,
        },
        include: {
          client: true,
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      // Log folder creation
      await auditService.logFolderCreated(userId, folder, folder.id);

      res.status(201).json({ message: "Folder created successfully", folder });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /:id/duplicate
   * Creates a new DRAFT folder for a different fiscal year, copying metadata
   * from the source folder. The source folder id comes from req.params.id.
   * Body: { fiscalYear, startDate, endDate }
   */
  duplicateFolder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.userId;
      const { id: sourceFolderId } = req.params;
      const { fiscalYear, startDate, endDate } = req.body;

      if (!fiscalYear || !startDate || !endDate) {
        throw new BadRequestError("fiscalYear, startDate and endDate are required");
      }

      const sourceFolder = await prisma.folder.findUnique({
        where: { id: sourceFolderId },
      });
      if (!sourceFolder) throw new NotFoundError("Source folder not found");

      await this.checkClientAccess(userId, sourceFolder.clientId, req.user!.role);

      const existing = await prisma.folder.findFirst({
        where: { clientId: sourceFolder.clientId, fiscalYear },
      });
      if (existing) {
        throw new BadRequestError(`Folder for year ${fiscalYear} already exists`);
      }

      const folder = await prisma.folder.create({
        data: {
          name: `${sourceFolder.name} - ${fiscalYear}`,
          description: sourceFolder.description ?? undefined,
          clientId: sourceFolder.clientId,
          ownerId: userId,
          fiscalYear,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: FolderStatus.DRAFT,
        },
        include: {
          client: true,
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      // Log folder duplication
      await auditService.logFolderCreated(userId, folder, folder.id);

      res.status(201).json({ message: "Folder duplicated successfully", folder });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /:id/clone
   * Deep-clones a folder: copies all balances (with equilibrium, issues, fixed assets,
   * ventilation logs), DSF (with coherence control), tax declarations, folder assignments,
   * and exercise-scoped DSF comptable configs into a new DRAFT folder.
   */
  cloneFolder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id: sourceFolderId } = req.params;
      const { fiscalYear, startDate, endDate } = req.body;

      if (!fiscalYear || !startDate || !endDate) {
        throw new BadRequestError("fiscalYear, startDate et endDate sont requis");
      }

      const sourceFolder = await prisma.folder.findUnique({
        where: { id: sourceFolderId },
        include: {
          balances: {
            include: {
              equilibrium: true,
              accountIssues: true,
              fixedAssets: true,
              ventilationLogs: true,
            },
          },
          dsf: { include: { coherenceControl: true } },
          taxDeclarations: true,
          assignments: true,
          dsfComptableConfigs: { where: { exerciseId: sourceFolderId } },
          ventilationConfigs: {
            where: { archived: false },
            include: { subAccounts: true },
          },
        },
      });

      if (!sourceFolder) throw new NotFoundError("Dossier source introuvable");
      await this.checkClientAccess(userId, sourceFolder.clientId, req.user!.role);

      // If an exercise for the same fiscal year already exists, archive it first.
      const existing = await prisma.folder.findFirst({
        where: { clientId: sourceFolder.clientId, fiscalYear },
      });
      if (existing) {
        await prisma.folder.update({
          where: { id: existing.id },
          data: { status: FolderStatus.COMPLETED, isActive: false },
        });
        await auditService.logFolderStatusChanged(userId, existing.id, existing.status, "ARCHIVED", {
          name: existing.name,
          isActive: false,
          reason: `Archived to make room for clone of fiscal year ${fiscalYear}`,
        });
      }

      const cloned = await prisma.$transaction(async (tx) => {
        // 1. New folder
        const baseName = sourceFolder.name.replace(/ - \d{4}$/, "").trim();
        const folder = await tx.folder.create({
          data: {
            name: `${baseName} - ${fiscalYear}`,
            description: sourceFolder.description ?? undefined,
            clientId: sourceFolder.clientId,
            ownerId: userId,
            fiscalYear,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: FolderStatus.DRAFT,
          },
        });

        // 2. Balances + children
        for (const bal of sourceFolder.balances) {
          const newBal = await tx.balance.create({
            data: {
              folderId: folder.id,
              type: bal.type,
              period: bal.period,
              fileName: bal.fileName,
              filePath: bal.filePath,
              originalData: (bal.originalData ?? undefined) as any,
              status: bal.status,
              validationErrors: bal.validationErrors,
              archived: bal.archived,
              archivedAt: bal.archivedAt,
            },
          });

          if (bal.equilibrium) {
            await tx.balanceEquilibrium.create({
              data: {
                balanceId: newBal.id,
                openingDebit: bal.equilibrium.openingDebit,
                openingCredit: bal.equilibrium.openingCredit,
                movementDebit: bal.equilibrium.movementDebit,
                movementCredit: bal.equilibrium.movementCredit,
                closingDebit: bal.equilibrium.closingDebit,
                closingCredit: bal.equilibrium.closingCredit,
                isBalanced: bal.equilibrium.isBalanced,
                anomalies: bal.equilibrium.anomalies,
              },
            });
          }

          if (bal.accountIssues.length > 0) {
            await tx.accountIssue.createMany({
              data: bal.accountIssues.map(({ id: _id, balanceId: _bid, ...issue }) => ({
                ...issue,
                balanceId: newBal.id,
                isResolved: false,
                resolvedAt: null,
                resolution: null,
              })),
            });
          }

          if (bal.fixedAssets.length > 0) {
            await tx.fixedAsset.createMany({
              data: bal.fixedAssets.map(({ id: _id, balanceId: _bid, ...asset }) => ({
                ...asset,
                balanceId: newBal.id,
              })) as any,
            });
          }

          if (bal.ventilationLogs.length > 0) {
            await tx.ventilationLog.createMany({
              data: bal.ventilationLogs.map(({ id: _id, balanceId: _bid, ...log }) => ({
                ...log,
                balanceId: newBal.id,
                replacedRows: log.replacedRows as any,
                newRows: log.newRows as any,
              })),
            });
          }
        }

        // 3. DSF + CoherenceControl
        if (sourceFolder.dsf) {
          const {
            id: _did, folderId: _dfid, folder: _df, user: _du,
            coherenceControl, createdAt: _dca, updatedAt: _dua,
            ...dsfData
          } = sourceFolder.dsf as any;
          const newDsf = await tx.dSF.create({
            data: {
              ...dsfData,
              folderId: folder.id,
              status: "DRAFT",
              isImported: false,
              importId: null,
              importedAt: null,
              importedBy: null,
            },
          });

          if (coherenceControl) {
            const { id: _ccid, dsfId: _ccdid, ...ccData } = coherenceControl;
            await tx.coherenceControl.create({
              data: { ...ccData, dsfId: newDsf.id },
            });
          }
        }

        // 4. TaxDeclarations (reset payment/filing state)
        if (sourceFolder.taxDeclarations.length > 0) {
          await tx.taxDeclaration.createMany({
            data: sourceFolder.taxDeclarations.map(
              ({ id: _id, folderId: _fid, createdAt: _ca, updatedAt: _ua, ...decl }) => ({
                ...decl,
                folderId: folder.id,
                dsfId: null,
                status: "PENDING" as any,
                amountPaid: null,
                filedAt: null,
              }),
            ),
          });
        }

        // 5. FolderAssignments
        if (sourceFolder.assignments.length > 0) {
          await tx.folderAssignment.createMany({
            data: sourceFolder.assignments.map(
              ({ folderId: _fid, assignedAt: _at, ...assign }) => ({
                ...assign,
                folderId: folder.id,
              }),
            ),
          });
        }

        // 6. Exercise-scoped DSFComptableConfigs
        if (sourceFolder.dsfComptableConfigs.length > 0) {
          await tx.dSFComptableConfig.createMany({
            data: sourceFolder.dsfComptableConfigs.map(
              ({ id: _id, exerciseId: _eid, createdAt: _ca, updatedAt: _ua, ...cfg }) => ({
                ...cfg,
                exerciseId: folder.id,
              }),
            ),
          });
        }

        // 7. VentilationConfigs (folder-scoped only)
        for (const vc of (sourceFolder as any).ventilationConfigs) {
          await tx.ventilationConfig.create({
            data: {
              clientId: vc.clientId,
              folderId: folder.id,
              mainAccountNumber: vc.mainAccountNumber,
              mainAccountName: vc.mainAccountName,
              createdBy: userId,
              subAccounts: {
                create: vc.subAccounts.map(
                  ({ id: _id, configId: _cid, createdAt: _ca, updatedAt: _ua, ...sub }: any) => sub
                ),
              },
            },
          });
        }

        return folder;
      }, { timeout: 30000 });

      const folderWithDetails = await prisma.folder.findUnique({
        where: { id: cloned.id },
        include: {
          client: true,
          owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      await auditService.logFolderCreated(userId, cloned, cloned.id);

      res.status(201).json({ message: "Exercice cloné avec succès", folder: folderWithDetails });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /:id/close
   * Permanently closes a folder by setting its status to COMPLETED.
   */
  closeFolder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const folder = await prisma.folder.findUnique({
        where: { id },
        include: { balances: true, dsf: true },
      });
      if (!folder) throw new NotFoundError("Folder not found");

      await this.checkFolderAccess(userId, id, req.user!.role);

      const updatedFolder = await prisma.folder.update({
        where: { id },
        data: { status: FolderStatus.COMPLETED },
      });

      await auditService.logFolderStatusChanged(userId, id, folder.status, FolderStatus.COMPLETED, { name: folder.name });

      res.json({ message: "Folder closed successfully", folder: updatedFolder });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /:id/status
   * Sets an arbitrary valid status on a folder.
   * Body: { status }
   * FIX: frontend updateFolderStatus() was wrongly calling the close endpoint.
   */
  updateFolderStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const { status } = req.body;

      if (!status || !VALID_STATUSES.includes(status)) {
        throw new BadRequestError(
          `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`
        );
      }

      await this.checkFolderAccess(userId, id, req.user!.role);

      const currentFolder = await prisma.folder.findUnique({ where: { id }, select: { status: true, name: true } });

      const updatedFolder = await prisma.folder.update({
        where: { id },
        data: { status },
        include: {
          client: true,
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      await auditService.logFolderStatusChanged(userId, id, currentFolder?.status ?? "unknown", status, { name: currentFolder?.name });

      res.json({ message: "Folder status updated", folder: updatedFolder });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /:id/archive
   * Marks a folder as inactive (soft-archive).
   * Note: Prisma schema has no ARCHIVED status; we use isActive=false + COMPLETED.
   * TODO: add ARCHIVED to FolderStatus enum when schema is migrated.
   */
  archiveFolder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const folder = await prisma.folder.findUnique({ where: { id } });
      if (!folder) throw new NotFoundError("Folder not found");
      await this.checkFolderAccess(userId, id, req.user!.role);

      const updatedFolder = await prisma.folder.update({
        where: { id },
        data: { status: FolderStatus.COMPLETED, isActive: false },
      });

      await auditService.logFolderStatusChanged(userId, id, folder.status, "ARCHIVED", { name: folder.name, isActive: false });

      res.json({ message: "Folder archived successfully", folder: updatedFolder });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /:id/restore
   * Restores an archived folder back to DRAFT / active.
   */
  restoreFolder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const folder = await prisma.folder.findUnique({ where: { id } });
      if (!folder) throw new NotFoundError("Folder not found");
      await this.checkFolderAccess(userId, id, req.user!.role);

      const updatedFolder = await prisma.folder.update({
        where: { id },
        data: { status: FolderStatus.DRAFT, isActive: true },
      });

      await auditService.logFolderStatusChanged(userId, id, folder.status, FolderStatus.DRAFT, { name: folder.name, isActive: true, action: "restored" });

      res.json({ message: "Folder restored successfully", folder: updatedFolder });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /:id
   * Generic update: name, description, isActive, status.
   */
  updateFolder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const { name, description, status, isActive } = req.body;

      await this.checkFolderAccess(userId, id, req.user!.role);

      // When activating this folder, deactivate all siblings
      const oldFolder = await prisma.folder.findUnique({ where: { id } });
      if (isActive === true && oldFolder) {
        await prisma.folder.updateMany({
          where: { clientId: oldFolder.clientId, id: { not: id } },
          data: { isActive: false },
        });
      }

      const updatedFolder = await prisma.folder.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status }),
          ...(isActive !== undefined && { isActive }),
        },
        include: {
          client: true,
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      await auditService.logFolderUpdated(userId, id, oldFolder, updatedFolder);

      res.json({ message: "Folder updated successfully", folder: updatedFolder });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /:id
   * Place le dossier en corbeille (suppression réversible). Propriétaire ou
   * administrateur uniquement. Le dossier ne doit plus porter de données.
   */
  deleteFolder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const { reason } = req.body || {};

      const folder = await prisma.folder.findUnique({
        where: { id },
        include: {
          balances: true,
          dsf: true,
          taxDeclarations: true,
        },
      });

      if (!folder) throw new NotFoundError("Folder not found");

      if (req.user!.role !== "ADMIN" && folder.ownerId !== userId) {
        throw new ForbiddenError("Only folder owner or admin can delete folders");
      }

      if (
        folder.balances.length > 0 ||
        folder.dsf ||
        folder.taxDeclarations.length > 0
      ) {
        throw new BadRequestError("Cannot delete folder with associated data");
      }

      await trashService.archiveAndDelete("Folder", id, userId, reason);

      await auditService.logFolderDeleted(userId, id, folder);

      res.json({
        message: "Dossier placé dans la corbeille. Un administrateur peut le restaurer.",
      });
    } catch (error) {
      next(error);
    }
  };

  // ─── ACCESS HELPERS ──────────────────────────────────────────────────────────

  checkClientAccess = async (
    userId: string,
    clientId: string,
    userRole: string
  ): Promise<boolean> => {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) throw new NotFoundError("Client not found");

    if (userRole === "ADMIN") return true;

    if (userRole === "COMPTABLE") {
      if (client.createdBy !== userId)
        throw new ForbiddenError("Access denied to this client");
      return true;
    }

    if (userRole === "ASSISTANT") {
      const hasAccess = await prisma.folderAssignment.findFirst({
        where: { userId, folder: { clientId } },
      });
      if (!hasAccess) throw new ForbiddenError("Access denied to this client");
      return true;
    }

    throw new ForbiddenError("Invalid user role");
  };

  checkFolderAccess = async (
    userId: string,
    folderId: string,
    userRole: string
  ): Promise<boolean> => {
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder) throw new NotFoundError("Folder not found");

    if (userRole === "ADMIN") return true;

    const hasAccess = await prisma.folder.findFirst({
      where: {
        id: folderId,
        OR: [{ ownerId: userId }, { assignments: { some: { userId } } }],
      },
    });

    if (!hasAccess) throw new ForbiddenError("Access denied to this folder");
    return true;
  };
}

export const folderController = new FolderController();
