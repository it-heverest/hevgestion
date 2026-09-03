// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../lib/errors";
import { verifyAccessToken } from "../utils/auth";
import { prisma } from "../lib/prisma";
import { NotificationService } from "../services/notification.service";
import { shouldUpdateActivity } from "../utils/activity-throttle";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email?: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // First try to get token from HttpOnly cookies (secure approach)
    let token = req.cookies?.accessToken;

    // Fallback to Authorization header for backward compatibility
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    const payload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError("User not found or inactive");
    }

    req.user = {
      userId: user.id,
      email: user.email || undefined,
      role: user.role,
    };

    // Update last activity (fire and forget) — throttled so we don't issue a DB
    // write on every single authenticated request (see activity-throttle).
    if (shouldUpdateActivity(user.id)) {
      NotificationService.updateLastActivity(user.id).catch(error =>
        console.error("Failed to update last activity:", error)
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }

    next();
  };
};

/**
 * Ensures a body/query "userId" field, when present, matches the
 * authenticated user. Several DGI declaration endpoints accept a userId to
 * scope which DGIConfig credentials to use — without this check, any
 * authenticated user could submit declarations using another user's DGI
 * (government tax portal) credentials.
 */
export const verifySelfUserId = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const targetUserId = (req.body?.userId ?? req.query?.userId) as
    | string
    | undefined;

  if (targetUserId && targetUserId !== req.user?.userId) {
    return next(new ForbiddenError("Unauthorized access"));
  }

  next();
};
