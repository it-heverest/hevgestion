// frontend/src/services/trash.service.ts
import axios from "axios";
import { API_CONFIG } from "../config/api";
import { authService } from "./auth.service";

export type TrashEntityType =
  | "Client"
  | "Folder"
  | "Balance"
  | "DSF"
  | "RevueFiscalCompany"
  | "DSFNote";

export interface TrashActor {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

export interface TrashItem {
  id: string;
  entityType: TrashEntityType;
  entityId: string;
  label: string;
  clientId: string | null;
  folderId: string | null;
  deletedAt: string;
  reason: string | null;
  deletedBy: TrashActor | null;
  restoredAt: string | null;
  restoredBy: TrashActor | null;
}

/** Détail unitaire: inclut la copie intégrale de l'enregistrement. */
export interface TrashItemDetail extends TrashItem {
  payload: unknown;
}

export interface TrashPage {
  items: TrashItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TrashStats {
  pending: Record<string, number>;
  pendingTotal: number;
  restoredTotal: number;
}

export interface TrashFilters {
  entityType?: TrashEntityType;
  clientId?: string;
  folderId?: string;
  /** false = encore en corbeille (défaut), true = déjà restaurés */
  restored?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

class TrashService {
  private api = axios.create({
    baseURL: `${API_CONFIG.BASE_URL}/trash`,
    withCredentials: true,
  });

  constructor() {
    this.api.interceptors.request.use((config) => {
      const token = authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Remonte le message d'erreur du serveur plutôt qu'un message générique:
   * la restauration peut échouer pour des raisons métier précises (parent
   * supprimé, identifiant réutilisé) qu'il faut montrer à l'administrateur.
   */
  private toError(error: any, fallback: string): Error {
    return new Error(
      error?.response?.data?.message || error?.message || fallback
    );
  }

  async list(filters: TrashFilters = {}): Promise<TrashPage> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });

      const response = await this.api.get(`/?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      throw this.toError(error, "Erreur lors du chargement de la corbeille");
    }
  }

  async getStats(): Promise<TrashStats> {
    try {
      const response = await this.api.get("/stats");
      return response.data.data;
    } catch (error: any) {
      throw this.toError(error, "Erreur lors du chargement des statistiques");
    }
  }

  async getItem(id: string): Promise<TrashItemDetail> {
    try {
      const response = await this.api.get(`/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw this.toError(error, "Erreur lors du chargement de l'élément");
    }
  }

  async restore(id: string): Promise<{ entityType: string; entityId: string }> {
    try {
      const response = await this.api.post(`/${id}/restore`);
      return response.data.data;
    } catch (error: any) {
      throw this.toError(error, "Erreur lors de la restauration");
    }
  }
}

export const trashService = new TrashService();
