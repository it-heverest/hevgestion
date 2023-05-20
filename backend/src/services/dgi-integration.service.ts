 /**
 * DGI Service - Integration layer between your system and DGI API
 *
 * This service wraps the DGIClient and integrates with your database
 */

import { dgiClient, DGINote1Request, DGIDeclarationType } from "./dgi-api-client";
import { prisma } from "../lib/prisma";
import { EncryptionUtil } from "../utils/encryption";

const encryption = new EncryptionUtil();

// ============================================
// Types
// ============================================

export interface DGIConfig {
  id: string;
  userId: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmitDeclarationOptions {
  folderId: string;
  userId: string;
  declarationType: string;
  fiscalYear: string;
  notes?: Record<string, any>;
}

export interface DGISubmissionResult {
  success: boolean;
  dsfId?: string;
  processId?: string;
  amountDue?: number;
  message: string;
  errors?: string[];
}

// ============================================
// DGI Service Class
// ============================================

export class DGIService {
  // ========================================
  // Configuration Management
  // ========================================

  /**
   * Get DGI configuration for a user
   */
  async getConfig(userId: string): Promise<DGIConfig | null> {
    try {
      const config = await prisma.dGIConfig.findUnique({
        where: { userId },
      });
      return config as DGIConfig | null;
    } catch (error) {
      console.error("Error getting DGI config:", error);
      return null;
    }
  }

  /**
   * Save DGI configuration for a user
   */
  async saveConfig(
    userId: string,
    username: string,
    password: string,
  ): Promise<DGIConfig | null> {
    try {
      const encryptedPassword = encryption.encrypt(password);

      const config = await prisma.dGIConfig.upsert({
        where: { userId },
        update: {
          username,
          password: encryptedPassword,
          updatedAt: new Date(),
        },
        create: {
          userId,
          username,
          password: encryptedPassword,
          niu: username,
          companyName: "",
        },
      });

      console.log(`[DGI] Config saved for user: ${userId}`);
      return config as DGIConfig;
    } catch (error) {
      console.error("Error saving DGI config:", error);
      return null;
    }
  }

  /**
   * Update DGI configuration
   */
  async updateConfig(
    id: string,
    data: { username?: string; password?: string },
  ): Promise<DGIConfig | null> {
    try {
      const updateData: any = { updatedAt: new Date() };

      if (data.username) updateData.username = data.username;
      if (data.password)
        updateData.password = encryption.encrypt(data.password);

      const config = await prisma.dGIConfig.update({
        where: { id },
        data: updateData,
      });

      console.log(`[DGI] Config updated: ${id}`);
      return config as DGIConfig;
    } catch (error) {
      console.error("Error updating DGI config:", error);
      return null;
    }
  }

  /**
   * Delete DGI configuration
   */
  async deleteConfig(userId: string): Promise<boolean> {
    try {
      await prisma.dGIConfig.delete({
        where: { userId },
      });
      console.log(`[DGI] Config deleted for user: ${userId}`);
      return true;
    } catch (error) {
      console.error("Error deleting DGI config:", error);
      return false;
    }
  }

  // ========================================
  // Authentication
  // ========================================

  /**
   * Authenticate with DGI using stored credentials
   */
  async authenticateWithStoredCredentials(userId: string): Promise<string> {
    const config = await this.getConfig(userId);

    if (!config) {
      throw new Error(
        "DGI configuration not found. Please configure your DGI credentials first.",
      );
    }

    const password = encryption.decrypt(config.password);

    const response = await dgiClient.authenticate({
      username: config.username,
      password,
    });

    console.log(`[DGI] Authenticated for user: ${userId}`);
    return response.token;
  }

  /**
   * Validate DGI credentials without storing them
   */
  async validateCredentials(
    username: string,
    password: string,
  ): Promise<{ valid: boolean; message: string }> {
    try {
      await dgiClient.authenticate({ username, password });
      return { valid: true, message: "Credentials validated successfully" };
    } catch (error: any) {
      if (error.code === 401) {
        return { valid: false, message: "Invalid username or password" };
      }
      return { valid: false, message: error.message || "Validation failed" };
    }
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
    userId: string,
    year: string,
    declarationType: DGIDeclarationType
  ): Promise<{ success: boolean; processId?: string; message: string }> {
    try {
      await this.authenticateWithStoredCredentials(userId);
      
      const result = await dgiClient.createDeclaration(year, declarationType);
      
      return {
        success: true,
        processId: result.id,
        message: `Declaration created successfully for ${year}`
      };
    } catch (error: any) {
      // Handle specific DGI errors
      if (error.response?.data?.errorCode === 409) {
        return {
          success: false,
          message: "A declaration of this type already exists for this year"
        };
      }
      if (error.response?.data?.errorCode === 415) {
        return {
          success: false,
          message: "Unsupported declaration type"
        };
      }
      console.error("[DGI] Failed to create declaration:", error);
      return {
        success: false,
        message: error.message || "Failed to create declaration"
      };
    }
  }

  /**
   * Submit a tax declaration to DGI
   */
  async submitDeclaration(
    options: SubmitDeclarationOptions,
  ): Promise<DGISubmissionResult> {
    const { folderId, userId, declarationType, fiscalYear, notes } = options;

    try {
      // 1. Get folder and client data
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        include: { client: true },
      });

      if (!folder) {
        return { success: false, message: "Folder not found" };
      }

      // 2. Authenticate with DGI
      await this.authenticateWithStoredCredentials(userId);

      // 3. Submit to DGI (simplified - would need proper DSF data)
      const result = await dgiClient.submitDeclaration({
        declarationType,
        fiscalYear,
        niu: folder.client.taxNumber || "",
        businessName: folder.client.name,
        totalRevenue: 0,
        totalExpenses: 0,
        taxableIncome: 0,
        taxDue: 0,
        notes,
      });

      console.log(`[DGI] Declaration submitted: ${result.dsfId || result.id}`);

      return {
        success: true,
        dsfId: result.dsfId || result.dsfNumber,
        processId: result.id,
        amountDue: result.amountDue,
        message: result.message,
      };
    } catch (error: any) {
      console.error("[DGI] Submission failed:", error);
      return {
        success: false,
        message: error.message || "Failed to submit declaration",
      };
    }
  }

  /**
   * Get declaration status from DGI
   */
  async getDeclarationStatus(
    declarationId: string,
  ): Promise<{ status: string; message: string }> {
    try {
      const result = await dgiClient.getDeclarationStatus(declarationId);
      return { status: result.status, message: result.message };
    } catch (error: any) {
      return { status: "UNKNOWN", message: error.message };
    }
  }

  /**
   * Get all declarations for a user
   */
  async getDeclarationHistory(userId: string): Promise<any[]> {
    try {
      await this.authenticateWithStoredCredentials(userId);
      const result = await dgiClient.getDeclarationHistory(userId);
      return result.records;
    } catch (error: any) {
      console.error("[DGI] Failed to get declaration history:", error);
      return [];
    }
  }

  // ========================================
  // Process Operations
  // ========================================

  /**
   * Get all declarations (processes)
   */
  async getProcesses(userId: string): Promise<any[]> {
    try {
      await this.authenticateWithStoredCredentials(userId);
      const result = await dgiClient.getProcesses();
      return result.records;
    } catch (error: any) {
      console.error("[DGI] Failed to get processes:", error);
      return [];
    }
  }

  /**
   * Get declarations for a specific year
   * GET /process/:declaration_year
   */
  async getProcessesByYear(userId: string, year: string): Promise<any[]> {
    try {
      await this.authenticateWithStoredCredentials(userId);
      const result = await dgiClient.getProcessesByYear(year);
      return result.records;
    } catch (error: any) {
      console.error("[DGI] Failed to get processes by year:", error);
      return [];
    }
  }

  /**
   * Delete a process
   */
  async deleteProcess(userId: string, processId: string): Promise<boolean> {
    try {
      await this.authenticateWithStoredCredentials(userId);
      await dgiClient.deleteDeclaration(processId);
      return true;
    } catch (error: any) {
      // Handle not found error
      if (error.response?.data?.errorCode === 404) {
        console.error("[DGI] Process not found:", error);
        return false;
      }
      console.error("[DGI] Failed to delete process:", error);
      return false;
    }
  }

  // ========================================
  // Note1 Operations
  // ========================================

  /**
   * Submit Note1 data
   */
  async submitNote1(
    userId: string,
    processusId: string,
    note1Data: DGINote1Request["note1"],
    annee: string,
    niu: string,
    periode: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.authenticateWithStoredCredentials(userId);

      const result = await dgiClient.submitNote1({
        processusId,
        annee,
        niu,
        periode,
        note1: note1Data,
      });

      return { success: true, message: result.message };
    } catch (error: any) {
      console.error("[DGI] Failed to submit Note1:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Update Note1 data
   */
  async updateNote1(
    userId: string,
    processusId: string,
    note1Data: DGINote1Request["note1"],
    annee: string,
    niu: string,
    periode: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.authenticateWithStoredCredentials(userId);

      const result = await dgiClient.updateNote1({
        processusId,
        annee,
        niu,
        periode,
        note1: note1Data,
      });

      return { success: true, message: result.message };
    } catch (error: any) {
      console.error("[DGI] Failed to update Note1:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete Note1 data
   */
  async deleteNote1(userId: string, declarationId: string): Promise<boolean> {
    try {
      await this.authenticateWithStoredCredentials(userId);
      await dgiClient.deleteNote1(declarationId);
      return true;
    } catch (error: any) {
      console.error("[DGI] Failed to delete Note1:", error);
      return false;
    }
  }

  // ========================================
  // Health Check
  // ========================================

  /**
   * Check DGI server availability
   */
  async healthCheck(): Promise<boolean> {
    return await dgiClient.healthCheck();
  }
}

// ============================================
// Singleton Instance
// ============================================

export const dgiService = new DGIService();
