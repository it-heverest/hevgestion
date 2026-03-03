import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useLogin } from "../hooks/useLogin";
import { useTranslation } from "../hooks/useTranslation";
import { WelcomePage } from "./WelcomePage";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";

export function Login() {
  const { t } = useTranslation();
  const [showWelcome, setShowWelcome] = useState(true);
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
  } = useLogin();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await handleLogin(e);
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

  if (showWelcome) {
    return <WelcomePage onComplete={() => setShowWelcome(false)} />;
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
            <BarChart3 className="h-8 w-8 text-white" />
          </motion.div>
          <hHevGestion DSF
          </h1>
          <p className="text-muted-foreground">{t("systemStatusCompliant")}
          <p className="text-muted-foreground">Gestion Comptable OHADA</p>
        </motion.div>

        <Tabs
          value={activeTab}
          onValueChange={(v: "login" | "register") => setActiveTab(v)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="login"
              className="transition-all duration-200 data-[state=active]:shadow-sm"
            >
              {t("login")}
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="transition-all duration-200 data-[state=active]:shadow-sm"
            >
              {t("register")}
            </TabsTrigger>
          </TabsList>

          {/* Onglet Connexion */}
          <TabsContent value="login">
            <LoginPage
              loginForm={loginForm}
              isLoggingIn={isLoggingIn}
              onLoginChange={handleLoginChange}
              onLoginSubmit={handleLoginSubmit}
              onSwitchToRegister={() => setActiveTab("register")}
            />
          </TabsContent>

          {/* Onglet Inscription */}
          <TabsContent value="register">
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
            />
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          <p>{t("systemStatusCompliant")}</p>
          <p className="mt-1 opacity-50">{t("poweredBy")}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
