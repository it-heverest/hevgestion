// src/controllers/trash.controller.ts
//
// Écran d'administration de la corbeille: consultation des éléments supprimés
// et restauration. Réservé aux administrateurs (voir trash.routes.ts).
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { trashService, TrashEntityType } from "../services/trash.service";
import { ResponseBuilder } from "../utils/response-builder";
import { auditService } from "../services/audit.service";

const ENTITY_TYPES: TrashEntityType[] = [
  "Client",
  "Folder",
  "Balance",
  "DSF",
  "DSFImport",
  "RevueFiscalCompany",
  "DSFNote",
];

export class TrashController {
  /** GET /api/trash — liste paginée des éléments supprimés */
  getItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { entityType, clientId, folderId, restored, search, page, limit } =
        req.query;

      const type =
        entityType && ENTITY_TYPES.includes(entityType as TrashEntityType)
          ? (entityType as TrashEntityType)
          : undefined;

      const result = await trashService.list({
        entityType: type,
        clientId: clientId ? String(clientId) : undefined,
        folderId: folderId ? String(folderId) : undefined,
        restored: restored === "true",
        search: search ? String(search) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
      });

      return ResponseBuilder.success(res, result, "Corbeille récupérée");
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/trash/stats — compteurs par type, pour l'en-tête de l'écran */
  getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await trashService.getStats();
      return ResponseBuilder.success(res, stats, "Statistiques de la corbeille");
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/trash/:id — détail d'un élément, payload complet inclus */
  getItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const record = await trashService.getById(req.params.id);
      return ResponseBuilder.success(res, record, "Élément récupéré");
    } catch (error) {
      next(error);
    }
  };

  /** POST /api/trash/:id/restore — remet l'élément en service */
  restoreItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const restored = await trashService.restore(req.params.id, userId);

      await auditService.logUserAction(
        userId,
        "TRASH_RESTORED",
        `Restauration depuis la corbeille: ${restored.entityType} ${restored.entityId}`,
        { recordId: req.params.id, ...restored }
      );

      return ResponseBuilder.success(res, restored, "Élément restauré avec succès");
    } catch (error) {
      next(error);
    }
  };
}

export const trashController = new TrashController();
