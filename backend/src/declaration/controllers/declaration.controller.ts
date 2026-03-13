/**
 * DGI Declaration Controller
 *
 * Handles all HTTP requests for DGI declaration operations
 */

import { Response } from "express";
import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../types/declaration.types";
import { declarationService } from "../services/declaration.service";
import {
  DGIAuthRequest,
  DGIDeclarationType,
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
} from "../types/declaration.types";

export class DeclarationController {
  // ============================================
  // Authentication
  // ============================================

  /**
   * POST /api/dgi/auth
   * Authenticate with DGI server
   */
  async authenticate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username, password } = req.body as DGIAuthRequest;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: "Le nom d'utilisateur et le mot de passe sont requis",
        });
        return;
      }

      const result = await declarationService.authenticate({
        username,
        password,
      });

      res.json({
        success: true,
        data: {
          token: result.token,
          statusCode: result.statusCode,
        },
      });
    } catch (error: any) {
      console.error("[DGI] Authentication error:", error);

      // Extract more detailed error message
      let errorMessage = "Échec de l'authentification DGI";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
        errorMessage =
          "Serveur DGI inaccessible. Veuillez vérifier votre connexion.";
      }

      res.status(error.response?.status || 500).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  // ============================================
  // Declaration Operations
  // ============================================

  /**
   * POST /api/dgi/declarations
   * Create a new declaration process
   */
  async createDeclaration(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationType, fiscalYear } = req.body as {
        userId: string;
        declarationType: DGIDeclarationType;
        fiscalYear: string;
      };

      const userIdFromToken = req.user?.userId;
      if (userId !== userIdFromToken) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      // Verify user has DGI credentials stored
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message:
            "DGI credentials not found. Please configure your DGI credentials first.",
        });
        return;
      }

      // Authenticate with DGI
      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      // Create declaration
      const result = await declarationService.createDeclaration(
        fiscalYear,
        declarationType,
      );

      res.json({
        success: true,
        data: {
          declarationId: result.id,
          action: result.action,
          status: result.status,
        },
      });
    } catch (error: any) {
      console.error("[DGI] Create declaration error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to create declaration",
      });
    }
  }

  /**
   * GET /api/dgi/declarations
   * Get all declarations
   */
  async getAllDeclarations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.query;

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      // Get DGI credentials
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId: userId as string },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI credentials not found",
        });
        return;
      }

      // Authenticate and get declarations
      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result = await declarationService.getAllDeclarations();

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DGI] Get declarations error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to get declarations",
      });
    }
  }

  /**
   * GET /api/dgi/declarations/:year
   * Get declarations by year
   */
  async getDeclarationsByYear(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, year } = req.query;
      const { year: yearParam } = req.params;

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      // Get DGI credentials
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId: userId as string },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI credentials not found",
        });
        return;
      }

      // Authenticate and get declarations
      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const targetYear = (year as string) || yearParam;
      const result = await declarationService.getDeclarationsByYear(targetYear);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DGI] Get declarations by year error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to get declarations",
      });
    }
  }

  /**
   * DELETE /api/dgi/declarations
   * Delete a declaration
   */
  async deleteDeclaration(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId } = req.body;

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      // Get DGI credentials
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI credentials not found",
        });
        return;
      }

      // Authenticate
      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      // Delete declaration
      const result = await declarationService.deleteDeclaration(declarationId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DGI] Delete declaration error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to delete declaration",
      });
    }
  }

  // ============================================
  // Page Operations
  // ============================================

  /**
   * PUT /api/dgi/pages
   * Submit a declaration page (full replace)
   */
  async submitPage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, pageName, pageData } = req.body;

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      // Get DGI credentials
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI credentials not found",
        });
        return;
      }

      // Authenticate
      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      // Submit page
      const result = await declarationService.submitPage(
        declarationId,
        pageName,
        pageData,
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DGI] Submit page error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to submit page",
      });
    }
  }

  /**
   * PATCH /api/dgi/pages
   * Update a declaration page (partial update)
   */
  async updatePage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, pageName, pageData } = req.body;

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      // Get DGI credentials
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI credentials not found",
        });
        return;
      }

      // Authenticate
      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      // Update page
      const result = await declarationService.updatePage(
        declarationId,
        pageName,
        pageData,
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DGI] Update page error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to update page",
      });
    }
  }

  /**
   * DELETE /api/dgi/pages
   * Delete a declaration page
   */
  async deletePage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, pageName } = req.body;

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      // Get DGI credentials
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI credentials not found",
        });
        return;
      }

      // Authenticate
      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      // Delete page
      const result = await declarationService.deletePage(
        declarationId,
        pageName,
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DGI] Delete page error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to delete page",
      });
    }
  }

  // ============================================
  // Specific Page Methods
  // ============================================

  /**
   * PUT /api/dgi/pages/etats-financiers
   * Submit Page de Garde
   */
  async submitPageDeGarde(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, pageData } = req.body;

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI credentials not found",
        });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result = await declarationService.submitPageDeGarde(
        declarationId,
        pageData,
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DGI] Submit Page de Garde error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to submit Page de Garde",
      });
    }
  }

  /**
   * PUT /api/dgi/pages/fiche-r1
   * Submit Fiche R1
   */
  async submitFicheR1(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, pageData } = req.body;

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI credentials not found",
        });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result = await declarationService.submitFicheR1(
        declarationId,
        pageData,
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DGI] Submit Fiche R1 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to submit Fiche R1",
      });
    }
  }

  /**
   * PUT /api/dgi/pages/fiche-r2
   * Submit Fiche R2
   */
  async submitFicheR2(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, pageData } = req.body;

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI credentials not found",
        });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result = await declarationService.submitFicheR2(
        declarationId,
        pageData,
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DGI] Submit Fiche R2 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to submit Fiche R2",
      });
    }
  }

  // ============================================
  // Grille Analyse Methods
  // ============================================

  /**
   * PUT /api/dgi/grille-analyse
   * Submit Grille Analyse (full replace)
   */
  async submitGrilleAnalyse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, grilleData } = req.body as {
        userId: string;
        declarationId: string;
        grilleData: DGIGrilleAnalyseData;
      };

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI credentials not found",
        });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result = await declarationService.submitGrilleAnalyse(
        declarationId,
        grilleData,
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DGI] Submit Grille Analyse error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to submit Grille Analyse",
      });
    }
  }

  /**
   * PATCH /api/dgi/grille-analyse
   * Update Grille Analyse (partial update)
   */
  async updateGrilleAnalyse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, grilleData } = req.body as {
        userId: string;
        declarationId: string;
        grilleData: Partial<DGIGrilleAnalyseData>;
      };

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI credentials not found",
        });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result = await declarationService.updateGrilleAnalyse(
        declarationId,
        grilleData,
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DGI] Update Grille Analyse error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to update Grille Analyse",
      });
    }
  }

  /**
   * DELETE /api/dgi/grille-analyse
   * Delete Grille Analyse
   */
  async deleteGrilleAnalyse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId } = req.body;

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI credentials not found",
        });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result =
        await declarationService.deleteGrilleAnalyse(declarationId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DGI] Delete Grille Analyse error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to delete Grille Analyse",
      });
    }
  }

  // ============================================
  // Section 2 Model 1 Bilan Paysage Methods
  // ============================================

  /**
   * PUT /api/dgi/section2-model1-bilan-paysage
   * Submit Section 2 Model 1 Bilan Paysage (full replace)
   */
  async submitSection2Model1BilanPaysage(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { userId, declarationId, bilanData } = req.body as {
        userId: string;
        declarationId: string;
        bilanData: DGISection2Model1BilanPaysageData;
      };

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI credentials not found",
        });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result = await declarationService.submitSection2Model1BilanPaysage(
        declarationId,
        bilanData,
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DGI] Submit Bilan Paysage error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to submit Bilan Paysage",
      });
    }
  }

  /**
   * PATCH /api/dgi/section2-model1-bilan-paysage
   * Update Section 2 Model 1 Bilan Paysage (partial update)
   */
  async updateSection2Model1BilanPaysage(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { userId, declarationId, bilanData } = req.body as {
        userId: string;
        declarationId: string;
        bilanData: Partial<DGISection2Model1BilanPaysageData>;
      };

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI credentials not found",
        });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result = await declarationService.updateSection2Model1BilanPaysage(
        declarationId,
        bilanData,
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DGI] Update Bilan Paysage error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to update Bilan Paysage",
      });
    }
  }

  /**
   * DELETE /api/dgi/section2-model1-bilan-paysage
   * Delete Section 2 Model 1 Bilan Paysage
   */
  async deleteSection2Model1BilanPaysage(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { userId, declarationId } = req.body;

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI credentials not found",
        });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result =
        await declarationService.deleteSection2Model1BilanPaysage(
          declarationId,
        );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DGI] Delete Bilan Paysage error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to delete Bilan Paysage",
      });
    }
  }

  // ============================================
  // Section 2 Model Compte de Resultat Methods
  // ============================================

  /**
   * PUT /api/dgi/section2-model-compte-resultat
   * Submit Section 2 Model Compte de Resultat (full replace)
   */
  async submitSection2ModelCompteResultat(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { userId, declarationId, resultatData } = req.body as {
        userId: string;
        declarationId: string;
        resultatData: DGISection2ModelCompteResultatData;
      };

      if (!userId || userId !== req.user?.userId) {
        res
          .status(403)
          .json({ success: false, message: "Unauthorized access" });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });
      if (!dgiConfig) {
        res
          .status(400)
          .json({ success: false, message: "DGI credentials not found" });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result = await declarationService.submitSection2ModelCompteResultat(
        declarationId,
        resultatData,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Submit Compte Resultat error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to submit Compte de Resultat",
      });
    }
  }

  /**
   * PATCH /api/dgi/section2-model-compte-resultat
   * Update Section 2 Model Compte de Resultat (partial update)
   */
  async updateSection2ModelCompteResultat(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { userId, declarationId, resultatData } = req.body as {
        userId: string;
        declarationId: string;
        resultatData: Partial<DGISection2ModelCompteResultatData>;
      };

      if (!userId || userId !== req.user?.userId) {
        res
          .status(403)
          .json({ success: false, message: "Unauthorized access" });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });
      if (!dgiConfig) {
        res
          .status(400)
          .json({ success: false, message: "DGI credentials not found" });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result = await declarationService.updateSection2ModelCompteResultat(
        declarationId,
        resultatData,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Update Compte Resultat error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to update Compte de Resultat",
      });
    }
  }

  /**
   * DELETE /api/dgi/section2-model-compte-resultat
   * Delete Section 2 Model Compte de Resultat
   */
  async deleteSection2ModelCompteResultat(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { userId, declarationId } = req.body;

      if (!userId || userId !== req.user?.userId) {
        res
          .status(403)
          .json({ success: false, message: "Unauthorized access" });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });
      if (!dgiConfig) {
        res
          .status(400)
          .json({ success: false, message: "DGI credentials not found" });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result =
        await declarationService.deleteSection2ModelCompteResultat(
          declarationId,
        );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Delete Compte Resultat error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to delete Compte de Resultat",
      });
    }
  }

  // ============================================
  // Section 2 Model Tableau des Flux de Tresorerie Methods
  // ============================================

  /**
   * PUT /api/dgi/section2-model-flux-tresorerie
   * Submit Section 2 Model Tableau des Flux de Tresorerie (full replace)
   */
  async submitSection2ModelFluxTresorerie(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { userId, declarationId, tresorerieData } = req.body as {
        userId: string;
        declarationId: string;
        tresorerieData: DGISection2ModelTableauFluxTresorerieData;
      };

      if (!userId || userId !== req.user?.userId) {
        res
          .status(403)
          .json({ success: false, message: "Unauthorized access" });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });
      if (!dgiConfig) {
        res
          .status(400)
          .json({ success: false, message: "DGI credentials not found" });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result =
        await declarationService.submitSection2ModelTableauFluxTresorerie(
          declarationId,
          tresorerieData,
        );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Submit Flux Tresorerie error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to submit Flux Tresorerie",
      });
    }
  }

  /**
   * PATCH /api/dgi/section2-model-flux-tresorerie
   * Update Section 2 Model Tableau des Flux de Tresorerie (partial update)
   */
  async updateSection2ModelFluxTresorerie(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { userId, declarationId, tresorerieData } = req.body as {
        userId: string;
        declarationId: string;
        tresorerieData: Partial<DGISection2ModelTableauFluxTresorerieData>;
      };

      if (!userId || userId !== req.user?.userId) {
        res
          .status(403)
          .json({ success: false, message: "Unauthorized access" });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });
      if (!dgiConfig) {
        res
          .status(400)
          .json({ success: false, message: "DGI credentials not found" });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result =
        await declarationService.updateSection2ModelTableauFluxTresorerie(
          declarationId,
          tresorerieData,
        );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Update Flux Tresorerie error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to update Flux Tresorerie",
      });
    }
  }

  /**
   * DELETE /api/dgi/section2-model-flux-tresorerie
   * Delete Section 2 Model Tableau des Flux de Tresorerie
   */
  async deleteSection2ModelFluxTresorerie(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { userId, declarationId } = req.body;

      if (!userId || userId !== req.user?.userId) {
        res
          .status(403)
          .json({ success: false, message: "Unauthorized access" });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });
      if (!dgiConfig) {
        res
          .status(400)
          .json({ success: false, message: "DGI credentials not found" });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result =
        await declarationService.deleteSection2ModelTableauFluxTresorerie(
          declarationId,
        );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Delete Flux Tresorerie error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to delete Flux Tresorerie",
      });
    }
  }

  // ============================================
  // Note 1 (Passif/Bilan) Methods
  // ============================================

  /**
   * PUT /api/dgi/note1
   * Submit Note 1 (Passif/Bilan) - full replace
   */
  async submitNote1(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note1Data } = req.body as {
        userId: string;
        declarationId: string;
        note1Data: DGINote1Data;
      };

      if (!userId || !declarationId || !note1Data) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId, note1Data",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.submitNote1(
        declarationId,
        note1Data,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Submit Note 1 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to submit Note 1",
      });
    }
  }

  /**
   * PATCH /api/dgi/note1
   * Update Note 1 (Passif/Bilan) - partial update
   */
  async updateNote1(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note1Data } = req.body as {
        userId: string;
        declarationId: string;
        note1Data: Partial<DGINote1Data>;
      };

      if (!userId || !declarationId || !note1Data) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId, note1Data",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.updateNote1(
        declarationId,
        note1Data,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Update Note 1 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to update Note 1",
      });
    }
  }

  /**
   * DELETE /api/dgi/note1
   * Delete Note 1 (Passif/Bilan)
   */
  async deleteNote1(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId } = req.body as {
        userId: string;
        declarationId: string;
      };

      if (!userId || !declarationId) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.deleteNote1(declarationId);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Delete Note 1 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to delete Note 1",
      });
    }
  }

  // ============================================
  // Note 2 (Informations Obligatoires) Methods
  // ============================================

  /**
   * PUT /api/dgi/note2
   * Submit Note 2 (Informations Obligatoires) - full replace
   */
  async submitNote2(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note2Data } = req.body as {
        userId: string;
        declarationId: string;
        note2Data: DGINote2Data;
      };

      if (!userId || !declarationId || !note2Data) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId, note2Data",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.submitNote2(
        declarationId,
        note2Data,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Submit Note 2 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to submit Note 2",
      });
    }
  }

  /**
   * PATCH /api/dgi/note2
   * Update Note 2 (Informations Obligatoires) - partial update
   */
  async updateNote2(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note2Data } = req.body as {
        userId: string;
        declarationId: string;
        note2Data: Partial<DGINote2Data>;
      };

      if (!userId || !declarationId || !note2Data) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId, note2Data",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.updateNote2(
        declarationId,
        note2Data,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Update Note 2 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to update Note 2",
      });
    }
  }

  /**
   * DELETE /api/dgi/note2
   * Delete Note 2 (Informations Obligatoires)
   */
  async deleteNote2(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId } = req.body as {
        userId: string;
        declarationId: string;
      };

      if (!userId || !declarationId) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.deleteNote2(declarationId);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Delete Note 2 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to delete Note 2",
      });
    }
  }

  // ============================================
  // Note 3A (Immobilisations Brutes) Methods
  // ============================================

  /**
   * PUT /api/dgi/note3a
   * Submit Note 3A (Immobilisations Brutes) - full replace
   */
  async submitNote3A(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note3aData } = req.body as {
        userId: string;
        declarationId: string;
        note3aData: DGINote3AData;
      };

      if (!userId || !declarationId || !note3aData) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId, note3aData",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.submitNote3A(
        declarationId,
        note3aData,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Submit Note 3A error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to submit Note 3A",
      });
    }
  }

  /**
   * PATCH /api/dgi/note3a
   * Update Note 3A (Immobilisations Brutes) - partial update
   */
  async updateNote3A(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note3aData } = req.body as {
        userId: string;
        declarationId: string;
        note3aData: Partial<DGINote3AData>;
      };

      if (!userId || !declarationId || !note3aData) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId, note3aData",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.updateNote3A(
        declarationId,
        note3aData,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Update Note 3A error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to update Note 3A",
      });
    }
  }

  /**
   * DELETE /api/dgi/note3a
   * Delete Note 3A (Immobilisations Brutes)
   */
  async deleteNote3A(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId } = req.body as {
        userId: string;
        declarationId: string;
      };

      if (!userId || !declarationId) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.deleteNote3A(declarationId);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Delete Note 3A error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to delete Note 3A",
      });
    }
  }

  // ============================================
  // Note 3B (Biens Pris en Location Acquisition) Methods
  // ============================================

  /**
   * PUT /api/dgi/note3b
   * Submit Note 3B (Biens Pris en Location Acquisition) - full replace
   */
  async submitNote3B(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note3bData } = req.body as {
        userId: string;
        declarationId: string;
        note3bData: DGINote3BData;
      };

      if (!userId || !declarationId || !note3bData) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId, note3bData",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.submitNote3B(
        declarationId,
        note3bData,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Submit Note 3B error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to submit Note 3B",
      });
    }
  }

  /**
   * PATCH /api/dgi/note3b
   * Update Note 3B (Biens Pris en Location Acquisition) - partial update
   */
  async updateNote3B(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note3bData } = req.body as {
        userId: string;
        declarationId: string;
        note3bData: Partial<DGINote3BData>;
      };

      if (!userId || !declarationId || !note3bData) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId, note3bData",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.updateNote3B(
        declarationId,
        note3bData,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Update Note 3B error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to update Note 3B",
      });
    }
  }

  /**
   * DELETE /api/dgi/note3b
   * Delete Note 3B (Biens Pris en Location Acquisition)
   */
  async deleteNote3B(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId } = req.body as {
        userId: string;
        declarationId: string;
      };

      if (!userId || !declarationId) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.deleteNote3B(declarationId);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Delete Note 3B error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to delete Note 3B",
      });
    }
  }

  // ============================================
  // Note 3C (Immobilisation - Amortissements) Methods
  // ============================================

  /**
   * PUT /api/dgi/note3c
   * Submit Note 3C (Immobilisation - Amortissements) - full replace
   */
  async submitNote3C(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note3cData } = req.body as {
        userId: string;
        declarationId: string;
        note3cData: DGINote3CData;
      };

      if (!userId || !declarationId || !note3cData) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId, note3cData",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.submitNote3C(
        declarationId,
        note3cData,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Submit Note 3C error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to submit Note 3C",
      });
    }
  }

  /**
   * PATCH /api/dgi/note3c
   * Update Note 3C (Immobilisation - Amortissements) - partial update
   */
  async updateNote3C(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note3cData } = req.body as {
        userId: string;
        declarationId: string;
        note3cData: Partial<DGINote3CData>;
      };

      if (!userId || !declarationId || !note3cData) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId, note3cData",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.updateNote3C(
        declarationId,
        note3cData,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Update Note 3C error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to update Note 3C",
      });
    }
  }

  /**
   * DELETE /api/dgi/note3c
   * Delete Note 3C (Immobilisation - Amortissements)
   */
  async deleteNote3C(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId } = req.body as {
        userId: string;
        declarationId: string;
      };

      if (!userId || !declarationId) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.deleteNote3C(declarationId);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Delete Note 3C error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to delete Note 3C",
      });
    }
  }

  // ============================================
  // CO1-Note 3C (Tableau de Suivi des Amortissements) Methods
  // ============================================

  /**
   * PUT /api/dgi/col1-note3c2
   * Submit CO1-Note 3C (Tableau de Suivi des Amortissements) - full replace
   */
  async submitCol1Note3C2(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, col1Note3C2Data } = req.body as {
        userId: string;
        declarationId: string;
        col1Note3C2Data: DGICol1Note3C2Data;
      };

      if (!userId || !declarationId || !col1Note3C2Data) {
        res.status(400).json({
          success: false,
          message:
            "Missing required fields: userId, declarationId, col1Note3C2Data",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.submitCol1Note3C2(
        declarationId,
        col1Note3C2Data,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Submit CO1-Note 3C error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to submit CO1-Note 3C",
      });
    }
  }

  /**
   * PATCH /api/dgi/col1-note3c2
   * Update CO1-Note 3C (Tableau de Suivi des Amortissements) - partial update
   */
  async updateCol1Note3C2(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, col1Note3C2Data } = req.body as {
        userId: string;
        declarationId: string;
        col1Note3C2Data: Partial<DGICol1Note3C2Data>;
      };

      if (!userId || !declarationId || !col1Note3C2Data) {
        res.status(400).json({
          success: false,
          message:
            "Missing required fields: userId, declarationId, col1Note3C2Data",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.updateCol1Note3C2(
        declarationId,
        col1Note3C2Data,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Update CO1-Note 3C error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to update CO1-Note 3C",
      });
    }
  }

  /**
   * DELETE /api/dgi/col1-note3c2
   * Delete CO1-Note 3C (Tableau de Suivi des Amortissements)
   */
  async deleteCol1Note3C2(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId } = req.body as {
        userId: string;
        declarationId: string;
      };

      if (!userId || !declarationId) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.deleteCol1Note3C2(declarationId);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Delete CO1-Note 3C error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to delete CO1-Note 3C",
      });
    }
  }

  // ============================================
  // Note 3D2 (Immobilisations - Cessions) Methods
  // This endpoint uses the standard URL pattern: /process/:declaration_id/:page
  // ============================================

  /**
   * PUT /api/dgi/note3d2
   * Submit Note 3D2 (Immobilisations - Cessions) - full replace
   * Uses URL pattern: /process/:declaration_id/note3d2
   */
  async submitNote3D2(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note3d2Data } = req.body as {
        userId: string;
        declarationId: string;
        note3d2Data: DGINote3D2Data;
      };

      if (!userId || !declarationId || !note3d2Data) {
        res.status(400).json({
          success: false,
          message:
            "Missing required fields: userId, declarationId, note3d2Data",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.submitNote3D2(
        declarationId,
        note3d2Data,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Submit Note 3D2 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to submit Note 3D2",
      });
    }
  }

  /**
   * PATCH /api/dgi/note3d2
   * Update Note 3D2 (Immobilisations - Cessions) - partial update
   */
  async updateNote3D2(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note3d2Data } = req.body as {
        userId: string;
        declarationId: string;
        note3d2Data: Partial<DGINote3D2Data>;
      };

      if (!userId || !declarationId || !note3d2Data) {
        res.status(400).json({
          success: false,
          message:
            "Missing required fields: userId, declarationId, note3d2Data",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.updateNote3D2(
        declarationId,
        note3d2Data,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Update Note 3D2 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to update Note 3D2",
      });
    }
  }

  /**
   * DELETE /api/dgi/note3d2
   * Delete Note 3D2 (Immobilisations - Cessions)
   */
  async deleteNote3D2(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId } = req.body as {
        userId: string;
        declarationId: string;
      };

      if (!userId || !declarationId) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.deleteNote3D2(declarationId);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Delete Note 3D2 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to delete Note 3D2",
      });
    }
  }

  // ============================================
  // Note 3E2 (Immobilisations - Réévaluation) Methods
  // ============================================

  /**
   * PUT /api/dgi/note3e2
   * Submit Note 3E2 (Immobilisations - Réévaluation) - full replace
   */
  async submitNote3E2(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note3e2Data } = req.body as {
        userId: string;
        declarationId: string;
        note3e2Data: DGINote3E2Data;
      };

      if (!userId || !declarationId || !note3e2Data) {
        res.status(400).json({
          success: false,
          message:
            "Missing required fields: userId, declarationId, note3e2Data",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.submitNote3E2(
        declarationId,
        note3e2Data,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Submit Note 3E2 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to submit Note 3E2",
      });
    }
  }

  /**
   * PATCH /api/dgi/note3e2
   * Update Note 3E2 (Immobilisations - Réévaluation) - partial update
   */
  async updateNote3E2(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note3e2Data } = req.body as {
        userId: string;
        declarationId: string;
        note3e2Data: Partial<DGINote3E2Data>;
      };

      if (!userId || !declarationId || !note3e2Data) {
        res.status(400).json({
          success: false,
          message:
            "Missing required fields: userId, declarationId, note3e2Data",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.updateNote3E2(
        declarationId,
        note3e2Data,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Update Note 3E2 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to update Note 3E2",
      });
    }
  }

  /**
   * DELETE /api/dgi/note3e2
   * Delete Note 3E2 (Immobilisations - Réévaluation)
   */
  async deleteNote3E2(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId } = req.body as {
        userId: string;
        declarationId: string;
      };

      if (!userId || !declarationId) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.deleteNote3E2(declarationId);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Delete Note 3E2 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to delete Note 3E2",
      });
    }
  }

  // ============================================
  // Note 3F (Frais d'Établissement) Methods
  // This endpoint uses the URL pattern: /process/:year/:type/:page
  // ============================================

  /**
   * PUT /api/dgi/note3f
   * Submit Note 3F (Frais d'Établissement) - full replace
   * Uses URL pattern: /process/:year/:type/note3F
   */
  async submitNote3F(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, year, type, note3fData } = req.body as {
        userId: string;
        year: string;
        type: string;
        note3fData: DGINote3FData;
      };

      if (!userId || !year || !type || !note3fData) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, year, type, note3fData",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.submitNote3F(
        year,
        type,
        note3fData,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Submit Note 3F error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to submit Note 3F",
      });
    }
  }

  /**
   * PATCH /api/dgi/note3f
   * Update Note 3F (Frais d'Établissement) - partial update
   */
  async updateNote3F(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, year, type, note3fData } = req.body as {
        userId: string;
        year: string;
        type: string;
        note3fData: Partial<DGINote3FData>;
      };

      if (!userId || !year || !type || !note3fData) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, year, type, note3fData",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.updateNote3F(
        year,
        type,
        note3fData,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Update Note 3F error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to update Note 3F",
      });
    }
  }

  /**
   * DELETE /api/dgi/note3f
   * Delete Note 3F (Frais d'Établissement)
   */
  async deleteNote3F(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, year, type } = req.body as {
        userId: string;
        year: string;
        type: string;
      };

      if (!userId || !year || !type) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, year, type",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.deleteNote3F(year, type);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Delete Note 3F error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to delete Note 3F",
      });
    }
  }

  // ============================================
  // Note 4 (Créances) Methods
  // This endpoint uses the URL pattern: /process/:declaration_id/:declaration_page
  // The :declaration_page parameter is "note42"
  // ============================================

  /**
   * PUT /api/dgi/note4
   * Submit Note 4 (Créances) - full replace
   * Uses URL pattern: /process/:declaration_id/note42
   */
  async submitNote4(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note4Data } = req.body as {
        userId: string;
        declarationId: string;
        note4Data: DGINote4Data;
      };

      if (!userId || !declarationId || !note4Data) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId, note4Data",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.submitNote4(
        declarationId,
        note4Data,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Submit Note 4 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to submit Note 4",
      });
    }
  }

  /**
   * PATCH /api/dgi/note4
   * Update Note 4 (Créances) - partial update
   */
  async updateNote4(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note4Data } = req.body as {
        userId: string;
        declarationId: string;
        note4Data: Partial<DGINote4Data>;
      };

      if (!userId || !declarationId || !note4Data) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId, note4Data",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.updateNote4(
        declarationId,
        note4Data,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Update Note 4 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to update Note 4",
      });
    }
  }

  /**
   * DELETE /api/dgi/note4
   * Delete Note 4 (Créances)
   */
  async deleteNote4(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId } = req.body as {
        userId: string;
        declarationId: string;
      };

      if (!userId || !declarationId) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.deleteNote4(declarationId);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Delete Note 4 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to delete Note 4",
      });
    }
  }

  // ============================================
  // Note 5 (Stocks) Methods
  // This endpoint uses the URL pattern: /process/:declaration_id/:declaration_page
  // The :declaration_page parameter is "note52"
  // ============================================

  /**
   * PUT /api/dgi/note5
   * Submit Note 5 (Stocks) - full replace
   * Uses URL pattern: /process/:declaration_id/note52
   */
  async submitNote5(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note5Data } = req.body as {
        userId: string;
        declarationId: string;
        note5Data: DGINote5Data;
      };

      if (!userId || !declarationId || !note5Data) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId, note5Data",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.submitNote5(
        declarationId,
        note5Data,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Submit Note 5 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to submit Note 5",
      });
    }
  }

  /**
   * PATCH /api/dgi/note5
   * Update Note 5 (Stocks) - partial update
   */
  async updateNote5(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId, note5Data } = req.body as {
        userId: string;
        declarationId: string;
        note5Data: Partial<DGINote5Data>;
      };

      if (!userId || !declarationId || !note5Data) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId, note5Data",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.updateNote5(
        declarationId,
        note5Data,
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Update Note 5 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to update Note 5",
      });
    }
  }

  /**
   * DELETE /api/dgi/note5
   * Delete Note 5 (Stocks)
   */
  async deleteNote5(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, declarationId } = req.body as {
        userId: string;
        declarationId: string;
      };

      if (!userId || !declarationId) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: userId, declarationId",
        });
        return;
      }

      // Get DGI config
      const dgiConfig = await prisma.dGIConfig.findUnique({
        where: { userId },
      });

      if (!dgiConfig) {
        res.status(400).json({
          success: false,
          message: "DGI configuration not found for user",
        });
        return;
      }

      // Authenticate if not already
      if (!declarationService.isAuthenticated()) {
        await declarationService.authenticate({
          username: dgiConfig.niu,
          password: dgiConfig.password,
        });
      }

      const result = await declarationService.deleteNote5(declarationId);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Delete Note 5 error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to delete Note 5",
      });
    }
  }
}

// ============================================
// Export singleton instance
// ============================================

export const declarationController = new DeclarationController();
