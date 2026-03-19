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
  DGINote2Data,
  DGINote3AData,
  DGINote3BData,
  DGINote3CData,
  DGICol1Note3C2Data,
  DGINote3D2Data,
  DGINote3E2Data,
  DGINote3FData,
  DGINote4Data,
  DGINote5Data,
  DGINote6Data,
  DGINote7Data,
  DGINote8Data,
  DGINote9Data,
  DGINote10Data,
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
            `[DGI API Error] ${error.response.data.errorCode}: ${error.response.data.message}`,
          );
        }
        return Promise.reject(error);
      },
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
    const response = await this.client.post<DGIAuthResponse>(
      "/auth",
      credentials,
    );
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
    declarationType: DGIDeclarationType,
  ): Promise<DGICreateDeclarationResponse> {
    const response = await this.client.post<DGICreateDeclarationResponse>(
      `/process/${year}/${declarationType}`,
      {},
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Get all processes
   * GET /process
   */
  async getAllDeclarations(): Promise<DGIDeclarationListResponse> {
    const response = await this.client.get<DGIDeclarationListResponse>(
      "/process",
      {
        headers: this.getAuthHeaders(),
      },
    );
    return response.data;
  }

  /**
   * Get processes by year
   * GET /process/:year
   */
  async getDeclarationsByYear(
    year: string,
  ): Promise<DGIDeclarationListResponse> {
    const response = await this.client.get<DGIDeclarationListResponse>(
      `/process/${year}`,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Get processes by year and type
   * GET /process/:year/:type
   */
  async getDeclarationsByYearAndType(
    year: string,
    type: DGIDeclarationType,
  ): Promise<DGIDeclarationListResponse> {
    const response = await this.client.get<DGIDeclarationListResponse>(
      `/process/${year}/${type}`,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete a declaration
   * DELETE /process
   */
  async deleteDeclaration(
    declarationId: string,
  ): Promise<DGIDeleteDeclarationResponse> {
    const response = await this.client.delete<DGIDeleteDeclarationResponse>(
      "/process",
      {
        headers: this.getAuthHeaders(),
        data: { id: declarationId },
      },
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
    data: any,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/${pageName}`,
      data,
      { headers: this.getAuthHeaders() },
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
    data: any,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/${pageName}`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete a declaration page
   * DELETE /process/:declaration_id/:page
   */
  async deletePage(
    declarationId: string,
    pageName: string,
  ): Promise<DGIPageResponse> {
    const response = await this.client.delete<DGIPageResponse>(
      `/process/${declarationId}/${pageName}`,
      { headers: this.getAuthHeaders() },
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
    data: any,
  ): Promise<DGIPageResponse> {
    return this.submitPage(declarationId, "etats-financiers", data);
  }

  /**
   * Update Page de Garde
   */
  async updatePageDeGarde(
    declarationId: string,
    data: any,
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
    data: any,
  ): Promise<DGIPageResponse> {
    return this.submitPage(declarationId, "fiche-r1", data);
  }

  /**
   * Update Fiche R1
   */
  async updateFicheR1(
    declarationId: string,
    data: any,
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
    data: any,
  ): Promise<DGIPageResponse> {
    return this.submitPage(declarationId, "fiche-r2", data);
  }

  /**
   * Update Fiche R2
   */
  async updateFicheR2(
    declarationId: string,
    data: any,
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
    data: DGIGrilleAnalyseData,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/grilledanalyse`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Grille Analyse (partial update)
   * PATCH /process/:declaration_id/grilledanalyse
   */
  async updateGrilleAnalyse(
    declarationId: string,
    data: Partial<DGIGrilleAnalyseData>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/grilledanalyse`,
      data,
      { headers: this.getAuthHeaders() },
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
    data: DGISection2Model1BilanPaysageData,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/section2modelbilanpasage`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Section 2 Model 1 Bilan Paysage (partial update)
   * PATCH /process/:declaration_id/section2modelbilanpasage
   */
  async updateSection2Model1BilanPaysage(
    declarationId: string,
    data: Partial<DGISection2Model1BilanPaysageData>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/section2modelbilanpasage`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Section 2 Model 1 Bilan Paysage
   * DELETE /process/:declaration_id/section2modelbilanpasage
   */
  async deleteSection2Model1BilanPaysage(
    declarationId: string,
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
    data: DGISection2ModelCompteResultatData,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/section2modelresultat`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Section 2 Model Compte de Resultat (partial update)
   * PATCH /process/:declaration_id/section2modelresultat
   */
  async updateSection2ModelCompteResultat(
    declarationId: string,
    data: Partial<DGISection2ModelCompteResultatData>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/section2modelresultat`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Section 2 Model Compte de Resultat
   * DELETE /process/:declaration_id/section2modelresultat
   */
  async deleteSection2ModelCompteResultat(
    declarationId: string,
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
    data: DGISection2ModelTableauFluxTresorerieData,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/section2modeltresori`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Section 2 Model Tableau des Flux de Tresorerie (partial update)
   * PATCH /process/:declaration_id/section2modeltresori
   */
  async updateSection2ModelTableauFluxTresorerie(
    declarationId: string,
    data: Partial<DGISection2ModelTableauFluxTresorerieData>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/section2modeltresori`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Section 2 Model Tableau des Flux de Tresorerie
   * DELETE /process/:declaration_id/section2modeltresori
   */
  async deleteSection2ModelTableauFluxTresorerie(
    declarationId: string,
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
    data: DGINote1Data,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/note1`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Note 1 (Passif/Bilan) - partial update
   * PATCH /process/:declaration_id/note1
   */
  async updateNote1(
    declarationId: string,
    data: Partial<DGINote1Data>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/note1`,
      data,
      { headers: this.getAuthHeaders() },
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
  // Note 2 (Informations Obligatoires) Methods
  // ============================================

  /**
   * Submit Note 2 (Informations Obligatoires) - full replace
   * PUT /process/:declaration_id/note2
   */
  async submitNote2(
    declarationId: string,
    data: DGINote2Data,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/note2`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Note 2 (Informations Obligatoires) - partial update
   * PATCH /process/:declaration_id/note2
   */
  async updateNote2(
    declarationId: string,
    data: Partial<DGINote2Data>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/note2`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Note 2 (Informations Obligatoires)
   * DELETE /process/:declaration_id/note2
   */
  async deleteNote2(declarationId: string): Promise<DGIPageResponse> {
    return this.deletePage(declarationId, "note2");
  }

  // ============================================
  // Note 3A (Immobilisations Brutes) Methods
  // ============================================

  /**
   * Submit Note 3A (Immobilisations Brutes) - full replace
   * PUT /process/:declaration_id/note3a
   */
  async submitNote3A(
    declarationId: string,
    data: DGINote3AData,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/note3a`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Note 3A (Immobilisations Brutes) - partial update
   * PATCH /process/:declaration_id/note3a
   */
  async updateNote3A(
    declarationId: string,
    data: Partial<DGINote3AData>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/note3a`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Note 3A (Immobilisations Brutes)
   * DELETE /process/:declaration_id/note3a
   */
  async deleteNote3A(declarationId: string): Promise<DGIPageResponse> {
    return this.deletePage(declarationId, "note3a");
  }

  // ============================================
  // Note 3B (Biens Pris en Location Acquisition) Methods
  // ============================================

  /**
   * Submit Note 3B (Biens Pris en Location Acquisition) - full replace
   * PUT /process/:declaration_id/note3b
   */
  async submitNote3B(
    declarationId: string,
    data: DGINote3BData,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/note3b`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Note 3B (Biens Pris en Location Acquisition) - partial update
   * PATCH /process/:declaration_id/note3b
   */
  async updateNote3B(
    declarationId: string,
    data: Partial<DGINote3BData>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/note3b`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Note 3B (Biens Pris en Location Acquisition)
   * DELETE /process/:declaration_id/note3b
   */
  async deleteNote3B(declarationId: string): Promise<DGIPageResponse> {
    return this.deletePage(declarationId, "note3b");
  }

  // ============================================
  // Note 3C (Immobilisation - Amortissements) Methods
  // ============================================

  /**
   * Submit Note 3C (Immobilisation - Amortissements) - full replace
   * PUT /process/:declaration_id/note3c
   */
  async submitNote3C(
    declarationId: string,
    data: DGINote3CData,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/note3c`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Note 3C (Immobilisation - Amortissements) - partial update
   * PATCH /process/:declaration_id/note3c
   */
  async updateNote3C(
    declarationId: string,
    data: Partial<DGINote3CData>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/note3c`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Note 3C (Immobilisation - Amortissements)
   * DELETE /process/:declaration_id/note3c
   */
  async deleteNote3C(declarationId: string): Promise<DGIPageResponse> {
    return this.deletePage(declarationId, "note3c");
  }

  // ============================================
  // CO1-Note 3C (Tableau de Suivi des Amortissements) Methods
  // ============================================

  /**
   * Submit CO1-Note 3C (Tableau de Suivi des Amortissements) - full replace
   * PUT /process/:declaration_id/col1note3c2
   */
  async submitCol1Note3C2(
    declarationId: string,
    data: DGICol1Note3C2Data,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/col1note3c2`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update CO1-Note 3C (Tableau de Suivi des Amortissements) - partial update
   * PATCH /process/:declaration_id/col1note3c2
   */
  async updateCol1Note3C2(
    declarationId: string,
    data: Partial<DGICol1Note3C2Data>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/col1note3c2`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete CO1-Note 3C (Tableau de Suivi des Amortissements)
   * DELETE /process/:declaration_id/col1note3c2
   */
  async deleteCol1Note3C2(declarationId: string): Promise<DGIPageResponse> {
    return this.deletePage(declarationId, "col1note3c2");
  }

  // ============================================
  // Note 3D2 (Immobilisations - Cessions) Methods
  // This endpoint uses the standard URL pattern: /process/:declaration_id/:page
  // ============================================

  /**
   * Submit Note 3D2 (Immobilisations - Cessions) - full replace
   * PUT /process/:declaration_id/note3d2
   */
  async submitNote3D2(
    declarationId: string,
    data: DGINote3D2Data,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/note3d2`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Note 3D2 (Immobilisations - Cessions) - partial update
   * PATCH /process/:declaration_id/note3d2
   */
  async updateNote3D2(
    declarationId: string,
    data: Partial<DGINote3D2Data>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/note3d2`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Note 3D2 (Immobilisations - Cessions)
   * DELETE /process/:declaration_id/note3d2
   */
  async deleteNote3D2(declarationId: string): Promise<DGIPageResponse> {
    return this.deletePage(declarationId, "note3d2");
  }

  // ============================================
  // Note 3E2 (Immobilisations - Réévaluation) Methods
  // ============================================

  /**
   * Submit Note 3E2 (Immobilisations - Réévaluation) - full replace
   * PUT /process/:declaration_id/note3e2
   */
  async submitNote3E2(
    declarationId: string,
    data: DGINote3E2Data,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/note3e2`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Note 3E2 (Immobilisations - Réévaluation) - partial update
   * PATCH /process/:declaration_id/note3e2
   */
  async updateNote3E2(
    declarationId: string,
    data: Partial<DGINote3E2Data>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/note3e2`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Note 3E2 (Immobilisations - Réévaluation)
   * DELETE /process/:declaration_id/note3e2
   */
  async deleteNote3E2(declarationId: string): Promise<DGIPageResponse> {
    return this.deletePage(declarationId, "note3e2");
  }

  // ============================================
  // Note 3F (Frais d'Établissement) Methods
  // This endpoint uses the URL pattern: /process/:year/:type/:page
  // ============================================

  /**
   * Submit Note 3F (Frais d'Établissement) - full replace
   * PUT /process/:year/:type/note3F
   */
  async submitNote3F(
    year: string,
    type: string,
    data: DGINote3FData,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${year}/${type}/note3F`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Note 3F (Frais d'Établissement) - partial update
   * PATCH /process/:year/:type/note3F
   */
  async updateNote3F(
    year: string,
    type: string,
    data: Partial<DGINote3FData>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${year}/${type}/note3F`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Note 3F (Frais d'Établissement)
   * DELETE /process/:year/:type/note3F
   */
  async deleteNote3F(year: string, type: string): Promise<DGIPageResponse> {
    const response = await this.client.delete<DGIPageResponse>(
      `/process/${year}/${type}/note3F`,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  // ============================================
  // Note 4 (Créances) Methods
  // This endpoint uses the URL pattern: /process/:declaration_id/:declaration_page
  // The :declaration_page parameter is "note42"
  // ============================================

  /**
   * Submit Note 4 (Créances) - full replace
   * PUT /process/:declaration_id/note42
   */
  async submitNote4(
    declarationId: string,
    data: DGINote4Data,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/note42`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Note 4 (Créances) - partial update
   * PATCH /process/:declaration_id/note42
   */
  async updateNote4(
    declarationId: string,
    data: Partial<DGINote4Data>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/note42`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Note 4 (Créances)
   * DELETE /process/:declaration_id/note42
   */
  async deleteNote4(declarationId: string): Promise<DGIPageResponse> {
    const response = await this.client.delete<DGIPageResponse>(
      `/process/${declarationId}/note42`,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  // ============================================
  // Note 5 (Stocks) Methods
  // This endpoint uses the URL pattern: /process/:declaration_id/:declaration_page
  // The :declaration_page parameter is "note52"
  // ============================================

  /**
   * Submit Note 5 (Stocks) - full replace
   * PUT /process/:declaration_id/note52
   */
  async submitNote5(
    declarationId: string,
    data: DGINote5Data,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/note52`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Note 5 (Stocks) - partial update
   * PATCH /process/:declaration_id/note52
   */
  async updateNote5(
    declarationId: string,
    data: Partial<DGINote5Data>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/note52`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Note 5 (Stocks)
   * DELETE /process/:declaration_id/note52
   */
  async deleteNote5(declarationId: string): Promise<DGIPageResponse> {
    const response = await this.client.delete<DGIPageResponse>(
      `/process/${declarationId}/note52`,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  // ============================================
  // Note 6 (Provisions) Methods
  // This endpoint uses the URL pattern: /process/:declaration_id/:declaration_page
  // The :declaration_page parameter is "note62"
  // ============================================

  /**
   * Submit Note 6 (Provisions) - full replace
   * PUT /process/:declaration_id/note62
   */
  async submitNote6(
    declarationId: string,
    data: DGINote6Data,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/note62`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Note 6 (Provisions) - partial update
   * PATCH /process/:declaration_id/note62
   */
  async updateNote6(
    declarationId: string,
    data: Partial<DGINote6Data>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/note62`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Note 6 (Provisions)
   * DELETE /process/:declaration_id/note62
   */
  async deleteNote6(declarationId: string): Promise<DGIPageResponse> {
    const response = await this.client.delete<DGIPageResponse>(
      `/process/${declarationId}/note62`,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  // ============================================
  // Note 7 (Créances - Accounts Receivable)
  // Page parameter: note72
  // ============================================

  /**
   * Submit Note 7 (Créances) - full replace
   * PUT /process/:declaration_id/note72
   */
  async submitNote7(
    declarationId: string,
    note7Data: DGINote7Data,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/note72`,
      note7Data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Note 7 (Créances) - partial update
   * PATCH /process/:declaration_id/note72
   */
  async updateNote7(
    declarationId: string,
    note7Data: Partial<DGINote7Data>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/note72`,
      note7Data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Note 7 (Créances)
   * DELETE /process/:declaration_id/note72
   */
  async deleteNote7(declarationId: string): Promise<DGIPageResponse> {
    const response = await this.client.delete<DGIPageResponse>(
      `/process/${declarationId}/note72`,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  // ============================================
  // Note 8 (Dettes - Accounts Payable)
  // Page parameter: note82
  // ============================================

  /**
   * Submit Note 8 (Dettes) - full replace
   * PUT /process/:declaration_id/note82
   */
  async submitNote8(
    declarationId: string,
    note8Data: DGINote8Data,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/note82`,
      note8Data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Note 8 (Dettes) - partial update
   * PATCH /process/:declaration_id/note82
   */
  async updateNote8(
    declarationId: string,
    note8Data: Partial<DGINote8Data>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/note82`,
      note8Data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Note 8 (Dettes)
   * DELETE /process/:declaration_id/note82
   */
  async deleteNote8(declarationId: string): Promise<DGIPageResponse> {
    const response = await this.client.delete<DGIPageResponse>(
      `/process/${declarationId}/note82`,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  // ============================================
  // Note 9 (Investissements)
  // Page parameter: note92
  // ============================================

  /**
   * Submit Note 9 (Investissements) - full replace
   * PUT /process/:declaration_id/note92
   */
  async submitNote9(
    declarationId: string,
    note9Data: DGINote9Data,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/note92`,
      note9Data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Note 9 (Investissements) - partial update
   * PATCH /process/:declaration_id/note92
   */
  async updateNote9(
    declarationId: string,
    note9Data: Partial<DGINote9Data>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/note92`,
      note9Data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Note 9 (Investissements)
   * DELETE /process/:declaration_id/note92
   */
  async deleteNote9(declarationId: string): Promise<DGIPageResponse> {
    const response = await this.client.delete<DGIPageResponse>(
      `/process/${declarationId}/note92`,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  // ============================================
  // Note 10 (Immobilisations)
  // Page parameter: note10
  // Uses URL pattern: /process/:declaration_id/note10
  // ============================================

  /**
   * Submit Note 10 (Immobilisations) - full replace
   * PUT /process/:declaration_id/note10
   */
  async submitNote10(
    declarationId: string,
    note10Data: DGINote10Data,
  ): Promise<DGIPageResponse> {
    const response = await this.client.put<DGIPageResponse>(
      `/process/${declarationId}/note10`,
      note10Data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update Note 10 (Immobilisations) - partial update
   * PATCH /process/:declaration_id/note10
   */
  async updateNote10(
    declarationId: string,
    note10Data: Partial<DGINote10Data>,
  ): Promise<DGIPageResponse> {
    const response = await this.client.patch<DGIPageResponse>(
      `/process/${declarationId}/note10`,
      note10Data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete Note 10 (Immobilisations)
   * DELETE /process/:declaration_id/note10
   */
  async deleteNote10(declarationId: string): Promise<DGIPageResponse> {
    const response = await this.client.delete<DGIPageResponse>(
      `/process/${declarationId}/note10`,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
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
