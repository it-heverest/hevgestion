// services/revue-fiscal.service.ts
import api from "./api";
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

export interface QuestionnaireQuestion {
  id: string;
  text: string;
  isNew2026?: boolean;
  ref?: string;
}

export interface QuestionnaireSubSection {
  id: string;
  title: string;
  badge?: string;
  info?: string;
  questions: QuestionnaireQuestion[];
}

export interface QuestionnaireSection {
  id: string;
  number: string;
  title: string;
  subsections: QuestionnaireSubSection[];
}

export interface QuestionnaireConfig {
  id: string;
  name: string;
  sections: QuestionnaireSection[];
}

/**
 * RevueFiscal Service - Handles API calls for fiscal review management
 */
class RevueFiscalService {

  // ==================== COMPANIES API ====================

  async getCompanies(): Promise<RevueFiscalCompanyWithStates[]> {
    try {
      const response = await api.get("/revue-fiscal/companies");
      return response.data as RevueFiscalCompanyWithStates[];
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw new Error("Erreur lors du chargement des entreprises");
    }
  }

  async createCompany(companyData: CreateCompanyData): Promise<RevueFiscalCompany> {
    try {
      const response = await api.post("/revue-fiscal/companies", companyData);
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
      const response = await api.get(`/revue-fiscal/companies/${companyId}`);
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
      const response = await api.put(`/revue-fiscal/companies/${companyId}`, companyData);
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
      await api.delete(`/revue-fiscal/companies/${companyId}`);
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
      const response = await api.post("/revue-fiscal/question-states", questionData);
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
      const response = await api.post("/revue-fiscal/question-states/bulk", updates);
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
      const response = await api.get("/revue-fiscal/stats");
      return response.data as CompanyStats[];
    } catch (error) {
      console.error("Error fetching company stats:", error);
      throw new Error("Erreur lors du chargement des statistiques");
    }
  }

  // ==================== QUESTIONNAIRE CONFIGURATION ====================

  async getQuestionnaire(id: string): Promise<QuestionnaireConfig> {
    try {
      const response = await api.get(`/revue-fiscal/questionnaire/${id}`);
      return response.data as QuestionnaireConfig;
    } catch (error: any) {
      console.error("Error fetching questionnaire:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.status === 404) {
        throw new Error("Questionnaire non trouvé");
      }

      throw new Error("Erreur lors du chargement du questionnaire");
    }
  }

  async getDefaultQuestionnaire(): Promise<QuestionnaireConfig> {
    try {
      const response = await api.get("/revue-fiscal/questionnaire");
      return response.data as QuestionnaireConfig;
    } catch (error: any) {
      console.error("Error fetching default questionnaire:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error("Erreur lors du chargement du questionnaire par défaut");
    }
  }

  async updateQuestionnaire(id: string, config: QuestionnaireConfig): Promise<void> {
    try {
      await api.put(`/revue-fiscal/questionnaire/${id}`, config);
    } catch (error: any) {
      console.error("Error updating questionnaire:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error("Erreur lors de la mise à jour du questionnaire");
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