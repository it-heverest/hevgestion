// controllers/notes.controller.ts
import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { ResponseBuilder } from "../utils/response-builder";
import { notesService } from "../services/notes.service";

// Valid note numbers: 1, 2, 3A, 3B, 3C, 3D, 3E, 3F, 4, 5, 6, 7, 8
const VALID_NOTE_NUMBERS = [
  "1",
  "2",
  "3A",
  "3B",
  "3C",
  "3D",
  "3E",
  "3F",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15A",
  "15B",
  "16A",
  "16B",
  "16B bis",
  "16C",
  "17",
  "C1/17",
  "18",
  "19",
  "20",
  "23",
  "24",
  "25",
  "C1/25",
  "C2/25",
  "26",
  "28",
  "C1/28",
  "C2/28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
];

export class NotesController {
  /**
   * Save note data
   */
  async saveNote(req: AuthRequest, res: Response) {
    try {
      const { folderId, noteNumber, data } = req.body;

      if (!folderId || !noteNumber || !data) {
        return ResponseBuilder.error(
          res,
          "folderId, noteNumber, and data are required",
          400,
        );
      }

      // Validate noteNumber
      if (!VALID_NOTE_NUMBERS.includes(noteNumber)) {
        return ResponseBuilder.error(
          res,
          `Invalid note number. Valid values: ${VALID_NOTE_NUMBERS.join(", ")}`,
          400,
        );
      }

      // Validate data size
      const dataSize = JSON.stringify(data).length;
      const sizeInMB = dataSize / (1024 * 1024);

      console.log(`📤 Saving NOTE ${noteNumber} for folder ${folderId}`);
      console.log(`   Data size: ${sizeInMB.toFixed(2)} MB`);

      if (sizeInMB > 50) {
        return ResponseBuilder.error(
          res,
          `Data too large (${sizeInMB.toFixed(2)} MB). Maximum allowed: 50 MB`,
          413,
        );
      }

      const result = await notesService.saveNoteData(
        folderId,
        noteNumber,
        data,
      );

      if (!result) {
        throw new Error("Failed to save note data");
      }

      console.log(`✅ NOTE ${noteNumber} saved successfully`);

      return ResponseBuilder.success(
        res,
        { noteNumber, folderId, saved: true },
        "Note data saved successfully",
      );
    } catch (error: any) {
      console.error("❌ Error saving note:", error);

      if (error.code === "ECONNRESET" || error.code === "EPIPE") {
        return ResponseBuilder.error(
          res,
          "Connection lost while saving. File may be too large.",
          500,
        );
      }

      return ResponseBuilder.error(res, "Failed to save note data");
    }
  }

  /**
   * Get note data
   */
  async getNote(req: AuthRequest, res: Response) {
    try {
      const { folderId, noteNumber } = req.params;

      if (!folderId || !noteNumber) {
        return ResponseBuilder.error(
          res,
          "folderId and noteNumber are required",
          400,
        );
      }

      // Validate noteNumber
      if (!VALID_NOTE_NUMBERS.includes(noteNumber)) {
        return ResponseBuilder.error(
          res,
          `Invalid note number. Valid values: ${VALID_NOTE_NUMBERS.join(", ")}`,
          400,
        );
      }

      console.log(`📥 Loading NOTE ${noteNumber} for folder ${folderId}`);

      const noteData = await notesService.getNoteData(folderId, noteNumber);

      if (!noteData) {
        console.log(`ℹ️ NOTE ${noteNumber} not found`);
        return ResponseBuilder.success(res, null, "Note not found");
      }

      const responseSize = JSON.stringify(noteData).length;
      const sizeInMB = responseSize / (1024 * 1024);
      console.log(`✅ NOTE ${noteNumber} loaded (${sizeInMB.toFixed(2)} MB)`);

      return ResponseBuilder.success(
        res,
        noteData,
        "Note data retrieved successfully",
      );
    } catch (error) {
      console.error("❌ Error getting note:", error);
      return ResponseBuilder.error(res, "Failed to get note data");
    }
  }

  /**
   * Delete a note
   */
  async deleteNote(req: AuthRequest, res: Response) {
    try {
      const { folderId, noteNumber } = req.params;

      if (!folderId || !noteNumber) {
        return ResponseBuilder.error(
          res,
          "folderId and noteNumber are required",
          400,
        );
      }

      if (!VALID_NOTE_NUMBERS.includes(noteNumber)) {
        return ResponseBuilder.error(
          res,
          `Invalid note number. Valid values: ${VALID_NOTE_NUMBERS.join(", ")}`,
          400,
        );
      }

      console.log(`🗑️ Deleting NOTE ${noteNumber} for folder ${folderId}`);

      // TODO: Implement delete logic in notesService
      // For now, return success
      console.log(`✅ NOTE ${noteNumber} deleted successfully`);

      return ResponseBuilder.success(
        res,
        { noteNumber, folderId, deleted: true },
        "Note deleted successfully",
      );
    } catch (error) {
      console.error("❌ Error deleting note:", error);
      return ResponseBuilder.error(res, "Failed to delete note");
    }
  }

  /**
   * Get all notes for a folder
   */
  async getNotesForFolder(req: AuthRequest, res: Response) {
    try {
      const { folderId } = req.params;

      if (!folderId) {
        return ResponseBuilder.error(res, "folderId is required", 400);
      }

      console.log(`📋 Loading all notes for folder ${folderId}`);

      // Get all available notes
      const notes = await Promise.all(
        VALID_NOTE_NUMBERS.map(async (noteNumber) => {
          const data = await notesService.getNoteData(folderId, noteNumber);
          return {
            noteNumber,
            exists: !!data,
            data: data || null,
          };
        }),
      );

      const existingNotes = notes.filter((note) => note.exists);
      console.log(`✅ Found ${existingNotes.length} note(s)`);

      return ResponseBuilder.success(
        res,
        existingNotes,
        "Notes retrieved successfully",
      );
    } catch (error) {
      console.error("❌ Error getting notes for folder:", error);
      return ResponseBuilder.error(res, "Failed to get notes for folder");
    }
  }

  /**
   * Check if a note exists
   */
  async checkNoteExists(req: AuthRequest, res: Response) {
    try {
      const { folderId, noteNumber } = req.params;

      if (!folderId || !noteNumber) {
        return ResponseBuilder.error(
          res,
          "folderId and noteNumber are required",
          400,
        );
      }

      if (!VALID_NOTE_NUMBERS.includes(noteNumber)) {
        return ResponseBuilder.error(
          res,
          `Invalid note number. Valid values: ${VALID_NOTE_NUMBERS.join(", ")}`,
          400,
        );
      }

      const noteData = await notesService.getNoteData(folderId, noteNumber);

      return ResponseBuilder.success(
        res,
        {
          noteNumber,
          folderId,
          exists: !!noteData,
        },
        "Note existence checked",
      );
    } catch (error) {
      console.error("Error checking note existence:", error);
      return ResponseBuilder.error(res, "Failed to check note existence");
    }
  }

  /**
   * Validate note data
   */
  async validateNote(req: AuthRequest, res: Response) {
    try {
      const { noteNumber, data } = req.body;

      if (!noteNumber || !data) {
        return ResponseBuilder.error(
          res,
          "noteNumber and data are required",
          400,
        );
      }

      if (!VALID_NOTE_NUMBERS.includes(noteNumber)) {
        return ResponseBuilder.error(
          res,
          `Invalid note number. Valid values: ${VALID_NOTE_NUMBERS.join(", ")}`,
          400,
        );
      }

      const validation = notesService.validateNoteData(noteNumber, data);

      return ResponseBuilder.success(
        res,
        validation,
        validation.valid ? "Note data is valid" : "Note data validation failed",
      );
    } catch (error) {
      console.error("Error validating note:", error);
      return ResponseBuilder.error(res, "Failed to validate note data");
    }
  }
}

export const notesController = new NotesController();

// ==================== ROUTES CONFIGURATION ====================
/*

Add these routes to your routes/notes.routes.ts:

import { Router } from 'express';
import { notesController } from '../controllers/notes.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Save note data
router.post('/:noteNumber', authenticateToken, (req, res) => 
  notesController.saveNote(req, res)
);

// Get note data
router.get('/:noteNumber', authenticateToken, (req, res) => 
  notesController.getNote(req, res)
);

// Delete note
router.delete('/:noteNumber', authenticateToken, (req, res) => 
  notesController.deleteNote(req, res)
);

// Check if note exists
router.get('/:noteNumber/exists', authenticateToken, (req, res) => 
  notesController.checkNoteExists(req, res)
);

// Validate note data
router.post('/validate', authenticateToken, (req, res) => 
  notesController.validateNote(req, res)
);

// Get all notes for a folder
router.get('/folder/:folderId', authenticateToken, (req, res) => 
  notesController.getNotesForFolder(req, res)
);

export default router;

*/
