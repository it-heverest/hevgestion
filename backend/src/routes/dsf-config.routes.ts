import { Router } from "express";
import { dsfConfigController } from "../controllers/dsf-config.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes principales

// GET /api/dsf-configs - Récupérer les configurations avec filtres
router.get("/", dsfConfigController.getConfigs.bind(dsfConfigController));

// POST /api/dsf-configs - Créer une nouvelle configuration
router.post("/", dsfConfigController.createConfig.bind(dsfConfigController));

// GET /api/dsf-configs/folder/:folderId - Configurations par dossier
router.get(
  "/folder/:folderId",
  dsfConfigController.getConfigsByFolder.bind(dsfConfigController)
);

// GET /api/dsf-configs/user/:userId - Configurations par utilisateur
router.get(
  "/user/:userId",
  dsfConfigController.getUserConfigs.bind(dsfConfigController)
);

// PUT /api/dsf-configs/:id - Mettre à jour une configuration
router.put("/:id", dsfConfigController.updateConfig.bind(dsfConfigController));

// DELETE /api/dsf-configs/:id - Supprimer une configuration
router.delete(
  "/:id",
  dsfConfigController.deleteConfig.bind(dsfConfigController)
);

// POST /api/dsf-configs/:id/duplicate - Dupliquer une configuration
router.post(
  "/:id/duplicate",
  dsfConfigController.duplicateConfig.bind(dsfConfigController)
);

// Routes administratives (ADMIN seulement)

// POST /api/dsf-configs/create-defaults - Créer des configurations par défaut (ADMIN only)
router.post(
  "/create-defaults",
  authorize("ADMIN"),
  dsfConfigController.createDefaultConfigs.bind(dsfConfigController)
);

// POST /api/dsf-configs/reset-all - Réinitialiser toutes les configurations (ADMIN only)
router.post(
  "/reset-all",
  authorize("ADMIN"),
  dsfConfigController.resetAllConfigs.bind(dsfConfigController)
);

export default router;
