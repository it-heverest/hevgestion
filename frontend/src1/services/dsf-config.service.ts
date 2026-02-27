// services/dsf-config.service.ts
import axios from "axios";

export interface DSFConfig {
  id: string;
  configId: string;
  ownerId: string;
  ownerType: "SYSTEM" | "ACCOUNTANT" | "ADMIN";
  codeDsf: string;
  libelle: string;
  operations: string[];
  destinationCell: string | null;
  scope: "GLOBAL" | "CLIENT" | "EXERCISE";
  clientId: string | null;
  exerciseId: string | null;
  isActive: boolean;
  isLocked: boolean;
  isModified: boolean;
  baseConfigId: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface DSFConfigFilters {
  category?: string;
  clientId?: string;
  exerciseId?: string;
  ownerType?: "SYSTEM" | "ACCOUNTANT" | "ADMIN";
}

export interface DSFConfigResponse {
  success: boolean;
  data: DSFConfig[];
  message: string;
}

class DSFConfigService {
  private baseURL = "http://localhost:5000/api/dsf-configs";

  async getConfigs(filters?: DSFConfigFilters): Promise<DSFConfig[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append("category", filters.category);
      if (filters?.clientId) params.append("clientId", filters.clientId);
      if (filters?.exerciseId) params.append("exerciseId", filters.exerciseId);
      if (filters?.ownerType) params.append("ownerType", filters.ownerType);

      const response = await axios.get(`${this.baseURL}?${params}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch configs");
      }
    } catch (error) {
      console.error("Error fetching DSF configs:", error);
      throw error;
    }
  }

  async getConfigsByFolder(
    folderId: string,
    category?: string
  ): Promise<DSFConfig[]> {
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);

      const response = await axios.get(
        `${this.baseURL}/folder/${folderId}?${params}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch folder configs"
        );
      }
    } catch (error) {
      console.error("Error fetching DSF configs by folder:", error);
      throw error;
    }
  }

  async getUserConfigs(
    userId: string,
    category?: string
  ): Promise<DSFConfig[]> {
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);

      const response = await axios.get(
        `${this.baseURL}/user/${userId}?${params}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch user configs"
        );
      }
    } catch (error) {
      console.error("Error fetching user DSF configs:", error);
      throw error;
    }
  }

  async createConfig(configData: Partial<DSFConfig>): Promise<DSFConfig> {
    try {
      const response = await axios.post(this.baseURL, configData, {
        withCredentials: true,
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to create config");
      }
    } catch (error) {
      console.error("Error creating DSF config:", error);
      throw error;
    }
  }

  async updateConfig(
    id: string,
    updates: Partial<DSFConfig>
  ): Promise<DSFConfig> {
    try {
      const response = await axios.put(`${this.baseURL}/${id}`, updates, {
        withCredentials: true,
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update config");
      }
    } catch (error) {
      console.error("Error updating DSF config:", error);
      throw error;
    }
  }

  async deleteConfig(id: string): Promise<void> {
    try {
      const response = await axios.delete(`${this.baseURL}/${id}`, {
        withCredentials: true,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete config");
      }
    } catch (error) {
      console.error("Error deleting DSF config:", error);
      throw error;
    }
  }

  async duplicateConfig(id: string): Promise<DSFConfig> {
    try {
      const response = await axios.post(
        `${this.baseURL}/${id}/duplicate`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to duplicate config");
      }
    } catch (error) {
      console.error("Error duplicating DSF config:", error);
      throw error;
    }
  }

  // Helper method to get configs for a specific note
  async getConfigsForNote(
    noteName: string,
    folderId?: string
  ): Promise<DSFConfig[]> {
    const category = noteName.toLowerCase(); // e.g., "note1", "cf1"
    if (folderId) {
      return this.getConfigsByFolder(folderId, category);
    } else {
      return this.getConfigs({ category });
    }
  }
}

export const dsfConfigService = new DSFConfigService();
