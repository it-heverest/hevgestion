import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Loader2,
  Mail,
  Timer,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp } = useAuth();

  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const user = location.state?.user;
  const message = location.state?.message;

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Redirect if no user data
  useEffect(() => {
    if (!user) {
      navigate("/fr/web/user/login");
    }
  }, [user, navigate]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join("");
    
    if (code.length !== 6) {
      setError("Veuillez entrer le code à 6 chiffres");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await verifyOtp(user.id, code);
      navigate("/fr/web/user/select-country");
    } catch (err: any) {
      setError(err?.message || "Code invalide ou expiré");
      setOtpCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    
    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const result = await resendOtp(user.id);
      if (result.success) {
        setResendSuccess(true);
        setTimeLeft(600); // Reset timer
        setOtpCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        setError(result.message || "Erreur lors de l'envoi");
      }
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'envoi du code");
    } finally {
      setIsResending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back button */}
        <button
          onClick={() => navigate("/fr/web/user/login")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Retour à la connexion</span>
        </button>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Vérification email
            </CardTitle>
            <p className="text-slate-500 mt-2">
              Entrez le code à 6 chiffres envoyé à
            </p>
            <p className="font-medium text-blue-600">{user.email}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleOtpSubmit}>
              {/* OTP Input - 6 boxes */}
              <div className="flex justify-center gap-2 mb-6">
                {otpCode.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    disabled={isVerifying}
                  />
                ))}
              </div>

              {/* Error message */}
              {error && (
                <p className="text-red-500 text-sm text-center mb-4">{error}</p>
              )}

              {/* Success message */}
              {resendSuccess && (
                <p className="text-green-600 text-sm text-center mb-4">
                  Nouveau code envoyé !
                </p>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isVerifying || otpCode.join("").length !== 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  "Vérifier"
                )}
              </Button>
            </form>

            {/* Resend section */}
            <div className="text-center space-y-3 pt-4 border-t border-slate-100">
              {timeLeft > 0 ? (
                <div className="flex items-center justify-center gap-2 text-slate-500">
                  <Timer className="h-4 w-4" />
                  <span className="text-sm">
                    Code expire dans {formatTime(timeLeft)}
                  </span>
                </div>
              ) : (
                <p className="text-orange-600 text-sm">Code expiré</p>
              )}

              <button
                onClick={handleResend}
                disabled={isResending}
                className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm mx-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Renvoyer le code
                  </>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-400 text-xs mt-6">
          Le code est valide pendant 10 minutes
        </p>
      </motion.div>
    </div>
  );
}