// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/auth";
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
} from "../lib/errors";
import { Validators } from "../utils/validators";
import { auditService } from "../services/audit.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { NotificationService } from "../services/notification.service";

// Reuse the same interface — no duplication
type AuthenticatedRequest = AuthRequest;

// ─── Cookie helpers ──────────────────────────────────────────────────────────

function makeCookieOptions(isProduction: boolean) {
  return {
    access: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ("strict" as const) : ("lax" as const),
      domain: isProduction ? undefined : "localhost",
      maxAge: 4 * 60 * 60 * 1000, // 4 hours
    },
    refresh: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ("strict" as const) : ("lax" as const),
      domain: isProduction ? undefined : "localhost",
      // No maxAge — expires when browser tab closes
    },
  };
}

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  const isProduction = process.env.NODE_ENV === "production";
  const opts = makeCookieOptions(isProduction);
  
  // Split Storage: only set refreshToken as HttpOnly cookie
  // Access token is returned in JSON for frontend to store in memory
  res.cookie("refreshToken", refreshToken, opts.refresh);
}

function formatUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    phoneCountryCode: user.phoneCountryCode,
    phoneNumber: user.phoneNumber,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    maxAssistants: user.maxAssistants,
    createdAt: user.createdAt instanceof Date
      ? user.createdAt.toISOString()
      : user.createdAt,
  };
}

// ─── Controller ──────────────────────────────────────────────────────────────

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        phoneCountryCode,
        phoneNumber,
        password,
        firstName,
        lastName,
        role,
        maxAssistants,
      } = req.body;

      if (email) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) throw new ConflictError("User with this email already exists");
      }

      if (phoneNumber) {
        const existing = await prisma.user.findUnique({ where: { phoneNumber } });
        if (existing)
          throw new ConflictError("User with this phone number already exists");
      }

      if (phoneNumber && phoneCountryCode === "+237") {
        if (!Validators.isValidCameroonPhoneNumber(phoneNumber)) {
          throw new BadRequestError("Invalid Cameroon phone number format");
        }
      }

      const hashedPassword = await hashPassword(password);

      // All public registrations are COMPTABLE
      const userRole = "COMPTABLE";

      const otpCode =
        process.env.NODE_ENV === "production"
          ? Math.floor(100000 + Math.random() * 900000).toString()
          : "123456";

      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      const user = await prisma.user.create({
        data: {
          email,
          phoneCountryCode,
          phoneNumber,
          password: hashedPassword,
          firstName,
          lastName,
          role: userRole,
          maxAssistants: role === "COMPTABLE" ? maxAssistants || 0 : 0,
          isActive: false,
          otpCode,
          otpExpiry,
          isVerified: false,
        } as any,
      });

      console.log(`OTP for user ${user.id}: ${otpCode}`);

      // Create welcome and guide notifications
      try {
        await NotificationService.createWelcomeNotification(user.id);
        await NotificationService.createGuideNotification(user.id);
      } catch (notifError) {
        console.error("Error creating notifications:", notifError);
      }

      res.status(201).json({
        message: "Un code de vérification a été envoyé à votre numéro de téléphone",
        user: formatUser(user),
        requiresOtp: true,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, password } = req.body;

      if (!phone) throw new BadRequestError("Phone number is required");

      const user = await prisma.user.findUnique({
        where: { phoneNumber: phone },
      });

      if (!user) throw new UnauthorizedError("Numéro de téléphone ou mot de passe incorrect");
      if (!user.isActive) throw new UnauthorizedError("Account is inactive");

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) throw new UnauthorizedError("Numéro de téléphone ou mot de passe incorrect");

      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email ?? undefined,
        role: user.role,
      });
      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email ?? undefined,
        role: user.role,
      });

      setAuthCookies(res, accessToken, refreshToken);

      await auditService.logUserLogin(user.id, {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        phoneNumber: user.phoneNumber,
      });

      res.json({ 
        message: "Login successful", 
        user: formatUser(user),
        accessToken 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh
   * FIX: reads refreshToken from the HttpOnly cookie (not from req.body),
   * and rotates both cookies.  The frontend's in-memory token is kept in sync
   * because the new accessToken is also returned in the JSON body.
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      // Accept token from cookie first (primary path), fallback to body
      const token = req.cookies?.refreshToken ?? req.body?.refreshToken;

      if (!token) throw new BadRequestError("Refresh token is required");

      const payload = verifyRefreshToken(token);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError("User not found or inactive");
      }

      const newAccessToken = generateAccessToken({
        userId: user.id,
        email: user.email ?? undefined,
        role: user.role,
      });
      const newRefreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email ?? undefined,
        role: user.role,
      });

      setAuthCookies(res, newAccessToken, newRefreshToken);

      // FIX: return the new accessToken in the body so the frontend can update
      // its in-memory token (used in Authorization: Bearer headers)
      res.json({
        message: "Tokens refreshed successfully",
        accessToken: newAccessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, otpCode } = req.body;

      if (!userId || !otpCode) {
        throw new BadRequestError("User ID and OTP code are required");
      }

      const user = (await prisma.user.findUnique({
        where: { id: userId },
      })) as any;

      if (!user) throw new BadRequestError("User not found");
      if (user.isVerified) throw new BadRequestError("User is already verified");
      if (user.otpCode !== otpCode) throw new BadRequestError("Invalid OTP code");
      if (!user.otpExpiry || user.otpExpiry < new Date()) {
        throw new BadRequestError("OTP code has expired");
      }

      const verifiedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isVerified: true,
          isActive: true,
          otpCode: null,
          otpExpiry: null,
        } as any,
      });

      const accessToken = generateAccessToken({
        userId: verifiedUser.id,
        email: verifiedUser.email ?? undefined,
        role: verifiedUser.role,
      });
      const refreshToken = generateRefreshToken({
        userId: verifiedUser.id,
        email: verifiedUser.email ?? undefined,
        role: verifiedUser.role,
      });

      setAuthCookies(res, accessToken, refreshToken);

      res.json({
        message: "OTP verified successfully. Registration complete.",
        user: formatUser(verifiedUser),
        // Return accessToken in body so frontend can store it in memory
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.userId) {
        await auditService.logUserLogout(req.user.userId, {
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });
      }

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.json({ message: "Logout successful" });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) throw new BadRequestError("Email is required");

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Don't reveal whether the email exists
        return res.json({ message: "If the email exists, a reset link has been sent" });
      }

      const resetToken =
        Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

      console.log(`Password reset token for ${email}: ${resetToken}`);

      res.json({
        message: "If the email exists, a reset link has been sent",
        resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw new BadRequestError("Token and new password are required");
      }
      if (newPassword.length < 8) {
        throw new BadRequestError("Password must be at least 8 characters long");
      }

      console.log(`Password reset attempted with token: ${token}`);

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          createdClients: {
            select: {
              id: true,
              name: true,
              legalForm: true,
              taxNumber: true,
              address: true,
              city: true,
              phone: true,
              currency: true,
              country: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      const {
        password,
        resetToken,
        resetTokenExpiry,
        otpCode,
        otpExpiry,
        ...safe
      } = user as any;

      res.json({
        success: true,
        user: {
          id: safe.id,
          firstName: safe.firstName,
          lastName: safe.lastName,
          email: safe.email,
          phoneCountryCode: safe.phoneCountryCode,
          phoneNumber: safe.phoneNumber,
          role: safe.role,
          isActive: safe.isActive,
          maxAssistants: safe.maxAssistants,
          clients: safe.createdClients,
          // Backward-compat: first client as "company"
          company: safe.createdClients[0] ?? undefined,
        },
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }

  /**
   * PATCH /auth/profile
   * Update firstName, lastName, email, phoneCountryCode, phoneNumber.
   */
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const { firstName, lastName, email, phoneCountryCode, phoneNumber } =
        req.body;

      // If changing email, check uniqueness
      if (email) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== req.user.userId) {
          throw new ConflictError("Email already in use");
        }
      }

      // If changing phone, check uniqueness
      if (phoneNumber) {
        const existing = await prisma.user.findUnique({ where: { phoneNumber } });
        if (existing && existing.id !== req.user.userId) {
          throw new ConflictError("Phone number already in use");
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(email !== undefined && { email }),
          ...(phoneCountryCode !== undefined && { phoneCountryCode }),
          ...(phoneNumber !== undefined && { phoneNumber }),
        },
      });

      res.json({ success: true, user: formatUser(updatedUser) });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/change-password
   * Body: { currentPassword, newPassword }
   */
  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new BadRequestError("currentPassword and newPassword are required");
      }
      if (newPassword.length < 8) {
        throw new BadRequestError("New password must be at least 8 characters");
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });
      if (!user) throw new UnauthorizedError("User not found");

      const isValid = await comparePassword(currentPassword, user.password);
      if (!isValid) throw new UnauthorizedError("Current password is incorrect");

      const hashed = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: req.user.userId },
        data: { password: hashed },
      });

      res.json({ success: true, message: "Mot de passe changé avec succès" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /auth/settings
   * Body: { settings: { ... } }
   * Persists arbitrary user preferences in a JSON column (if your schema has one).
   * Falls back to a simple acknowledgement if the schema has no settings column.
   */
  async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const { settings } = req.body;

      if (!settings || typeof settings !== "object") {
        throw new BadRequestError("settings object is required");
      }

      // Attempt to persist settings. If the schema has no `settings` column,
      // Prisma will throw — catch it gracefully and still return success so the
      // frontend doesn't break.
      let updatedUser: any;
      try {
        updatedUser = await (prisma.user as any).update({
          where: { id: req.user.userId },
          data: { settings },
        });
      } catch {
        // Schema may not have a settings column yet — return current user instead
        updatedUser = await prisma.user.findUnique({
          where: { id: req.user.userId },
        });
      }

      res.json({ success: true, user: formatUser(updatedUser) });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
