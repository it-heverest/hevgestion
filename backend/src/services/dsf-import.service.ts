// services/note-data.service.ts - Backend service for processing all notes in DSF model
import { prisma } from "../lib/prisma";

export interface ExtractionResult {
  noteName: string;
  success: boolean;
  data?: any;
  error?: string;
}

export class NoteDataService {
  /**
   * Process all extracted notes and save to DSF model
   */
  async processExtractedNotes(
    importId: string,
    folderId: string,
    extractionResults: ExtractionResult[],
    userId: string,
  ): Promise<{
    successful: string[];
    failed: Array<{ noteName: string; error: string }>;
    total: number;
  }> {
    const successful: string[] = [];
    const failed: Array<{ noteName: string; error: string }> = [];

    // Prepare note data object
    const noteData: any = {
      isImported: true,
      importId: importId,
      importedAt: new Date(),
      importedBy: userId,
    };

    // Process each extraction result
    for (const result of extractionResults) {
      if (!result.success || !result.data) {
        failed.push({
          noteName: result.noteName,
          error: result.error || "No data extracted",
        });
        continue;
      }

      try {
        const noteField = this.mapNoteNameToField(result.noteName);
        if (noteField) {
          // Transform and store the data
          const transformedData = this.transformNoteData(
            result.noteName,
            result.data,
          );
          noteData[noteField] = transformedData;
          successful.push(result.noteName);
        } else {
          failed.push({
            noteName: result.noteName,
            error: "Unknown note type",
          });
        }
      } catch (error: any) {
        failed.push({
          noteName: result.noteName,
          error: error.message || "Error processing data",
        });
      }
    }

    // Save or update DSF record
    try {
      await this.saveDSFNotes(folderId, noteData);
    } catch (error: any) {
      throw new Error(`Failed to save DSF notes: ${error.message}`);
    }

    return {
      successful,
      failed,
      total: extractionResults.length,
    };
  }

  /**
   * Map note name to DSF field name
   */
  private mapNoteNameToField(noteName: string): string | null {
    const mapping: { [key: string]: string } = {
      "NOTE 1": "note1",
      "NOTE 2": "note2",
      "NOTE 3A": "note3a",
      "NOTE 3B": "note3b",
      "NOTE 3C": "note3c",
      "NOTE 3D": "note3d",
      "NOTE 3E": "note3e",
      "NOTE 3F": "note3f",
      "NOTE 4": "note4",
      "NOTE 5": "note5",
      "NOTE 6": "note6",
      "NOTE 7": "note7",
      "NOTE 8": "note8",
    };

    return mapping[noteName] || null;
  }

  /**
   * Transform extracted data to structured format
   */
  private transformNoteData(noteName: string, extractedData: any): any {
    // Transform section data by combining libelles with lignes
    const transformSection = (sectionData: any) => {
      if (!sectionData || !sectionData.lignes) return [];

      return sectionData.lignes.map((ligne: any, index: number) => ({
        libelle: sectionData.libelles?.[index] || "",
        ...ligne,
      }));
    };

    const transformed: any = {
      entete: extractedData.entete,
      sections: {},
      extractedAt: new Date().toISOString(),
      noteType: noteName,
    };

    // Transform all sections
    if (extractedData.sections) {
      Object.keys(extractedData.sections).forEach((sectionKey) => {
        transformed.sections[sectionKey] = transformSection(
          extractedData.sections[sectionKey],
        );
      });
    }

    return transformed;
  }

  /**
   * Save or update DSF with note data
   */
  private async saveDSFNotes(folderId: string, noteData: any): Promise<void> {
    // Check if DSF exists
    const existingDSF = await prisma.dSF.findUnique({
      where: { folderId },
    });

    if (existingDSF) {
      // Update existing DSF
      await prisma.dSF.update({
        where: { folderId },
        data: {
          ...noteData,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new DSF
      await prisma.dSF.create({
        data: {
          folderId,
          status: "DRAFT",
          ...noteData,
        },
      });
    }
  }

  /**
   * Get specific note data from DSF
   */
  async getNoteData(folderId: string, noteNumber: string): Promise<any | null> {
    const noteField = this.mapNoteNumberToField(noteNumber);
    if (!noteField) {
      throw new Error(`Invalid note number: ${noteNumber}`);
    }

    const dsf = await prisma.dSF.findUnique({
      where: { folderId },
      select: {
        id: true,
        folderId: true,
        isImported: true,
        importId: true,
        importedAt: true,
        importedBy: true,
        [noteField]: true,
        updatedAt: true,
      },
    });

    if (!dsf) {
      return null;
    }

    return {
      noteData: (dsf as any)[noteField],
      metadata: {
        isImported: dsf.isImported,
        importId: dsf.importId,
        importedAt: dsf.importedAt,
        importedBy: dsf.importedBy,
        updatedAt: dsf.updatedAt,
      },
    };
  }

  /**
   * Get all notes data from DSF
   */
  async getAllNotesData(folderId: string): Promise<any | null> {
    const dsf = await prisma.dSF.findUnique({
      where: { folderId },
    });

    if (!dsf) {
      return null;
    }

    return {
      metadata: {
        isImported: dsf.isImported,
        importId: dsf.importId,
        importedAt: dsf.importedAt,
        importedBy: dsf.importedBy,
        status: dsf.status,
        lastGeneratedAt: dsf.lastGeneratedAt,
      },
      notes: {
        note1: dsf.note1,
        note2: dsf.note2,
        note3a: dsf.note3a,
        note3b: dsf.note3b,
        note3c: dsf.note3c,
        note3d: dsf.note3d,
        note3e: dsf.note3e,
        note3f: dsf.note3f,
        note4: dsf.note4,
        note5: dsf.note5,
        note6: dsf.note6,
        note7: dsf.note7,
        note8: dsf.note8,
      },
    };
  }

  /**
   * Map note number to DSF field name
   */
  private mapNoteNumberToField(noteNumber: string): string | null {
    const mapping: { [key: string]: string } = {
      "1": "note1",
      "2": "note2",
      "3A": "note3a",
      "3B": "note3b",
      "3C": "note3c",
      "3D": "note3d",
      "3E": "note3e",
      "3F": "note3f",
      "4": "note4",
      "5": "note5",
      "6": "note6",
      "7": "note7",
      "8": "note8",
    };

    return mapping[noteNumber] || null;
  }

  /**
   * Update specific note data in DSF
   */
  async updateNoteData(
    folderId: string,
    noteNumber: string,
    data: any,
  ): Promise<void> {
    const noteField = this.mapNoteNumberToField(noteNumber);
    if (!noteField) {
      throw new Error(`Invalid note number: ${noteNumber}`);
    }

    // Check if DSF exists
    const existingDSF = await prisma.dSF.findUnique({
      where: { folderId },
    });

    if (!existingDSF) {
      throw new Error("DSF not found for this folder");
    }

    // Update the specific note field
    await prisma.dSF.update({
      where: { folderId },
      data: {
        [noteField]: {
          ...data,
          updatedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Mark DSF as generated (not imported)
   */
  async markAsGenerated(folderId: string, userId: string): Promise<void> {
    await prisma.dSF.update({
      where: { folderId },
      data: {
        isImported: false,
        importId: null,
        importedAt: null,
        importedBy: null,
        lastGeneratedAt: new Date(),
        userId: userId,
        status: "GENERATED",
      },
    });
  }

  /**
   * Check if DSF exists and whether it's imported or generated
   */
  async getDSFStatus(folderId: string): Promise<{
    exists: boolean;
    isImported: boolean;
    importId?: string;
    importedAt?: Date;
    status?: string;
  } | null> {
    const dsf = await prisma.dSF.findUnique({
      where: { folderId },
      select: {
        id: true,
        isImported: true,
        importId: true,
        importedAt: true,
        status: true,
      },
    });

    if (!dsf) {
      return { exists: false, isImported: false };
    }

    return {
      exists: true,
      isImported: dsf.isImported,
      importId: dsf.importId || undefined,
      importedAt: dsf.importedAt || undefined,
      status: dsf.status,
    };
  }

  /**
   * Efface le contenu d'une note. Le contenu précédent est archivé en
   * corbeille avant l'effacement: rien n'est réellement perdu, un
   * administrateur peut le restaurer.
   */
  async deleteNoteData(
    folderId: string,
    noteNumber: string,
    deletedById?: string,
  ): Promise<void> {
    const noteField = this.mapNoteNumberToField(noteNumber);
    if (!noteField) {
      throw new Error(`Invalid note number: ${noteNumber}`);
    }

    const dsf = await prisma.dSF.findUnique({ where: { folderId } });
    const previousContent = dsf ? (dsf as any)[noteField] : null;

    if (dsf && previousContent && deletedById) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { clientId: true, name: true, fiscalYear: true },
      });

      await prisma.deletedRecord.create({
        data: {
          entityType: "DSFNote",
          entityId: `${dsf.id}:${noteField}`,
          label: `Note ${noteNumber} — ${folder?.name ?? folderId} (exercice ${folder?.fiscalYear ?? "?"})`,
          payload: {
            dsfId: dsf.id,
            fieldName: noteField,
            noteNumber,
            content: previousContent,
          },
          clientId: folder?.clientId ?? null,
          folderId,
          deletedById,
        },
      });
    }

    await prisma.dSF.update({
      where: { folderId },
      data: {
        [noteField]: null,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Validate note data structure
   */
  validateNoteData(
    noteNumber: string,
    data: any,
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data) {
      errors.push("Données manquantes");
      return { valid: false, errors };
    }

    if (!data.entete) {
      errors.push("En-tête manquant");
    } else {
      if (!data.entete.entityName) {
        errors.push("Le nom de l'entité est requis");
      }
      if (!data.entete.fiscalYear) {
        errors.push("L'exercice fiscal est requis");
      }
    }

    if (!data.sections || Object.keys(data.sections).length === 0) {
      errors.push("Aucune section de données trouvée");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
