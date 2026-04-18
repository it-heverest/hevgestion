// src/routes/notes.routes.ts
import { Router } from "express";
import { notesController } from "../controllers/notes.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// ⚠️  ORDER MATTERS: specific paths must be declared before wildcard /:noteNumber

// GET /api/notes/folder/:folderId  — get all notes for a folder
router.get("/folder/:folderId", authenticate, (req, res) =>
  notesController.getNotesForFolder(req, res),
);

// POST /api/notes/validate  — validate note data without saving
router.post("/validate", authenticate, (req, res) =>
  notesController.validateNote(req, res),
);

// GET /api/notes/:noteNumber/exists?folderId=xxx
router.get("/:noteNumber/exists", authenticate, (req, res) =>
  notesController.checkNoteExists(req, res),
);

// GET /api/notes/:noteNumber?folderId=xxx
router.get("/:noteNumber", authenticate, (req, res) =>
  notesController.getNote(req, res),
);

// POST /api/notes/:noteNumber  — body: { folderId, noteNumber, data }
router.post("/:noteNumber", authenticate, (req, res) =>
  notesController.saveNote(req, res),
);

// DELETE /api/notes/:noteNumber?folderId=xxx
router.delete("/:noteNumber", authenticate, (req, res) =>
  notesController.deleteNote(req, res),
);

// DELETE /api/notes/folder/:folderId — delete all notes for a folder
router.delete("/folder/:folderId", authenticate, (req, res) =>
  notesController.deleteAllNotes(req, res),
);

export default router;
