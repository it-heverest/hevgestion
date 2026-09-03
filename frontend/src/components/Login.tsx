import React, { useState } from "react";
import { BarChart3, Github, Gitlab } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLogin } from "../hooks/useLogin";
import { useTranslation } from "../hooks/useTranslation";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";
import { BitbucketIcon, GoogleIcon } from "./icons/BrandIcons";

/**
 * Page de connexion / inscription.
 *
 * Mise en page sobre et large, inspirée des pages d'authentification type
 * Render: pas de carte flottante avec ombre, contenu posé directement sur la
 * page, champs sans icône, un lien texte (pas un sélecteur d'onglets) pour
 * basculer entre connexion et inscription — comme le fait Render entre ses
 * pages "Sign in" / "Create an account".
 */

// Fournisseurs pas encore branchés — boutons décoratifs pour l'instant,
// l'intégration OAuth réelle (routes backend, apps chez chaque fournisseur,
// secrets) viendra dans un second temps.
const SOCIAL_PROVIDERS: {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "github", label: "GitHub", Icon: Github },
  { id: "gitlab", label: "GitLab", Icon: Gitlab },
  { id: "bitbucket", label: "Bitbucket", Icon: BitbucketIcon },
  { id: "google", label: "Google", Icon: GoogleIcon },
];

function SocialAuthButtons() {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 gap-3">
        {SOCIAL_PROVIDERS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => alert(`Connexion avec ${label} bientôt disponible`)}
            className="flex h-12 items-center justify-center gap-2 rounded-md border border-gray-200 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">ou</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
    </div>
  );
}
export function Login() {
  const { t } = useTranslation();
  const {
    activeTab,
    loginForm,
    registerForm,
    registerStep,
    registerProgress,
    setActiveTab,
    handleLoginChange,
    handleLogin,
    handleRegisterChange,
    handleRegister,
    nextStep,
    previousStep,
    isStepValid,
    error,
  } = useLogin();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent multiple submissions
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    try {
      await handleLogin(e);
    } catch (err) {
      // Error is already handled in handleLogin, just prevent propagation
      console.error("Login error:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      await handleRegister(e);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Marque, ancrée en haut à gauche de la page. */}
      <div className="px-6 py-8 md:px-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900">
            HevGestion DSF
          </span>
        </div>
      </div>

      {/* Colonne de contenu centrée dans l'espace restant de la page,
          horizontalement et verticalement. */}
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {activeTab === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <h1 className="text-2xl font-semibold text-gray-900 mb-8">
                  Connexion
                </h1>
                <SocialAuthButtons />
                <LoginPage
                  loginForm={loginForm}
                  isLoggingIn={isLoggingIn}
                  onLoginChange={handleLoginChange as any}
                  onLoginSubmit={handleLoginSubmit}
                  onSwitchToRegister={() => setActiveTab("register")}
                  error={error}
                />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <h1 className="text-2xl font-semibold text-gray-900 mb-8">
                  Créer un compte
                </h1>
                <SocialAuthButtons />
                <RegisterPage
                  registerForm={registerForm}
                  registerStep={registerStep}
                  registerProgress={registerProgress}
                  isRegistering={isRegistering}
                  onRegisterChange={handleRegisterChange}
                  onRegisterSubmit={handleRegisterSubmit}
                  onNextStep={nextStep}
                  onPreviousStep={previousStep}
                  isStepValid={isStepValid}
                  onSwitchToLogin={() => setActiveTab("login")}
                  error={error}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-10 text-xs text-muted-foreground">
            {t("systemStatusCompliant")}. © {new Date().getFullYear()}{" "}
            Nashsoft systems.
          </p>
        </div>
      </div>
    </div>
  );
}
