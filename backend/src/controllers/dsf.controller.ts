// src/controllers/dsf.controller.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { BadRequestError, NotFoundError } from "../lib/errors";
import { DSFGenerator } from "../services/dsf-generator.service";
import { DSFValidationService } from "../services/dsf-validation.service";
import {
  DSFStatus,
  FolderStatus,
  BalanceStatus,
  BalanceType,
} from "@prisma/client";
import * as path from "path";
import { config } from "../config";
import * as XLSX from "xlsx";
import * as fs from "fs/promises";

// Type pour les relations complètes du dossier
type FolderWithFullRelations = {
  id: string;
  name: string;
  description: string | null;
  status: FolderStatus;
  isActive: boolean;
  clientId: string;
  ownerId: string;
  fiscalYear: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    legalForm: any;
    taxNumber: string | null;
    address: string | null;
    city: string | null;
    phone: string | null;
    country: any;
    currency: string;
    createdBy: string;
    clientType: any;
  };
  balances: {
    id: string;
    type: BalanceType;
    period: string;
    folderId: string;
    fileName: string;
    filePath: string | null;
    originalData: any;
    status: BalanceStatus;
    validationErrors: string | null;
    importedAt: Date;
    processedAt: Date | null;
    equilibrium: {
      id: string;
      balanceId: string;
      openingDebit: number;
      openingCredit: number;
      movementDebit: number;
      movementCredit: number;
      closingDebit: number;
      closingCredit: number;
      isBalanced: boolean;
      anomalies: string | null;
    } | null;
    fixedAssets: any[];
  }[];
};

class DSFController {
  private dsfGenerator = new DSFGenerator();
  private dsfValidationService = new DSFValidationService();

  /**
   * Check DSF status for a given client and folder
   * GET /api/dsf/check-status?clientId=xxx&folderId=yyy
   */
  checkDSFStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { clientId, folderId } = req.query;
      const userId = req.user?.userId;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      // Validate required parameters
      if (!clientId || !folderId) {
        throw new BadRequestError(
          "clientId and folderId are required parameters",
        );
      }

      // Check if client exists and user has access
      const client = await prisma.client.findUnique({
        where: { id: clientId as string },
        select: {
          id: true,
          name: true,
          createdBy: true,
        },
      });

      if (!client) {
        throw new NotFoundError("Client not found");
      }

      // Verify user has access to this client
      if (client.createdBy !== userId) {
        throw new BadRequestError("You don't have access to this client");
      }

      // Check if folder exists and belongs to this client
      const folder = await prisma.folder.findUnique({
        where: { id: folderId as string },
        select: {
          id: true,
          name: true,
          clientId: true,
          fiscalYear: true,
          ownerId: true,
        },
      });

      if (!folder) {
        throw new NotFoundError("Folder not found");
      }

      if (folder.clientId !== clientId) {
        throw new BadRequestError("Folder does not belong to this client");
      }

      // Verify user owns this folder
      if (folder.ownerId !== userId) {
        throw new BadRequestError("You don't have access to this folder");
      }

      // Check for existing DSF Import (imported Excel files)
      const dsfImport = await prisma.dSFImport.findFirst({
        where: {
          clientId: clientId as string,
          folderId: folderId as string,
          status: {
            in: ["processing", "completed"],
          },
        },
        orderBy: {
          importedAt: "desc",
        },
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          exerciseYear: true,
          importedAt: true,
          status: true,
          totalSheets: true,
          processedSheets: true,
          importedBy: true,
        },
      });

      // If DSF Import exists, return its details
      if (dsfImport) {
        return res.json({
          exists: true,
          importId: dsfImport.id,
          fileName: dsfImport.fileName,
          fileUrl: dsfImport.fileUrl,
          exerciseYear: dsfImport.exerciseYear,
          importedAt: dsfImport.importedAt.toISOString(),
          status: dsfImport.status,
          totalSheets: dsfImport.totalSheets,
          processedSheets: dsfImport.processedSheets,
          importedBy: dsfImport.importedBy,
          type: "imported", // Distinguish from generated DSF
          client: {
            id: client.id,
            name: client.name,
          },
          folder: {
            id: folder.id,
            name: folder.name,
            exerciseYear: folder.fiscalYear,
          },
        });
      }

      // Check for generated DSF (from balance)
      const dsfGenerated = await prisma.dSF.findUnique({
        where: { folderId: folderId as string },
        select: {
          id: true,
          status: true,
          createdAt: true,
          lastGeneratedAt: true,
          userId: true,
        },
      });

      // If generated DSF exists, return its details
      if (dsfGenerated) {
        return res.json({
          exists: true,
          importId: dsfGenerated.id,
          status: dsfGenerated.status,
          importedAt: dsfGenerated.createdAt.toISOString(),
          lastGeneratedAt: dsfGenerated.lastGeneratedAt?.toISOString() || null,
          importedBy: dsfGenerated.userId,
          type: "generated", // Generated from balance
          client: {
            id: client.id,
            name: client.name,
          },
          folder: {
            id: folder.id,
            name: folder.name,
            exerciseYear: folder.fiscalYear,
          },
        });
      }

      // No DSF found (neither imported nor generated)
      return res.json({
        exists: false,
        client: {
          id: client.id,
          name: client.name,
        },
        folder: {
          id: folder.id,
          name: folder.name,
          exerciseYear: folder.fiscalYear,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete DSF import and all related data
   * DELETE /api/dsf/:id
   */
  deleteDSF = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { type } = req.query; // 'imported' or 'generated'
      const userId = req.user?.userId;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      // Handle imported DSF deletion
      if (type === "imported") {
        const dsfImport = await prisma.dSFImport.findUnique({
          where: { id },
          include: {
            folder: {
              select: {
                ownerId: true,
                id: true,
              },
            },
          },
        });

        if (!dsfImport) {
          throw new NotFoundError("DSF Import not found");
        }

        // Verify user has access
        if (
          dsfImport.folder.ownerId !== userId &&
          dsfImport.importedBy !== userId
        ) {
          throw new BadRequestError("You don't have access to delete this DSF");
        }

        // Delete the DSF Import (cascade will delete sheets and entries)
        await prisma.dSFImport.delete({
          where: { id },
        });

        // Update folder status back to BALANCE_UPLOADED
        await prisma.folder.update({
          where: { id: dsfImport.folderId },
          data: { status: FolderStatus.BALANCE_READY },
        });

        return res.json({
          success: true,
          message: "DSF import deleted successfully",
        });
      }

      // Handle generated DSF deletion (default behavior)
      const dsf = await prisma.dSF.findUnique({
        where: { id },
        include: {
          folder: {
            select: {
              ownerId: true,
              clientId: true,
            },
          },
        },
      });

      if (!dsf) {
        throw new NotFoundError("DSF not found");
      }

      // Verify user has access
      if (dsf.folder.ownerId !== userId && dsf.userId !== userId) {
        throw new BadRequestError("You don't have access to delete this DSF");
      }

      // Delete the DSF (cascade will delete related coherenceControl)
      await prisma.dSF.delete({
        where: { id },
      });

      // Update folder status back to BALANCE_UPLOADED
      await prisma.folder.update({
        where: { id: dsf.folderId },
        data: { status: FolderStatus.BALANCE_READY },
      });

      res.json({
        success: true,
        message: "DSF deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  generateDSF = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // 1. Validating input from body
      const { folderId } = req.body;
      if (!folderId) {
        throw new BadRequestError("L'ID du dossier est requis");
      }

      // 2. Fetch folder using the relation structure defined in your prisma.ts
      // This eliminates the need for "as unknown as"
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        include: {
          client: true, // Full client object to match LegalForm/ClientType types
          balances: {
            where: { status: BalanceStatus.PROCESSED },
            include: {
              equilibrium: true,
              fixedAssets: true,
            },
          },
          // Ensure any other fields required by FolderWithFullRelations are included here
        },
      });

      // 3. Guards / Validation
      if (!folder) {
        throw new NotFoundError("Dossier introuvable");
      }

      if (!folder.client) {
        throw new BadRequestError(
          "Informations client manquantes pour ce dossier",
        );
      }

      const hasNBalance = folder.balances.some(
        (b) => b.type === BalanceType.CURRENT_YEAR,
      );
      if (!hasNBalance) {
        throw new BadRequestError(
          "Balance N (année en cours) introuvable ou non traitée",
        );
      }

      // 4. Shared Generation Logic
      // Because we included the full client/balances above, TS accepts 'folder' directly
      const reports = await this.dsfGenerator.generate(
        folder as unknown as FolderWithFullRelations,
      );

      // 5. Sanitize data for database storage
      const sanitizeForDB = (data: any) => {
        if (data === null || data === undefined) return null;
        if (typeof data === "object" && !Array.isArray(data)) {
          const sanitized: any = {};
          for (const [key, value] of Object.entries(data)) {
            if (value !== null && value !== undefined) {
              sanitized[key] = sanitizeForDB(value);
            }
          }
          return Object.keys(sanitized).length > 0 ? sanitized : null;
        }
        if (Array.isArray(data)) {
          return data.filter((item) => item !== null && item !== undefined);
        }
        return data;
      };

      // Convert reports array to proper database structure
      const dsfData: any = {};
      if (Array.isArray(reports)) {
        reports.forEach((report: any) => {
          if (report.type && report.data) {
            // Map report types to database fields
            switch (report.type) {
              case "BALANCE_SHEET":
                dsfData.bilan_paysage = sanitizeForDB(report.data);
                break;
              case "INCOME_STATEMENT":
                dsfData.compte_de_resultat = sanitizeForDB(report.data);
                break;
              case "TAX_TABLES":
                dsfData.statistiques_et_syntheses = sanitizeForDB(report.data);
                break;
              case "SIGNALETICS":
                dsfData.informations_generales = sanitizeForDB(report.data);
                break;
              case "NOTES":
                // Handle notes - this might contain multiple note types
                if (report.data && typeof report.data === "object") {
                  Object.entries(report.data).forEach(([noteKey, noteData]) => {
                    if (noteData) {
                      dsfData[noteKey] = sanitizeForDB(noteData);
                    }
                  });
                }
                break;
              default:
                // For other report types, store in the reports field
                break;
            }
          }
        });
      }

      // Also store the full reports array for backward compatibility
      dsfData.reports = sanitizeForDB(reports);

      // 6. Database Atomic Operation (Transaction is safer here)
      const result = await prisma.$transaction(async (tx) => {
        // Check if DSF already exists
        let dsf = await tx.dSF.findUnique({
          where: { folderId },
        });

        if (dsf) {
          // Update existing
          dsf = await tx.dSF.update({
            where: { id: dsf.id },
            data: {
              status: DSFStatus.GENERATED,
              ...dsfData,
              lastGeneratedAt: new Date(),
            },
          });
        } else {
          // Create new
          dsf = await tx.dSF.create({
            data: {
              folderId,
              status: DSFStatus.GENERATED,
              ...dsfData,
              lastGeneratedAt: new Date(),
            },
          });

          // Update folder status only on first creation
          await tx.folder.update({
            where: { id: folderId },
            data: { status: FolderStatus.DSF_GENERATED },
          });
        }
        return dsf;
      });

      // 6. Final Response
      res.json({
        message: "DSF généré avec succès",
        dsf: {
          id: result.id,
          status: result.status,
          lastGeneratedAt: result.lastGeneratedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getDSF = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { folderId } = req.params;

      const dsf = await prisma.dSF.findUnique({
        where: { folderId },
        include: {
          folder: {
            include: {
              client: true,
              balances: {
                include: {
                  equilibrium: true,
                  fixedAssets: true,
                },
              },
            },
          },
          coherenceControl: true,
        },
      });

      if (!dsf) {
        throw new NotFoundError("DSF not found for this exercise");
      }

      res.json({ dsf });
    } catch (error) {
      next(error);
    }
  };

  validateDSF = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const dsf = await prisma.dSF.findUnique({
        where: { id },
        include: {
          folder: {
            include: {
              client: true,
              balances: {
                include: {
                  equilibrium: true,
                  fixedAssets: true,
                },
              },
            },
          },
        },
      });

      if (!dsf) {
        throw new NotFoundError("DSF not found");
      }

      // Type assertion pour la cohérence des types
      const dsfWithRelations = {
        ...dsf,
        folder: dsf.folder as unknown as FolderWithFullRelations,
      };

      // Perform coherence control
      const coherenceResult =
        await this.dsfGenerator.performCoherenceControl(dsfWithRelations);

      // Update or create coherence control
      await prisma.coherenceControl.upsert({
        where: { dsfId: id },
        create: {
          dsfId: id,
          isCoherent: coherenceResult.isCoherent,
          issues: coherenceResult.issues,
          performedAt: new Date(),
        },
        update: {
          isCoherent: coherenceResult.isCoherent,
          issues: coherenceResult.issues,
          performedAt: new Date(),
        },
      });

      // Update DSF status
      await prisma.dSF.update({
        where: { id },
        data: {
          status: coherenceResult.isCoherent
            ? DSFStatus.VALID
            : DSFStatus.VALIDATING,
        },
      });

      // Update folder status if valid
      if (coherenceResult.isCoherent) {
        await prisma.folder.update({
          where: { id: dsf.folderId },
          data: { status: FolderStatus.DSF_VALIDATED },
        });
      }

      res.json({
        message: "DSF validation completed",
        isValid: coherenceResult.isCoherent,
        issues: coherenceResult.issues,
      });
    } catch (error) {
      next(error);
    }
  };

  exportDSF = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { format } = req.query;

      const dsf = await prisma.dSF.findUnique({
        where: { id },
        include: {
          folder: {
            include: {
              client: true,
              balances: {
                include: {
                  equilibrium: true,
                  fixedAssets: true,
                },
              },
            },
          },
        },
      });

      if (!dsf) {
        throw new NotFoundError("DSF not found");
      }

      if (dsf.status !== DSFStatus.VALID) {
        throw new BadRequestError("DSF must be validated before export");
      }

      // Type assertion pour l'export
      const dsfWithRelations = {
        ...dsf,
        folder: dsf.folder as unknown as FolderWithFullRelations,
      };

      // Generate Excel file
      const filePath = await this.dsfGenerator.exportToExcel(dsfWithRelations);

      // Update DSF status
      await prisma.dSF.update({
        where: { id },
        data: { status: DSFStatus.EXPORTED },
      });

      res.json({
        message: "DSF exported successfully",
        downloadUrl: `/api/files/download/${config.upload.subDirectories.exports}/${path.basename(filePath)}`,
      });
    } catch (error) {
      next(error);
    }
  };

  updateDSF = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { reports } = req.body;

      const dsf = await prisma.dSF.findUnique({
        where: { id },
        include: {
          folder: true,
        },
      });

      if (!dsf) {
        throw new NotFoundError("DSF not found");
      }

      // Verify ownership (check both direct user and folder owner)
      const userId = req.user?.userId!;
      if (dsf.userId !== userId && dsf.folder.ownerId !== userId) {
        throw new BadRequestError(
          "You don't have permission to update this DSF",
        );
      }

      // Update reports array
      if (reports && Array.isArray(reports)) {
        // Merge with existing reports or replace completely
        const currentReports = (dsf.reports as any[]) || [];
        const updatedReports = [...currentReports];

        // Update or add reports based on type
        reports.forEach((newReport: any) => {
          const existingIndex = updatedReports.findIndex(
            (r) => r.type === newReport.type,
          );

          if (existingIndex !== -1) {
            // Update existing report
            updatedReports[existingIndex] = {
              ...updatedReports[existingIndex],
              data: {
                ...updatedReports[existingIndex].data,
                ...newReport.data,
              },
            };
          } else {
            // Add new report
            updatedReports.push(newReport);
          }
        });

        await prisma.dSF.update({
          where: { id },
          data: {
            reports: updatedReports as any,
            lastGeneratedAt: new Date(),
            userId: dsf.userId || userId, // Set userId if not already set
          },
        });
      }

      res.json({
        message: "DSF updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getCoherenceReport = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      const coherenceControl = await prisma.coherenceControl.findUnique({
        where: { dsfId: id },
        include: {
          dsf: {
            include: {
              folder: {
                include: {
                  client: true,
                },
              },
            },
          },
        },
      });

      if (!coherenceControl) {
        throw new NotFoundError(
          "Coherence control not found. Please validate DSF first.",
        );
      }

      res.json({ coherenceControl });
    } catch (error) {
      next(error);
    }
  };

  importDSF = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { folderId } = req.body;
      const file = req.files && "file" in req.files ? req.files.file[0] : null;

      if (!folderId) {
        throw new BadRequestError("Folder ID is required");
      }

      if (!file) {
        throw new BadRequestError("DSF file is required");
      }

      // Verify folder ownership
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        include: { client: true },
      });

      if (!folder) {
        throw new NotFoundError("Exercise not found");
      }

      if (folder.ownerId !== req.user?.userId) {
        throw new BadRequestError(
          "You don't have permission to import DSF for this exercise",
        );
      }

      // Validate DSF file
      const validationResult = await this.dsfValidationService.validateDSFFile(
        file.path,
      );
      if (!validationResult.isValid) {
        // Clean up uploaded file
        await fs.unlink(file.path).catch(() => {}); // Ignore cleanup errors
        throw new BadRequestError(
          `DSF validation failed: ${validationResult.errors.join(", ")}`,
        );
      }

      // Parse Excel file
      const workbook = XLSX.readFile(file.path);

      // Extract data using validation service
      const extractedData = this.dsfValidationService.extractDSFData(workbook);
      const { balanceSheet, incomeStatement, taxTables, notes: rawNotes, signaletics } = extractedData;

      console.log("DSF Import - Extracted data:", {
        hasBalanceSheet: !!balanceSheet,
        hasIncomeStatement: !!incomeStatement,
        hasTaxTables: !!taxTables,
        hasNotes: !!rawNotes,
        hasSignaletics: !!signaletics,
        notesKeys: rawNotes ? Object.keys(rawNotes) : [],
        signaleticsKeys: signaletics ? Object.keys(signaletics) : [],
      });

      // If we have balance data, generate processed DSF data
      let processedData: any = {};
      if (balanceSheet || incomeStatement) {
        console.log("DSF Import - Generating processed data from extracted balance");
        // Create mock folder with extracted data
        const mockFolder = {
          id: folderId,
          client: folder.client,
          balances: [{
            type: BalanceType.CURRENT_YEAR,
            equilibrium: balanceSheet ? { data: balanceSheet } : null,
            fixedAssets: null,
            status: BalanceStatus.PROCESSED,
          }],
        } as unknown as FolderWithFullRelations;

        const reports = await this.dsfGenerator.generate(mockFolder);
        processedData = this.convertReportsToDSFData(reports);
      } else if (rawNotes || signaletics) {
        // Fallback to raw data if no balance
        console.log("DSF Import - Using raw extracted data");
        processedData = this.convertRawDataToDSFData(rawNotes, signaletics);
      } else {
        throw new BadRequestError(
          "DSF file must contain balance data or notes/signaletics data",
        );
      }

      // Sanitize processedData for database storage
      const sanitizeForDB = (data: any) => {
        if (data === null || data === undefined) return null;
        if (typeof data === "object" && !Array.isArray(data)) {
          const sanitized: any = {};
          for (const [key, value] of Object.entries(data)) {
            if (value !== null && value !== undefined) {
              sanitized[key] = sanitizeForDB(value);
            }
          }
          return Object.keys(sanitized).length > 0 ? sanitized : null;
        }
        if (Array.isArray(data)) {
          return data.filter((item) => item !== null && item !== undefined);
        }
        return data;
      };

      const sanitizedData = sanitizeForDB(processedData);

      console.log("DSF Import - Processed data keys:", Object.keys(processedData));
      console.log("DSF Import - Sanitized data keys:", Object.keys(sanitizedData || {}));

      // Check if DSF already exists
      let dsf = await prisma.dSF.findUnique({
        where: { folderId },
      });

      if (dsf) {
        // Update existing DSF
        dsf = await prisma.dSF.update({
          where: { id: dsf.id },
          data: {
            status: DSFStatus.GENERATED,
            isImported: true,
            ...(sanitizedData || {}),
            lastGeneratedAt: new Date(),
          },
        });
      } else {
        // Create new DSF
        dsf = await prisma.dSF.create({
          data: {
            folderId,
            isImported: true,
            status: DSFStatus.GENERATED,
            ...(sanitizedData || {}),
            lastGeneratedAt: new Date(),
          },
        });

        // Update folder status
        await prisma.folder.update({
          where: { id: folderId },
          data: { status: FolderStatus.DSF_GENERATED },
        });
      }

      res.json({
        message: "DSF imported successfully",
        dsf: {
          id: dsf.id,
          status: dsf.status,
          lastGeneratedAt: dsf.lastGeneratedAt,
        },
      });

      await fs.unlink(file.path).catch(() => {});
    } catch (error) {
      next(error);
    }
  };

  private convertReportsToDSFData(reports: any[]): any {
    const dsfData: any = {};
    if (Array.isArray(reports)) {
      reports.forEach((report: any) => {
        if (report.type && report.data) {
          switch (report.type) {
            case "BALANCE_SHEET":
              dsfData.bilan_paysage = report.data;
              break;
            case "INCOME_STATEMENT":
              dsfData.compte_de_resultat = report.data;
              break;
            case "TAX_TABLES":
              dsfData.statistiques_et_syntheses = report.data;
              break;
            case "SIGNALETICS":
              dsfData.informations_generales = report.data;
              break;
            case "NOTES":
              if (report.data && typeof report.data === "object") {
                Object.entries(report.data).forEach(([noteKey, noteData]) => {
                  if (noteData) {
                    dsfData[noteKey] = noteData;
                  }
                });
              }
              break;
            default:
              break;
          }
        }
      });
    }
    dsfData.reports = reports;
    return dsfData;
  }

  private convertRawDataToDSFData(rawNotes: any, signaletics: any): any {
    const sanitizeForDB = (data: any) => {
      if (data === null || data === undefined) return null;
      if (typeof data === "object" && !Array.isArray(data)) {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(data)) {
          if (value !== null && value !== undefined) {
            sanitized[key] = sanitizeForDB(value);
          }
        }
        return Object.keys(sanitized).length > 0 ? sanitized : null;
      }
      if (Array.isArray(data)) {
        return data.filter((item) => item !== null && item !== undefined);
      }
      return data;
    };

    const validFields = [
      "note1", "note2", "note3a", "note3b", "note3c", "note3d", "note3e", "note3f",
      "note4", "note5", "note6", "note7", "note8", "note9", "note10", "note11",
      "note12", "note13", "note14", "note15a", "note15b", "note16a", "note16b",
      "note16b_bis", "note16c", "note17", "note17_c1", "note18", "note19", "note20",
      "note21", "note22", "note23", "note24", "note25", "note25_c1", "note25_c2",
      "note26", "note27a", "note27b", "note28", "note28_c1", "note28_c2", "note29",
      "note30", "note31", "note32", "note33", "note34", "fiche1", "fiche2", "fiche3",
      "cter", "cf1", "cf1_bis", "cf1_ter", "cf1_quater", "cf2", "cf2_bis", "cf2_ter",
      "impot21", "impot22", "bilan_actif", "bilan_passif", "charges", "produits",
      "compte_general_pertes_profits", "etat_c4", "etat_c11", "etat_c11_vie",
      "annexe6", "ass1", "ass2", "ass3", "ass4", "ass5", "ass6", "ass7", "ass8",
      "ass9", "ass10", "ass11", "declaration_annuel", "sommes_verse", "tva",
      "versements", "tableau30", "tableau31", "tableau32", "tableau33", "tableau34",
      "tableau35a", "tableau35b", "tableau36", "tableau37", "tableau38", "tableau39",
      "tableau40", "tableau41a", "tableau41b", "tableau42", "tableau43a", "tableau43b",
      "tableau44a", "grille_analyse_notes_smt", "mod_bilan", "note1_smt", "note2_smt",
      "note3_smt", "note4_smt", "note5_smt", "note6_smt", "t1", "t1_bis", "t1_ter",
      "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"
    ];

    const mappedData: any = {};

    if (rawNotes) {
      Object.entries(rawNotes).forEach(([key, value]) => {
        if (validFields.includes(key) && value !== null && value !== undefined) {
          const sanitized = sanitizeForDB(value);
          if (sanitized !== null) {
            mappedData[key] = sanitized;
          }
        }
      });
    }

    if (signaletics) {
      Object.entries(signaletics).forEach(([key, value]) => {
        if (validFields.includes(key) && value !== null && value !== undefined) {
          const sanitized = sanitizeForDB(value);
          if (sanitized !== null) {
            mappedData[key] = sanitized;
          }
        }
      });
    }

    return mappedData;
  }
}

export const dsfController = new DSFController();
