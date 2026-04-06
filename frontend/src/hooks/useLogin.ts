// hooks/useLogin.ts
import { useCallback, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service"; // Assuming you have this service

export interface LoginFormData {
  phoneCountryCode?: string;
  phoneNumber?: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
  role: "ASSISTANT" | "COMPTABLE" | "ADMIN";
  maxAssistants?: number;
  country: string;
  companyName?: string;
  legalForm?: "SARL" | "SA" | "SUARL" | "INDIVIDUAL" | "OTHER" | "";
  taxNumber?: string;
  address?: string;
  city?: string;
}

// Interface for the hook's return value
export interface ForgotPasswordState {
  email: string;
  isLoading: boolean;
  successMessage: string | null;
  error: string | null;
  resetStates: () => void;
}

export function useLogin() {
  const { login, register, user, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  // États pour les tabs
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // États pour le login
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    phoneCountryCode: "+237",
    phoneNumber: "",
    password: "",
  });

  // États pour le mot de passe oublié
  const [forgotPasswordState, setForgotPasswordState] =
    useState<ForgotPasswordState>({
      email: "",
      isLoading: false,
      successMessage: null,
      error: null,
      resetStates: () => {
        setForgotPasswordState((prev) => ({
          ...prev,
          isLoading: false,
          successMessage: null,
          error: null,
        }));
      },
    });

  // États pour l'inscription
  const [registerStep, setRegisterStep] = useState(1);
  const [registerProgress, setRegisterProgress] = useState(25);
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneCountryCode: "+237",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "COMPTABLE",
    maxAssistants: 0,
    country: "",
    companyName: "",
    legalForm: "",
    taxNumber: "",
    address: "",
    city: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetStates = useCallback(() => {
    setIsLoading(false);
    setSuccessMessage(null);
    setError(null);
    setForgotPasswordState((prev) => ({
      ...prev,
      isLoading: false,
      successMessage: null,
      error: null,
    }));
  }, []);

  // Handlers pour le login
  const handleLoginChange = (field: keyof LoginFormData, value: string) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call login and check if it was successful
      const success = await login({
        phoneCountryCode: loginForm.phoneCountryCode,
        phoneNumber: loginForm.phoneNumber,
        password: loginForm.password,
      });

      // If login failed (success === false), don't navigate
      if (!success) {
        // Error is already set in AuthContext, sync it here
        setError(authError || "Numéro de téléphone ou mot de passe incorrect");
        setIsLoading(false);
        return;
      }

      // Login successful - clear form and navigate
      setLoginForm((prev) => ({
        ...prev,
        phoneNumber: "",
        password: "",
      }));

      navigate("/fr/web/user/select-country");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Échec de la connexion";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers pour l'inscription
  const handleRegisterChange = (
    field: keyof RegisterFormData,
    value: string | number,
  ) => {
    setRegisterForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation du mot de passe
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (registerForm.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return;
    }

    // Validation de la force du mot de passe
    const passwordValidation = validatePasswordStrength(registerForm.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      setIsLoading(false);
      return;
    }

    try {
      // Préparer les données pour l'inscription
      const {
        confirmPassword: _confirmPassword,
        legalForm: _legalForm,
        companyName: _companyName,
        taxNumber: _taxNumber,
        address: _address,
        city: _city,
        phoneCountryCode: _phoneCountryCode,
        phoneNumber: _phoneNumber,
        maxAssistants: _maxAssistants,
        ...baseData
      } = registerForm;

      // N'envoyer que les champs pertinents au backend
      const submitData: any = {
        ...baseData,
        phoneCountryCode: _phoneCountryCode,
        phoneNumber: _phoneNumber,
        maxAssistants: _maxAssistants,
      };

      // Ajouter les champs optionnels seulement s'ils ne sont pas vides
      if (_companyName && _companyName.trim())
        submitData.companyName = _companyName.trim();
      if (_legalForm) submitData.legalForm = _legalForm;
      if (_taxNumber && _taxNumber.trim())
        submitData.taxNumber = _taxNumber.trim();
      if (_address && _address.trim()) submitData.address = _address.trim();
      if (_city && _city.trim()) submitData.city = _city.trim();

      // Ne pas envoyer le champ email s'il est vide
      if (!submitData.email || submitData.email.trim() === "") {
        delete submitData.email;
      }

      const result = await register(submitData);

      if (result.requiresOtp && result.user) {
        // Clear sensitive fields after successful registration initiation
        setRegisterForm((prev) => ({
          ...prev,
          phoneNumber: "",
          password: "",
          confirmPassword: "",
        }));

        // Redirect to OTP verification page with user data
        navigate("/fr/web/user/verify-otp", {
          state: {
            user: result.user,
            message:
              "Registration initiated. Please verify your phone number with the OTP sent.",
          },
        });
      } else {
        // Clear sensitive fields after successful registration
        setRegisterForm((prev) => ({
          ...prev,
          phoneNumber: "",
          password: "",
          confirmPassword: "",
        }));

        // Direct registration success - redirect to country/client selection
        navigate("/fr/web/user/select-country");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Échec de l'inscription";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler pour mot de passe oublié
  const handleForgotPassword = useCallback(async (email: string) => {
    setForgotPasswordState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      successMessage: null,
    }));

    if (!email) {
      setForgotPasswordState((prev) => ({
        ...prev,
        error: "L'email est requis.",
        isLoading: false,
      }));
      return;
    }

    if (!isValidEmail(email)) {
      setForgotPasswordState((prev) => ({
        ...prev,
        error: "Format d'email invalide.",
        isLoading: false,
      }));
      return;
    }

    try {
      const result = await authService.forgotPassword(email);

      if (result.success) {
        setForgotPasswordState((prev) => ({
          ...prev,
          successMessage:
            result.message ||
            "Un lien de réinitialisation a été envoyé à votre email.",
          error: null,
        }));
      } else {
        setForgotPasswordState((prev) => ({
          ...prev,
          error: result.error || "Une erreur est survenue lors de la demande.",
          successMessage: null,
        }));
      }
    } catch (err) {
      setForgotPasswordState((prev) => ({
        ...prev,
        error: "Erreur de connexion. Veuillez réessayer.",
        successMessage: null,
      }));
    } finally {
      setForgotPasswordState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Mise à jour de l'email pour le mot de passe oublié
  const handleForgotEmailChange = (email: string) => {
    setForgotPasswordState((prev) => ({ ...prev, email }));
  };

  // Navigation entre les étapes
  const nextStep = () => {
    const maxSteps = registerForm.role === "COMPTABLE" ? 5 : 4;
    const stepIncrement = registerForm.role === "COMPTABLE" ? 20 : 25;

    if (registerStep < maxSteps && isStepValid(registerStep)) {
      setRegisterStep(registerStep + 1);
      setRegisterProgress((registerStep + 1) * stepIncrement);
    }
  };

  const previousStep = () => {
    if (registerStep > 1) {
      setRegisterStep(registerStep - 1);
      const stepIncrement = registerForm.role === "COMPTABLE" ? 20 : 25;
      setRegisterProgress((registerStep - 1) * stepIncrement);
    }
  };

  // Validation des étapes
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: // Informations personnelles
        return (
          !!registerForm.firstName &&
          registerForm.firstName.length >= 2 &&
          !!registerForm.lastName &&
          registerForm.lastName.length >= 2 &&
          !!registerForm.phoneNumber &&
          registerForm.phoneNumber.length >= 8 &&
          (!registerForm.email || isValidEmail(registerForm.email)) // Email is optional
        );

      case 2: // Informations de contact
        return !!registerForm.country;

      case 3: // Rôle et type de compte
        return !!registerForm.role;

      case 4: // Assistant count (for COMPTABLE) or Password (for others)
        if (registerForm.role === "COMPTABLE") {
          // For COMPTABLE, validate maxAssistants selection
          return (
            registerForm.maxAssistants !== undefined &&
            registerForm.maxAssistants >= 0
          );
        } else {
          // For other roles, validate password
          const passwordValidation = validatePasswordStrength(
            registerForm.password,
          );
          return (
            passwordValidation.isValid &&
            registerForm.password === registerForm.confirmPassword
          );
        }

      case 5: // Password (only for COMPTABLE)
        if (registerForm.role === "COMPTABLE") {
          const passwordValidation = validatePasswordStrength(
            registerForm.password,
          );
          return (
            passwordValidation.isValid &&
            registerForm.password === registerForm.confirmPassword
          );
        }
        return false;

      default:
        return false;
    }
  };

  // Fonction utilitaire pour valider l'email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Fonction pour valider la force du mot de passe
  const validatePasswordStrength = (
    password: string,
  ): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return {
        isValid: false,
        message: "Le mot de passe doit contenir au moins 8 caractères",
      };
    }
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: "Le mot de passe doit contenir au moins une majuscule",
      };
    }
    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        message: "Le mot de passe doit contenir au moins une minuscule",
      };
    }
    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        message: "Le mot de passe doit contenir au moins un chiffre",
      };
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return {
        isValid: false,
        message: "Le mot de passe doit contenir au moins un caractère spécial",
      };
    }
    return { isValid: true, message: "" };
  };

  // Reset form when switching tabs
  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    resetStates();
    if (tab === "login") {
      setLoginForm({ phoneCountryCode: "+237", phoneNumber: "", password: "" });
    } else {
      setRegisterForm({
        firstName: "",
        lastName: "",
        email: "",
        phoneCountryCode: "+237",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        role: "COMPTABLE",
        maxAssistants: 0,
        country: "",
        companyName: "",
        legalForm: "",
        taxNumber: "",
        address: "",
        city: "",
      });
      setRegisterStep(1);
      setRegisterProgress(25);
    }
  };

  // Fonction pour réinitialiser le formulaire d'inscription
  const resetRegisterForm = useCallback(() => {
    setRegisterForm({
      firstName: "",
      lastName: "",
      email: "",
      phoneCountryCode: "+237",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      role: "COMPTABLE",
      maxAssistants: 0,
      country: "",
      companyName: "",
      legalForm: "",
      taxNumber: "",
      address: "",
      city: "",
    });
    setRegisterStep(1);
    setRegisterProgress(25);
  }, []);

  // Fonction pour réinitialiser le formulaire de login
  const resetLoginForm = useCallback(() => {
    setLoginForm({ phoneCountryCode: "+237", phoneNumber: "", password: "" });
  }, []);

  return {
    // États
    activeTab,
    loginForm,
    registerForm,
    isLoading,
    successMessage,
    error,
    forgotPasswordState,
    registerStep,
    registerProgress,

    // Handlers
    handleLoginChange,
    handleLogin,
    handleRegisterChange,
    handleRegister,
    handleForgotPassword,
    handleForgotEmailChange,
    resetStates,
    nextStep,
    previousStep,
    isStepValid,
    setActiveTab: handleTabChange,

    // Setters supplémentaires
    setRegisterStep,
    resetRegisterForm,
    resetLoginForm,

    // Utilitaires
    isValidEmail,
    validatePasswordStrength,
  };
}
