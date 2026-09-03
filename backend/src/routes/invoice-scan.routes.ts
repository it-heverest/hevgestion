// src/routes/invoice-scan.routes.ts
import { Router } from "express";
import { invoiceScanController } from "../controllers/invoice-scan.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/analyze", authenticate, (req, res) =>
  invoiceScanController.analyze(req, res),
);

export default router;
