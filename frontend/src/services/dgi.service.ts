// services/dgi.service.ts
import axios from "axios";
import { API_CONFIG } from "../config/api";

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
  private baseURL = API_CONFIG.BASE_URL;

  /**
   * Create a declaration process on DGI
   */
  async createProcess(
    declarationYear: string,
    declarationType: string,
  ): Promise<DGICreateProcessResponse> {
    try {
      const response = await axios.post(
        `${API_CONFIG.DGI}/process/${declarationYear}/${declarationType}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      return response.data;
    } catch (error: any) {
      console.error("DGI create process error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create declaration process",
      );
    }
  }

  /**
   * Delete a declaration process
   */
  async deleteProcess(processId: string): Promise<DGIDeleteProcessResponse> {
    try {
      const response = await axios.delete(`${API_CONFIG.DGI}/process`, {
        data: { id: processId },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error: any) {
      console.error("DGI delete process error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to delete declaration process",
      );
    }
  }

  /**
   * Get all declaration processes
   */
  async getProcesses(): Promise<DGIGetProcessesResponse> {
    try {
      const response = await axios.get(`${API_CONFIG.DGI}/process`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error: any) {
      console.error("DGI get processes error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get declaration processes",
      );
    }
  }

  /**
   * Get declaration processes for a specific year
   */
  async getProcessesByYear(
    declarationYear: string,
  ): Promise<DGIGetProcessesResponse> {
    try {
      const response = await axios.get(
        `${API_CONFIG.DGI}/process/${declarationYear}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      return response.data;
    } catch (error: any) {
      console.error("DGI get processes by year error:", error);
      throw new Error(
        error.response?.data?.message ||
          "Failed to get declaration processes for year",
      );
    }
  }

  /**
   * Login to DGI API
   */
  async login(username: string, password: string): Promise<DGILoginResponse> {
    try {
      const response = await axios.post(
        `${API_CONFIG.DGI}/auth`,
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      return response.data;
    } catch (error: any) {
      console.error("DGI login error:", error);

      // Extract error message from response
      let errorMessage = "Échec de la connexion DGI";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 401) {
        errorMessage = "Nom d'utilisateur ou mot de passe incorrect";
      } else if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
        errorMessage =
          "Serveur DGI inaccessible. Veuillez vérifier votre connexion.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }
}

export const dgiService = new DGIService();
