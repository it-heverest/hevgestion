// components/LoginPage.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Phone, Lock, Loader2 } from "lucide-react";
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
}

export function LoginPage({
  loginForm,
  isLoggingIn,
  onLoginChange,
  onLoginSubmit,
  onSwitchToRegister,
}: LoginPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-center">Connexion</CardTitle>
          <CardDescription>
            Accédez à votre espace professionnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onLoginSubmit} className="space-y-4">
            <div className="space-y-2 pb-2">{t("phoneNumber")}
              {/* <Label htmlFor="login-phone">Numéro de téléphone</Label> */}
              <div className="flex gap-2 mt-2">
                <Select
                  value={loginForm.phoneCountryCode || "+237"}
                  onValueChange={(value: string) =>
                    onLoginChange("phoneCountryCode", value)
                  }
                >
                  <SelectTrigger className="w-25 transition-all duration-200 focus:ring-2 focus:ring-blue-500">
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
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-phone"
                    type="tel"
                    value={loginForm.phoneNumber || ""}
                    onChange={(e) =>
                      onLoginChange("phoneNumber", e.target.value)
                    }
                    placeholder="6 67 12 34 56"
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">{t("password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => onLoginChange("password", e.target.value)}
                  placeholder={t("password")}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
            <div className="space-y-2 text-right">
              <button
                type="button"
                className=" text-sm mb-4 text-blue-600 hover:underline font-medium transition-all duration-200"
                onClick={() => {
                  navigate("fr/web/user/forgot-password");
                }}
              >
                {t("forgotPassword")} ?
              </button>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full transition-all duration-200"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  t("signIn")
                )}
              </Button>
            </motion.div>

            <p className="text-center text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <button
                type="button"
                className="text-blue-600 hover:underline font-medium transition-all duration-200"
                onClick={onSwitchToRegister}
              >
                S'inscrire
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
