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
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // Gestionnaires de navigation avec fallback
  const handleBackToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      navigate("/login");
    }
  };

  const handleSwitchToRegister = () => {
    if (onSwitchToRegister) {
      onSwitchToRegister();
    } else {
      navigate("/register");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
          "Un lien de réinitialisation a été envoyé à votre adresse email."
        );
        setEmailSent(true);
      } else {
        setError(
          result.error ||
          "Une erreur est survenue lors de l'envoi du lien de réinitialisation."
        );
      }
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setError(null);
    setSuccessMessage(null);
    setEmailSent(false);
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
                {emailSent ? "Email envoyé" : "Mot de passe oublié"}
              </CardTitle>
            </div>
            <CardDescription>
              {emailSent
                ? "Consultez votre boîte email pour réinitialiser votre mot de passe"
                : "Saisissez votre email pour recevoir un lien de réinitialisation"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {!emailSent ? (
                <motion.form
                  key="forgot-form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
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
                        onChange={(e) => handleEmailChange(e.target.value)}
                        placeholder="votre@email.com"
                        className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        autoComplete="off"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Vous recevrez un lien sécurisé pour réinitialiser votre
                      mot de passe
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
                        "Envoyer le lien de réinitialisation"
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
              ) : (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center"
                >
                  {/* Icône de succès */}
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </motion.div>
                  </div>

                  {/* Message de succès */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">
                      Email envoyé avec succès !
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {successMessage}
                    </p>
                  </div>

                  {/* Instructions supplémentaires */}
                  <div className="bg-blue-50 p-4 rounded-lg text-left space-y-2">
                    <p className="text-sm font-medium text-blue-800">
                      📧 Consultez votre boîte email
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                      <li>
                        Vérifiez votre dossier de spam si vous ne voyez pas
                        l'email
                      </li>
                      <li>Le lien de réinitialisation expire dans 1 heure</li>
                      <li>
                        Cliquez sur le lien pour créer un nouveau mot de passe
                      </li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="w-full"
                    >
                      Réinitialiser un autre mot de passe
                    </Button>

                    <Button
                      onClick={handleBackToLogin}
                      variant="ghost"
                      className="w-full"
                    >
                      Retour à la connexion
                    </Button>
                  </div>
                </motion.div>
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
