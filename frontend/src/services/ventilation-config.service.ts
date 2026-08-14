// services/ventilation-config.service.ts
import axios from "axios";
import { API_CONFIG } from "../config/api";
import { authService } from "./auth.service";

export interface VentilationSubAccount {
  id: string;
  configId: string;
  accountNumber: string;
  accountName: string;
  order: number;
  debitAmount: number | null;
  creditAmount: number | null;
}

export interface VentilationConfig {
  id: string;
  clientId: string;
  folderId: string | null;
  mainAccountNumber: string;
  mainAccountName: string;
  subAccounts: VentilationSubAccount[];
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  archivedAt: string | null;
}

export interface SubAccountInput {
  accountNumber: string;
  accountName: string;
  debitAmount?: number;
  creditAmount?: number;
}

export interface CreateVentilationConfigData {
  clientId: string;
  folderId?: string;
  mainAccountNumber: string;
  mainAccountName: string;
  subAccounts: SubAccountInput[];
}

export interface UpdateVentilationConfigData {
  mainAccountNumber?: string;
  mainAccountName?: string;
  subAccounts?: SubAccountInput[];
}

class VentilationConfigService {
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
      (error) => Promise.reject(error)
    );
  }

  async getConfigs(clientId: string, folderId?: string): Promise<VentilationConfig[]> {
    try {
      const response = await this.api.get("/ventilation-configs", {
        params: { clientId, ...(folderId ? { folderId } : {}) },
      });
      return response.data.configs;
    } catch (error: any) {
      console.error("Error fetching ventilation configs:", error);
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors du chargement des configurations de ventilation"
      );
    }
  }

  async createConfig(
    data: CreateVentilationConfigData
  ): Promise<VentilationConfig> {
    try {
      const response = await this.api.post("/ventilation-configs", data);
      return response.data.config;
    } catch (error: any) {
      console.error("Error creating ventilation config:", error);
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la création de la configuration de ventilation"
      );
    }
  }

  async updateConfig(
    id: string,
    data: UpdateVentilationConfigData
  ): Promise<VentilationConfig> {
    try {
      const response = await this.api.put(`/ventilation-configs/${id}`, data);
      return response.data.config;
    } catch (error: any) {
      console.error("Error updating ventilation config:", error);
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour de la configuration de ventilation"
      );
    }
  }

  async deleteConfig(id: string): Promise<void> {
    try {
      await this.api.delete(`/ventilation-configs/${id}`);
    } catch (error: any) {
      console.error("Error deleting ventilation config:", error);
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la suppression de la configuration de ventilation"
      );
    }
  }

  async restoreConfig(id: string): Promise<void> {
    try {
      await this.api.post(`/ventilation-configs/${id}/restore`);
    } catch (error: any) {
      console.error("Error restoring ventilation config:", error);
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la restauration de la configuration de ventilation"
      );
    }
  }
}

export const ventilationConfigService = new VentilationConfigService();
