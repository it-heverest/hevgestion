// src/routes/folder.routes.ts
import { Router } from "express";
import { folderController } from "../controllers/folder.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { createExerciseSchema } from "../validators/exercise.validator";

const router = Router();

// ⚠️  Specific routes must come before wildcard /:id

// GET /api/folders?clientId=xxx  — list folders for a client
router.get("/", authenticate, folderController.getFolders);

// GET /api/folders/current?clientId=xxx  — active (non-completed) folder
router.get("/current", authenticate, folderController.getCurrentFolder);

// GET /api/folders/search?query=xxx&clientId=xxx
router.get("/search", authenticate, folderController.searchFolders);

// GET /api/folders/stats/summary?clientId=xxx
router.get("/stats/summary", authenticate, folderController.getFolderStats);

// GET /api/folders/:id
router.get("/:id", authenticate, folderController.getFolderById);

// GET /api/folders/:id/details  — full relations (alias for getFolderById)
router.get("/:id/details", authenticate, folderController.getFolderWithDetails);

// GET /api/folders/:id/progress
router.get("/:id/progress", authenticate, folderController.getFolderProgress);

// GET /api/folders/:id/timeline
router.get("/:id/timeline", authenticate, folderController.getFolderTimeline);

// POST /api/folders  — create
router.post(
  "/",
  authenticate,
  validate(createExerciseSchema),
  folderController.createFolder
);

// POST /api/folders/:id/duplicate  — duplicate for a new fiscal year
router.post("/:id/duplicate", authenticate, folderController.duplicateFolder);

// PUT /api/folders/:id/close  — set status → COMPLETED
router.put("/:id/close", authenticate, folderController.closeFolder);

// PUT /api/folders/:id/archive  — soft-archive
router.put("/:id/archive", authenticate, folderController.archiveFolder);

// PUT /api/folders/:id/restore  — restore archived folder
router.put("/:id/restore", authenticate, folderController.restoreFolder);

// PATCH /api/folders/:id/status  — set arbitrary valid status
// FIX: replaces the incorrect pattern of calling closeFolder with a status body
router.patch("/:id/status", authenticate, folderController.updateFolderStatus);

// PUT /api/folders/:id  — generic update (name, description, isActive, status)
router.put("/:id", authenticate, folderController.updateFolder);

// DELETE /api/folders/:id
router.delete("/:id", authenticate, folderController.deleteFolder);

export default router;
