import { Router } from "express";
import { notesController } from "../controllers/notes.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Save note data
router.post("/:noteNumber", authenticate, (req, res) =>
  notesController.saveNote(req, res),
);

// Get note data
router.get("/:noteNumber", authenticate, (req, res) =>
  notesController.getNote(req, res),
);

// Delete note
router.delete("/:noteNumber", authenticate, (req, res) =>
  notesController.deleteNote(req, res),
);

// Check if note exists
router.get("/:noteNumber/exists", authenticate, (req, res) =>
  notesController.checkNoteExists(req, res),
);

// Validate note data
router.post("/validate", authenticate, (req, res) =>
  notesController.validateNote(req, res),
);

// Get all notes for a folder
router.get("/folder/:folderId", authenticate, (req, res) =>
  notesController.getNotesForFolder(req, res),
);

export default router;
