import api from "./api";

export interface DSFImportResponse {
  message: string;
  dsf: {
    id: string;
    status: string;
    lastGeneratedAt: string;
  };
}

export interface DSFStatusResponse {
  exists: boolean;
  importId?: string;
  fileName?: string;
  fileUrl?: string;
  exerciseYear?: number;
  importedAt?: string;
  status?: string;
  totalSheets?: number;
  processedSheets?: number;
  importedBy?: string;
  type?: "imported" | "generated";
  client?: {
    id: string;
    name: string;
  };
  folder?: {
    id: string;
    name: string;
    exerciseYear: number;
  };
}

class DSFService {

  async importDSF(folderId: string, file: File): Promise<DSFImportResponse> {
    const formData = new FormData();
    formData.append("folderId", folderId);
    formData.append("file", file);

    const response = await api.post("/dsf-import/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  async generateDSF(folderId: string): Promise<{ message: string; dsf: any }> {
    const response = await api.post("/dsf/generate", { folderId });
    return response.data;
  }

  async getDSF(folderId: string): Promise<{ dsf: any }> {
    const response = await api.get(`/dsf/${folderId}`);
    return response.data;
  }

  async validateDSF(
    dsfId: string
  ): Promise<{ message: string; isValid: boolean; issues: string[] }> {
    const response = await api.post(`/dsf/${dsfId}/validate`, {});
    return response.data;
  }

  async exportDSF(
    dsfId: string,
    format?: string
  ): Promise<{ message: string; downloadUrl: string }> {
    const response = await api.post(`/dsf/${dsfId}/export`, {
      format,
    });
    return response.data;
  }

  async updateDSF(
    dsfId: string,
    data: any
  ): Promise<{ message: string; results: any }> {
    const response = await api.put(`/dsf/${dsfId}`, data);
    return response.data;
  }

  async getCoherenceReport(dsfId: string): Promise<{ coherenceControl: any }> {
    const response = await api.get(`/dsf/${dsfId}/coherence-report`);
    return response.data;
  }

  async checkDSFStatus(
    clientId: string,
    folderId: string
  ): Promise<DSFStatusResponse> {
    const response = await api.get("/dsf/check-status", {
      params: { clientId, folderId },
    });
    return response.data;
  }
}

export const dsfService = new DSFService();
