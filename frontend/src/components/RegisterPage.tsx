import React from "react";
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
  onRegisterChange: (field: keyof RegisterFormData, value: string | number) => void;
  onRegisterSubmit: (e: React.FormEvent) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  isStepValid: (step: number) => boolean;
  onSwitchToLogin?: () => void;
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
  onSwitchToLogin = () => {},
}: RegisterPageProps) {
  const { t } = useTranslation();

  // Step 0: Choose verification method
  const [verificationMethod, setVerificationMethod] = React.useState<"email" | "phone" | null>(registerForm.email ? "email" : (registerForm.phoneNumber ? "phone" : null));

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const totalSteps = registerForm.role === "COMPTABLE" ? 5 : 4;

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
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && hasMinLength;
  };

  const handleVerificationMethodSelect = (method: "email" | "phone") => {
    setVerificationMethod(method);
    if (method === "email") {
      onRegisterChange("phoneNumber", "");
    } else {
      onRegisterChange("email", "");
    }
  };

  const renderStep0Verification = () => (
    <motion.div
      key="step0"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Comment souhaitez-vous vérifier votre compte ?
        </h2>
        <p className="text-slate-500">
          Choisissez une méthode pour recevoir votre code de vérification
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleVerificationMethodSelect("email")}
          className={`p-6 rounded-xl border-2 transition-all text-left ${
            verificationMethod === "email"
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 hover:border-blue-300"
          }`}
        >
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
            verificationMethod === "email" ? "bg-blue-500" : "bg-slate-100"
          }`}>
            <Mail className={`h-7 w-7 ${verificationMethod === "email" ? "text-white" : "text-slate-600"}`} />
          </div>
          <h3 className="font-semibold text-lg text-slate-900 mb-1">Par Email</h3>
          <p className="text-sm text-slate-500">
            Recevez votre code de vérification par email
          </p>
          {verificationMethod === "email" && (
            <CheckCircle2 className="w-5 h-5 text-blue-500 mt-3" />
          )}
        </motion.button>

        {/* Phone Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleVerificationMethodSelect("phone")}
          className={`p-6 rounded-xl border-2 transition-all text-left ${
            verificationMethod === "phone"
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 hover:border-blue-300"
          }`}
        >
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
            verificationMethod === "phone" ? "bg-blue-500" : "bg-slate-100"
          }`}>
            <MessageSquare className={`h-7 w-7 ${verificationMethod === "phone" ? "text-white" : "text-slate-600"}`} />
          </div>
          <h3 className="font-semibold text-lg text-slate-900 mb-1">Par SMS</h3>
          <p className="text-sm text-slate-500">
            Recevez votre code de vérification par SMS
          </p>
          {verificationMethod === "phone" && (
            <CheckCircle2 className="w-5 h-5 text-blue-500 mt-3" />
          )}
        </motion.button>
      </div>

      {verificationMethod && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={onNextStep}
            className="w-full h-12 text-base font-medium mt-4"
          >
            Continuer
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );

  const renderStep1Personal = () => (
    <motion.div
      key="step1"
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

      {/* Conditional input based on verification method */}
      {verificationMethod === "email" ? (
        <div className="space-y-2">
          <Label htmlFor="email">Adresse email *</Label>
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
      ) : (
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">{t("phoneNumber")} *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="6XX XXX XXX"
              value={registerForm.phoneNumber}
              onChange={(e) => onRegisterChange("phoneNumber", e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-slate-500">
            Numéro valide Cameroon (MTN: 67x/68x/69x, Orange: 65x/66x)
          </p>
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
            type="password"
            placeholder={t("password")}
            value={registerForm.password}
            onChange={(e) => onRegisterChange("password", e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("confirmPassword")} *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t("confirmPassword")}
            value={registerForm.confirmPassword}
            onChange={(e) => onRegisterChange("confirmPassword", e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="bg-slate-50 p-4 rounded-lg">
        <p className="text-sm font-medium text-slate-700 mb-2">Requirements:</p>
        <ul className="text-xs text-slate-500 space-y-1">
          <li className={registerForm.password.length >= 8 ? "text-green-600" : ""}>
            ✓ At least 8 characters
          </li>
          <li className={/[A-Z]/.test(registerForm.password) ? "text-green-600" : ""}>
            ✓ At least one uppercase letter
          </li>
          <li className={/[a-z]/.test(registerForm.password) ? "text-green-600" : ""}>
            ✓ At least one lowercase letter
          </li>
          <li className={/[0-9]/.test(registerForm.password) ? "text-green-600" : ""}>
            ✓ At least one number
          </li>
          <li className={/[^A-Za-z0-9]/.test(registerForm.password) ? "text-green-600" : ""}>
            ✓ At least one special character
          </li>
        </ul>
      </div>
    </motion.div>
  );

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
            onChange={(e) => onRegisterChange("maxAssistants", parseInt(e.target.value) || 0)}
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

  const getStepContent = () => {
    if (registerStep === 1 && !verificationMethod) {
      return renderStep0Verification();
    }
    if (registerStep === 1) {
      return renderStep1Personal();
    }
    if (registerStep === 2) {
      return renderStep2Password();
    }
    if (registerStep === 3) {
      return renderStep3Role();
    }
    if (registerStep === 4) {
      return renderStep4Company();
    }
    return null;
  };

  const getStepTitle = () => {
    if (registerStep === 1 && !verificationMethod) {
      return "Choisissez votre méthode de vérification";
    }
    if (registerStep === 1) {
      return "Informations personnelles";
    }
    if (registerStep === 2) {
      return "Sécurité du compte";
    }
    if (registerStep === 3) {
      return "Type de compte";
    }
    if (registerStep === 4) {
      return "Informations de l'entreprise";
    }
    return "";
  };

  const currentStep = verificationMethod ? registerStep : 0;
  const adjustedTotalSteps = verificationMethod ? totalSteps : 1;
  const progress = verificationMethod 
    ? ((currentStep - 1) / (adjustedTotalSteps - 1)) * 100 
    : 0;

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>Step {currentStep} of {adjustedTotalSteps}</span>
          <span>{Math.round(progress)}% completed</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {getStepContent()}
      </AnimatePresence>

      {verificationMethod && registerStep > 1 && (
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
          {registerStep < adjustedTotalSteps ? (
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
              onClick={onRegisterSubmit}
              disabled={isRegistering}
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
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}