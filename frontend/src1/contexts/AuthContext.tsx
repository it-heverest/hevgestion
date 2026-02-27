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
import { User } from "../utils/localAuth";

// Types et interfaces
export type { User };

export interface LoginCredentials {
  phoneCountryCode?: string;
  phoneNumber?: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email?: string;
  password: string;
  role: "ASSISTANT" | "COMPTABLE" | "ADMIN";
  phoneCountryCode?: string;
  phoneNumber?: string;
  companyName?: string;
  legalForm?: string;
  taxNumber?: string;
  country: string;
  address?: string;
  city?: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  tokens?: Tokens;
  error?: string;
}

export interface UserSettings {
  language?: string;
  theme?: string;
  notifications?: {
    email: boolean;
    push: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (
    userData: RegisterData,
  ) => Promise<{ requiresOtp?: boolean; user?: User }>;
  verifyOtp: (userId: string, otpCode: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refreshSession: () => Promise<void>;
  validateAuthentication: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  updateSettings: (settings: UserSettings) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Fournisseur d'authentification
 * Gère l'état d'authentification de l'utilisateur avec HttpOnly cookies
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // ==================== FONCTIONS UTILITAIRES ====================

  /**
   * Récupérer le profil utilisateur depuis l'API
   */
  const fetchUserProfile = useCallback(async (): Promise<User | null> => {
    try {
      const profileResponse = await authService.getProfile();

      if (profileResponse.success && profileResponse.user) {
        return profileResponse.user;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      return null;
    }
  }, []);

  /**
   * Nettoyer la session d'authentification
   */
  const handleInvalidSession = useCallback(async (): Promise<void> => {
    authService.clearTokens();
    setUser(null);
    setError(null);
  }, []);

  /**
   * Gérer les erreurs d'authentification
   */
  const handleAuthError = useCallback((error: any, defaultMessage: string) => {
    const errorMessage = error.message || defaultMessage;
    setError(errorMessage);
    throw new Error(errorMessage);
  }, []);

  // ==================== FONCTIONS D'AUTHENTIFICATION ====================

  /**
   * Initialiser l'authentification au chargement
   */
  useEffect(() => {
    if (initialized) return;

    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        const userProfile = await fetchUserProfile();

        if (isMounted) {
          setUser(userProfile);
          setInitialized(true);
        }
      } catch (error) {
        console.error("Erreur d'initialisation:", error);
        if (isMounted) {
          setUser(null);
          setInitialized(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [initialized, fetchUserProfile]);

  /**
   * Connexion utilisateur
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!credentials.phoneNumber) {
        throw new Error("Le numéro de téléphone est requis");
      }

      const cleanPhoneNumber = credentials.phoneNumber.replace(/\D/g, "");

      if (cleanPhoneNumber.length < 8) {
        throw new Error(
          "Le numéro de téléphone doit contenir au moins 8 chiffres",
        );
      }

      if (!credentials.password) {
        throw new Error("Le mot de passe est requis");
      }

      const result = await authService.login(
        cleanPhoneNumber,
        credentials.password,
      );

      if (result.success && result.user) {
        setUser(result.user);
      } else {
        throw new Error(result.error || "Échec de la connexion");
      }
    } catch (error: any) {
      handleAuthError(error, "Erreur lors de la connexion");
      await handleInvalidSession();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inscription utilisateur
   */
  const register = async (
    userData: RegisterData,
  ): Promise<{ requiresOtp?: boolean; user?: User }> => {
    try {
      setLoading(true);
      setError(null);

      const validationError = authService.validateRegisterData(userData);
      if (validationError) {
        throw new Error(validationError);
      }

      const result = await authService.register(userData);

      if (result.success && result.user) {
        return {
          requiresOtp: result.requiresOtp,
          user: result.user,
        };
      } else {
        throw new Error(result.error || "Échec de l'inscription");
      }
    } catch (error: any) {
      handleAuthError(error, "Erreur lors de l'inscription");
      await handleInvalidSession();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vérification OTP
   */
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
    } catch (error: any) {
      handleAuthError(error, "Erreur lors de la vérification OTP");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Déconnexion
   */
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      await handleInvalidSession();
      setLoading(false);
    }
  };

  // ==================== GESTION DU PROFIL ====================

  /**
   * Mettre à jour le profil utilisateur
   */
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Replace null values with undefined so they match UpdateProfileData (no nulls)
      const sanitize = <T extends Record<string, any>>(obj: Partial<T>) =>
        Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
          const value = (obj as any)[key];
          acc[key] = value === null ? undefined : value;
          return acc;
        }, {} as Record<string, any>) as Partial<T>;

      const payload = sanitize<User>(data) as any;

      const result = await authService.updateProfile(payload);

      if (result.success && result.user) {
        setUser(result.user);
      } else {
        throw new Error(result.error || "Échec de la mise à jour du profil");
      }
    } catch (error: any) {
      handleAuthError(error, "Erreur lors de la mise à jour du profil");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Changer le mot de passe
   */
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!currentPassword || !newPassword) {
        throw new Error("Les mots de passe sont requis");
      }

      if (newPassword.length < 8) {
        throw new Error(
          "Le nouveau mot de passe doit contenir au moins 8 caractères",
        );
      }

      const result = await authService.changePassword(
        currentPassword,
        newPassword,
      );

      if (!result.success) {
        throw new Error(result.error || "Échec du changement de mot de passe");
      }
    } catch (error: any) {
      handleAuthError(error, "Erreur lors du changement de mot de passe");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mettre à jour les paramètres utilisateur
   */
  const updateSettings = async (settings: UserSettings): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.updateSettings(settings);

      if (result.success && result.user) {
        // Replace the whole user object with the updated one returned by the API
        setUser(result.user);
      } else {
        throw new Error(
          result.error || "Échec de la mise à jour des paramètres",
        );
      }
    } catch (error: any) {
      handleAuthError(error, "Erreur lors de la mise à jour des paramètres");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ==================== FONCTIONS D'ASSISTANCE ====================

  /**
   * Valider l'authentification
   */
  const validateAuthentication = async (): Promise<boolean> => {
    try {
      const userProfile = await fetchUserProfile();

      if (userProfile) {
        setUser(userProfile);
        return true;
      } else {
        await handleInvalidSession();
        return false;
      }
    } catch (error) {
      console.error("Erreur de validation d'authentification:", error);
      await handleInvalidSession();
      return false;
    }
  };

  /**
   * Rafraîchir la session
   */
  const refreshSession = async (): Promise<void> => {
    try {
      const userProfile = await fetchUserProfile();
      if (userProfile) {
        setUser(userProfile);
      } else {
        throw new Error("Impossible de rafraîchir la session");
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement de la session:", error);
      throw error;
    }
  };

  /**
   * Effacer les erreurs
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Configurer le rafraîchissement automatique des tokens
   */
  useEffect(() => {
    const interval = setInterval(
      async () => {
        if (authService.isAuthenticated()) {
          try {
            await authService.refreshTokenIfNeeded();
          } catch (error) {
            console.error(
              "Erreur de rafraîchissement automatique du token:",
              error,
            );
          }
        }
      },
      4 * 60 * 1000,
    ); // Toutes les 4 minutes

    return () => clearInterval(interval);
  }, []);

  // Valeur du contexte
  const value: AuthContextType = {
    user,
    login,
    register,
    verifyOtp,
    logout,
    isAuthenticated: !!user,
    loading,
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

/**
 * Hook pour utiliser le contexte d'authentification
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider",
    );
  }
  return context;
};
