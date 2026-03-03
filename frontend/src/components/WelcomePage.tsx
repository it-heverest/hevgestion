// components/WelcomePage.tsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

interface WelcomePageProps {
  onComplete: () => void;
}

export function WelcomePage({ onComplete }: WelcomePageProps) {
  const { t } = useTranslation();
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-8">
        {/* Logo avec animation de rotation */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, ease: "linear", repeat: Infinity },
            scale: { duration: 1.5, repeat: Infinity },
          }}
          className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto"
        >
          <BarChart3 className="h-8 w-8 text-white" />
        </motion.div>
        <div className="h-11"></div>
        {/* Message de bienvenue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t("welcomeUser")}</h1>
          <p className="text-gray-600">{t("loading")}</p>
        </motion.div>
      </div>
    </div>
  );
}
