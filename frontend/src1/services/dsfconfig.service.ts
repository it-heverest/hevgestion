import axios from "axios";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DSFConfig {
  id: string;
  configId?: string;
  codeDsf: string;
  libelle: string;
  operations?: string[]; // Legacy support
  accountMappings?: Array<{
    id?: string;
    accountNumber: string;
    source: string;
    destination: string;
    isActive?: boolean;
  }>;
  destinationCell?: string;
  scope: ConfigScope;
  ownerType: ConfigOwnerType;
  ownerId: string;
  clientId?: string | null;
  exerciseId?: string | null;
  isActive: boolean;
  isLocked?: boolean;
  category: string;
  isModified?: boolean;
  baseConfigId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type ConfigOwnerType = "SYSTEM" | "ACCOUNTANT" | "ADMIN";
export type ConfigScope = "GLOBAL" | "CLIENT" | "EXERCISE";

// ============================================================================
// API SERVICE CORRIGÉE
// ============================================================================

class DSFConfigApiService {
  private baseURL = "http://localhost:5000/api/dsf-configs";

  // Configurer axios avec intercepteur pour le token
  constructor() {
    // Intercepteur pour ajouter le token
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // ========== MÉTHODES PRINCIPALES ==========

  /**
   * GET /api/dsf-configs
   * Récupère les configurations avec filtres
   */
  async getConfigs(params?: {
    category?: string;
    clientId?: string;
    exerciseId?: string;
    ownerType?: string;
  }): Promise<DSFConfig[]> {
    try {
      console.log("📡 GET Configs request params:", params);

      const response = await axios.get(this.baseURL, {
        params,
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("✅ GET Configs response:", response.data);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Erreur lors de la récupération"
        );
      }
    } catch (error: any) {
      console.error("❌ GET Configs error:", error);

      // Log détaillé
      if (error.response) {
        console.error("❌ Error response:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        console.error("❌ No response:", error.request);
      } else {
        console.error("❌ Request error:", error.message);
      }

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      throw error;
    }
  }

  /**
   * POST /api/dsf-configs
   * Crée une nouvelle configuration
   */
   // CORRECTION dans la méthode createConfig du service
   async createConfig(config: {
     category: string;
     codeDsf: string;
     libelle: string;
     operations?: string[] | string;
     accountMappings?: Array<{
       accountNumber: string;
       source: string;
       destination: string;
     }>;
     destinationCell?: string;
     clientId?: string | null;
     exerciseId?: string | null;
     ownerType?: "SYSTEM" | "ACCOUNTANT" | "ADMIN";
     isActive?: boolean;
     isLocked?: boolean;
     baseConfigId?: string | null;
   }): Promise<DSFConfig> {
    try {
      console.log("📡 CREATE Config request:", config);

      // CORRECTION: Pour SYSTEM, ignorer clientId et exerciseId
      const isSystemConfig = config.ownerType === "SYSTEM";

      // Préparer les données
      const requestData: any = {
        category: config.category?.trim(),
        codeDsf: config.codeDsf?.trim(),
        libelle: config.libelle?.trim(),
        operations: config.operations || [],
        accountMappings: config.accountMappings || [],
        destinationCell: config.destinationCell?.trim() || null,
        ownerType: config.ownerType || "SYSTEM",
        isActive: config.isActive !== undefined ? config.isActive : true,
        isLocked: config.isLocked !== undefined ? config.isLocked : false,
        baseConfigId: config.baseConfigId || null,
      };

      // CORRECTION: Ajouter clientId/exerciseId seulement si pas SYSTEM
      if (!isSystemConfig) {
        if (config.clientId) requestData.clientId = config.clientId;
        if (config.exerciseId) requestData.exerciseId = config.exerciseId;
      } else {
        // Pour SYSTEM, s'assurer qu'ils sont null
        requestData.clientId = null;
        requestData.exerciseId = null;
      }

      console.log("📡 CREATE Config cleaned data:", requestData);

      const response = await axios.post(this.baseURL, requestData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("✅ CREATE Config response:", response.data);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Erreur lors de la création");
      }
    } catch (error: any) {
      console.error("❌ CREATE Config error:", error);

      // Log détaillé
      if (error.response) {
        console.error("❌ Error response:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });

        // Messages d'erreur spécifiques
        if (error.response.status === 400) {
          const errorMessage =
            error.response.data?.message || "Données invalides";
          throw new Error(`Validation error: ${errorMessage}`);
        }
        if (error.response.status === 403) {
          throw new Error("Permission refusée");
        }
        if (error.response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          throw new Error("Session expirée");
        }
      }

      throw error;
    }
  }

  /**
   * PUT /api/dsf-configs/:id
   * Met à jour une configuration existante
   */
  async updateConfig(
    id: string,
    updates: {
      operations?: string[] | string;
      accountMappings?: Array<{
        accountNumber: string;
        source: string;
        destination: string;
      }>;
      libelle?: string;
      destinationCell?: string;
      isActive?: boolean;
      isLocked?: boolean;
      isModified?: boolean;
    }
  ): Promise<DSFConfig> {
    try {
      console.log("📡 UPDATE Config request:", { id, updates });

      // Traiter les opérations si fournies (legacy support)
      let processedUpdates = { ...updates };
      if (updates.operations !== undefined) {
        if (typeof updates.operations === "string") {
          processedUpdates.operations = updates.operations
            .split(",")
            .map((op: string) => op.trim())
            .filter((op: string) => op.length > 0);
        }
      }
      // accountMappings are passed through as-is

      const response = await axios.put(
        `${this.baseURL}/${id}`,
        processedUpdates,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ UPDATE Config response:", response.data);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Erreur lors de la mise à jour"
        );
      }
    } catch (error: any) {
      console.error("❌ UPDATE Config error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      throw error;
    }
  }

  /**
   * DELETE /api/dsf-configs/:id
   * Supprime une configuration
   */
  async deleteConfig(id: string): Promise<void> {
    try {
      console.log("📡 DELETE Config request:", id);

      const response = await axios.delete(`${this.baseURL}/${id}`, {
        withCredentials: true,
      });

      console.log("✅ DELETE Config response:", response.data);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Erreur lors de la suppression"
        );
      }
    } catch (error: any) {
      console.error("❌ DELETE Config error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      throw error;
    }
  }

  /**
   * GET /api/dsf-configs/folder/:folderId
   * Récupère les configurations par dossier
   */
  async getConfigsByFolder(
    folderId: string,
    category?: string
  ): Promise<DSFConfig[]> {
    try {
      console.log("📡 GET Configs by folder:", { folderId, category });

      const response = await axios.get(`${this.baseURL}/folder/${folderId}`, {
        params: { category },
        withCredentials: true,
      });

      console.log("✅ GET Configs by folder response:", response.data);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Erreur lors de la récupération"
        );
      }
    } catch (error: any) {
      console.error("❌ GET Configs by folder error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      // Fallback: utiliser getConfigs avec exerciseId
      if (error.response?.status === 404) {
        console.log("⚠️ Route /folder non disponible, fallback à getConfigs");
        return this.getConfigs({
          category,
          exerciseId: folderId,
        });
      }

      throw error;
    }
  }

  /**
   * POST /api/dsf-configs/:id/duplicate
   * Duplique une configuration
   */
  async duplicateConfig(id: string): Promise<DSFConfig> {
    try {
      console.log("📡 DUPLICATE Config request:", id);

      const response = await axios.post(
        `${this.baseURL}/${id}/duplicate`,
        {},
        {
          withCredentials: true,
        }
      );

      console.log("✅ DUPLICATE Config response:", response.data);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Erreur lors de la duplication"
        );
      }
    } catch (error: any) {
      console.error("❌ DUPLICATE Config error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      throw error;
    }
  }

  // ========== MÉTHODES NON IMPLÉMENTÉES (optionnelles) ==========

  /**
   * GET /api/dsf-configs/user/:userId
   */
  async getUserConfigs(
    userId: string,
    category?: string
  ): Promise<DSFConfig[]> {
    try {
      const response = await axios.get(`${this.baseURL}/user/${userId}`, {
        params: { category },
        withCredentials: true,
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error("Error getting user configs:", error);

      if (error.response?.status === 404) {
        // Fallback: utiliser getConfigs avec ownerId
        return this.getConfigs({
          category,
          ownerType: "ACCOUNTANT",
        });
      }

      throw error;
    }
  }

  // Méthodes qui ne sont pas implémentées dans le controller
  async createDefaultConfigs(params: any): Promise<any> {
    console.warn("⚠️ createDefaultConfigs not implemented");
    return { success: false, message: "Non implémenté" };
  }

  async resetAllConfigs(params: any): Promise<any> {
    console.warn("⚠️ resetAllConfigs not implemented");
    return { success: false, message: "Non implémenté" };
  }

  async createUserConfig(config: any): Promise<DSFConfig> {
    console.warn("⚠️ createUserConfig not implemented");
    throw new Error("Non implémenté");
  }

  async updateUserConfig(id: string, updates: any): Promise<DSFConfig> {
    console.warn("⚠️ updateUserConfig not implemented");
    throw new Error("Non implémenté");
  }

  async resetUserConfig(id: string): Promise<DSFConfig> {
    console.warn("⚠️ resetUserConfig not implemented");
    throw new Error("Non implémenté");
  }

  async getDefaultConfigs(): Promise<DSFConfig[]> {
    console.warn("⚠️ getDefaultConfigs not implemented");
    return [];
  }

  async importFromExcel(file: File, targetScope: any): Promise<any> {
    console.warn("⚠️ importFromExcel not implemented");
    return { success: false, message: "Non implémenté" };
  }

  async exportToExcel(configs: DSFConfig[]): Promise<Blob> {
    console.warn("⚠️ exportToExcel not implemented");
    throw new Error("Non implémenté");
  }
}

// Export de l'instance
export const dsfConfigApiService = new DSFConfigApiService();

// ============================================================================
// UTILITAIRES POUR LE FRONTEND
// ============================================================================

/**
 * Fonction utilitaire pour vérifier si l'utilisateur peut éditer une config
 */
export const canEditConfig = (
  config: DSFConfig,
  currentUserId?: string
): boolean => {
  if (!currentUserId) return false;

  if (config.ownerType === "SYSTEM") {
    return false; // Les configs système ne sont pas éditables directement
  }

  if (config.ownerType === "ACCOUNTANT") {
    return config.ownerId === currentUserId;
  }

  return true; // Pour ADMIN
};

/**
 * Fonction utilitaire pour créer une copie personnalisée d'une config système
 */
export const createCustomConfigFromSystem = async (
  systemConfig: DSFConfig,
  userId: string,
  exerciseId?: string
): Promise<DSFConfig> => {
  try {
    return await dsfConfigApiService.createConfig({
      category: systemConfig.category,
      codeDsf: systemConfig.codeDsf,
      libelle: `${systemConfig.libelle} (Personnalisé)`,
      operations: systemConfig.operations,
      destinationCell: systemConfig.destinationCell,
      exerciseId,
      ownerType: "ACCOUNTANT",
      baseConfigId: systemConfig.id,
    });
  } catch (error) {
    console.error("Error creating custom config:", error);
    throw error;
  }
};

/**
 * Fonction utilitaire pour formater les opérations pour l'affichage
 */
export const formatOperations = (operations: string[] | undefined): string => {
  if (!operations || operations.length === 0) return "-";
  return operations.join(", ");
};

/**
 * Fonction utilitaire pour parser les opérations depuis une chaîne
 */
export const parseOperations = (operationsString: string): string[] => {
  if (!operationsString.trim()) return [];

  return operationsString
    .split(",")
    .map((op) => op.trim())
    .filter((op) => op.length > 0);
};
