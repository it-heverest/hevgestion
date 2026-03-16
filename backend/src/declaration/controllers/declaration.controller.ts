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
          message: "Username and password are required",
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
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Authentication failed",
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
    res: Response
  ): Promise<void> {
    try {
      const { userId, declarationId, tresorerieData } = req.body as {
        userId: string;
        declarationId: string;
        tresorerieData: DGISection2ModelTableauFluxTresorerieData;
      };

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({ success: false, message: "Unauthorized access" });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({ where: { userId } });
      if (!dgiConfig) {
        res.status(400).json({ success: false, message: "DGI credentials not found" });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result = await declarationService.submitSection2ModelTableauFluxTresorerie(
        declarationId,
        tresorerieData
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Submit Flux Tresorerie error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to submit Flux Tresorerie",
      });
    }
  }

  /**
   * PATCH /api/dgi/section2-model-flux-tresorerie
   * Update Section 2 Model Tableau des Flux de Tresorerie (partial update)
   */
  async updateSection2ModelFluxTresorerie(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { userId, declarationId, tresorerieData } = req.body as {
        userId: string;
        declarationId: string;
        tresorerieData: Partial<DGISection2ModelTableauFluxTresorerieData>;
      };

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({ success: false, message: "Unauthorized access" });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({ where: { userId } });
      if (!dgiConfig) {
        res.status(400).json({ success: false, message: "DGI credentials not found" });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result = await declarationService.updateSection2ModelTableauFluxTresorerie(
        declarationId,
        tresorerieData
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Update Flux Tresorerie error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to update Flux Tresorerie",
      });
    }
  }

  /**
   * DELETE /api/dgi/section2-model-flux-tresorerie
   * Delete Section 2 Model Tableau des Flux de Tresorerie
   */
  async deleteSection2ModelFluxTresorerie(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { userId, declarationId } = req.body;

      if (!userId || userId !== req.user?.userId) {
        res.status(403).json({ success: false, message: "Unauthorized access" });
        return;
      }

      const dgiConfig = await prisma.dGIConfig.findUnique({ where: { userId } });
      if (!dgiConfig) {
        res.status(400).json({ success: false, message: "DGI credentials not found" });
        return;
      }

      await declarationService.authenticate({
        username: dgiConfig.username,
        password: dgiConfig.password,
      });

      const result = await declarationService.deleteSection2ModelTableauFluxTresorerie(declarationId);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[DGI] Delete Flux Tresorerie error:", error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Failed to delete Flux Tresorerie",
      });
    }
  }
}

// ============================================
// Export singleton instance
// ============================================

export const declarationController = new DeclarationController();
