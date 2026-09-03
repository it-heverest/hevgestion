// components/LoginPage.tsx
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTranslation } from "../hooks/useTranslation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface LoginPageProps {
  loginForm: {
    phoneCountryCode?: string;
    phoneNumber?: string;
    password: string;
  };
  isLoggingIn: boolean;
  onLoginChange: (field: keyof any, value: string) => void;
  onLoginSubmit: (e: React.FormEvent) => void;
  onSwitchToRegister: () => void;
  error?: string | null;
}

export function LoginPage({
  loginForm,
  isLoggingIn,
  onLoginChange,
  onLoginSubmit,
  onSwitchToRegister,
  error,
}: LoginPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <form onSubmit={onLoginSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login-phone">{t("phoneNumber")}</Label>
          <div className="flex gap-2">
            <Select
              value={loginForm.phoneCountryCode || "+237"}
              onValueChange={(value: string) =>
                onLoginChange("phoneCountryCode", value)
              }
            >
              <SelectTrigger className="h-12 w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+237">🇨🇲 +237</SelectItem>
                <SelectItem value="+229">🇧🇯 +229</SelectItem>
                <SelectItem value="+225">🇨🇮 +225</SelectItem>
                <SelectItem value="+221">🇸🇳 +221</SelectItem>
                <SelectItem value="+228">🇹🇬 +228</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="login-phone"
              type="tel"
              value={loginForm.phoneNumber || ""}
              onChange={(e) => onLoginChange("phoneNumber", e.target.value)}
              placeholder="6XX XXX XXX"
              className="h-12 flex-1"
              autoComplete="off"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">{t("password")}</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={loginForm.password}
              onChange={(e) => onLoginChange("password", e.target.value)}
              placeholder={t("password")}
              className="h-12 pr-10"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-primary hover:underline font-medium"
              onClick={() => navigate("/fr/web/user/forgot-password")}
            >
              {t("forgotPassword")} ?
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <Button type="submit" className="h-12 w-full" disabled={isLoggingIn}>
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion...
            </>
          ) : (
            t("signIn")
          )}
        </Button>

        <p className="text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <button
            type="button"
            className="text-primary hover:underline font-medium"
            onClick={onSwitchToRegister}
          >
            S'inscrire
          </button>
        </p>
      </form>
    </motion.div>
  );
}
