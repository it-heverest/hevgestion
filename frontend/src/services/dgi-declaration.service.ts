// services/dgi-declaration.service.ts
import api from "./api";

interface DGIConfig {
  id?: string;
  companyName?: string;
  niu?: string;
  username: string;
  password: string;
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
  async getConfig(userId: string): Promise<DGIConfig | null> {
    try {
      const response = await api.get(`/dgi/config/${userId}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  async saveConfig(config: Omit<DGIConfig, "id" | "userId">): Promise<DGIConfig> {
    const response = await api.post("/dgi/config", config);
    return response.data.data;
  }

  async updateConfig(id: string, updates: Partial<Omit<DGIConfig, "id" | "userId">>): Promise<DGIConfig> {
    const response = await api.put(`/dgi/config/${id}`, updates);
    return response.data.data;
  }

  async submitDeclaration(folderId: string, userId: string): Promise<DeclarationResult> {
    const response = await api.post("/dgi/declaration", { folderId, userId });
    const data = response.data.data;
    return {
      number: data.declarationNumber,
      date: new Date(data.submittedAt).toLocaleDateString("fr-FR"),
      timestamp: new Date(data.submittedAt).toLocaleTimeString("fr-FR"),
    };
  }

  async getDeclarationHistory(userId: string): Promise<DeclarationHistory[]> {
    const response = await api.get(`/dgi/declarations/${userId}`);
    return response.data.data;
  }

  async getDeclarationStatus(declarationId: string): Promise<any> {
    const response = await api.get(`/dgi/declaration/${declarationId}`);
    return response.data.data;
  }
}

export const dgiDeclarationService = new DGIDeclarationService();