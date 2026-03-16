/**
 * DGI Notes API Service
 *
 * Maps all DSF notes to their corresponding DGI API endpoints.
 * Each note can be submitted, updated, or deleted via the API.
 *
 * Page names for DGI API:
 * - etats-financiers (Page de Garde)
 * - fiche-r1 (Fiche R1)
 * - note1 through note34
 * - Various combo notes (note3c-co1, note16b-bis, note17-c1, etc.)
 */

import { dgiClient } from "./dgi-api-client";
import { DGIPageResponse, DGIGrilleAnalyseData } from "./dgi-api-client";

// ============================================
// Note Names (matching DGI API page names)
// ============================================

export type DGINoteName =
  // Basic notes
  | "note1"
  | "note2"
  | "note3"
  | "note4"
  | "note5"
  | "note6"
  | "note7"
  | "note8"
  | "note9"
  | "note10"
  | "note11"
  | "note12"
  | "note13"
  | "note14"
  | "note15"
  | "note16"
  | "note17"
  | "note18"
  | "note19"
  | "note20"
  | "note21"
  | "note22"
  | "note23"
  | "note24"
  | "note25"
  | "note26"
  | "note27"
  | "note28"
  | "note29"
  | "note30"
  | "note31"
  | "note32"
  | "note33"
  | "note34"
  // Extended notes (3A-3F)
  | "note3a"
  | "note3b"
  | "note3c"
  | "note3d"
  | "note3e"
  | "note3f"
  | "note3c-co1"
  // Special notes
  | "note15a"
  | "note15b"
  | "note16a"
  | "note16b"
  | "note16b-bis"
  | "note16c"
  | "note17-c1"
  | "note25-c1"
  | "note25-c2"
  | "note28-c1"
  | "note28-c2"
  // Cover pages
  | "etats-financiers"
  | "fiche-r1"
  | "fiche-r2"
  | "grilledanalyse";

// Note ID to API page name mapping
export const NOTE_TO_API_PAGE: Record<string, DGINoteName> = {
  "1": "note1",
  "2": "note2",
  "3A": "note3a",
  "3B": "note3b",
  "3C": "note3c",
  "3C_C01": "note3c-co1",
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
  "16B bis": "note16b-bis",
  "16C": "note16c",
  "17": "note17",
  "C1/17": "note17-c1",
  "18": "note18",
  "19": "note19",
  "20": "note20",
  "21": "note21",
  "22": "note22",
  "23": "note23",
  "24": "note24",
  "25": "note25",
  "C1/25": "note25-c1",
  "C2/25": "note25-c2",
  "26": "note26",
  "27": "note27",
  "28": "note28",
  "C1/28": "note28-c1",
  "C2/28": "note28-c2",
  "29": "note29",
  "30": "note30",
  "31": "note31",
  "32": "note32",
  "33": "note33",
  "34": "note34",
  // Cover pages
  etatsFinanciers: "etats-financiers",
  ficheR1: "fiche-r1",
  ficheR2: "fiche-r2",
  grilleAnalyse: "grilledanalyse",
};

// ============================================
// DGI Notes Service Class
// ============================================

export class DGINotesService {
  /**
   * Get the API page name for a note ID
   */
  getApiPageName(noteId: string): DGINoteName {
    return NOTE_TO_API_PAGE[noteId] || `note${noteId.toLowerCase()}`;
  }

  /**
   * Submit a note to DGI (full replacement)
   * PUT /process/:declaration_id/:note_page
   */
  async submitNote(
    userId: string,
    declarationId: string,
    noteId: string,
    noteData: Record<string, any>,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // First authenticate
      await this.authenticate(userId);

      const pageName = this.getApiPageName(noteId);
      const result = await dgiClient.fillDeclarationPage(
        declarationId,
        pageName,
        noteData as any,
      );

      return { success: true, message: result.status };
    } catch (error: any) {
      console.error(`[DGI] Failed to submit note ${noteId}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Update a note in DGI (partial update)
   * PATCH /process/:declaration_id/:note_page
   */
  async updateNote(
    userId: string,
    declarationId: string,
    noteId: string,
    noteData: Record<string, any>,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.authenticate(userId);

      const pageName = this.getApiPageName(noteId);
      const result = await dgiClient.updateDeclarationPage(
        declarationId,
        pageName,
        noteData as any,
      );

      return { success: true, message: result.status };
    } catch (error: any) {
      console.error(`[DGI] Failed to update note ${noteId}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Delete a note from DGI
   * DELETE /process/:declaration_id/:note_page
   */
  async deleteNote(
    userId: string,
    declarationId: string,
    noteId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.authenticate(userId);

      const pageName = this.getApiPageName(noteId);
      const result = await dgiClient.deleteDeclarationPage(
        declarationId,
        pageName,
      );

      return { success: true, message: result.status };
    } catch (error: any) {
      console.error(`[DGI] Failed to delete note ${noteId}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  // ========================================
  // Individual Note Methods (for convenience)
  // ========================================

  /**
   * Submit Note 1
   */
  async submitNote1(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "1", data);
  }

  /**
   * Submit Note 2
   */
  async submitNote2(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "2", data);
  }

  /**
   * Submit Note 3A
   */
  async submitNote3A(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "3A", data);
  }

  /**
   * Submit Note 3B
   */
  async submitNote3B(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "3B", data);
  }

  /**
   * Submit Note 3C
   */
  async submitNote3C(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "3C", data);
  }

  /**
   * Submit Note 3C C01
   */
  async submitNote3CC01(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "3C_C01", data);
  }

  /**
   * Submit Note 3D
   */
  async submitNote3D(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "3D", data);
  }

  /**
   * Submit Note 3E
   */
  async submitNote3E(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "3E", data);
  }

  /**
   * Submit Note 3F
   */
  async submitNote3F(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "3F", data);
  }

  /**
   * Submit Note 4-34
   */
  async submitNote4(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "4", data);
  }
  async submitNote5(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "5", data);
  }
  async submitNote6(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "6", data);
  }
  async submitNote7(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "7", data);
  }
  async submitNote8(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "8", data);
  }
  async submitNote9(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "9", data);
  }
  async submitNote10(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "10", data);
  }
  async submitNote11(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "11", data);
  }
  async submitNote12(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "12", data);
  }
  async submitNote13(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "13", data);
  }
  async submitNote14(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "14", data);
  }
  async submitNote15A(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "15A", data);
  }
  async submitNote15B(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "15B", data);
  }
  async submitNote16A(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "16A", data);
  }
  async submitNote16B(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "16B", data);
  }
  async submitNote16BBis(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "16B bis", data);
  }
  async submitNote16C(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "16C", data);
  }
  async submitNote17(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "17", data);
  }
  async submitNoteC117(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "C1/17", data);
  }
  async submitNote18(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "18", data);
  }
  async submitNote19(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "19", data);
  }
  async submitNote20(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "20", data);
  }
  async submitNote23(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "23", data);
  }
  async submitNote24(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "24", data);
  }
  async submitNote25(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "25", data);
  }
  async submitNoteC125(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "C1/25", data);
  }
  async submitNoteC225(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "C2/25", data);
  }
  async submitNote26(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "26", data);
  }
  async submitNote28(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "28", data);
  }
  async submitNoteC128(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "C1/28", data);
  }
  async submitNoteC228(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "C2/28", data);
  }
  async submitNote29(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "29", data);
  }
  async submitNote30(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "30", data);
  }
  async submitNote31(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "31", data);
  }
  async submitNote32(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "32", data);
  }
  async submitNote33(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "33", data);
  }
  async submitNote34(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "34", data);
  }

  /**
   * Submit Page de Garde (etats-financiers)
   */
  async submitEtatsFinanciers(
    userId: string,
    declarationId: string,
    data: any,
  ) {
    return this.submitNote(userId, declarationId, "etatsFinanciers", data);
  }

  /**
   * Submit Fiche R1
   */
  async submitFicheR1(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "ficheR1", data);
  }

  /**
   * Submit Fiche R2
   */
  async submitFicheR2(userId: string, declarationId: string, data: any) {
    return this.submitNote(userId, declarationId, "ficheR2", data);
  }

  /**
   * Submit Grille Analyse (Analysis Grid) - Full replace
   * WARNING: This will wipe all existing data!
   */
  async submitGrilleAnalyse(
    userId: string,
    declarationId: string,
    data: DGIGrilleAnalyseData
  ) {
    try {
      await this.authenticate(userId);
      return await dgiClient.submitGrilleAnalyse(declarationId, data);
    } catch (error: any) {
      console.error(`[DGI] Failed to submit grille analyse:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Update Grille Analyse (Analysis Grid) - Partial update
   */
  async updateGrilleAnalyse(
    userId: string,
    declarationId: string,
    data: Partial<DGIGrilleAnalyseData>
  ) {
    try {
      await this.authenticate(userId);
      return await dgiClient.updateGrilleAnalyse(declarationId, data);
    } catch (error: any) {
      console.error(`[DGI] Failed to update grille analyse:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Delete Grille Analyse (Analysis Grid)
   */
  async deleteGrilleAnalyse(userId: string, declarationId: string) {
    try {
      await this.authenticate(userId);
      return await dgiClient.deleteGrilleAnalyse(declarationId);
    } catch (error: any) {
      console.error(`[DGI] Failed to delete grille analyse:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Submit Grille Analyse using generic note method
   * Uses the "grilleAnalyse" noteId
   */
  async submitGrilleAnalyseByNoteId(
    userId: string,
    declarationId: string,
    data: DGIGrilleAnalyseData
  ) {
    return this.submitNote(userId, declarationId, "grilleAnalyse", data);
  }

  /**
   * Update Grille Analyse using generic note method
   */
  async updateGrilleAnalyseByNoteId(
    userId: string,
    declarationId: string,
    data: Partial<DGIGrilleAnalyseData>
  ) {
    return this.updateNote(userId, declarationId, "grilleAnalyse", data);
  }

  /**
   * Delete Grille Analyse using generic note method
   */
  async deleteGrilleAnalyseByNoteId(userId: string, declarationId: string) {
    return this.deleteNote(userId, declarationId, "grilleAnalyse");
  }

  // ========================================
  // Submit all notes at once
  // ========================================

  /**
   * Submit all notes for a declaration
   * Takes a record of noteId -> noteData
   */
  async submitAllNotes(
    userId: string,
    declarationId: string,
    notesData: Record<string, any>,
  ): Promise<{ success: boolean; results: Record<string, any> }> {
    const results: Record<string, any> = {};
    let allSuccess = true;

    for (const [noteId, noteData] of Object.entries(notesData)) {
      const result = await this.submitNote(
        userId,
        declarationId,
        noteId,
        noteData,
      );
      results[noteId] = result;
      if (!result.success) {
        allSuccess = false;
      }
    }

    return { success: allSuccess, results };
  }

  // ========================================
  // Private helper
  // ========================================

  private async authenticate(userId: string): Promise<void> {
    const { dgiService } = await import("./dgi-integration.service");
    await dgiService.authenticateWithStoredCredentials(userId);
  }
}

// ============================================
// Singleton Instance
// ============================================

export const dgiNotesService = new DGINotesService();
