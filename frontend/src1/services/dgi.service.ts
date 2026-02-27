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
    declarationType: string
  ): Promise<DGICreateProcessResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/declarations/process/${declarationYear}/${declarationType}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("DGI create process error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create declaration process"
      );
    }
  }

  /**
   * Delete a declaration process
   */
  async deleteProcess(processId: string): Promise<DGIDeleteProcessResponse> {
    try {
      const response = await axios.delete(
        `${this.baseURL}/declarations/process`,
        {
          data: { id: processId },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("DGI delete process error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to delete declaration process"
      );
    }
  }

  /**
   * Get all declaration processes
   */
  async getProcesses(): Promise<DGIGetProcessesResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/declarations/process`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error: any) {
      console.error("DGI get processes error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get declaration processes"
      );
    }
  }

  /**
   * Get declaration processes for a specific year
   */
  async getProcessesByYear(
    declarationYear: string
  ): Promise<DGIGetProcessesResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/declarations/process/${declarationYear}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("DGI get processes by year error:", error);
      throw new Error(
        error.response?.data?.message ||
          "Failed to get declaration processes for year"
      );
    }
  }

  /**
   * Login to DGI API
   */
  async login(username: string, password: string): Promise<DGILoginResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/declarations/auth`,
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("DGI login error:", error);

      if (error.response?.status === 401) {
        throw new Error("Nom d'utilisateur ou mot de passe incorrect");
      }

      throw new Error(
        error.response?.data?.message || "Échec de la connexion DGI"
      );
    }
  }
}

export const dgiService = new DGIService();
