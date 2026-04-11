// components/ForgotPassword.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Mail,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "../services/auth.service";

interface ForgotPasswordProps {
  onBackToLogin?: () => void;
  onSwitchToRegister?: () => void;
}

export function ForgotPassword({
  onBackToLogin,
  onSwitchToRegister,
}: ForgotPasswordProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null);

  // Gestionnaires de navigation avec fallback
  const handleBackToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      navigate("/fr/web/user/login");
    }
  };

  const handleSwitchToRegister = () => {
    if (onSwitchToRegister) {
      onSwitchToRegister();
    } else {
      navigate("/fr/web/user/register");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation de l'email
    if (!email || !isValidEmail(email)) {
      setError("Veuillez saisir une adresse email valide");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await authService.forgotPassword(email);

      if (result.success) {
        setSuccessMessage(
          result.message ||
          "Un code de réinitialisation a été envoyé à votre adresse email."
        );
        setStep("otp");
      } else {
        setError(
          result.message ||
          result.error ||
          "Une erreur est survenue lors de l'envoi du code de réinitialisation."
        );
        // Don't proceed to OTP step if email doesn't exist
      }
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError("Veuillez saisir un code de 6 chiffres valide");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.verifyPasswordResetOtp(email, otp);

      if (result.success && result.userId) {
        setVerifiedUserId(result.userId);
        setStep("reset");
        setSuccessMessage("Code vérifié avec succès. Vous pouvez maintenant définir un nouveau mot de passe.");
      } else {
        setError(
          result.error ||
          "Code invalide ou expiré."
        );
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      setError("Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial");
      return;
    }

    if (!verifiedUserId) {
      setError("Session expirée. Veuillez recommencer le processus.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.resetPassword(verifiedUserId, newPassword);

      if (result.success) {
        setSuccessMessage("Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(
          result.error ||
          "Une erreur est survenue lors de la réinitialisation du mot de passe."
        );
      }
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccessMessage(null);
    setStep("email");
    setVerifiedUserId(null);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    // Clear error when user starts typing
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToLogin}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl flex-1">
                {step === "email" && "Mot de passe oublié"}
                {step === "otp" && "Vérification du code"}
                {step === "reset" && "Nouveau mot de passe"}
              </CardTitle>
            </div>
            <CardDescription>
              {step === "email" && "Saisissez votre email pour recevoir un code de réinitialisation"}
              {step === "otp" && "Saisissez le code de 6 chiffres envoyé à votre email"}
              {step === "reset" && "Définissez votre nouveau mot de passe"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {step === "email" && (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleEmailSubmit}
                  className="space-y-4"
                >
                  {/* Alert d'erreur */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email professionnel</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="votre@email.com"
                        className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        autoComplete="off"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Vous recevrez un code de 6 chiffres pour réinitialiser votre mot de passe
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full transition-all duration-200"
                      disabled={isLoading || !email}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        "Envoyer le code de réinitialisation"
                      )}
                    </Button>
                  </motion.div>

                  <div className="text-center">
                    <Button
                      variant="link"
                      onClick={handleSwitchToRegister}
                      className="text-sm text-muted-foreground"
                      disabled={isLoading}
                    >
                      Pas encore de compte ? S'inscrire
                    </Button>
                  </div>
                </motion.form>
              )}

              {step === "otp" && (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleOtpSubmit}
                  className="space-y-4"
                >
                  {/* Alert d'erreur */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success message */}
                  <AnimatePresence>
                    {successMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Alert className="mb-4 border-green-200 bg-green-50">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <Label htmlFor="otp-code">Code de vérification</Label>
                    <div className="relative">
                      <Input
                        id="otp-code"
                        type="text"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(value);
                          if (error) setError(null);
                        }}
                        placeholder="123456"
                        className="text-center text-2xl tracking-widest transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        autoComplete="off"
                        required
                        disabled={isLoading}
                        maxLength={6}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Code envoyé à {email}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      Le code expire dans 5 minutes
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full transition-all duration-200"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        "Vérifier le code"
                      )}
                    </Button>
                  </motion.div>

                  <div className="text-center space-y-2">
                    <Button
                      variant="link"
                      onClick={handleReset}
                      className="text-sm text-muted-foreground"
                      disabled={isLoading}
                    >
                      Renvoyer le code
                    </Button>
                  </div>
                </motion.form>
              )}

              {step === "reset" && (
                <motion.form
                  key="reset-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handlePasswordReset}
                  className="space-y-4"
                >
                  {/* Alert d'erreur */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success message */}
                  <AnimatePresence>
                    {successMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Alert className="mb-4 border-green-200 bg-green-50">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="Votre nouveau mot de passe"
                        className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        autoComplete="new-password"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="Confirmer votre nouveau mot de passe"
                        className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        autoComplete="new-password"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full transition-all duration-200"
                      disabled={isLoading || !newPassword || !confirmPassword}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Réinitialisation...
                        </>
                      ) : (
                        "Réinitialiser le mot de passe"
                      )}
                    </Button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Message de sécurité */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-3 bg-gray-50 rounded-lg border"
            >
              <p className="text-xs text-muted-foreground text-center">
                🔒 Votre sécurité est notre priorité. Nous ne partagerons jamais
                votre email.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
