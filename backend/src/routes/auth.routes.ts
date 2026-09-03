// src/routes/auth.routes.ts
import { Router } from "express";
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
import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  forgotPasswordLimiter,
  otpLimiter,
} from "../middleware/rateLimit";

const router = Router();

// Per-endpoint limiters with INDEPENDENT counters (see middleware/rateLimit.ts).
// Previously a single shared limiter meant hammering one route exhausted them all.

// ─── Public routes ───────────────────────────────────────────────────────────
router.post("/register", registerLimiter, validate(registerSchema), authController.register.bind(authController));
router.post("/verify-otp", otpLimiter, validate(verifyOtpSchema), authController.verifyOtp.bind(authController));
router.post("/resend-otp", otpLimiter, validate(resendOtpSchema), authController.resendOtp.bind(authController));
router.post("/login", loginLimiter, validate(loginSchema), authController.login.bind(authController));
router.post("/refresh", refreshLimiter, authController.refreshToken.bind(authController));
router.post("/forgot-password", forgotPasswordLimiter, validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));
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
