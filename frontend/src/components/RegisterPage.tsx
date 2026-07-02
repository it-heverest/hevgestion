import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTranslation } from "../hooks/useTranslation";
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

  const isValidCameroonPhone = (phoneNumber: string): boolean => {
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    if (cleanNumber.length !== 9) return false;
    const mtnPrefixes = ["67", "68", "69"];
    const orangePrefixes = ["65", "66"];
    const prefix = cleanNumber.substring(0, 2);
    return mtnPrefixes.includes(prefix) || orangePrefixes.includes(prefix);
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
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="firstName"
              type="text"
              placeholder={t("firstName")}
              value={registerForm.firstName}
              onChange={(e) => onRegisterChange("firstName", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t("lastName")} *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="lastName"
              type="text"
              placeholder={t("lastName")}
              value={registerForm.lastName}
              onChange={(e) => onRegisterChange("lastName", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="exemple@email.com"
              value={registerForm.email || ""}
              onChange={(e) => onRegisterChange("email", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Numéro de téléphone *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="6XX XXX XXX"
              value={registerForm.phoneNumber || ""}
              onChange={(e) => onRegisterChange("phoneNumber", e.target.value)}
              className="pl-10"
            />
          </div>
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
          <Label htmlFor="maxAssistants">Number of assistants *</Label>
          <Select
            value={registerForm.maxAssistants?.toString() || "1"}
            onValueChange={(value) => {
              const numValue = value === "many" ? 50 : parseInt(value);
              onRegisterChange("maxAssistants", numValue);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select number of assistants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 assistant</SelectItem>
              <SelectItem value="3">3 assistants</SelectItem>
              <SelectItem value="5">5 assistants</SelectItem>
              <SelectItem value="many">Many (unlimited)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 rounded">
          This step is optional for your selected role. Click Next to continue.
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
          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            value={registerForm.password}
            onChange={(e) => onRegisterChange("password", e.target.value)}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("confirmPassword")} *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("confirmPassword")}
            value={registerForm.confirmPassword}
            onChange={(e) =>
              onRegisterChange("confirmPassword", e.target.value)
            }
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="bg-slate-50 p-4 rounded-lg">
        <p className="text-sm font-medium text-slate-700 mb-2">Requirements:</p>
        <ul className="text-xs text-slate-500 space-y-1">
          <li
            className={
              registerForm.password.length >= 8 ? "text-green-600" : ""
            }
          >
            ✓ At least 8 characters
          </li>
          <li
            className={
              /[A-Z]/.test(registerForm.password) ? "text-green-600" : ""
            }
          >
            ✓ At least one uppercase letter
          </li>
          <li
            className={
              /[a-z]/.test(registerForm.password) ? "text-green-600" : ""
            }
          >
            ✓ At least one lowercase letter
          </li>
          <li
            className={
              /[0-9]/.test(registerForm.password) ? "text-green-600" : ""
            }
          >
            ✓ At least one number
          </li>
          <li
            className={
              /[^A-Za-z0-9]/.test(registerForm.password) ? "text-green-600" : ""
            }
          >
            ✓ At least one special character
          </li>
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
          <div className="relative">
            {verificationMethod === "email" ? (
              <>
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="verificationContact"
                  type="email"
                  placeholder="exemple@email.com"
                  value={registerForm.email || ""}
                  onChange={(e) => onRegisterChange("email", e.target.value)}
                  className="pl-10"
                />
              </>
            ) : (
              <>
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="verificationContact"
                  type="tel"
                  placeholder="6XX XXX XXX"
                  value={registerForm.phoneNumber || ""}
                  onChange={(e) =>
                    onRegisterChange("phoneNumber", e.target.value)
                  }
                  className="pl-10"
                />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input id="allowChangeOtp" type="checkbox" checked={false} readOnly />
          <label htmlFor="allowChangeOtp" className="text-sm text-slate-500">
            Allow user to change OTP verification method later
          </label>
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
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round(progress)}% completed</span>
        </div>
      </div>

      <form onSubmit={onRegisterSubmit} noValidate>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">{getStepContent()}</AnimatePresence>

        <div className="flex gap-3 mt-8">
          {registerStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={onPreviousStep}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
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
                  Creating account...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Register
                </>
              )}
            </Button>
          ) : registerStep < totalSteps ? (
            <Button
              type="button"
              onClick={onNextStep}
              disabled={!isStepValid(registerStep)}
              className="flex-1"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
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
                  Creating account...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Create account
                </>
              )}
            </Button>
          )}
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-orange-600 hover:underline font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
