import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  Loader2,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();

  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user data from navigation state
  const user = location.state?.user;
  const message = location.state?.message;

  useEffect(() => {
    // Redirect if no user data
    if (!user) {
      navigate("/web/user/login");
    }
  }, [user, navigate]);

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError("Veuillez entrer le code OTP");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await verifyOtp(user.id, otpCode.trim());
      // Success - navigate to dashboard (will handle onboarding automatically)
      navigate("/web/user/dashboard/me");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Échec de la vérification OTP";
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = () => {
    // For now, just show a message. In production, this would call an API
    alert("Un nouveau code OTP a été envoyé (123456 pour les tests)");
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo et titre */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg"
          >
            <Shield className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Vérification OTP
          </h1>
          <p className="text-muted-foreground">
            Confirmez votre numéro de téléphone
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Vérification requise
              </CardTitle>
              <CardDescription>
                {message} {user.phoneCountryCode}
                {user.phoneNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                {/* User info display */}
                {/* <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>{user.firstName} {user.lastName}</strong>
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    {user.phoneCountryCode}{user.phoneNumber}
                  </p>
                </div> */}

                <div className="space-y-2">
                  <Label className="mb-6" htmlFor="otp">
                    Code de vérification
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="* * * * *"
                    className=" text-lg tracking-widest font-mono"
                    maxLength={6}
                    autoComplete="off"
                    required
                  />
                  <p className="text-xs  mt-6 h-8 text-muted-foreground ">
                    Entrez le code à 6 chiffres envoyé par SMS
                  </p>
                  {process.env.NODE_ENV === "development" && (
                    <p className="text-xs text-blue-600 text-center mt-1">
                      Code de test: 123456
                    </p>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {error}
                    </p>
                  </motion.div>
                )}

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isVerifying || otpCode.length !== 6}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Vérification...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Vérifier le code
                      </>
                    )}
                  </Button>
                </motion.div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Vous n'avez pas reçu le code ?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendOtp}
                    className="text-xs"
                  >
                    Renvoyer le code
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => navigate("/login")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la connexion
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          <p>Conforme aux normes SYSCOHADA révisé</p>
          <p className="mt-1 opacity-50">Powered by nashsoft systems</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
