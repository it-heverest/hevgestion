// src/controllers/folder.controller.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { BadRequestError, NotFoundError, ForbiddenError } from "../lib/errors";
import { FolderStatus } from "@prisma/client";
import { auditService } from "../services/audit.service";

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
        orderBy: { createdAt: "desc" },
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

      const where: any = {
        ...accessScope,
        OR: [
          { name: { contains: query as string, mode: "insensitive" } },
          { description: { contains: query as string, mode: "insensitive" } },
        ],
      };

      if (clientId) where.clientId = clientId;

      const folders = await prisma.folder.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, country: true } },
        },
        orderBy: { fiscalYear: "desc" },
        take: 20,
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
      if (isActive === true) {
        const folder = await prisma.folder.findUnique({ where: { id } });
        if (folder) {
          await prisma.folder.updateMany({
            where: { clientId: folder.clientId, id: { not: id } },
            data: { isActive: false },
          });
        }
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

      res.json({ message: "Folder updated successfully", folder: updatedFolder });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /:id
   * Permanently deletes a folder. Owner or admin only. No associated data allowed.
   */
  deleteFolder = async (
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

      await prisma.folder.delete({ where: { id } });

      res.json({ message: "Folder deleted successfully" });
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
