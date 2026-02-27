// components/RegisterPage.tsx
import React from "react";
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
import { Progress } from "./ui/progress";
import {
  User,
  Phone,
  Globe,
  Building2,
  FileText,
  MapPin,
  Lock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Briefcase,
  Shield,
  Mail,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { motion, AnimatePresence } from "framer-motion";

interface RegisterForm {
  firstName: string;
  lastName: string;
  email?: string;
  phoneCountryCode: string;
  phoneNumber: string;
  country: string;
  role: "ASSISTANT" | "COMPTABLE" | "ADMIN";
  maxAssistants: number;
  companyName: string;
  legalForm: string;
  taxNumber: string;
  address: string;
  city: string;
  password: string;
  confirmPassword: string;
}

interface RegisterPageProps {
  registerForm: RegisterForm;
  registerStep: number;
  registerProgress: number;
  isRegistering: boolean;
  onRegisterChange: (field: keyof RegisterForm, value: string | number) => void;
  onRegisterSubmit: (e: React.FormEvent) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  isStepValid: (step: number) => boolean;
  onSwitchToLogin: () => void;
}

export function RegisterPage({
  registerForm,
  registerStep,
  registerProgress,
  isRegistering,
  onRegisterChange,
  onRegisterSubmit,
  onNextStep,
  onPreviousStep,
  isStepValid,
}: RegisterPageProps) {
  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  // Calculate total steps based on role
  const totalSteps = registerForm.role === "COMPTABLE" ? 5 : 4;

  // Validate Cameroon phone number format
  const isValidCameroonPhone = (phoneNumber: string): boolean => {
    // Remove any spaces, dashes, or other non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, "");

    // Cameroon phone numbers should be 9 digits (without country code)
    if (cleanNumber.length !== 9) {
      return false;
    }

    // Check if it starts with valid prefixes for MTN and Orange
    const mtnPrefixes = ["67", "68", "69"]; // MTN Cameroon
    const orangePrefixes = ["65", "66"]; // Orange Cameroon

    const prefix = cleanNumber.substring(0, 2);

    return mtnPrefixes.includes(prefix) || orangePrefixes.includes(prefix);
  };

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    const hasMinLength = password.length >= 8;

    return {
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      hasMinLength,
      isValid:
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar &&
        hasMinLength,
    };
  };

  const renderRegisterStep = () => {
    const passwordValidation = validatePassword(registerForm.password);

    switch (registerStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="register-firstName">Prénom *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-firstName"
                    type="text"
                    value={registerForm.firstName}
                    onChange={(e) =>
                      onRegisterChange("firstName", e.target.value)
                    }
                    placeholder="Jean"
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {registerForm.firstName &&
                  registerForm.firstName.length < 2 && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-xs text-red-500"
                    >
                      Le prénom doit contenir au moins 2 caractères
                    </motion.p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-lastName">Nom *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-lastName"
                    type="text"
                    value={registerForm.lastName}
                    onChange={(e) =>
                      onRegisterChange("lastName", e.target.value)
                    }
                    placeholder="Dupont"
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {registerForm.lastName && registerForm.lastName.length < 2 && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-red-500"
                  >
                    Le nom doit contenir au moins 2 caractères
                  </motion.p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-phone">Numéro de téléphone *</Label>
              <div className="flex gap-2">
                <Select
                  value={registerForm.phoneCountryCode || "+237"}
                  onValueChange={(value: string) =>
                    onRegisterChange("phoneCountryCode", value)
                  }
                >
                  <SelectTrigger className="w-25 transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="+237" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+237">🇨🇲 +237</SelectItem>
                    <SelectItem value="+229">🇧🇯 +229</SelectItem>
                    <SelectItem value="+225">🇨🇮 +225</SelectItem>
                    <SelectItem value="+221">🇸🇳 +221</SelectItem>
                    <SelectItem value="+228">🇹🇬 +228</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-phone"
                    type="tel"
                    value={registerForm.phoneNumber || ""}
                    onChange={(e) =>
                      onRegisterChange("phoneNumber", e.target.value)
                    }
                    placeholder="6 67 12 34 56"
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              {registerForm.phoneNumber &&
                registerForm.phoneNumber.length < 8 && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-red-500"
                  >
                    Le numéro de téléphone doit contenir au moins 8 caractères
                  </motion.p>
                )}
              {registerForm.phoneCountryCode === "+237" &&
                registerForm.phoneNumber &&
                !isValidCameroonPhone(registerForm.phoneNumber) && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-red-500"
                  >
                    Format invalide pour le Cameroun. Utilisez un numéro MTN
                    (67, 68, 69) ou Orange (65, 66).
                  </motion.p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">Email professionnel</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => onRegisterChange("email", e.target.value)}
                  placeholder="jean.dupont@entreprise.com"
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {registerForm.email &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email) && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-red-500"
                  >
                    Format d'email invalide
                  </motion.p>
                )}
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                className="w-full transition-all duration-200"
                onClick={onNextStep}
                disabled={!isStepValid(1)}
              >
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="register-country">Pays *</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Select
                  value={registerForm.country}
                  onValueChange={(value: string) =>
                    onRegisterChange("country", value)
                  }
                >
                  <SelectTrigger className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Sélectionnez votre pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BJ">Bénin</SelectItem>
                    <SelectItem value="BF">Burkina Faso</SelectItem>
                    <SelectItem value="CI">Côte d'Ivoire</SelectItem>
                    <SelectItem value="SN">Sénégal</SelectItem>
                    <SelectItem value="CM">Cameroun</SelectItem>
                    <SelectItem value="TG">Togo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!registerForm.country && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-red-500"
                >
                  Le pays est requis
                </motion.p>
              )}
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full transition-all duration-200"
                    onClick={onPreviousStep}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                </motion.div>
              </div>
              <div className="flex-1">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    className="w-full transition-all duration-200"
                    onClick={onNextStep}
                    disabled={!isStepValid(2)}
                  >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="register-role">Type de compte *</Label>
              <Select
                value={registerForm.role}
                onValueChange={(value: "ASSISTANT" | "COMPTABLE" | "ADMIN") =>
                  onRegisterChange("role", value)
                }
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Sélectionnez un type de compte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPTABLE">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Comptable</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground"
              >
                {registerForm.role === "COMPTABLE" &&
                  "• Rôle comptable avec permissions métier étendues"}
              </motion.p>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full transition-all duration-200"
                    onClick={onPreviousStep}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                </motion.div>
              </div>
              <div className="flex-1">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    className="w-full transition-all duration-200"
                    onClick={onNextStep}
                    disabled={!isStepValid(3)}
                  >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        // For COMPTABLE, show assistant count step, otherwise show password
        if (registerForm.role === "COMPTABLE") {
          return (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="register-maxAssistants">
                  Nombre d'assistants *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={registerForm.maxAssistants?.toString() || "0"}
                    onValueChange={(value: string) =>
                      onRegisterChange("maxAssistants", parseInt(value, 10))
                    }
                  >
                    <SelectTrigger className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Nombre d'assistants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 assistant</SelectItem>
                      <SelectItem value="1">1 assistant</SelectItem>
                      <SelectItem value="2">2 assistants</SelectItem>
                      <SelectItem value="3">3 assistants</SelectItem>
                      <SelectItem value="5">5 assistants</SelectItem>
                      <SelectItem value="10">10 assistants</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground"
                >
                  • Vous pourrez créer et gérer des comptes assistants dans les
                  paramètres
                  <br />• Les assistants ont un accès limité aux dossiers qui
                  leur sont assignés
                </motion.p>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full transition-all duration-200"
                      onClick={onPreviousStep}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                  </motion.div>
                </div>
                <div className="flex-1">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      className="w-full transition-all duration-200"
                      onClick={onNextStep}
                      disabled={!isStepValid(4)}
                    >
                      Suivant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        }

        // Password step for non-COMPTABLE roles
        return (
          <motion.div
            key="step4"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="register-password">Mot de passe *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => onRegisterChange("password", e.target.value)}
                  placeholder="VotreMotDePasse123!"
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1 text-xs">
                <div
                  className={`flex items-center gap-2 ${
                    passwordValidation.hasMinLength
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      passwordValidation.hasMinLength
                        ? "bg-green-600"
                        : "bg-red-500"
                    }`}
                  />
                  Au moins 8 caractères
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    passwordValidation.hasUpperCase
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      passwordValidation.hasUpperCase
                        ? "bg-green-600"
                        : "bg-red-500"
                    }`}
                  />
                  Au moins une majuscule (A-Z)
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    passwordValidation.hasLowerCase
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      passwordValidation.hasLowerCase
                        ? "bg-green-600"
                        : "bg-red-500"
                    }`}
                  />
                  Au moins une minuscule (a-z)
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    passwordValidation.hasNumber
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      passwordValidation.hasNumber
                        ? "bg-green-600"
                        : "bg-red-500"
                    }`}
                  />
                  Au moins un chiffre (0-9)
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    passwordValidation.hasSpecialChar
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      passwordValidation.hasSpecialChar
                        ? "bg-green-600"
                        : "bg-red-500"
                    }`}
                  />
                  Au moins un caractère spécial (!@#$% etc.)
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-confirm">
                Confirmer le mot de passe *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-confirm"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    onRegisterChange("confirmPassword", e.target.value)
                  }
                  placeholder="Confirmez votre mot de passe"
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {registerForm.confirmPassword &&
                registerForm.password !== registerForm.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-red-500"
                  >
                    Les mots de passe ne correspondent pas
                  </motion.p>
                )}
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full transition-all duration-200"
                    onClick={onPreviousStep}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                </motion.div>
              </div>
              <div className="flex-1">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full transition-all duration-200"
                    disabled={!isStepValid(4) || isRegistering}
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Créer mon compte
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        // Password step for COMPTABLE role
        if (registerForm.role === "COMPTABLE") {
          return (
            <motion.div
              key="step5"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="register-password">Mot de passe *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    value={registerForm.password}
                    onChange={(e) =>
                      onRegisterChange("password", e.target.value)
                    }
                    placeholder="VotreMotDePasse123!"
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <div
                    className={`flex items-center gap-2 ${
                      passwordValidation.hasMinLength
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        passwordValidation.hasMinLength
                          ? "bg-green-600"
                          : "bg-red-500"
                      }`}
                    />
                    Au moins 8 caractères
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      passwordValidation.hasUpperCase
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        passwordValidation.hasUpperCase
                          ? "bg-green-600"
                          : "bg-red-500"
                      }`}
                    />
                    Au moins une majuscule (A-Z)
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      passwordValidation.hasLowerCase
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        passwordValidation.hasLowerCase
                          ? "bg-green-600"
                          : "bg-red-500"
                      }`}
                    />
                    Au moins une minuscule (a-z)
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      passwordValidation.hasNumber
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        passwordValidation.hasNumber
                          ? "bg-green-600"
                          : "bg-red-500"
                      }`}
                    />
                    Au moins un chiffre (0-9)
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      passwordValidation.hasSpecialChar
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        passwordValidation.hasSpecialChar
                          ? "bg-green-600"
                          : "bg-red-500"
                      }`}
                    />
                    Au moins un caractère spécial (!@#$% etc.)
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm">
                  Confirmer le mot de passe *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-confirm"
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) =>
                      onRegisterChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirmez votre mot de passe"
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {registerForm.confirmPassword &&
                  registerForm.password !== registerForm.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-xs text-red-500"
                    >
                      Les mots de passe ne correspondent pas
                    </motion.p>
                  )}
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full transition-all duration-200"
                      onClick={onPreviousStep}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                  </motion.div>
                </div>
                <div className="flex-1">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full transition-all duration-200"
                      disabled={!isStepValid(5) || isRegistering}
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Créer mon compte
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        }
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Créer un compte</CardTitle>
          <CardDescription>
            Étape {registerStep} sur {totalSteps}
          </CardDescription>
          <Progress value={registerProgress} className="mt-2 h-2" />
        </CardHeader>
        <CardContent>
          <form onSubmit={onRegisterSubmit}>
            <AnimatePresence mode="wait">
              {renderRegisterStep()}
            </AnimatePresence>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
