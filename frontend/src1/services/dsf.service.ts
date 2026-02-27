import axios from "axios";

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
  private baseUrl = "/api/dsf";

  async importDSF(folderId: string, file: File): Promise<DSFImportResponse> {
    const formData = new FormData();
    formData.append("folderId", folderId);
    formData.append("file", file);

    const response = await axios.post(`${this.baseUrl}/import`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    return response.data;
  }

  async generateDSF(folderId: string): Promise<{ message: string; dsf: any }> {
    const response = await axios.post(
      `${this.baseUrl}/generate`,
      { folderId },
      {
        withCredentials: true,
      }
    );
    return response.data;
  }

  async getDSF(folderId: string): Promise<{ dsf: any }> {
    const response = await axios.get(`${this.baseUrl}/${folderId}`, {
      withCredentials: true,
    });
    return response.data;
  }

  async validateDSF(
    dsfId: string
  ): Promise<{ message: string; isValid: boolean; issues: string[] }> {
    const response = await axios.post(
      `${this.baseUrl}/${dsfId}/validate`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  }

  async exportDSF(
    dsfId: string,
    format?: string
  ): Promise<{ message: string; downloadUrl: string }> {
    const response = await axios.post(
      `${this.baseUrl}/${dsfId}/export`,
      {
        format,
      },
      {
        withCredentials: true,
      }
    );
    return response.data;
  }

  async updateDSF(
    dsfId: string,
    data: any
  ): Promise<{ message: string; results: any }> {
    const response = await axios.put(`${this.baseUrl}/${dsfId}`, data, {
      withCredentials: true,
    });
    return response.data;
  }

  async getCoherenceReport(dsfId: string): Promise<{ coherenceControl: any }> {
    const response = await axios.get(
      `${this.baseUrl}/${dsfId}/coherence-report`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }

  async checkDSFStatus(
    clientId: string,
    folderId: string
  ): Promise<DSFStatusResponse> {
    const response = await axios.get(`${this.baseUrl}/check-status`, {
      params: { clientId, folderId },
      withCredentials: true,
    });
    return response.data;
  }
}

export const dsfService = new DSFService();
