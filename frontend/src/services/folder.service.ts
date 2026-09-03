// services/folderService.ts
import api from "./api";
import { API_CONFIG } from "../config/api";
import { authService } from "./auth.service";

export interface Folder {
  id: string;
  name: string;
  description?: string;
  status:
    | "DRAFT"
    | "IN_PROGRESS"
    | "PROCESSING_BALANCE"
    | "BALANCE_READY"
    | "DSF_GENERATED"
    | "DSF_VALIDATED"
    | "COMPLETED"
    | "ARCHIVED";
  fiscalYear: number;
  startDate: string;
  endDate: string;
  clientId: string;
  ownerId: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  client?: {
    id: string;
    name: string;
    country: string;
  };
  balances?: Array<{
    id: string;
    type: string;
    status: string;
  }>;
  dsf?: any;
}

export interface CreateFolderData {
  name: string;
  description?: string;
  clientId: string;
  fiscalYear: number;
  startDate: string;
  endDate: string;
}

export interface UpdateFolderData {
  name?: string;
  description?: string;
  status?: string;
}

/**
 * Folder Service
 *
 * Responsibilities:
 * - Handle all API communication for folders
 * - Use AuthService for token management
 * - Centralize error handling for folder operations
 */
class FolderService {

  /**
   * Cancel all pending requests (placeholder for cleanup)
   */
  cancelAllRequests(): void {
    // Implementation would depend on your specific needs
    // This could use axios CancelToken if needed
  }

  // ==================== FOLDERS API ====================

  /**
   * Get all folders for a client
   */
  async getFolders(clientId: string): Promise<Folder[]> {
    try {
      const response = await api.get("/folders", {
        params: { clientId },
      });
      return response.data.folders;
    } catch (error) {
      console.error("Error fetching folders:", error);
      throw new Error("Erreur lors du chargement des dossiers");
    }
  }

  /**
   * Create a new folder
   */
  async createFolder(folderData: CreateFolderData): Promise<Folder> {
    try {
      console.log("Creating folder with data:", folderData);
      const response = await api.post("/folders", folderData);
      return response.data.folder;
    } catch (error: any) {
      console.error("Error creating folder:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Erreur lors de la création du dossier");
    }
  }

  /**
   * Close a folder
   */
  async closeFolder(folderId: string): Promise<Folder> {
    try {
      const response = await api.put(`/folders/${folderId}/close`);
      return response.data.folder;
    } catch (error: any) {
      console.error("Error closing folder:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Erreur lors de la clôture du dossier");
    }
  }

  /**
   * Get folders by client ID
   */
  async getFoldersByClient(clientId: string): Promise<Folder[]> {
    try {
      const response = await api.get("/folders", {
        params: { clientId },
      });
      return response.data.folders;
    } catch (error) {
      console.error("Error fetching folders by client:", error);
      throw new Error("Erreur lors du chargement des dossiers du client");
    }
  }

  /**
   * Get folder by ID
   */
  async getFolderById(folderId: string): Promise<Folder> {
    try {
      const response = await api.get(`/folders/${folderId}`);
      return response.data.folder;
    } catch (error) {
      console.error("Error fetching folder:", error);
      throw new Error("Erreur lors du chargement du dossier");
    }
  }

  /**
   * Get current active folder for a client
   */
  async getCurrentFolder(clientId: string): Promise<Folder | null> {
    try {
      const response = await api.get("/folders/current", {
        params: { clientId },
      });
      return response.data.folder;
    } catch (error) {
      console.error("Error fetching current folder:", error);
      throw new Error("Erreur lors du chargement du dossier actuel");
    }
  }

  /**
   * Update folder information
   */
  async updateFolder(
    folderId: string,
    folderData: UpdateFolderData,
  ): Promise<Folder> {
    try {
      const response = await api.put(`/folders/${folderId}`, folderData);
      return response.data.folder;
    } catch (error: any) {
      console.error("Error updating folder:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Erreur lors de la modification du dossier");
    }
  }

  /**
   * Delete folder
   */
  async deleteFolder(folderId: string): Promise<void> {
    try {
      await api.delete(`/folders/${folderId}`);
    } catch (error) {
      console.error("Error deleting folder:", error);
      throw new Error("Erreur lors de la suppression du dossier");
    }
  }

  // ==================== ADDITIONAL FOLDER OPERATIONS ====================

  /**
   * Get folder with detailed information including balances and DSF
   */
  async getFolderWithDetails(folderId: string): Promise<Folder> {
    try {
      const response = await api.get(`/folders/${folderId}/details`);
      return response.data.folder;
    } catch (error) {
      console.error("Error fetching folder details:", error);
      throw new Error("Erreur lors du chargement des détails du dossier");
    }
  }

  /**
   * Duplicate folder for a new fiscal year (metadata only — no accounting data)
   */
  async duplicateFolder(
    folderId: string,
    newFiscalYear: number,
  ): Promise<Folder> {
    try {
      const startDate = `${newFiscalYear}-01-01`;
      const endDate = `${newFiscalYear}-12-31`;
      const response = await api.post(`/folders/${folderId}/duplicate`, {
        fiscalYear: newFiscalYear,
        startDate,
        endDate,
      });
      return response.data.folder;
    } catch (error: any) {
      console.error("Error duplicating folder:", error);
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      throw new Error("Erreur lors de la duplication du dossier");
    }
  }

  /**
   * Full deep clone of a folder: copies balances (with all nested data),
   * DSF, tax declarations, assignments and exercise configs.
   */
  async cloneFolder(
    folderId: string,
    newFiscalYear: number,
  ): Promise<Folder> {
    try {
      const startDate = `${newFiscalYear}-01-01`;
      const endDate = `${newFiscalYear}-12-31`;
      const response = await api.post(`/folders/${folderId}/clone`, {
        fiscalYear: newFiscalYear,
        startDate,
        endDate,
      });
      return response.data.folder;
    } catch (error: any) {
      console.error("Error cloning folder:", error);
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      throw new Error("Erreur lors du clonage de l'exercice");
    }
  }

  /**
   * Get folder statistics and progress
   */
  async getFolderProgress(folderId: string): Promise<any> {
    try {
      const response = await api.get(`/folders/${folderId}/progress`);
      return response.data;
    } catch (error) {
      console.error("Error fetching folder progress:", error);
      throw new Error("Erreur lors du chargement de la progression du dossier");
    }
  }

  /**
   * Update folder status
   * Uses PATCH /:id/status endpoint (not the close endpoint)
   */
  async updateFolderStatus(
    folderId: string,
    status: Folder["status"],
  ): Promise<Folder> {
    try {
      const response = await api.patch(`/folders/${folderId}/status`, {
        status,
      });
      return response.data.folder;
    } catch (error: any) {
      console.error("Error updating folder status:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Erreur lors de la mise à jour du statut du dossier");
    }
  }

  /**
   * Refresh folders - reloads all folders for the current user
   */
  async refreshFolders(): Promise<Folder[]> {
    try {
      const response = await api.get("/folders");
      return response.data.folders;
    } catch (error) {
      console.error("Error refreshing folders:", error);
      throw new Error("Erreur lors du rafraîchissement des dossiers");
    }
  }

  /**
   * Search folders by query string
   */
  async searchFolders(query: string, clientId?: string): Promise<Folder[]> {
    try {
      const response = await api.get("/folders/search", {
        params: { query, ...(clientId && { clientId }) },
      });
      return response.data.folders;
    } catch (error) {
      console.error("Error searching folders:", error);
      throw new Error("Erreur lors de la recherche de dossiers");
    }
  }

  /**
   * Get folder statistics for a client
   */
  async getFolderStats(
    clientId: string,
  ): Promise<{ [status: string]: number }> {
    try {
      const response = await api.get("/folders/stats/summary", {
        params: { clientId },
      });
      return response.data.stats;
    } catch (error) {
      console.error("Error fetching folder stats:", error);
      throw new Error(
        "Erreur lors du chargement des statistiques des dossiers",
      );
    }
  }

  /**
   * Archive a folder
   */
  async archiveFolder(folderId: string): Promise<Folder> {
    try {
      const response = await api.put(`/folders/${folderId}/archive`);
      return response.data.folder;
    } catch (error: any) {
      console.error("Error archiving folder:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Erreur lors de l'archivage du dossier");
    }
  }

  /**
   * Restore an archived folder
   */
  async restoreFolder(folderId: string): Promise<Folder> {
    try {
      const response = await api.put(`/folders/${folderId}/restore`);
      return response.data.folder;
    } catch (error: any) {
      console.error("Error restoring folder:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Erreur lors de la restauration du dossier");
    }
  }

  /**
   * Get folder timeline - audit events for a folder
   */
  async getFolderTimeline(folderId: string): Promise<any[]> {
    try {
      const response = await api.get(`/folders/${folderId}/timeline`);
      return response.data.timeline;
    } catch (error) {
      console.error("Error fetching folder timeline:", error);
      throw new Error("Erreur lors du chargement de l'historique du dossier");
    }
  }

  /**
   * Get auth headers for external API calls if needed
   */
  getAuthHeaders(): Record<string, string> {
    return authService.getAuthHeaders();
  }
}

export const folderService = new FolderService();
