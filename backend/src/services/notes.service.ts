// backend/src/services/notes.service.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Map note numbers to DSF field names
const NOTE_NUMBER_TO_FIELD: Record<string, string> = {
  "1": "note1",
  "2": "note2",
  "3A": "note3a",
  "3B": "note3b",
  "3C": "note3c",
  "3C_C01": "note3c_c01",
  "3D": "note3d",
  "3E": "note3e",
  "3F": "note3f",
  "4": "note4",
  "5": "note5",
  "6": "note6",
  "7": "note7",
  "8": "note8",
  "9": "note9",
  "10": "note10",
  "11": "note11",
  "12": "note12",
  "13": "note13",
  "14": "note14",
  "15A": "note15a",
  "15B": "note15b",
  "16A": "note16a",
  "16B": "note16b",
  "16B bis": "note16b_bis",
  "16C": "note16c",
  "17": "note17",
  "C1/17": "note17_c1",
  "18": "note18",
  "19": "note19",
  "20": "note20",
  "23": "note23",
  "24": "note24",
  "25": "note25",
  "C1/25": "note25_c1",
  "C2/25": "note25_c2",
  "26": "note26",
  "28": "note28",
  "C1/28": "note28_c1",
  "C2/28": "note28_c2",
  "29": "note29",
  "30": "note30",
  "31": "note31",
  "32": "note32",
  "33": "note33",
  "34": "note34",
};

// Valid note numbers
const VALID_NOTE_NUMBERS = Object.keys(NOTE_NUMBER_TO_FIELD);

export interface NoteData {
  entete?: {
    entityName?: string | null;
    fiscalYear?: string | null;
    idNumber?: string | null;
    duration?: string | null;
  };
  [key: string]: any;
}

export class NotesService {
  /**
   * Get DSF field name from note number
   */
  private getFieldName(noteNumber: string): string | null {
    return NOTE_NUMBER_TO_FIELD[noteNumber] || null;
  }

  /**
   * Save note data to database
   */
  async saveNoteData(
    folderId: string,
    noteNumber: string,
    data: any,
  ): Promise<any> {
    // Validate note number
    if (!VALID_NOTE_NUMBERS.includes(noteNumber)) {
      throw new Error(`Invalid note number: ${noteNumber}`);
    }

    const fieldName = this.getFieldName(noteNumber);
    if (!fieldName) {
      throw new Error(`Could not map note number ${noteNumber} to field name`);
    }

    // Check if folder exists
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      throw new Error(`Folder not found: ${folderId}`);
    }

    // Check if DSF record exists for this folder
    let dsf = await prisma.dSF.findUnique({
      where: { folderId },
    });

    if (dsf) {
      // Update existing DSF record with the note data
      const result = await prisma.dSF.update({
        where: { id: dsf.id },
        data: {
          [fieldName]: data as any,
          updatedAt: new Date(),
        },
      });
      return result;
    } else {
      // Create new DSF record with the note data
      const result = await prisma.dSF.create({
        data: {
          folderId,
          status: "DRAFT",
          [fieldName]: data as any,
        },
      });
      return result;
    }
  }

  /**
   * Get note data from database
   */
  async getNoteData(folderId: string, noteNumber: string): Promise<any> {
    // Validate note number
    if (!VALID_NOTE_NUMBERS.includes(noteNumber)) {
      throw new Error(`Invalid note number: ${noteNumber}`);
    }

    const fieldName = this.getFieldName(noteNumber);
    if (!fieldName) {
      throw new Error(`Could not map note number ${noteNumber} to field name`);
    }

    const dsf = await prisma.dSF.findUnique({
      where: { folderId },
      select: {
        [fieldName]: true,
      },
    });

    if (!dsf) {
      return null;
    }

    return (dsf as any)[fieldName] || null;
  }

  /**
   * Delete note from database (set to null)
   */
  async deleteNoteData(folderId: string, noteNumber: string): Promise<boolean> {
    // Validate note number
    if (!VALID_NOTE_NUMBERS.includes(noteNumber)) {
      throw new Error(`Invalid note number: ${noteNumber}`);
    }

    const fieldName = this.getFieldName(noteNumber);
    if (!fieldName) {
      throw new Error(`Could not map note number ${noteNumber} to field name`);
    }

    const dsf = await prisma.dSF.findUnique({
      where: { folderId },
    });

    if (!dsf) {
      return false;
    }

    // Set the note field to null
    await prisma.dSF.update({
      where: { id: dsf.id },
      data: {
        [fieldName]: null,
      },
    });

    return true;
  }

  /**
   * Get all notes for a folder
   */
  async getNotesForFolder(folderId: string): Promise<any[]> {
    const dsf = await prisma.dSF.findUnique({
      where: { folderId },
    });

    if (!dsf) {
      return [];
    }

    const notes: any[] = [];

    // Check each note field
    for (const [noteNumber, fieldName] of Object.entries(
      NOTE_NUMBER_TO_FIELD,
    )) {
      const data = (dsf as any)[fieldName];
      if (data) {
        notes.push({
          noteNumber,
          noteType: `NOTE${noteNumber}`,
          fieldName,
          data,
          exists: true,
        });
      }
    }

    return notes;
  }

  /**
   * Check if note exists
   */
  async noteExists(folderId: string, noteNumber: string): Promise<boolean> {
    if (!VALID_NOTE_NUMBERS.includes(noteNumber)) {
      return false;
    }

    const fieldName = this.getFieldName(noteNumber);
    if (!fieldName) {
      return false;
    }

    const dsf = await prisma.dSF.findUnique({
      where: { folderId },
      select: {
        [fieldName]: true,
      },
    });

    if (!dsf) {
      return false;
    }

    return !!(dsf as any)[fieldName];
  }

  /**
   * Validate note data structure (basic validation)
   */
  validateNoteData(
    noteNumber: string,
    data: any,
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data) {
      errors.push("Données manquantes");
      return { valid: false, errors };
    }

    // Check for entete
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

    // Note-specific validation
    switch (noteNumber) {
      case "1":
        if (!data.financialDebts) {
          errors.push("Les dettes financières sont requises");
        }
        break;
      case "3A":
        if (!data.immobilisationsIncorporelles) {
          errors.push("Les immobilisations incorporelles sont requises");
        }
        break;
      // Add more validations as needed
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const notesService = new NotesService();
