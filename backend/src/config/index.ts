// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
import * as fs from "fs";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const getUploadDir = (): string => {
  if (process.env.UPLOAD_DIR) {
    if (path.isAbsolute(process.env.UPLOAD_DIR)) {
      return process.env.UPLOAD_DIR;
    }
    return path.resolve(process.cwd(), process.env.UPLOAD_DIR);
  }

  let projectRoot = process.cwd();
  while (projectRoot !== path.dirname(projectRoot)) {
    if (fs.existsSync(path.join(projectRoot, "package.json"))) {
      break;
    }
    projectRoot = path.dirname(projectRoot);
  }

  const defaultDir = path.join(projectRoot, "assets", "uploads");
  console.log(`📁 Upload directory: ${defaultDir}`);
  return defaultDir;
};

const getCorsOrigin = (): string[] => {
  if (isProduction) {
    const origin = process.env.CORS_ORIGIN;
    if (!origin) {
      throw new Error("CORS_ORIGIN environment variable is required in production");
    }
    return origin.split(",").map((o) => o.trim());
  }
  return [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
  ];
};

export const config = {
  env: process.env.NODE_ENV || "development",
  isProduction,
  port: parseInt(process.env.PORT || "3000", 10),
  rootDir: path.resolve(process.cwd()),

  database: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://user:password@localhost:5432/financial_app",
  },

  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  cors: {
    origin: getCorsOrigin(),
    credentials: true,
  },

  upload: {
    maxSize: parseInt(process.env.MAX_UPLOAD_SIZE || "52428800", 10),
    allowedTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ],
    directory: getUploadDir(),
    subDirectories: {
      balance: "balances",
      dsf: "dsf",
      templates: "dsf-templates",
      exports: "dsf-exports",
      guides: "guides",
    },
  },

  dgi: {
    apiUrl: process.env.DGI_API_URL || "http://tasserver.dgi.cm/api/v1",
    timeout: parseInt(process.env.DGI_TIMEOUT || "60000", 10),
  },

  encryption: {
    algorithm: "aes-256-gcm",
    key: (() => {
      const key = process.env.ENCRYPTION_KEY;
      if (!key) {
        throw new Error("ENCRYPTION_KEY environment variable is required");
      }
      return key;
    })(),
  },

  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0", 10),
  },

  supportedCountries: ["CM", "CI", "SN", "BF", "TG", "BJ"],
};