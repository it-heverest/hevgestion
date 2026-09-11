import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTranslation } from "../hooks/useTranslation";
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
  MessageSquare,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { RegisterFormData } from "../hooks/useLogin";

interface RegisterPageProps {
  registerForm: RegisterFormData;
  registerStep: number;
  registerProgress: number;
  isRegistering: boolean;
  onRegisterChange: (
    field: keyof RegisterFormData,
    value: string | number,
  ) => void;
  onRegisterSubmit: (e: React.FormEvent) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onSwitchToLogin: () => void;
  isStepValid: (step: number) => boolean;
  error?: string | null;
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
  onSwitchToLogin,
  isStepValid,
  error,
}: RegisterPageProps) {
  const { t } = useTranslation();

  // Verification method (chosen during verification step)
  const [verificationMethod, setVerificationMethod] = React.useState<
    "email" | "phone" | null
  >(
    registerForm.email ? "email" : registerForm.phoneNumber ? "phone" : "email",
  );

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  // Steps: 1=Personal, 2=Assistants (conditional for COMPTABLE), 3=Password, 4=Verification (OTP)
  const totalSteps = registerForm.role === "COMPTABLE" ? 4 : 3;

  // Numéro mobile camerounais: 9 chiffres commençant par 6, quel que soit
  // l'opérateur (voir la même règle côté backend, utils/validators.ts, où
  // elle est réellement appliquée à l'inscription).
  const isValidCameroonPhone = (phoneNumber: string): boolean => {
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    return /^6\d{8}$/.test(cleanNumber);
  };

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    const hasMinLength = password.length >= 8;
    return (
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar &&
      hasMinLength
    );
  };

  const handleVerificationMethodSelect = (method: "email" | "phone") => {
    setVerificationMethod(method);
    if (method === "email") {
      onRegisterChange("phoneNumber", "");
    } else {
      onRegisterChange("email", "");
    }
  };

  const renderStepPersonal = () => (
    <motion.div
      key="personal"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t("firstName")} *</Label>
          <Input
            id="firstName"
            type="text"
            placeholder={t("firstName")}
            value={registerForm.firstName}
            onChange={(e) => onRegisterChange("firstName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t("lastName")} *</Label>
          <Input
            id="lastName"
            type="text"
            placeholder={t("lastName")}
            value={registerForm.lastName}
            onChange={(e) => onRegisterChange("lastName", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="exemple@email.com"
            value={registerForm.email || ""}
            onChange={(e) => onRegisterChange("email", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Numéro de téléphone *</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="6XX XXX XXX"
            value={registerForm.phoneNumber || ""}
            onChange={(e) => onRegisterChange("phoneNumber", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">{t("country")} *</Label>
          <Select
            value={registerForm.country}
            onValueChange={(value) => onRegisterChange("country", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectCountry")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CM">Cameroun</SelectItem>
              <SelectItem value="CI">Côte d'Ivoire</SelectItem>
              <SelectItem value="SN">Sénégal</SelectItem>
              <SelectItem value="BF">Burkina Faso</SelectItem>
              <SelectItem value="TG">Togo</SelectItem>
              <SelectItem value="BJ">Bénin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("registerAs")} *</Label>
          <Select
            value={registerForm.role}
            onValueChange={(value: "ASSISTANT" | "COMPTABLE" | "ADMIN") => {
              onRegisterChange("role", value);
              if (value === "ASSISTANT") onRegisterChange("maxAssistants", 0);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectRole")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COMPTABLE">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Expert Comptable</span>
                </div>
              </SelectItem>
              <SelectItem value="ASSISTANT">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Assistant</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2Assistants = () => (
    <motion.div
      key="assistants"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      {registerForm.role === "COMPTABLE" ? (
        <div className="space-y-2">
          <Label htmlFor="maxAssistants">Nombre d'assistants *</Label>
          <Select
            value={
              registerForm.maxAssistants === 50
                ? "many"
                : registerForm.maxAssistants?.toString() || "1"
            }
            onValueChange={(value) => {
              const numValue = value === "many" ? 50 : parseInt(value);
              onRegisterChange("maxAssistants", numValue);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un nombre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 assistant</SelectItem>
              <SelectItem value="3">3 assistants</SelectItem>
              <SelectItem value="5">5 assistants</SelectItem>
              <SelectItem value="many">Illimité</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 rounded text-sm text-slate-600">
          Cette étape ne concerne pas le rôle sélectionné. Cliquez sur
          Suivant pour continuer.
        </div>
      )}
    </motion.div>
  );

  const renderStep2Password = () => (
    <motion.div
      key="step2"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="password">{t("password")} *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            value={registerForm.password}
            onChange={(e) => onRegisterChange("password", e.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("confirmPassword")} *</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("confirmPassword")}
            value={registerForm.confirmPassword}
            onChange={(e) =>
              onRegisterChange("confirmPassword", e.target.value)
            }
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="rounded-lg bg-slate-50 p-4">
        <p className="mb-2 text-sm font-medium text-slate-700">Exigences :</p>
        <ul className="space-y-1.5 text-xs">
          {[
            { label: "Au moins 8 caractères", met: registerForm.password.length >= 8 },
            { label: "Au moins une majuscule", met: /[A-Z]/.test(registerForm.password) },
            { label: "Au moins une minuscule", met: /[a-z]/.test(registerForm.password) },
            { label: "Au moins un chiffre", met: /[0-9]/.test(registerForm.password) },
            { label: "Au moins un caractère spécial", met: /[^A-Za-z0-9]/.test(registerForm.password) },
          ].map(({ label, met }) => (
            <li
              key={label}
              className={`flex items-center gap-1.5 transition-colors ${
                met ? "text-green-600" : "text-slate-400"
              }`}
            >
              <CheckCircle2
                className={`h-3.5 w-3.5 flex-none ${met ? "opacity-100" : "opacity-40"}`}
              />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );

  const renderStep3Password = () => renderStep2Password();

  const renderStep3Role = () => (
    <motion.div
      key="step3"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label>{t("registerAs")} *</Label>
        <Select
          value={registerForm.role}
          onValueChange={(value: "ASSISTANT" | "COMPTABLE" | "ADMIN") => {
            onRegisterChange("role", value);
            if (value === "ASSISTANT") {
              onRegisterChange("maxAssistants", 0);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("selectRole")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="COMPTABLE">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Expert Comptable</span>
              </div>
            </SelectItem>
            <SelectItem value="ASSISTANT">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Assistant</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {registerForm.role === "COMPTABLE" && (
        <div className="space-y-2">
          <Label htmlFor="maxAssistants">Number of assistants *</Label>
          <Input
            id="maxAssistants"
            type="number"
            min="0"
            max="10"
            value={registerForm.maxAssistants || 0}
            onChange={(e) =>
              onRegisterChange("maxAssistants", parseInt(e.target.value) || 0)
            }
          />
        </div>
      )}
    </motion.div>
  );

  const renderStep4Company = () => (
    <motion.div
      key="step4"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">{t("country")} *</Label>
          <Select
            value={registerForm.country}
            onValueChange={(value) => onRegisterChange("country", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectCountry")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CM">Cameroun</SelectItem>
              <SelectItem value="CI">Côte d'Ivoire</SelectItem>
              <SelectItem value="SN">Sénégal</SelectItem>
              <SelectItem value="BF">Burkina Faso</SelectItem>
              <SelectItem value="TG">Togo</SelectItem>
              <SelectItem value="BJ">Bénin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">{t("companyName")}</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="companyName"
              type="text"
              placeholder={t("companyName")}
              value={registerForm.companyName || ""}
              onChange={(e) => onRegisterChange("companyName", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="legalForm">Legal form</Label>
        <Select
          value={registerForm.legalForm || ""}
          onValueChange={(value) => onRegisterChange("legalForm", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select legal form" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SARL">SARL</SelectItem>
            <SelectItem value="SA">SA</SelectItem>
            <SelectItem value="SUARL">SUARL</SelectItem>
            <SelectItem value="INDIVIDUAL">Individual</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="taxNumber">Tax ID / NIF</Label>
          <Input
            id="taxNumber"
            type="text"
            placeholder="NIF"
            value={registerForm.taxNumber || ""}
            onChange={(e) => onRegisterChange("taxNumber", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">{t("city")}</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="city"
              type="text"
              placeholder={t("city")}
              value={registerForm.city || ""}
              onChange={(e) => onRegisterChange("city", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
  const renderStep4Verification = () => (
    <motion.div
      key="verification"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Vérification du compte
        </h2>
        <p className="text-slate-500">
          Entrez le code OTP envoyé ou modifiez la méthode de vérification
          ci-dessous.
        </p>
      </div>

      <div className="space-y-4">
        <Label>Méthode de vérification</Label>
        <div className="flex gap-3">
          <Button
            variant={verificationMethod === "email" ? undefined : "outline"}
            onClick={() => handleVerificationMethodSelect("email")}
            className={verificationMethod === "email" ? "flex-1" : "flex-1"}
          >
            Email
          </Button>
          <Button
            variant={verificationMethod === "phone" ? undefined : "outline"}
            onClick={() => handleVerificationMethodSelect("phone")}
            className="flex-1"
          >
            SMS
          </Button>
        </div>

        <div>
          <Label htmlFor="verificationContact">
            {verificationMethod === "email"
              ? "Adresse email *"
              : "Numéro de téléphone *"}
          </Label>
          {verificationMethod === "email" ? (
            <Input
              id="verificationContact"
              type="email"
              placeholder="exemple@email.com"
              value={registerForm.email || ""}
              onChange={(e) => onRegisterChange("email", e.target.value)}
            />
          ) : (
            <Input
              id="verificationContact"
              type="tel"
              placeholder="6XX XXX XXX"
              value={registerForm.phoneNumber || ""}
              onChange={(e) =>
                onRegisterChange("phoneNumber", e.target.value)
              }
            />
          )}
        </div>
      </div>
    </motion.div>
  );

  const getStepContent = () => {
    if (registerStep === 1) return renderStepPersonal();
    if (registerStep === 2) return renderStep2Assistants();
    if (registerStep === 3) return renderStep3Password();
    if (registerStep === 4) return renderStep4Verification();
    return null;
  };

  const getStepTitle = () => {
    if (registerStep === 1) return "Informations personnelles";
    if (registerStep === 2) return "Nombre d'assistants";
    if (registerStep === 3) return "Sécurité du compte";
    if (registerStep === 4) return "Vérification du compte";
    return "";
  };

  const currentStep = registerStep;
  const progress = ((currentStep - 1) / Math.max(1, totalSteps - 1)) * 100;

  return (
    <div className="w-full">
      {totalSteps > 1 && (
        <div className="mb-6">
          <Progress value={progress} className="h-1.5" />
          <p className="mt-2 text-xs text-muted-foreground">
            Étape {currentStep} sur {totalSteps}
          </p>
        </div>
      )}

      <form onSubmit={onRegisterSubmit} noValidate>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">{getStepContent()}</AnimatePresence>

        <div className="flex gap-3 mt-6">
          {registerStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={onPreviousStep}
              className="flex-1"
            >
              Précédent
            </Button>
          )}

          {registerStep === 3 ? (
            <Button
              type="submit"
              disabled={isRegistering || !isStepValid(registerStep)}
              className="flex-1"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création du compte...
                </>
              ) : (
                "Créer le compte"
              )}
            </Button>
          ) : registerStep < totalSteps ? (
            <Button
              type="button"
              onClick={onNextStep}
              disabled={!isStepValid(registerStep)}
              className="flex-1"
            >
              Suivant
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isRegistering || !isStepValid(registerStep)}
              className="flex-1"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création du compte...
                </>
              ) : (
                "Créer le compte"
              )}
            </Button>
          )}
        </div>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary hover:underline font-medium"
        >
          Connectez-vous
        </button>
      </p>
    </div>
  );
}
