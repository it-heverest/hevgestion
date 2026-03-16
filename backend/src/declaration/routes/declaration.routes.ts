/**
 * DGI Declaration Routes
 *
 * All routes for DGI declaration operations
 */

import { Router } from "express";
import { declarationController } from "../controllers/declaration.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// Authentication
// ============================================

// POST /api/dgi/auth
router.post(
  "/auth",
  declarationController.authenticate.bind(declarationController),
);

// ============================================
// Declaration Operations
// ============================================

// POST /api/dgi/declarations - Create declaration
router.post(
  "/declarations",
  declarationController.createDeclaration.bind(declarationController),
);

// GET /api/dgi/declarations - Get all declarations
router.get(
  "/declarations",
  declarationController.getAllDeclarations.bind(declarationController),
);

// GET /api/dgi/declarations/:year - Get declarations by year
router.get(
  "/declarations/:year",
  declarationController.getDeclarationsByYear.bind(declarationController),
);

// DELETE /api/dgi/declarations - Delete declaration
router.delete(
  "/declarations",
  declarationController.deleteDeclaration.bind(declarationController),
);

// ============================================
// Generic Page Operations
// ============================================

// PUT /api/dgi/pages - Submit page (full replace)
router.put(
  "/pages",
  declarationController.submitPage.bind(declarationController),
);

// PATCH /api/dgi/pages - Update page (partial update)
router.patch(
  "/pages",
  declarationController.updatePage.bind(declarationController),
);

// DELETE /api/dgi/pages - Delete page
router.delete(
  "/pages",
  declarationController.deletePage.bind(declarationController),
);

// ============================================
// Specific Page Routes
// ============================================

// Page de Garde (etats-financiers)
// PUT /api/dgi/pages/etats-financiers
router.put(
  "/pages/etats-financiers",
  declarationController.submitPageDeGarde.bind(declarationController),
);

// Fiche R1
// PUT /api/dgi/pages/fiche-r1
router.put(
  "/pages/fiche-r1",
  declarationController.submitFicheR1.bind(declarationController),
);

// Fiche R2
// PUT /api/dgi/pages/fiche-r2
router.put(
  "/pages/fiche-r2",
  declarationController.submitFicheR2.bind(declarationController),
);

// ============================================
// Grille Analyse Routes
// ============================================

// PUT /api/dgi/grille-analyse - Submit grille analyse (full replace)
router.put(
  "/grille-analyse",
  declarationController.submitGrilleAnalyse.bind(declarationController),
);

// PATCH /api/dgi/grille-analyse - Update grille analyse (partial update)
router.patch(
  "/grille-analyse",
  declarationController.updateGrilleAnalyse.bind(declarationController),
);

// DELETE /api/dgi/grille-analyse - Delete grille analyse
router.delete(
  "/grille-analyse",
  declarationController.deleteGrilleAnalyse.bind(declarationController),
);

// ============================================
// Section 2 Model 1 Bilan Paysage Routes
// ============================================

// PUT /api/dgi/section2-model1-bilan-paysage - Submit (full replace)
router.put(
  "/section2-model1-bilan-paysage",
  declarationController.submitSection2Model1BilanPaysage.bind(
    declarationController,
  ),
);

// PATCH /api/dgi/section2-model1-bilan-paysage - Update (partial)
router.patch(
  "/section2-model1-bilan-paysage",
  declarationController.updateSection2Model1BilanPaysage.bind(
    declarationController,
  ),
);

// DELETE /api/dgi/section2-model1-bilan-paysage - Delete
router.delete(
  "/section2-model1-bilan-paysage",
  declarationController.deleteSection2Model1BilanPaysage.bind(
    declarationController,
  ),
);

// ============================================
// Section 2 Model Compte de Resultat Routes
// ============================================

// PUT /api/dgi/section2-model-compte-resultat - Submit (full replace)
router.put(
  "/section2-model-compte-resultat",
  declarationController.submitSection2ModelCompteResultat.bind(
    declarationController,
  ),
);

// PATCH /api/dgi/section2-model-compte-resultat - Update (partial)
router.patch(
  "/section2-model-compte-resultat",
  declarationController.updateSection2ModelCompteResultat.bind(
    declarationController,
  ),
);

// DELETE /api/dgi/section2-model-compte-resultat - Delete
router.delete(
  "/section2-model-compte-resultat",
  declarationController.deleteSection2ModelCompteResultat.bind(
    declarationController,
  ),
);

// ============================================
// Section 2 Model Tableau des Flux de Tresorerie Routes
// ============================================

// PUT /api/dgi/section2-model-flux-tresorerie - Submit (full replace)
router.put(
  "/section2-model-flux-tresorerie",
  declarationController.submitSection2ModelFluxTresorerie.bind(
    declarationController,
  ),
);

// PATCH /api/dgi/section2-model-flux-tresorerie - Update (partial)
router.patch(
  "/section2-model-flux-tresorerie",
  declarationController.updateSection2ModelFluxTresorerie.bind(
    declarationController,
  ),
);

// DELETE /api/dgi/section2-model-flux-tresorerie - Delete
router.delete(
  "/section2-model-flux-tresorerie",
  declarationController.deleteSection2ModelFluxTresorerie.bind(
    declarationController,
  ),
);

// ============================================
// Note 1 (Passif/Bilan) Routes
// ============================================

// PUT /api/dgi/note1 - Submit Note 1 (full replace)
router.put(
  "/note1",
  declarationController.submitNote1.bind(declarationController),
);

// PATCH /api/dgi/note1 - Update Note 1 (partial)
router.patch(
  "/note1",
  declarationController.updateNote1.bind(declarationController),
);

// DELETE /api/dgi/note1 - Delete Note 1
router.delete(
  "/note1",
  declarationController.deleteNote1.bind(declarationController),
);

// ============================================
// Note 2 (Informations Obligatoires) Routes
// ============================================

// PUT /api/dgi/note2 - Submit Note 2 (full replace)
router.put(
  "/note2",
  declarationController.submitNote2.bind(declarationController),
);

// PATCH /api/dgi/note2 - Update Note 2 (partial)
router.patch(
  "/note2",
  declarationController.updateNote2.bind(declarationController),
);

// DELETE /api/dgi/note2 - Delete Note 2
router.delete(
  "/note2",
  declarationController.deleteNote2.bind(declarationController),
);

// ============================================
// Note 3A (Immobilisations Brutes) Routes
// ============================================

// PUT /api/dgi/note3a - Submit Note 3A (full replace)
router.put(
  "/note3a",
  declarationController.submitNote3A.bind(declarationController),
);

// PATCH /api/dgi/note3a - Update Note 3A (partial)
router.patch(
  "/note3a",
  declarationController.updateNote3A.bind(declarationController),
);

// DELETE /api/dgi/note3a - Delete Note 3A
router.delete(
  "/note3a",
  declarationController.deleteNote3A.bind(declarationController),
);

// ============================================
// Note 3B (Biens Pris en Location Acquisition) Routes
// ============================================

// PUT /api/dgi/note3b - Submit Note 3B (full replace)
router.put(
  "/note3b",
  declarationController.submitNote3B.bind(declarationController),
);

// PATCH /api/dgi/note3b - Update Note 3B (partial)
router.patch(
  "/note3b",
  declarationController.updateNote3B.bind(declarationController),
);

// DELETE /api/dgi/note3b - Delete Note 3B
router.delete(
  "/note3b",
  declarationController.deleteNote3B.bind(declarationController),
);

// ============================================
// Note 3C (Immobilisation - Amortissements) Routes
// ============================================

// PUT /api/dgi/note3c - Submit Note 3C (full replace)
router.put(
  "/note3c",
  declarationController.submitNote3C.bind(declarationController),
);

// PATCH /api/dgi/note3c - Update Note 3C (partial)
router.patch(
  "/note3c",
  declarationController.updateNote3C.bind(declarationController),
);

// DELETE /api/dgi/note3c - Delete Note 3C
router.delete(
  "/note3c",
  declarationController.deleteNote3C.bind(declarationController),
);

// ============================================
// Export
// ============================================

export default router;
