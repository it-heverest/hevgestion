/**
 * DGI Declaration Service
 * 
 * Handles all communication with DGI API
 * Base URL: http://tasserver.dgi.cm/api/v1
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import { config } from "../../config";
import {
  DGIAuthRequest,
  DGIAuthResponse,
  DGIDeclarationType,
  DGICreateDeclarationResponse,
  DGIDeclarationListResponse,
  DGIDeclaration,
  DGIDeleteDeclarationResponse,
  DGIPageResponse,
  DGIGrilleAnalyseData,
  DGISection2Model1BilanPaysageData,
  DGISection2ModelCompteResultatData,
  DGISection2ModelTableauFluxTresorerieData,
  DGINote1Data,
  DGIError,
} from "../types/declaration.types";

export class DeclarationService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: config.dgi.apiUrl,
      timeout: config.dgi.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<DGIError>) => {
        if (error.response?.data) {
          console.error(
            `[DGI API Error] ${error.response.data.errorCode}: ${error.response.data.message}`
          );
        }
        return Promise.reject(error);
      }
    );
  }

  // ============================================
  // Authentication
  // ============================================

  /**
   * Authenticate with DGI server
   * POST /auth
   */
  async authenticate(credentials: DGIAuthRequest): Promise<DGIAuthResponse> {
    const response = await this.client.post<DGIAuthResponse>("/auth", credentials);
    this.token = response.data.token;
    return response.data;
  }

  /**
   * Set token directly
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Clear token
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  /**
   * Get auth headers
   */
  private getAuthHeaders(): Record<string, string> {
    if (!this.token) {
      throw new Error("Not authenticated. Please call authenticate() first.");
    }
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  // ============================================
  // Declaration Operations
  // ============================================

  /**
   * Create a new declaration process
   * POST /process/:declaration_year/:declaration_type
   */
  async createDeclaration(
    year: string,
    declarationType: DGIDeclarationType
  ): Promise<DGICreateDeclarationResponse> {
    const response = await this.client.post<DGICreateDeclarationResponse>(
      `/process/${year}/${declarationType}`,
      {},
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Get all processes
   * GET /process
   */
  async getAllDeclarations(): Promise<DGIDeclarationListResponse> {
    const response = await this.client.get<DGIDeclarationListResponse>("/process", {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  /**
   * Get processes by year
   * GET /process/:year
   */
  async getDeclarationsByYear(year: string): Promise<DGIDeclarationListResponse> {
    const response = await this.client.get<DGIDeclarationListResponse>(
      `/process/${year}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Get processes by year and type
   * GET /process/:year/:type
   */
  async getDeclarationsByYearAndType(
    year: string,
    type: DGIDeclarationType
  ): Promise<DGIDeclarationListResponse> {
    const response = await this.client.get<DGIDeclarationListResponse>(
      `/process/${year}/${type}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Delete a declaration
   * DELETE /process
   */
  async deleteDeclaration(declarationId: string): Promise<DGIDeleteDeclarationResponse> {
    const response = await this.client.delete<DGIDeleteDeclarationResponse>(
      "/process",
      {
        headers: this.getAuthHeaders(),
        data: { id: declarationId },
      }
    );
    return response.data;
  }

  // ============================================
  // Page Operations (Page de Garde, Fiche R1, Fiche R2)
  // ============================================

  /**
   * Submit a declaration page (full replace - PUT)
   * PUT /process/:declaration_id/:page
   */
  async submitPage(
    declarationId: string,
    pageName: string,
    data: any
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/${pageName}`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Update a declaration page (partial update - PATCH)
   * PATCH /process/:declaration_id/:page
   */
  async updatePage(
    declarationId: string,
    pageName: string,
    data: any
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/${pageName}`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Delete a declaration page
   * DELETE /process/:declaration_id/:page
   */
  async deletePage(
    declarationId: string,
    pageName: string
  ): Promise<DGIPageResponse> {
    const response = await this.client.delete<DGIPageResponse>(
      `/process/${declarationId}/${pageName}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  // ============================================
  // Specific Page Methods
  // ============================================

  /**
   * Submit Page de Garde (etats-financiers)
   */
  async submitPageDeGarde(
    declarationId: string,
    data: any
  ): Promise<DGIPageResponse> {
    return this.submitPage(declarationId, "etats-financiers", data);
  }

  /**
   * Update Page de Garde
   */
  async updatePageDeGarde(
    declarationId: string,
    data: any
  ): Promise<DGIPageResponse> {
    return this.updatePage(declarationId, "etats-financiers", data);
  }

  /**
   * Delete Page de Garde
   */
  async deletePageDeGarde(declarationId: string): Promise<DGIPageResponse> {
    return this.deletePage(declarationId, "etats-financiers");
  }

  /**
   * Submit Fiche R1
   */
  async submitFicheR1(
    declarationId: string,
    data: any
  ): Promise<DGIPageResponse> {
    return this.submitPage(declarationId, "fiche-r1", data);
  }

  /**
   * Update Fiche R1
   */
  async updateFicheR1(
    declarationId: string,
    data: any
  ): Promise<DGIPageResponse> {
    return this.updatePage(declarationId, "fiche-r1", data);
  }

  /**
   * Delete Fiche R1
   */
  async deleteFicheR1(declarationId: string): Promise<DGIPageResponse> {
    return this.deletePage(declarationId, "fiche-r1");
  }

  /**
   * Submit Fiche R2
   */
  async submitFicheR2(
    declarationId: string,
    data: any
  ): Promise<DGIPageResponse> {
    return this.submitPage(declarationId, "fiche-r2", data);
  }

  /**
   * Update Fiche R2
   */
  async updateFicheR2(
    declarationId: string,
    data: any
  ): Promise<DGIPageResponse> {
    return this.updatePage(declarationId, "fiche-r2", data);
  }

  /**
   * Delete Fiche R2
   */
  async deleteFicheR2(declarationId: string): Promise<DGIPageResponse> {
    return this.deletePage(declarationId, "fiche-r2");
  }

  // ============================================
  // Grille Analyse Methods
  // ============================================

  /**
   * Submit Grille Analyse (full replace)
   * PUT /process/:declaration_id/grilledanalyse
   */
  async submitGrilleAnalyse(
    declarationId: string,
    data: DGIGrilleAnalyseData
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/grilledanalyse`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Update Grille Analyse (partial update)
   * PATCH /process/:declaration_id/grilledanalyse
   */
  async updateGrilleAnalyse(
    declarationId: string,
    data: Partial<DGIGrilleAnalyseData>
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/grilledanalyse`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Delete Grille Analyse
   * DELETE /process/:declaration_id/grilledanalyse
   */
  async deleteGrilleAnalyse(declarationId: string): Promise<DGIPageResponse> {
    return this.deletePage(declarationId, "grilledanalyse");
  }

  // ============================================
  // Section 2 Model 1 Bilan Paysage Methods
  // ============================================

  /**
   * Submit Section 2 Model 1 Bilan Paysage (full replace)
   * PUT /process/:declaration_id/section2modelbilanpasage
   */
  async submitSection2Model1BilanPaysage(
    declarationId: string,
    data: DGISection2Model1BilanPaysageData
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/section2modelbilanpasage`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Update Section 2 Model 1 Bilan Paysage (partial update)
   * PATCH /process/:declaration_id/section2modelbilanpasage
   */
  async updateSection2Model1BilanPaysage(
    declarationId: string,
    data: Partial<DGISection2Model1BilanPaysageData>
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/section2modelbilanpasage`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Delete Section 2 Model 1 Bilan Paysage
   * DELETE /process/:declaration_id/section2modelbilanpasage
   */
  async deleteSection2Model1BilanPaysage(
    declarationId: string
  ): Promise<DGIPageResponse> {
    return this.deletePage(declarationId, "section2modelbilanpasage");
  }

  // ============================================
  // Section 2 Model Compte de Resultat Methods
  // ============================================

  /**
   * Submit Section 2 Model Compte de Resultat (full replace)
   * PUT /process/:declaration_id/section2modelresultat
   */
  async submitSection2ModelCompteResultat(
    declarationId: string,
    data: DGISection2ModelCompteResultatData
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/section2modelresultat`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Update Section 2 Model Compte de Resultat (partial update)
   * PATCH /process/:declaration_id/section2modelresultat
   */
  async updateSection2ModelCompteResultat(
    declarationId: string,
    data: Partial<DGISection2ModelCompteResultatData>
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/section2modelresultat`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Delete Section 2 Model Compte de Resultat
   * DELETE /process/:declaration_id/section2modelresultat
   */
  async deleteSection2ModelCompteResultat(
    declarationId: string
  ): Promise<DGIPageResponse> {
    return this.deletePage(declarationId, "section2modelresultat");
  }

  // ============================================
  // Section 2 Model Tableau des Flux de Tresorerie Methods
  // ============================================

  /**
   * Submit Section 2 Model Tableau des Flux de Tresorerie (full replace)
   * PUT /process/:declaration_id/section2modeltresori
   */
  async submitSection2ModelTableauFluxTresorerie(
    declarationId: string,
    data: DGISection2ModelTableauFluxTresorerieData
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/section2modeltresori`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Update Section 2 Model Tableau des Flux de Tresorerie (partial update)
   * PATCH /process/:declaration_id/section2modeltresori
   */
  async updateSection2ModelTableauFluxTresorerie(
    declarationId: string,
    data: Partial<DGISection2ModelTableauFluxTresorerieData>
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/section2modeltresori`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Delete Section 2 Model Tableau des Flux de Tresorerie
   * DELETE /process/:declaration_id/section2modeltresori
   */
  async deleteSection2ModelTableauFluxTresorerie(
    declarationId: string
  ): Promise<DGIPageResponse> {
    return this.deletePage(declarationId, "section2modeltresori");
  }

  // ============================================
  // Note 1 (Passif/Bilan) Methods
  // ============================================

  /**
   * Submit Note 1 (Passif/Bilan) - full replace
   * PUT /process/:declaration_id/note1
   */
  async submitNote1(
    declarationId: string,
    data: DGINote1Data
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/note1`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Update Note 1 (Passif/Bilan) - partial update
   * PATCH /process/:declaration_id/note1
   */
  async updateNote1(
    declarationId: string,
    data: Partial<DGINote1Data>
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/note1`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Delete Note 1 (Passif/Bilan)
   * DELETE /process/:declaration_id/note1
   */
  async deleteNote1(declarationId: string): Promise<DGIPageResponse> {
    return this.deletePage(declarationId, "note1");
  }

  // ============================================
  // Health Check
  // ============================================

  /**
   * Check if DGI server is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get("/health");
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

export const declarationService = new DeclarationService();
