// src/routes/auth.routes.ts
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validation.middleware";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  verifyPasswordResetOtpSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Strict limiter: 10 attempts per 15 min — login, register, OTP
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
});

// OTP limiter: 5 attempts per 5 min — verify/resend OTP, password reset OTP
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many OTP attempts. Please try again in 5 minutes." },
});

// ─── Public routes ───────────────────────────────────────────────────────────
router.post("/register", strictLimiter, validate(registerSchema), authController.register.bind(authController));
router.post("/verify-otp", otpLimiter, validate(verifyOtpSchema), authController.verifyOtp.bind(authController));
router.post("/resend-otp", otpLimiter, validate(resendOtpSchema), authController.resendOtp.bind(authController));
router.post("/login", strictLimiter, validate(loginSchema), authController.login.bind(authController));
router.post("/refresh", strictLimiter, authController.refreshToken.bind(authController));
router.post("/forgot-password", strictLimiter, validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));
router.post("/verify-password-reset-otp", otpLimiter, validate(verifyPasswordResetOtpSchema), authController.verifyPasswordResetOtp.bind(authController));
router.post("/reset-password", otpLimiter, validate(resetPasswordSchema), authController.resetPassword.bind(authController));

// ─── Protected routes ────────────────────────────────────────────────────────
router.post("/logout", authenticate, authController.logout.bind(authController));

// Profile
router.get("/profile", authenticate, authController.getProfile.bind(authController));
router.patch("/profile", authenticate, authController.updateProfile.bind(authController));

// Password
router.post("/change-password", authenticate, authController.changePassword.bind(authController));

// User settings (preferences)
router.patch("/settings", authenticate, authController.updateSettings.bind(authController));

export default router;
