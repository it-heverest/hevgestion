// src/routes/auth.routes.ts
import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validation.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// ─── Public routes ───────────────────────────────────────────────────────────
router.post("/register", validate(registerSchema), authController.register.bind(authController));
router.post("/verify-otp", authController.verifyOtp.bind(authController));
router.post("/resend-otp", authController.resendOtp.bind(authController));
router.post("/login", validate(loginSchema), authController.login.bind(authController));
router.post("/refresh", authController.refreshToken.bind(authController));
router.post("/forgot-password", authController.forgotPassword.bind(authController));
router.post("/reset-password", authController.resetPassword.bind(authController));

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
