// contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { authService } from "../services/auth.service";
import type {
  User,
  LoginCredentials,
  RegisterData,
  Tokens,
  AuthResponse,
  UserSettings,
} from "../types";

export type { User, LoginCredentials, RegisterData, Tokens, AuthResponse, UserSettings };

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ requiresOtp?: boolean; user?: User }>;
  verifyOtp: (userId: string, otpCode: string) => Promise<void>;
  resendOtp: (userId: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  isInitializing: boolean;
  error: string | null;
  clearError: () => void;
  refreshSession: () => Promise<void>;
  validateAuthentication: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateSettings: (settings: UserSettings) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // ==================== UTILITY ====================

  const fetchUserProfile = useCallback(async (): Promise<User | null> => {
    try {
      const response = await authService.getProfile();
      if (response.success && response.user) {
        // Check if this user should have restricted access
        const isRestrictedUser = response.user.phoneNumber === "690909090";

        return {
          ...response.user,
          isRestrictedUser,
        };
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const handleInvalidSession = useCallback(async (): Promise<void> => {
    authService.clearTokens();
    setUser(null);
    setError(null);
    // Clear all localStorage
    localStorage.clear();
    // Clear all sessionStorage
    sessionStorage.clear();
    // Clear cookies by setting them to expire
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }, []);

  const handleAuthError = useCallback((err: any, defaultMessage: string) => {
    const message = err?.message || defaultMessage;
    setError(message);
    throw new Error(message);
  }, []);

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    if (initialized) return;
    let mounted = true;

    const init = async () => {
      try {
        setLoading(true);
        
        // Try to refresh token using cookie first (if no accessToken in memory)
        if (!authService.getToken()) {
          try {
            const refreshResult = await authService.refreshToken();
            if (refreshResult) {
              // Token refreshed successfully, now fetch profile
              const profile = await fetchUserProfile();
              if (mounted) {
                setUser(profile);
                setInitialized(true);
              }
              return;
            }
          } catch (refreshErr) {
            // Refresh failed, try fetching profile anyway (cookie might be expired)
            console.log("Token refresh failed, trying direct profile fetch");
          }
        }
        
        // Fallback: try to get profile directly
        const profile = await fetchUserProfile();
        if (mounted) {
          setUser(profile);
          setInitialized(true);
        }
      } catch {
        if (mounted) {
          setUser(null);
          setInitialized(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitializing(false);
        }
      }
    };

    init();
    return () => { mounted = false; };
  }, [initialized, fetchUserProfile]);

  // Auto-refresh token every 4 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      if (authService.isAuthenticated()) {
        try {
          await authService.refreshTokenIfNeeded();
        } catch (err) {
          console.error("Auto token refresh failed:", err);
        }
      }
    }, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ==================== AUTH ACTIONS ====================

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      if (!credentials.phoneNumber) throw new Error("Le numéro de téléphone est requis");
      const cleanPhone = credentials.phoneNumber.replace(/\D/g, "");
      if (cleanPhone.length < 8) throw new Error("Le numéro de téléphone doit contenir au moins 8 chiffres");
      if (!credentials.password) throw new Error("Le mot de passe est requis");

      const result = await authService.login(cleanPhone, credentials.password);
      if (result.success && result.user) {
        // Check if this user should have restricted access (based on phone number)
        const isRestrictedUser = cleanPhone === "690909090";

        const userWithRestrictions = {
          ...result.user,
          isRestrictedUser,
        };

        setUser(userWithRestrictions);
        return { success: true }; // Login successful
      } else {
        // Don't throw, just set the error message
        const errorMsg = result.error || "Numéro de téléphone ou mot de passe incorrect";
        setError(errorMsg);
        return { success: false, error: errorMsg }; // Login failed
      }
    } catch (err: any) {
      // For validation errors (before API call), set error
      const errorMessage = err?.message || "Erreur lors de la connexion";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{ requiresOtp?: boolean; user?: User }> => {
    try {
      setLoading(true);
      setError(null);

      const validationError = authService.validateRegisterData(userData);
      if (validationError) throw new Error(validationError);

      const result = await authService.register(userData);
      if (result.success && result.user) {
        return { requiresOtp: result.requiresOtp, user: result.user };
      }
      throw new Error(result.error || "Échec de l'inscription");
    } catch (err: any) {
      await handleInvalidSession();
      handleAuthError(err, "Erreur lors de l'inscription");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (userId: string, otpCode: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.verifyOtp(userId, otpCode);
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        throw new Error(result.error || "Échec de la vérification OTP");
      }
    } catch (err: any) {
      handleAuthError(err, "Erreur lors de la vérification OTP");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (userId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.resendOtp(userId);
      return result;
    } catch (err: any) {
      const message = err?.message || "Erreur lors de l'envoi du code";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      await handleInvalidSession();
      setLoading(false);
    }
  };

  // ==================== PROFILE MANAGEMENT ====================

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Strip null values → undefined
      const payload = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === null ? undefined : v])
      ) as any;

      const result = await authService.updateProfile(payload);
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        throw new Error(result.error || "Échec de la mise à jour du profil");
      }
    } catch (err: any) {
      handleAuthError(err, "Erreur lors de la mise à jour du profil");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!currentPassword || !newPassword) throw new Error("Les mots de passe sont requis");
      if (newPassword.length < 8) throw new Error("Le nouveau mot de passe doit contenir au moins 8 caractères");

      const result = await authService.changePassword(currentPassword, newPassword);
      if (!result.success) throw new Error(result.error || "Échec du changement de mot de passe");
    } catch (err: any) {
      handleAuthError(err, "Erreur lors du changement de mot de passe");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (settings: UserSettings): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.updateSettings(settings);
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        throw new Error(result.error || "Échec de la mise à jour des paramètres");
      }
    } catch (err: any) {
      handleAuthError(err, "Erreur lors de la mise à jour des paramètres");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ==================== SESSION HELPERS ====================

  const validateAuthentication = async (): Promise<boolean> => {
    const profile = await fetchUserProfile();
    if (profile) {
      setUser(profile);
      return true;
    }
    await handleInvalidSession();
    return false;
  };

  const refreshSession = async (): Promise<void> => {
    const profile = await fetchUserProfile();
    if (profile) {
      setUser(profile);
    } else {
      throw new Error("Impossible de rafraîchir la session");
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    isAuthenticated: !!user,
    loading,
    isInitializing,
    error,
    clearError,
    refreshSession,
    validateAuthentication,
    updateProfile,
    changePassword,
    updateSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  return ctx;
};
