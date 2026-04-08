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
  Lock,
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
  const [timeLeft, setTimeLeft] = useState(600);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const user = location.state?.user;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!user) {
      navigate("/fr/web/user/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Handle paste - if 6 digits are pasted at once
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      setOtpCode(value.split(""));
      setError(null);
      inputRefs.current[5]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Enter key handling
    if (e.key === "Enter") {
      e.preventDefault();
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      } else {
        // On last input, submit the form
        const code = otpCode.join("");
        if (code.length === 6) {
          handleOtpSubmit(e as any);
        }
      }
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
        setTimeLeft(600);
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
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-4 text-center"
          >
            HevGestion DSF
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-blue-200 text-lg text-center max-w-md"
          >
            Système de gestion des déclarations statistiques et fiscales
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex items-center gap-4 text-blue-200"
          >
            <Lock className="w-5 h-5" />
            <span className="text-sm">Sécurité garantie</span>
          </motion.div>
        </div>
      </div>

      {/* Right side - OTP Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">HevGestion</span>
          </div>

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
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              >
                <Shield className="h-8 w-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Vérification de sécurité
              </CardTitle>
              <p className="text-slate-500 mt-3 text-sm">
                Entrez le code à 6 chiffres envoyé à
              </p>
              <p className="font-semibold text-blue-600">{user.email}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleOtpSubmit}>
                {/* OTP Input */}
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
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all"
                      disabled={isVerifying}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {/* Error message */}
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm text-center mb-4"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Success message */}
                {resendSuccess && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-600 text-sm text-center mb-4"
                  >
                    ✓ Nouveau code envoyé avec succès !
                  </motion.p>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
                  disabled={isVerifying || otpCode.join("").length !== 6}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Vérification en cours...
                    </>
                  ) : (
                    "Vérifier le code"
                  )}
                </Button>
              </form>

              {/* Resend section */}
              <div className="text-center space-y-4 pt-4 border-t border-slate-100">
                {timeLeft > 0 ? (
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Timer className="h-4 w-4" />
                    <span className="text-sm">
                      Code expire dans {formatTime(timeLeft)}
                    </span>
                  </div>
                ) : (
                  <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg text-sm">
                    Code expiré
                  </div>
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
    </div>
  );
}