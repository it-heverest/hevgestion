// src/routes/ventilation-config.routes.ts
import { Router } from "express";
import { ventilationConfigController } from "../controllers/ventilation-config.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  createVentilationConfigSchema,
  updateVentilationConfigSchema,
  ventilationConfigIdSchema,
  ventilationConfigQuerySchema,
} from "../validators/ventilation-config.validator";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validate(ventilationConfigQuerySchema),
  ventilationConfigController.getConfigs
);
router.post(
  "/",
  validate(createVentilationConfigSchema),
  ventilationConfigController.createConfig
);
router.put(
  "/:id",
  validate(updateVentilationConfigSchema),
  ventilationConfigController.updateConfig
);
router.delete(
  "/:id",
  validate(ventilationConfigIdSchema),
  ventilationConfigController.deleteConfig
);
router.post(
  "/:id/restore",
  validate(ventilationConfigIdSchema),
  ventilationConfigController.restoreConfig
);

export default router;
