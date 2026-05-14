// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors";
import { Prisma } from "@prisma/client";
import { securityConfig } from "../config/security";

// Utility function to sanitize error messages
const sanitizeErrorMessage = (message: string): string => {
  // Remove any potential file paths or system information
  let sanitized = message
    .replace(/\/[a-zA-Z]:[^\s]*/g, '[PATH]') // Windows paths
    .replace(/\/[^\s]*/g, '[PATH]') // Unix paths
    .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[IP]') // IP addresses
    .replace(/port \d+/gi, 'port [PORT]') // Port numbers
    .replace(/localhost:\d+/gi, 'localhost:[PORT]') // Localhost with port
    .replace(/\b\d{4,}\b/g, '[NUMBER]'); // Long numbers (potential IDs)

  // Truncate if too long
  if (sanitized.length > securityConfig.errorHandling.maxErrorMessageLength) {
    sanitized = sanitized.substring(0, securityConfig.errorHandling.maxErrorMessageLength - 3) + '...';
  }

  return sanitized;
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log full error details server-side for debugging (never exposed to client)
  const timestamp = new Date().toISOString();
  const requestId = req.headers['x-request-id'] || 'unknown';

  const logData: any = {
    message: err.message,
    name: err.name,
  };

  // Add stack trace if enabled in security config
  if (securityConfig.errorHandling.logStackTraces) {
    logData.stack = err.stack;
  }

  // Add Prisma-specific details if available
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logData.prismaCode = err.code;
    logData.prismaMeta = err.meta;
  }

  // Add request context if enabled
  if (securityConfig.requestLogging.enabled) {
    logData.request = {
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    };

    if (securityConfig.errorHandling.logUserDetails) {
      logData.userId = (req as any).user?.userId || 'anonymous';
    }
  }

  console.error(`[${timestamp}] ERROR [${requestId}]:`, logData);

  // Helper function to send secure error response
  const sendSecureErrorResponse = (statusCode: number, error: string, message: string) => {
    return res.status(statusCode).json({
      error: sanitizeErrorMessage(error),
      message: sanitizeErrorMessage(message),
      timestamp: new Date().toISOString(),
    });
  };

  // Prisma errors - handle specific known cases with safe messages
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return sendSecureErrorResponse(409, "Conflict", "A record with this information already exists");
    }
    if (err.code === "P2025") {
      return sendSecureErrorResponse(404, "Not Found", "The requested resource was not found");
    }
    // Generic Prisma error - don't expose internal details
    return sendSecureErrorResponse(400, "Database Error", "An error occurred while processing your request");
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return sendSecureErrorResponse(400, "Validation Error", "The provided data is invalid or incomplete");
  }

  // App errors - these are operational errors we designed to show to users
  if (err instanceof AppError) {
    return sendSecureErrorResponse(err.statusCode, err.message, err.message);
  }

  // Unknown errors - generic response to prevent information leakage
  return sendSecureErrorResponse(500, "Internal Server Error", securityConfig.errorHandling.genericErrorMessage);
};
