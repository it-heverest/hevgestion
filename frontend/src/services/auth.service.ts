// services/auth.service.ts
import axios, { AxiosResponse } from "axios";
import type { User, RegisterData, Tokens, UserSettings } from "../types";
import { API_CONFIG } from "../config/api";

// Interfaces
export interface AuthResponse {
  success: boolean;
  user?: User;
  tokens?: Tokens;
  error?: string;
  message?: string;
  requiresOtp?: boolean;
}

export interface PasswordResetResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  companyName?: string;
  address?: string;
  city?: string;
  country?: string;
}

/**
 * Service d'authentification avec Split Storage (Best Practice)
 * - Access Token: en mémoire (disparaît au refresh - sécurisé)
 * - Refresh Token: cookie HttpOnly (géré par le serveur)
 */
class AuthService {
  private baseURL = API_CONFIG.AUTH;
  private accessToken: string | null = null;
  private readonly TOKEN_BUFFER_TIME = 5 * 60 * 1000; // 5 minutes

  // ==================== GESTION DES TOKENS ====================

  constructor() {
    // Ne plus charger depuis localStorage - token en mémoire seulement
    // Le refresh se fait via le cookie HttpOnly automatiquement
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  clearTokens(): void {
    this.accessToken = null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch {
      return true;
    }
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      throw new Error("Token invalide");
    }
  }

  getUserFromToken(
    token: string,
  ): { id: string; email: string; role: string } | null {
    try {
      const payload = this.decodeToken(token);
      return {
        id: payload.sub || payload.id,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      return null;
    }
  }

  // ==================== REQUÊTES API ====================

  private async makeRequest<T>(
    method: "get" | "post" | "patch" | "delete",
    endpoint: string,
    data?: any,
    requiresAuth: boolean = false,
  ): Promise<T> {
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(requiresAuth && this.getToken()
          ? { Authorization: `Bearer ${this.getToken()}` }
          : {}),
      },
      withCredentials: true,
    };

    try {
      let response: AxiosResponse;

      switch (method) {
        case "get":
          response = await axios.get(`${this.baseURL}${endpoint}`, config);
          break;
        case "post":
          response = await axios.post(
            `${this.baseURL}${endpoint}`,
            data,
            config,
          );
          break;
        case "patch":
          response = await axios.patch(
            `${this.baseURL}${endpoint}`,
            data,
            config,
          );
          break;
        case "delete":
          response = await axios.delete(`${this.baseURL}${endpoint}`, config);
          break;
        default:
          throw new Error(`Méthode HTTP non supportée: ${method}`);
      }

      return response.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  private handleApiError(error: any): Error {
    console.error("Erreur API:", error);

    if (!error.response) {
      return new Error(
        "Problème de connexion réseau. Vérifiez votre connexion internet.",
      );
    }

    const status = error.response.status;
    const message = error.response.data?.message || "Une erreur s'est produite";

    switch (status) {
      case 400:
        return new Error(message || "Données invalides");
      case 401:
        return new Error(message || "Numéro de téléphone ou mot de passe incorrect");
      case 403:
        return new Error(message || "Accès interdit");
      case 404:
        return new Error(message || "Ressource non trouvée");
      case 409:
        return new Error(message || "Conflit de données");
      case 422:
        return new Error(message || "Données invalides");
      case 500:
        return new Error("Erreur serveur. Veuillez réessayer plus tard.");
      default:
        return new Error(message);
    }
  }

  // ==================== AUTHENTIFICATION ====================

  async login(identifier: string, password: string): Promise<AuthResponse> {
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      const loginData = isEmail
        ? { email: identifier, password }
        : { phone: identifier, password };

      const response = await this.makeRequest<any>("post", "/login", loginData);

      if (response.accessToken) {
        this.setAccessToken(response.accessToken);
      }

      return {
        success: true,
        user: response.user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<any>(
        "post",
        "/register",
        userData,
      );

      return {
        success: true,
        user: response.user,
        message: response.message,
        requiresOtp: response.requiresOtp,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async verifyOtp(userId: string, otpCode: string): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<any>("post", "/verify-otp", {
        userId,
        otpCode,
      });

      if (response.accessToken) {
        this.setAccessToken(response.accessToken);
      }

      return {
        success: true,
        user: response.user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async resendOtp(userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.makeRequest<any>("post", "/resend-otp", {
        userId,
      });

      return {
        success: response.success || true,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest("post", "/logout", {});
    } finally {
      this.clearTokens();
    }
  }

  // ==================== GESTION DU PROFIL ====================

  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<any>(
        "get",
        "/profile",
        null,
        true,
      );

      return {
        success: true,
        user: response.user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<any>(
        "patch",
        "/profile",
        data,
        true,
      );

      return {
        success: true,
        user: response.user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<AuthResponse> {
    try {
      await this.makeRequest(
        "post",
        "/change-password",
        { currentPassword, newPassword },
        true,
      );

      return {
        success: true,
        message: "Mot de passe changé avec succès",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async updateSettings(settings: UserSettings): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<any>(
        "patch",
        "/settings",
        { settings },
        true,
      );

      return {
        success: true,
        user: response.user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== RÉINITIALISATION DE MOT DE PASSE ====================

  async forgotPassword(email: string): Promise<PasswordResetResponse> {
    try {
      const response = await this.makeRequest<any>("post", "/forgot-password", {
        email,
      });

      return {
        success: true,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<PasswordResetResponse> {
    try {
      const response = await this.makeRequest<any>("post", "/reset-password", {
        token,
        newPassword,
      });

      return {
        success: true,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== RAFRAÎCHISSEMENT DE TOKEN ====================

  async refreshToken(): Promise<boolean> {
    try {
      const response = await this.makeRequest<any>("post", "/refresh", {});

      if (response.accessToken) {
        this.setAccessToken(response.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async refreshTokenIfNeeded(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();

      if (expirationTime - currentTime <= this.TOKEN_BUFFER_TIME) {
        return await this.refreshToken();
      }
      return false;
    } catch {
      return false;
    }
  }

  // ==================== VALIDATIONS ====================

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidUser(userData: any): userData is User {
    return Boolean(
      userData &&
      typeof userData.id === "string" &&
      typeof userData.firstName === "string" &&
      typeof userData.lastName === "string" &&
      typeof userData.email === "string" &&
      ["ASSISTANT", "COMPTABLE", "ADMIN"].includes(userData.role),
    );
  }

  validateRegisterData(userData: RegisterData): string | null {
    const validations = [
      {
        condition: !userData.firstName || userData.firstName.trim().length < 2,
        message: "Le prénom doit contenir au moins 2 caractères",
      },
      {
        condition: !userData.lastName || userData.lastName.trim().length < 2,
        message: "Le nom doit contenir au moins 2 caractères",
      },
      {
        condition: !userData.email || !this.isValidEmail(userData.email),
        message: "Un email valide est requis",
      },
      {
        condition: !userData.password || userData.password.length < 8,
        message: "Le mot de passe doit contenir au moins 8 caractères",
      },
      {
        condition: !/[A-Z]/.test(userData.password || ""),
        message: "Le mot de passe doit contenir au moins une majuscule",
      },
      {
        condition: !/[a-z]/.test(userData.password || ""),
        message: "Le mot de passe doit contenir au moins une minuscule",
      },
      {
        condition: !/[0-9]/.test(userData.password || ""),
        message: "Le mot de passe doit contenir au moins un chiffre",
      },
      {
        condition: !/[^A-Za-z0-9]/.test(userData.password || ""),
        message: "Le mot de passe doit contenir au moins un caractère spécial",
      },
      {
        condition: !["ASSISTANT", "COMPTABLE", "ADMIN"].includes(userData.role),
        message: "Rôle utilisateur invalide",
      },
      {
        condition: !userData.country || userData.country.length !== 2,
        message: "Le code pays (2 lettres) est requis",
      },
    ];

    for (const validation of validations) {
      if (validation.condition) {
        return validation.message;
      }
    }

    return null;
  }

  // ==================== UTILITAIRES ====================

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  normalizeUserData(userData: any): User {
    return {
      id: userData.id || "",
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      phoneCountryCode: userData.phoneCountryCode || null,
      phoneNumber: userData.phoneNumber || null,
      role: userData.role || "ASSISTANT",
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      // companyName: userData.companyName || "",
      // legalForm: userData.legalForm || "",
      // taxNumber: userData.taxNumber || "",
      // country: userData.country || "",
      // address: userData.address || "",
      // city: userData.city || "",
      createdAt: userData.createdAt || new Date().toISOString(),
      // settings: userData.settings || {},
      maxAssistants: userData.maxAssistants || 0,
    };
  }
}

export const authService = new AuthService();
