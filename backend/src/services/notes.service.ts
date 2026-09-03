// backend/src/services/notes.service.ts
import { PrismaClient } from "@prisma/client";
import { trashService } from "./trash.service";

const prisma = new PrismaClient();

// Map note numbers to DSF field names
const NOTE_NUMBER_TO_FIELD: Record<string, string> = {
  "1": "note1",
  "2": "note2",
  "3A": "note3a",
  "3B": "note3b",
  "3C": "note3c",
  "3C_C01": "note3c_co1",
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
  "21": "note21",
  "22": "note22",
  "23": "note23",
  "24": "note24",
  "25": "note25",
  "C1/25": "note25_c1",
  "C2/25": "note25_c2",
  "26": "note26",
  "27A": "note27a",
  "C1/27A": "note27a_c1",
  "27B": "note27b",
  "28": "note28",
  "C1/28": "note28_c1",
  "C2/28": "note28_c2",
  "29": "note29",
  "30": "note30",
  "31": "note31",
  "32": "note32",
  "33": "note33",
  "34": "note34",
  "35": "note35",
  "flux-tresorerie": "tableau_des_flux_tresorerie",
  "cf1": "cf1",
  "cf1bis": "cf1_bis",
  "cf1ter": "cf1_ter",
  "cf1quater": "cf1_quater",
  "cf2": "cf2",
  "cf2bis": "cf2_bis",
  "cf2ter": "cf2_ter",
  "bilan-paysage": "bilan_paysage",
  "grille-analyse-notes": "grille_analyse_des_notes",
  // Fiches d'identification du régime normal. La DSF officielle en compte
  // exactement trois (onglets « Fiche R1 », « Fiche R2 », « Fiche R3 »): les
  // colonnes fiche1/fiche2/fiche3 du modèle DSF, jusque-là jamais écrites,
  // les portent. À ne pas confondre avec les fiches 1 à 5 du régime Assurance.
  R1: "fiche1",
  R2: "fiche2",
  R3: "fiche3",
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
  private getFieldName(noteNumber: string): string | null {
    return NOTE_NUMBER_TO_FIELD[noteNumber] || null;
  }

  /**
   * Strip OHADA form template placeholder strings from entete fields.
   * Values like "Numéro d'identification : ………………" are static UI labels
   * that got stored as data — they add noise and payload without value.
   */
  private cleanEntete(data: any): any {
    if (!data?.entete) return data;
    const clean = { ...data, entete: { ...data.entete } };
    const PLACEHOLDER = /[…\.]{4,}/;
    for (const key of ["idNumber", "entityName", "duration", "fiscalYear"] as const) {
      const v = clean.entete[key];
      if (typeof v === "string" && PLACEHOLDER.test(v)) {
        clean.entete[key] = null;
      }
    }
    return clean;
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

    if (!dsf) return null;

    const raw = (dsf as any)[fieldName];
    return raw ? this.cleanEntete(raw) : null;
  }

  /**
   * Efface le contenu d'une note. Le contenu précédent est d'abord archivé en
   * corbeille (rien n'est réellement perdu): un administrateur peut le
   * consulter et le réinjecter si l'effacement était une erreur.
   */
  async deleteNoteData(
    folderId: string,
    noteNumber: string,
    deletedById?: string,
  ): Promise<boolean> {
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

    const previousContent = (dsf as any)[fieldName];

    // On n'archive que s'il y avait effectivement quelque chose à perdre.
    if (previousContent && deletedById) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { clientId: true, name: true, fiscalYear: true },
      });

      await prisma.deletedRecord.create({
        data: {
          entityType: "DSFNote",
          entityId: `${dsf.id}:${fieldName}`,
          label: `Note ${noteNumber} — ${folder?.name ?? folderId} (exercice ${folder?.fiscalYear ?? "?"})`,
          payload: { dsfId: dsf.id, fieldName, noteNumber, content: previousContent },
          clientId: folder?.clientId ?? null,
          folderId,
          deletedById,
        },
      });
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
      let data = (dsf as any)[fieldName];
      if (data) {
        // If data is an array (from raw import), try to convert to object
        if (Array.isArray(data) && data.length > 0) {
          const converted = this.convertArrayToObject(data);
          if (converted) {
            data = converted;
          }
        }
        notes.push({
          noteNumber,
          exists: true,
          data: this.cleanEntete(data),
        });
      }
    }

    return notes;
  }

  private convertArrayToObject(arrayData: any[]): any {
    if (!Array.isArray(arrayData) || arrayData.length === 0) return null;

    // Try different conversion strategies
    const firstRow = arrayData[0];
    if (Array.isArray(firstRow) && firstRow.length >= 2) {
      // Assume first row has headers, second has values
      if (arrayData.length >= 2) {
        const headers = firstRow.map(h => String(h || '').trim());
        const values = arrayData[1];
        const obj: any = {};
        headers.forEach((header, index) => {
          if (header && values[index] !== undefined) {
            obj[header] = values[index];
          }
        });
        return Object.keys(obj).length > 0 ? obj : null;
      }
      // If only one row, assume it's key-value pairs
      const obj: any = {};
      firstRow.forEach((item, index) => {
        if (item !== null && item !== undefined) {
          obj[`col${index}`] = item;
        }
      });
      return Object.keys(obj).length > 0 ? obj : null;
    }

    // If not array of arrays, return as is or try to flatten
    return arrayData;
  }

  async isNoteFilled(folderId: string, noteNumber: string): Promise<boolean> {
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
   * Delete DSF data for a folder
   */
  /**
   * Supprime l'intégralité de la DSF d'un dossier.
   *
   * C'est le chemin emprunté par le bouton « Supprimer la DSF » de l'écran
   * Rapports. La DSF est archivée en corbeille avant retrait: rien n'est
   * réellement perdu, un administrateur peut la restaurer.
   */
  async deleteDSFForFolder(
    folderId: string,
    deletedById?: string,
    reason?: string,
  ): Promise<boolean> {
    const dsf = await prisma.dSF.findUnique({
      where: { folderId },
    });

    if (!dsf) {
      return false;
    }

    if (deletedById) {
      await trashService.archiveAndDelete("DSF", dsf.id, deletedById, reason);
    } else {
      // Appel hors contexte utilisateur (script, tâche planifiée): sans
      // auteur identifiable, la corbeille ne peut pas être renseignée.
      await prisma.dSF.delete({ where: { id: dsf.id } });
    }

    return true;
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
