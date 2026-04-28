// services/revue-fiscal.service.ts
import axios from "axios";
import { API_CONFIG } from "../config/api";
import { authService } from "./auth.service";

export type RevueFiscalEval = "NA" | "OK" | "ERR_MAT" | "ANOMALIE";
export type RevueFiscalPriority = "HAUTE" | "NORMALE" | "BASSE";

export interface RevueFiscalCompany {
  id: string;
  name: string;
  sector?: string;
  exercice?: string;
  reviseur?: string;
  chef?: string;
  niu?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevueFiscalQuestionState {
  id: string;
  companyId: string;
  questionId: string;
  eval?: RevueFiscalEval;
  note?: string;
  renvoi?: string;
  priority: RevueFiscalPriority;
  createdAt: string;
  updatedAt: string;
}

export interface RevueFiscalCompanyWithStates extends RevueFiscalCompany {
  questionStates: RevueFiscalQuestionState[];
}

export interface CreateCompanyData {
  name: string;
  sector?: string;
  exercice?: string;
  reviseur?: string;
  chef?: string;
  niu?: string;
}

export interface UpdateQuestionStateData {
  companyId: string;
  questionId: string;
  eval?: RevueFiscalEval;
  note?: string;
  renvoi?: string;
  priority?: RevueFiscalPriority;
}

export interface CompanyStats {
  id: string;
  name: string;
  total: number;
  answered: number;
  anomalies: number;
  erreurs: number;
  ok: number;
  na: number;
  pct: number;
}

/**
 * RevueFiscal Service - Handles API calls for fiscal review management
 */
class RevueFiscalService {
  private api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          window.location.href = "/web/user/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== COMPANIES API ====================

  async getCompanies(): Promise<RevueFiscalCompanyWithStates[]> {
    try {
      const response = await this.api.get("/revue-fiscal/companies");
      return response.data as RevueFiscalCompanyWithStates[];
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw new Error("Erreur lors du chargement des entreprises");
    }
  }

  async createCompany(companyData: CreateCompanyData): Promise<RevueFiscalCompany> {
    try {
      const response = await this.api.post("/revue-fiscal/companies", companyData);
      return response.data as RevueFiscalCompany;
    } catch (error: any) {
      console.error("Error creating company:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Erreur lors de la création de l'entreprise");
    }
  }

  async getCompany(companyId: string): Promise<RevueFiscalCompanyWithStates> {
    try {
      const response = await this.api.get(`/revue-fiscal/companies/${companyId}`);
      return response.data as RevueFiscalCompanyWithStates;
    } catch (error: any) {
      console.error("Error fetching company:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.status === 404) {
        throw new Error("Entreprise non trouvée");
      }

      throw new Error("Erreur lors du chargement de l'entreprise");
    }
  }

  async updateCompany(
    companyId: string,
    companyData: Partial<CreateCompanyData>
  ): Promise<RevueFiscalCompany> {
    try {
      const response = await this.api.put(`/revue-fiscal/companies/${companyId}`, companyData);
      return response.data as RevueFiscalCompany;
    } catch (error: any) {
      console.error("Error updating company:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Erreur lors de la modification de l'entreprise");
    }
  }

  async deleteCompany(companyId: string): Promise<void> {
    try {
      await this.api.delete(`/revue-fiscal/companies/${companyId}`);
    } catch (error: any) {
      console.error("Error deleting company:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.status === 404) {
        throw new Error("Entreprise non trouvée");
      }

      throw new Error("Erreur lors de la suppression de l'entreprise");
    }
  }

  // ==================== QUESTION STATES API ====================

  async updateQuestionState(questionData: UpdateQuestionStateData): Promise<RevueFiscalQuestionState> {
    try {
      const response = await this.api.post("/revue-fiscal/question-states", questionData);
      return response.data as RevueFiscalQuestionState;
    } catch (error: any) {
      console.error("Error updating question state:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error("Erreur lors de la mise à jour de la réponse");
    }
  }

  async bulkUpdateQuestionStates(updates: UpdateQuestionStateData[]): Promise<RevueFiscalQuestionState[]> {
    try {
      const response = await this.api.post("/revue-fiscal/question-states/bulk", updates);
      return response.data as RevueFiscalQuestionState[];
    } catch (error: any) {
      console.error("Error bulk updating question states:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error("Erreur lors de la mise à jour en masse des réponses");
    }
  }

  // ==================== STATS API ====================

  async getCompanyStats(): Promise<CompanyStats[]> {
    try {
      const response = await this.api.get("/revue-fiscal/stats");
      return response.data as CompanyStats[];
    } catch (error) {
      console.error("Error fetching company stats:", error);
      throw new Error("Erreur lors du chargement des statistiques");
    }
  }

  /**
   * Get auth headers for external API calls if needed
   */
  getAuthHeaders(): Record<string, string> {
    return authService.getAuthHeaders();
  }

  cancelAllRequests(): void {
    // Implementation would depend on your specific needs
  }
}

export const revueFiscalService = new RevueFiscalService();