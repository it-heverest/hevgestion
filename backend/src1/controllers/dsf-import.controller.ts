import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { BadRequestError, NotFoundError } from "../lib/errors";
import { NoteDataService } from "../services/dsf-import.service";

class DSFImportController {
  private noteDataService = new NoteDataService();

  /**
   * Import DSF file from Excel with extracted notes data
   */
  importDSFFile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { folderId, extractedData, clientId } = req.body;
      const file = req.files && "file" in req.files ? req.files.file[0] : null;

      if (!folderId) {
        throw new BadRequestError("Folder ID is required");
      }

      if (!clientId) {
        throw new BadRequestError("Client ID is required");
      }

      if (!file) {
        throw new BadRequestError("DSF file is required");
      }

      // Verify folder ownership
      const folder = await this.verifyFolderAccess(folderId, req.user?.userId);

      // Parse extracted data from client
      let parsedExtractedData;
      try {
        parsedExtractedData =
          typeof extractedData === "string"
            ? JSON.parse(extractedData)
            : extractedData;
      } catch (error) {
        throw new BadRequestError("Invalid extracted data format");
      }

      // Create DSF import record
      const dsfImport = await prisma.dSFImport.create({
        data: {
          folderId,
          clientId,
          fileName: file.originalname,
          fileUrl: file.path || `/uploads/dsf/${file.filename}`,
          exerciseYear: folder.fiscalYear,
          importedBy: req.user!.userId,
          status: "processing",
          totalSheets: parsedExtractedData.sheetNames?.length || 0,
          processedSheets: 0,
        },
      });

      // Process and save each note's extracted data to DSF model
      const results = await this.noteDataService.processExtractedNotes(
        dsfImport.id,
        folderId,
        parsedExtractedData.results || [],
        req.user!.userId,
      );

      // Update import status
      await prisma.dSFImport.update({
        where: { id: dsfImport.id },
        data: {
          status:
            results.failed.length > 0 ? "completed_with_errors" : "completed",
          processedSheets: results.successful.length,
        },
      });

      res.json({
        message: "DSF import completed successfully",
        importId: dsfImport.id,
        processedNotes: results.successful,
        failedNotes: results.failed,
        totalNotes: results.total,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all DSF imports for a folder
   */
  getImports = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { folderId } = req.params;

      // Verify folder ownership
      await this.verifyFolderAccess(folderId, req.user?.userId);

      const imports = await prisma.dSFImport.findMany({
        where: { folderId },
        orderBy: { importedAt: "desc" },
      });

      res.json({ imports });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get import details
   */
  getImportDetails = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { importId } = req.params;

      const dsfImport = await prisma.dSFImport.findUnique({
        where: { id: importId },
        include: {
          folder: true,
          client: true,
        },
      });

      if (!dsfImport) {
        throw new NotFoundError("Import not found");
      }

      // Verify ownership
      if (dsfImport.folder.ownerId !== req.user?.userId) {
        throw new BadRequestError(
          "You don't have permission to view this import",
        );
      }

      res.json({ import: dsfImport });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get DSF status (imported or generated)
   */
  getDSFStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { folderId } = req.params;

      await this.verifyFolderAccess(folderId, req.user?.userId);
      const status = await this.noteDataService.getDSFStatus(folderId);

      res.json(status);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all notes data from DSF
   */
  getAllNotes = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { folderId } = req.params;

      await this.verifyFolderAccess(folderId, req.user?.userId);
      const data = await this.noteDataService.getAllNotesData(folderId);

      if (!data) {
        throw new NotFoundError("DSF not found for this folder");
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get specific note data
   */
  getNoteData = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { folderId, noteNumber } = req.params;

      await this.verifyFolderAccess(folderId, req.user?.userId);
      const data = await this.noteDataService.getNoteData(folderId, noteNumber);

      if (!data) {
        throw new NotFoundError(`Note ${noteNumber} not found`);
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update specific note data
   */
  updateNoteData = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { folderId, noteNumber } = req.params;
      const { data } = req.body;

      await this.verifyFolderAccess(folderId, req.user?.userId);

      // Validate data
      const validation = this.noteDataService.validateNoteData(
        noteNumber,
        data,
      );
      if (!validation.valid) {
        throw new BadRequestError(
          `Validation failed: ${validation.errors.join(", ")}`,
        );
      }

      await this.noteDataService.updateNoteData(folderId, noteNumber, data);

      res.json({
        message: `Note ${noteNumber} updated successfully`,
        updatedAt: new Date(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete specific note data
   */
  deleteNoteData = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { folderId, noteNumber } = req.params;

      await this.verifyFolderAccess(folderId, req.user?.userId);
      await this.noteDataService.deleteNoteData(folderId, noteNumber);

      res.json({
        message: `Note ${noteNumber} deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate DSF from balance (mark as generated, not imported)
   */
  generateDSFFromBalance = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { folderId } = req.params;

      await this.verifyFolderAccess(folderId, req.user?.userId);

      // TODO: Implement DSF generation from balance
      // This will create/update DSF with isImported=false

      await this.noteDataService.markAsGenerated(folderId, req.user!.userId);

      res.json({
        message: "DSF generation started",
        isImported: false,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get DSF mapping configurations
   */
  getMappingConfigs = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const configs = await prisma.dSFMappingConfig.findMany({
        where: {
          OR: [{ isSystem: true }, { ownerId: req.user?.userId }],
        },
        orderBy: { noteType: "asc" },
      });

      res.json({ configs });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Helper method to verify folder access
   */
  private async verifyFolderAccess(folderId: string, userId?: string) {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      throw new NotFoundError("Exercise not found");
    }

    if (folder.ownerId !== userId) {
      throw new BadRequestError(
        "You don't have permission to access this exercise",
      );
    }

    return folder;
  }
}

export const dsfImportController = new DSFImportController();
