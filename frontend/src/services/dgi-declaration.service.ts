// services/dgi-declaration.service.ts
import axios from "axios";
import { API_CONFIG } from "../config/api";

interface DGIConfig {
  id?: string;
  companyName: string;
  niu: string;
  username: string;
  password: string;
  userId: string;
}

interface DeclarationResult {
  number: string;
  date: string;
  timestamp: string;
}

interface DeclarationHistory {
  id: string;
  declarationNumber: string;
  fiscalYear: number;
  submittedAt: string;
  status: string;
  folderId: string;
  userId: string;
}

class DGIDeclarationService {
  private baseURL = API_CONFIG.DGI;

  async getConfig(userId: string): Promise<DGIConfig | null> {
    try {
      const response = await axios.get(`${this.baseURL}/config/${userId}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Config not found
      }
      console.error("Error fetching DGI config:", error);
      throw error;
    }
  }

  async saveConfig(config: DGIConfig): Promise<DGIConfig> {
    try {
      const response = await axios.post(`${this.baseURL}/config`, config);
      return response.data.data;
    } catch (error) {
      console.error("Error saving DGI config:", error);
      throw error;
    }
  }

  async updateConfig(id: string, updates: Partial<DGIConfig>): Promise<DGIConfig> {
    try {
      const response = await axios.put(`${this.baseURL}/config/${id}`, updates);
      return response.data.data;
    } catch (error) {
      console.error("Error updating DGI config:", error);
      throw error;
    }
  }

  async submitDeclaration(folderId: string, userId: string): Promise<DeclarationResult> {
    try {
      const response = await axios.post(`${this.baseURL}/declaration`, {
        folderId,
        userId,
      });

      const data = response.data.data;
      return {
        number: data.declarationNumber,
        date: new Date(data.submittedAt).toLocaleDateString("fr-FR"),
        timestamp: new Date(data.submittedAt).toLocaleTimeString("fr-FR"),
      };
    } catch (error) {
      console.error("Error submitting declaration:", error);
      throw error;
    }
  }

  async getDeclarationHistory(userId: string): Promise<DeclarationHistory[]> {
    try {
      const response = await axios.get(`${this.baseURL}/declarations/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching declaration history:", error);
      throw error;
    }
  }

  async getDeclarationStatus(declarationId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/declaration/${declarationId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching declaration status:", error);
      throw error;
    }
  }

  async validateCredentials(username: string, password: string, niu: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseURL}/validate-credentials`, {
        username,
        password,
        niu,
      });
      return response.data.valid;
    } catch (error) {
      console.error("Error validating credentials:", error);
      return false;
    }
  }
}

export const dgiDeclarationService = new DGIDeclarationService();