// src/routes/dsf-assistant.routes.ts
import { Router } from "express";
import { dsfAssistantController } from "../controllers/dsf-assistant.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post("/chat", authenticate, (req, res) =>
  dsfAssistantController.chat(req, res),
);

// Réglage du modèle IA. Lecture ouverte aux utilisateurs connectés (l'écran
// Paramètres affiche le modèle actif), écriture réservée aux administrateurs:
// le réglage est global à l'application.
router.get("/settings", authenticate, (req, res) =>
  dsfAssistantController.getSettings(req, res),
);
router.put("/settings", authenticate, authorize("ADMIN"), (req, res) =>
  dsfAssistantController.updateSettings(req, res),
);
router.get("/models", authenticate, authorize("ADMIN"), (req, res) =>
  dsfAssistantController.listModels(req, res),
);

export default router;
