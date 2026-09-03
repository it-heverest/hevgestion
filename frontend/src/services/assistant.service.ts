// services/assistant.service.ts
import axios from "axios";

export interface Assistant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    assignedFolders: number;
  };
}

export interface CreateAssistantData {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  password: string;
}

export interface UpdateAssistantData {
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
}

export interface FolderAssignment {
  id: string;
  folderId: string;
  userId: string;
  role: "VIEWER" | "EDITOR" | "ADMIN";
  assignedAt: string;
  folder: {
    id: string;
    name: string;
    fiscalYear: number;
    status: string;
    client: {
      name: string;
    };
  };
}

class AssistantService {
  // Chemin relatif: passe par le proxy Vite (/api -> backend), ce qui
  // fonctionne aussi bien en localhost qu'en accédant via l'IP réseau de la
  // machine (http://192.168.x.x:3000) — un hôte codé en dur ne
  // fonctionnerait que depuis la machine qui héberge le backend elle-même.
  private baseURL = "/api/assistants";

  async getAssistants(): Promise<Assistant[]> {
    try {
      const response = await axios.get(this.baseURL, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching assistants:", error);
      throw error;
    }
  }

  async createAssistant(assistantData: CreateAssistantData): Promise<Assistant> {
    try {
      const response = await axios.post(this.baseURL, assistantData, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error creating assistant:", error);
      throw error;
    }
  }

  async updateAssistant(
    assistantId: string,
    updates: UpdateAssistantData
  ): Promise<Assistant> {
    try {
      const response = await axios.put(
        `${this.baseURL}/${assistantId}`,
        updates,
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating assistant:", error);
      throw error;
    }
  }

  async deleteAssistant(assistantId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${assistantId}`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Error deleting assistant:", error);
      throw error;
    }
  }

  async assignToFolders(
    assistantId: string,
    folderIds: string[],
    role: "VIEWER" | "EDITOR" | "ADMIN" = "VIEWER"
  ): Promise<FolderAssignment[]> {
    try {
      const response = await axios.post(
        `${this.baseURL}/${assistantId}/assign`,
        { folderIds, role },
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error assigning assistant to folders:", error);
      throw error;
    }
  }

  async getAssistantFolders(assistantId: string): Promise<FolderAssignment[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/${assistantId}/folders`,
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching assistant folders:", error);
      throw error;
    }
  }

  async removeFromFolders(
    assistantId: string,
    folderIds: string[]
  ): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${assistantId}/folders`, {
        data: { folderIds },
        withCredentials: true,
      });
    } catch (error) {
      console.error("Error removing assistant from folders:", error);
      throw error;
    }
  }
}

export const assistantService = new AssistantService();