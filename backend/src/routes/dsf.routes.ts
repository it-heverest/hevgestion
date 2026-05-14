// src/routes/dsf.routes.ts
import { Router } from "express";
import multer from "multer";
import path from "path";
import { dsfController } from "../controllers/dsf.controller";
import { authenticate } from "../middleware/auth.middleware";
import { config } from "../config";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dsfDir = path.join(config.upload.directory, config.upload.subDirectories.dsf);
    cb(null, dsfDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxSize,
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".xlsx", ".xls"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      config.upload.allowedTypes.includes(file.mimetype) &&
      allowedExtensions.includes(ext)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only Excel files (.xlsx, .xls) are allowed."));
    }
  },
});

const router = Router();

router.post("/generate", authenticate, dsfController.generateDSF);
router.post(
  "/import",
  authenticate,
  upload.fields([{ name: "file", maxCount: 1 }]),
  dsfController.importDSF
);
router.get("/check-status", authenticate, dsfController.checkDSFStatus);
router.get("/:folderId", authenticate, dsfController.getDSF);
router.put("/:id", authenticate, dsfController.updateDSF);
router.post("/:id/validate", authenticate, dsfController.validateDSF);
router.post("/:id/export", authenticate, dsfController.exportDSF);
router.get(
  "/:id/coherence-report",
  authenticate,
  dsfController.getCoherenceReport
);

export default router;
