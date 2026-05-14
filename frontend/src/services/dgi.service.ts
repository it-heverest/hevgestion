// services/dgi.service.ts
import api from "./api";

export interface DGICreateProcessResponse {
  id: string;
  action: string;
  status: string;
}

export interface DGIDeleteProcessResponse {
  action: string;
  status: string;
}

export interface DGIGetProcessesResponse {
  total: number;
  records: any[];
}

export interface DGILoginResponse {
  token: string;
  statusCode: number;
}

/**
 * DGI Service
 *
 * Handles communication with DGI API endpoints
 */
class DGIService {
  async createProcess(
    declarationYear: string,
    declarationType: string,
  ): Promise<DGICreateProcessResponse> {
    try {
      const response = await api.post(
        `/dgi/process/${declarationYear}/${declarationType}`,
        {},
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create declaration process",
      );
    }
  }

  async deleteProcess(processId: string): Promise<DGIDeleteProcessResponse> {
    try {
      const response = await api.delete("/dgi/process", {
        data: { id: processId },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete declaration process",
      );
    }
  }

  async getProcesses(): Promise<DGIGetProcessesResponse> {
    try {
      const response = await api.get("/dgi/process");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get declaration processes",
      );
    }
  }

  async getProcessesByYear(
    declarationYear: string,
  ): Promise<DGIGetProcessesResponse> {
    try {
      const response = await api.get(`/dgi/process/${declarationYear}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to get declaration processes for year",
      );
    }
  }

  async login(username: string, password: string): Promise<DGILoginResponse> {
    try {
      // Backend wraps the token under { success, data: { token, statusCode } }
      const response = await api.post("/dgi/auth", { username, password });
      const payload = response.data?.data ?? response.data;
      return { token: payload.token, statusCode: payload.statusCode };
    } catch (error: any) {
      let errorMessage = "Échec de la connexion DGI";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Nom d'utilisateur ou mot de passe incorrect";
      } else if (
        error.code === "ECONNREFUSED" ||
        error.code === "ENOTFOUND"
      ) {
        errorMessage = "Serveur DGI inaccessible. Veuillez vérifier votre connexion.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }
}

export const dgiService = new DGIService();
