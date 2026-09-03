// src/routes/trash.routes.ts
import { Router } from "express";
import { trashController } from "../controllers/trash.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// La corbeille contient des données de tous les clients: strictement réservée
// aux administrateurs.
router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", trashController.getItems);
router.get("/stats", trashController.getStats);
router.get("/:id", trashController.getItem);
router.post("/:id/restore", trashController.restoreItem);

export default router;
