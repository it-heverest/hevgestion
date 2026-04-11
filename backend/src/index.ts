// src/index.ts
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import jwtBlacklistMiddleware from "./middleware/jwtBlacklist.middleware";
import * as path from "path";
import * as fs from "fs";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
// import countryRoutes from "./routes/country.routes";
import clientRoutes from "./routes/client.routes";
import folderRoutes from "./routes/folder.routes";
import balanceRoutes from "./routes/balance.routes";
import dsfRoutes from "./routes/dsf.routes";
import dsfImportRoutes from "./routes/dsf-import.routes";
import declarationRoutes from "./routes/declaration.routes";
import dsfConfigRoutes from "./routes/dsf-config.routes";
import assistantRoutes from "./routes/assistant.routes";
// import reportRoutes from "./routes/report.routes";
import auditRoutes from "./routes/audit.routes";
import notesRoutes from "./routes/notes.routes";
import dsfTemplateRoutes from "./routes/dsf-template.routes";
import dgiRoutes from "./declaration/routes/declaration.routes";
import notificationRoutes from "./routes/notification.routes";
import redisRoutes from "./routes/redis.routes";
// import dsfMappingRoutes from "./routes/dsf-mapping.routes";

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Increased for development
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Cookie parsing for HttpOnly cookies
app.use(cookieParser());

// JWT blacklist middleware (checks revoked tokens stored in Redis)
app.use(jwtBlacklistMiddleware);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Debug endpoint - shows upload directory config
app.get("/api/debug/config", (req: Request, res: Response) => {
  res.json({
    uploadDir: config.upload.directory,
    subDirectories: config.upload.subDirectories,
    isProduction: config.isProduction,
  });
});

// Debug endpoint - list files in upload directory
app.get("/api/debug/files", (req: Request, res: Response) => {
  const uploadDir = config.upload.directory;
  const subDir = (req.query.subdir as string) || "";
  const targetDir = subDir ? path.join(uploadDir, subDir) : uploadDir;

  try {
    if (!fs.existsSync(targetDir)) {
      return res.json({
        files: [],
        message: `Directory does not exist: ${targetDir}`,
      });
    }
    const files = fs.readdirSync(targetDir);
    res.json({ directory: targetDir, files: files.slice(0, 20) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Serve uploaded files - main uploads directory
console.log(`📁 Serving files from: ${config.upload.directory}`);
app.use("/api/files/download", express.static(config.upload.directory));

// Serve guides from assets/uploads/guides
const guidesPath = path.join(
  config.upload.directory,
  config.upload.subDirectories.guides,
);
app.use("/api/files/guide-utilisation.pdf", express.static(guidesPath));

// Ensure upload directories exist on startup
// ... existing code ...

// Ensure upload directories exist on startup
const ensureDirectories = () => {
  const dirs = Object.values(config.upload.subDirectories);
  dirs.forEach((dir: string) => {
    const fullPath = path.join(config.upload.directory, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Created directory: ${fullPath}`);
    }
  });
};
ensureDirectories();

// Generate plan comptable JSON from Excel if not exists
const generatePlanComptable = async () => {
  try {
    const { planComptableService } = await import(
      "./services/plan-comptable.service"
    );
    const jsonPath = path.join(
      config.rootDir,
      "assets",
      "data",
      "plan-comptable.json",
    );
    if (!fs.existsSync(jsonPath)) {
      const excelPath = path.join(
        config.rootDir,
        "frontend",
        "plan_comptable",
        "PLAN COMPTABLE UNIQUE.xlsx",
      );
      if (fs.existsSync(excelPath)) {
        console.log("📊 Generating plan comptable JSON from Excel...");
        planComptableService.generateJsonFromExcel(excelPath);
      }
    }
  } catch (error) {
    console.error("Error generating plan comptable:", error);
  }
};
generatePlanComptable();

// API Routes
app.use("/api/auth", authRoutes);
// app.use("/api/countries", countryRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/balances", balanceRoutes);
app.use("/api/dsf", dsfRoutes);
app.use("/api/dsf-import", dsfImportRoutes);
app.use("/api/declarations", declarationRoutes);
app.use("/api/dsf-configs", dsfConfigRoutes);
app.use("/api/assistants", assistantRoutes);
// app.use("/api/reports", reportRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/dsf-template", dsfTemplateRoutes);
app.use("/api/dgi", dgiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/debug/redis", redisRoutes);
// app.use("/api/dsf-mapping", dsfMappingRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = config.port || 5000;

console.log(`🔑 JWT Secret loaded: ${config.jwt.secret ? "YES" : "NO"}`);
console.log(
  `🔄 Refresh Secret loaded: ${config.jwt.refreshSecret ? "YES" : "NO"}`,
);
console.log(`🗄️ Database URL: ${config.database.url ? "SET" : "NOT SET"}`);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.env}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  process.exit(0);
});

export default app;
