// services/client.service.ts
import api from "./api";
import { API_CONFIG } from "../config/api";
import { Client } from "@/types";

export interface Country {
  code: string;
  name: string;
  currency: string;
  timezone: string;
}

// export interface Client {
//   id: string;
//   name: string;
//   country: string;
//   legalForm: string;
//   taxNumber?: string;
//   address: string;
//   city: string;
//   phone?: string;
//   email?: string;
//   createdBy: string;
//   currency: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

export interface CreateClientData {
  name: string;
  country: string;
  legalForm: string;
  clientType?: string;
  taxNumber: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
}

/**
 * Simplified Client Service - Only handles API calls
 * Session management is now handled by AppContext
 */
class ClientService {

  // ==================== COUNTRIES API ====================

  async getCountries(): Promise<Country[]> {
    try {
      const response = await api.get("/clients/countries");
      return response.data.countries as Country[];
    } catch (error) {
      console.error("Error fetching countries:", error);
      throw new Error("Erreur lors du chargement des pays");
    }
  }

  // ==================== CLIENTS API ====================

  async getClients(country?: string): Promise<Client[]> {
    try {
      const params = country ? { country } : {};
      const response = await api.get("/clients", { params });
      return response.data.clients as Client[];
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw new Error("Erreur lors du chargement des clients");
    }
  }

  async createClient(clientData: CreateClientData): Promise<Client> {
    try {
      const response = await api.post("/clients", clientData);
      return response.data.client;
    } catch (error: any) {
      console.error("Error creating client:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Erreur lors de la création du client");
    }
  }

  async getClientsByCountry(countryCode: string): Promise<Client[]> {
    try {
      const response = await api.get("/clients", {
        params: { country: countryCode },
      });
      return response.data.clients as Client[];
    } catch (error) {
      console.error("Error fetching clients by country:", error);
      throw new Error("Erreur lors du filtrage par pays");
    }
  }

  async searchClients(query: string, countryCode?: string): Promise<Client[]> {
    try {
      const params: any = { q: query };
      if (countryCode) {
        params.country = countryCode;
      }

      const response = await api.get("/clients/search", {
        params,
      });
      return response.data.clients as Client[];
    } catch (error) {
      console.error("Error searching clients:", error);
      throw new Error("Erreur lors de la recherche");
    }
  }

  async getClientById(clientId: string): Promise<Client> {
    try {
      const response = await api.get(`/clients/${clientId}`);
      return response.data.client;
    } catch (error) {
      console.error("Error fetching client:", error);
      throw new Error("Erreur lors du chargement du client");
    }
  }

  async updateClient(
    clientId: string,
    clientData: Partial<Client>
  ): Promise<Client> {
    try {
      const response = await api.put(`/clients/${clientId}`, clientData);
      return response.data.client;
    } catch (error: any) {
      console.error("Error updating client:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Erreur lors de la modification du client");
    }
  }

  async deleteClient(clientId: string): Promise<void> {
    try {
      await api.delete(`/clients/${clientId}`);
    } catch (error) {
      console.error("Error deleting client:", error);
      throw new Error("Erreur lors de la suppression du client");
    }
  }

  // ==================== BALANCE API ====================

  async uploadBalance(formData: FormData): Promise<any> {
    try {
      const response = await api.post("/balances/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error uploading balance:", error);
      console.log("Error response data:", error.response?.data);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Erreur lors de l'upload de la balance");
    }
  }

  async validateAccounts(accounts: { accountNumber: string; accountName: string }[]): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    try {
      const response = await api.post("/balances/validate-accounts", { accounts });
      return response.data;
    } catch (error: any) {
      console.error("Error validating accounts:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("Erreur lors de la validation des comptes");
    }
  }

  async createBalanceFromTemplate(folderId: string, type: "current" | "previous" = "current"): Promise<any> {
    try {
      const response = await api.post("/balances/create-from-template", {
        folderId,
        type,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error creating balance from template:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("Erreur lors de la création du modèle de balance");
    }
  }

  async getBalancesByFolder(folderId: string): Promise<any> {
    try {
      const response = await api.get(`/balances/folder/${folderId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching balances by folder:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Erreur lors de la récupération des balances");
    }
  }

  async getBalanceById(balanceId: string): Promise<any> {
    try {
      const response = await api.get(`/balances/${balanceId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching balance:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Erreur lors de la récupération de la balance");
    }
  }

  async checkBalanceEquilibrium(balanceId: string): Promise<any> {
    try {
      const response = await api.post(
        `/balances/${balanceId}/check-equilibrium`
      );
      return response.data;
    } catch (error) {
      console.error("Error checking equilibrium:", error);
      throw new Error("Erreur lors de la vérification d'équilibre");
    }
  }

  async performBalanceVentilation(balanceId: string): Promise<any> {
    try {
      const response = await api.post(
        `/balances/${balanceId}/ventilation`
      );
      return response.data;
    } catch (error) {
      console.error("Error performing ventilation:", error);
      throw new Error("Erreur lors de la ventilation");
    }
  }

  async getBalanceIssues(balanceId: string): Promise<any> {
    try {
      const response = await api.get(`/balances/${balanceId}/issues`);
      return response.data;
    } catch (error) {
      console.error("Error fetching balance issues:", error);
      throw new Error("Erreur lors de la récupération des problèmes");
    }
  }

  async resolveBalanceIssue(
    balanceId: string,
    issueId: string,
    resolution: string
  ): Promise<any> {
    try {
      const response = await api.post(
        `/balances/${balanceId}/resolve-issue`,
        {
          issueId,
          resolution,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error resolving issue:", error);
      throw new Error("Erreur lors de la résolution du problème");
    }
  }

  async deleteBalance(balanceId: string): Promise<any> {
    try {
      const response = await api.delete(`/balances/${balanceId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting balance:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Erreur lors de la suppression de la balance");
    }
  }

  async updateBalanceRows(balanceId: string, rows: any[]): Promise<any> {
    try {
      const response = await api.put(`/balances/${balanceId}/rows`, { rows });
      return response.data;
    } catch (error: any) {
      console.error("Error updating balance rows:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Erreur lors de la mise à jour des lignes de la balance");
    }
  }

  async createBalanceTemplate(folderId: string): Promise<{ downloadUrl: string }> {
    try {
      const response = await api.post("/balances/create-from-template", { folderId });
      return response.data;
    } catch (error: any) {
      console.error("Error creating balance template:", error);
      throw new Error("Erreur lors de la création du modèle");
    }
  }

  // ==================== DSF API ====================

  async importDSF(formData: FormData): Promise<any> {
    try {
      const response = await api.post("/dsf/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error importing DSF:", error);
      console.log("Error response data:", error.response?.data);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Erreur lors de l'import du DSF");
    }
  }

  /**
   * Get auth headers for external API calls if needed
   */
  getAuthHeaders(): Record<string, string> {
    return authService.getAuthHeaders();
  }

  cancelAllRequests(): void {
    // Implementation would depend on your specific needs
  }
}

export const clientService = new ClientService();
