/**
 * DGI API Client - Clean integration with DGI TAS Server
 * Base URL: http://tasserver.dgi.cm/api/v1
 *
 * Endpoints:
 * - POST /auth - Authenticate and get token
 * - All other endpoints require Bearer token in Authorization header
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import { config } from "../config";

// ============================================
// Type Definitions
// ============================================

export interface DGIAuthRequest {
  username: string;
  password: string;
}

export interface DGIAuthResponse {
  token: string;
  statusCode: number;
}

export interface DGIErrorResponse {
  action: string;
  errorCode: number;
  message: string;
}

export type DGIErrorCode =
  | 401 // UNAUTHORIZED
  | 404 // NOT_FOUND
  | 409 // RESOURCE_ALREADY_EXISTS_CONFLICT
  | 415 // UNSUPPORTED_DECLARATION_TYPE
  | 500 // INTERNAL_ERROR
  | 503; // SERVICE_UNAVAILABLE

// Declaration Types
export interface DGIDeclarationRequest {
  // Basic Info
  declarationType: string;
  fiscalYear: string;

  // Taxpayer Info
  niu: string;
  businessName: string;
  taxCenter?: string;

  // Financial Data
  totalRevenue: number;
  totalExpenses: number;
  taxableIncome: number;
  taxDue: number;

  // Notes & Attachments
  notes?: Record<string, any>;
}

export interface DGIDeclarationResponse {
  id: string;
  status: string;
  dsfId?: string;
  dsfNumber?: string;
  submissionDate?: string;
  amountDue?: number;
  message: string;
}

export interface DGIProcess {
  id: string;
  annee: string;
  status: string;
  typeDeclaration: string;
  dateCreation?: string;
  dateModification?: string;
}

export interface DGIProcessListResponse {
  total: number;
  records: DGIProcess[];
}

// Note1 Types
export interface DGINote1Request {
  processusId: string;
  annee: string;
  niu: string;
  periode: string;
  note1: {
    chiffreAffaires: number;
    produitsExploitation: number;
    chargesExploitation: number;
    resultatExploitation: number;
    resultatAvantImpots: number;
    impotsSurResultat: number;
    resultatNet: number;
  };
}

export interface DGINote1Response {
  id: string;
  processusId: string;
  status: string;
  message: string;
}

// Declaration types supported by DGI
export type DGIDeclarationType = "dsf" | "dsfBanque" | "dsfAssurance";

export interface DGICreateDeclarationResponse {
  id: string;
  action: string;
  status: string;
}

export interface DGIDeleteDeclarationResponse {
  action: string;
  status: string;
}

// ============================================
// DGI API Client Class
// ============================================

export class DGIClient {
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

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<DGIErrorResponse>) => {
        if (error.response?.data) {
          const { errorCode, message } = error.response.data;
          console.error(`[DGI API Error] ${errorCode}: ${message}`);
        }
        return Promise.reject(error);
      },
    );
  }

  // ========================================
  // Authentication
  // ========================================

  /**
   * Authenticate with DGI server
   * POST /auth
   *
   * @param username - User's username (NIU)
   * @param password - User's password
   * @returns Authentication token
   */
  async authenticate(credentials: DGIAuthRequest): Promise<DGIAuthResponse> {
    try {
      const response = await this.client.post<DGIAuthResponse>(
        "/auth",
        credentials,
      );

      // Store token for subsequent requests
      this.token = response.data.token;

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<DGIErrorResponse>;
      if (axiosError.response?.status === 401) {
        throw new DGIAuthenticationError(
          "Authorization failed (wrong username or password)",
          401,
        );
      }
      throw new DGIServiceError(
        `Authentication failed: ${axiosError.message}`,
        axiosError.response?.status || 500,
      );
    }
  }

  /**
   * Set authentication token directly
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
   * Clear authentication token
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

  // ========================================
  // Private: Get auth headers
  // ========================================

  private getAuthHeaders(): Record<string, string> {
    if (!this.token) {
      throw new DGIAuthenticationError(
        "Not authenticated. Please call authenticate() first.",
        401,
      );
    }
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  // ========================================
  // Declaration Operations
  // ========================================

  /**
   * Create a new declaration process
   * POST /process/:declaration_year/:declaration_type
   *
   * @param year - Declaration year (e.g., "2024")
   * @param declarationType - Type: "dsf", "dsfBanque", or "dsfAssurance"
   * @returns Process ID and status
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
   * Submit a tax declaration
   * POST /declaration
   */
  async submitDeclaration(
    declaration: DGIDeclarationRequest,
  ): Promise<DGIDeclarationResponse> {
    const response = await this.client.post<DGIDeclarationResponse>(
      "/declaration",
      declaration,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Get declaration status
   * GET /declaration/:id
   */
  async getDeclarationStatus(
    declarationId: string,
  ): Promise<DGIDeclarationResponse> {
    const response = await this.client.get<DGIDeclarationResponse>(
      `/declaration/${declarationId}`,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Get declaration history for a user
   * GET /declarations/:userId
   */
  async getDeclarationHistory(userId: string): Promise<DGIProcessListResponse> {
    const response = await this.client.get<DGIProcessListResponse>(
      `/declarations/${userId}`,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete a declaration process
   * DELETE /process
   *
   * @param processId - The ID of the process to delete
   * @returns Delete confirmation
   */
  async deleteDeclaration(
    processId: string,
  ): Promise<DGIDeleteDeclarationResponse> {
    const response = await this.client.delete<DGIDeleteDeclarationResponse>(
      "/process",
      {
        headers: this.getAuthHeaders(),
        data: { id: processId },
      },
    );
    return response.data;
  }

  /**
   * Get all processes
   * GET /process (no auth needed)
   */
  async getProcesses(): Promise<DGIProcessListResponse> {
    const response = await this.client.get<DGIProcessListResponse>("/process", {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  /**
   * Get processes by year
   * GET /process/:year
   */
  async getProcessesByYear(year: string): Promise<DGIProcessListResponse> {
    const response = await this.client.get<DGIProcessListResponse>(
      `/process/${year}`,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Delete a declaration process
   * DELETE /process
   * 
   * @param processId - The ID of the process to delete
   * @returns Delete confirmation
   */
  async deleteDeclaration(
    processId: string,
  ): Promise<DGIDeleteDeclarationResponse> {
    const response = await this.client.delete<DGIDeleteDeclarationResponse>(
      "/process",
      {
        headers: this.getAuthHeaders(),
        data: { id: processId },
      }
    );
    return response.data;
  }

  // ========================================
  // Note1 Operations
  // ========================================

  /**
   * Submit Note1 data
   * POST /note1
   */
  async submitNote1(note1: DGINote1Request): Promise<DGINote1Response> {
    const response = await this.client.post<DGINote1Response>("/note1", note1, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  /**
   * Update Note1 data
   * PUT /note1
   */
  async updateNote1(note1: DGINote1Request): Promise<DGINote1Response> {
    const response = await this.client.put<DGINote1Response>("/note1", note1, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  /**
   * Delete Note1 data
   * DELETE /note1/:declarationId
   */
  async deleteNote1(declarationId: string): Promise<DGINote1Response> {
    const response = await this.client.delete<DGINote1Response>(
      `/note1/${declarationId}`,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  // ========================================
  // Estados Financieros (Financial Statements)
  // ========================================

  /**
   * Submit financial statements
   * POST /etats-financiers
   */
  async submitEtatsFinanciers(
    processusId: string,
    data: Record<string, any>,
  ): Promise<{ id: string; status: string }> {
    const response = await this.client.post<{ id: string; status: string }>(
      "/etats-financiers",
      { processusId, ...data },
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  /**
   * Update financial statements
   * PUT /etats-financiers/:processusId
   */
  async updateEtatsFinanciers(
    processusId: string,
    data: Record<string, any>,
  ): Promise<{ id: string; status: string }> {
    const response = await this.client.put<{ id: string; status: string }>(
      `/etats-financiers/${processusId}`,
      data,
      { headers: this.getAuthHeaders() },
    );
    return response.data;
  }

  // ========================================
  // Health Check
  // ========================================

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
// Custom Error Classes
// ============================================

export class DGIAuthenticationError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.name = "DGIAuthenticationError";
    this.code = code;
  }
}

export class DGIServiceError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.name = "DGIServiceError";
    this.code = code;
  }
}

// ============================================
// Singleton Instance
// ============================================

export const dgiClient = new DGIClient();
