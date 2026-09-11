import { Response } from "express";
import { AuditAction, EntityType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ResponseBuilder } from "../utils/response-builder";
import { AuthRequest } from "../middleware/auth.middleware";
import { auditService } from "../services/audit.service";
import {
  getAllMappingNoteCodes,
  getMappingLines,
  mappingLineToOperations,
  noteCodeToCategory,
} from "../services/dsf/account-mapping.data";

interface AuthenticatedRequest extends AuthRequest {}

export class DSFConfigController {
  /**
   * Get DSF configs based on scope and user permissions - VERSION CORRIGÉE
   */
  async getConfigs(req: AuthenticatedRequest, res: Response) {
    try {
      const { category, clientId, exerciseId, ownerType } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      console.log("🔍 Get DSF configs - Params:", {
        category,
        clientId,
        exerciseId,
        ownerType,
        userId,
        userRole,
      });

      // Construire la clause WHERE de base
      let whereClause: any = {
        isActive: true,
      };

      // IMPORTANT: Pour les configs SYSTEM, on ignore clientId et exerciseId
      // Pour les configs ACCOUNTANT, on les utilise si fournis

      // Filtrage par ownerType si spécifié
      if (ownerType) {
        whereClause.ownerType = ownerType;

        // Si ownerType est ACCOUNTANT, on filtre par ownerId et scope
        if (ownerType === "ACCOUNTANT") {
          if (exerciseId) {
            whereClause.exerciseId = exerciseId;
          }
          if (clientId && !exerciseId) {
            whereClause.clientId = clientId;
          }

          // Permission pour les comptables: ne voir que leurs propres configs
          if (userRole === "COMPTABLE") {
            whereClause.ownerId = userId;
          }
        }
        // Pour SYSTEM, on ignore clientId et exerciseId
      } else {
        // Pas de ownerType spécifié: logique de permission basée sur le rôle
        if (userRole === "COMPTABLE") {
          // Comptables voient: SYSTEM + leurs propres ACCOUNTANT
          whereClause.OR = [
            { ownerType: "SYSTEM" },
            {
              ownerType: "ACCOUNTANT",
              ownerId: userId,
              ...(exerciseId ? { exerciseId } : clientId ? { clientId } : {}),
            },
          ];
        } else if (userRole === "ADMIN") {
          // Admins voient tout, mais pour ACCOUNTANT on utilise les filtres
          if (exerciseId || clientId) {
            whereClause.OR = [
              { ownerType: "SYSTEM" }, // SYSTEM n'a pas ces champs
              {
                ownerType: "ACCOUNTANT",
                ...(exerciseId ? { exerciseId } : clientId ? { clientId } : {}),
              },
            ];
          }
        } else {
          // Autres rôles: seulement SYSTEM
          whereClause.ownerType = "SYSTEM";
        }
      }

      // Filtrage par catégorie (vient de la relation avec DSFConfig)
      // On va filtrer après avoir récupéré les données

      console.log(
        "🔍 Get DSF configs - Where clause:",
        JSON.stringify(whereClause, null, 2)
      );

      // Récupérer les configurations comptables
      // Note: pas de relation `accountMappings` sur DSFConfig — les
      // opérations vivent directement sur DSFComptableConfig.operations
      // (voir schema.prisma). Un include imbriqué dessus fait planter
      // Prisma (modèle inexistant), d'où le simple `config: true` ici.
      const comptableConfigs = await (
        prisma as any
      ).DSFComptableConfig.findMany({
        where: whereClause,
        include: {
          config: true,
        },
        orderBy: [{ ownerType: "asc" }, { codeDsf: "asc" }],
      });

      console.log(
        `🔍 Get DSF configs - Found ${comptableConfigs.length} comptable configs`
      );

      // Transformer les résultats pour inclure la catégorie
      let transformedConfigs = comptableConfigs.map((config: any) => ({
        ...config,
        category: config.config?.category || "unknown",
      }));

      // Filtrer par catégorie si spécifiée
      if (category) {
        const categoryFilter = String(category).toLowerCase();
        transformedConfigs = transformedConfigs.filter(
          (config: any) => config.category.toLowerCase() === categoryFilter
        );
      }

      // Pour les comptables: si une config ACCOUNTANT existe pour un codeDsf,
      // on masque la config SYSTEM correspondante
      if (userRole === "COMPTABLE") {
        const userConfigCodes = new Set(
          transformedConfigs
            .filter((c: { ownerType: string; ownerId: string | undefined; }) => c.ownerType === "ACCOUNTANT" && c.ownerId === userId)
            .map((c: { codeDsf: any; }) => c.codeDsf)
        );

        transformedConfigs = transformedConfigs.filter((config: { ownerType: string; codeDsf: unknown; }) => {
          if (
            config.ownerType === "SYSTEM" &&
            userConfigCodes.has(config.codeDsf)
          ) {
            // Masquer la config SYSTEM si l'utilisateur a une config personnalisée
            return false;
          }
          return true;
        });
      }

      console.log(
        `✅ Get DSF configs - Final count: ${transformedConfigs.length} configs`
      );

      return ResponseBuilder.success(
        res,
        transformedConfigs,
        "Configurations récupérées avec succès"
      );
    } catch (error) {
      console.error("❌ Error fetching DSF configs:", error);
      return ResponseBuilder.error(
        res,
        "Erreur lors de la récupération des configurations"
      );
    }
  }

  /**
   * Create a new DSF config - VERSION CORRIGÉE
   */
  // RÉPARATION de la méthode createConfig - VERSION FINALE
  async createConfig(req: AuthenticatedRequest, res: Response) {
    try {
      console.log("========== DEBUT CREATE CONFIG ==========");
      console.log("🔍 Raw request body:", JSON.stringify(req.body, null, 2));

      const requestData = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        console.error("❌ ERROR: User ID not found in token");
        return ResponseBuilder.error(res, "Utilisateur non authentifié", 401);
      }

      // Extraction des données
      const {
        category,
        codeDsf,
        libelle,
        operations = [], // ex: ["+20MD", "+30MC"] ou "+20MD,+30MC" — voir DSFComptableConfig.operations
        destinationCell = null,
        clientId = null,
        exerciseId = null,
        ownerType = "SYSTEM",
        isActive = true,
        isLocked = false,
        baseConfigId = null,
      } = requestData;

      console.log("🔍 Parsed fields:", {
        category,
        codeDsf,
        libelle,
        operations,
        destinationCell,
        clientId,
        exerciseId,
        ownerType,
        isActive,
        isLocked,
        baseConfigId,
      });

      // Validation des champs requis
      if (!category || !codeDsf || !libelle) {
        console.error("❌ ERROR: Missing required fields");
        return ResponseBuilder.error(
          res,
          "Champs requis manquants: category, codeDsf, libelle",
          400
        );
      }

      // Nettoyer les données
      const cleanedCodeDsf = String(codeDsf).trim();
      const cleanedLibelle = String(libelle).trim();
      const cleanedCategory = String(category).trim();

      // Déterminer le ownerType final
      let finalOwnerType: "SYSTEM" | "ACCOUNTANT" | "ADMIN";

      if (userRole === "ADMIN") {
        // Admins peuvent créer SYSTEM ou ACCOUNTANT
        finalOwnerType =
          ownerType === "SYSTEM" ||
          ownerType === "ACCOUNTANT" ||
          ownerType === "ADMIN"
            ? ownerType
            : "SYSTEM";
      } else if (userRole === "COMPTABLE") {
        // Comptables créent seulement ACCOUNTANT
        finalOwnerType = "ACCOUNTANT";
      } else {
        // Autres rôles
        finalOwnerType = "SYSTEM";
      }

      console.log("🔍 Final owner type:", finalOwnerType);

      // Déterminer le scope
      let scope: "GLOBAL" | "CLIENT" | "EXERCISE" = "GLOBAL";
      if (exerciseId) {
        scope = "EXERCISE";
      } else if (clientId) {
        scope = "CLIENT";
      }

      // Pour SYSTEM, ignorer clientId et exerciseId
      const finalClientId = finalOwnerType === "SYSTEM" ? null : clientId;
      const finalExerciseId = finalOwnerType === "SYSTEM" ? null : exerciseId;

      // Normaliser les opérations — accepte un tableau ou une chaîne
      // "+20MD,+30MC" (format validé côté front par dsfConfigValidators.ts:
      // chaque op = signe + numéro de compte + source 2 lettres MD/MC/OD/OC/SD/SC).
      const OPERATION_PATTERN = /^[+-]\d+[A-Z]{2}$/;
      let finalOperations: string[] = [];
      try {
        const rawOps = Array.isArray(operations)
          ? operations
          : String(operations || "").split(",");
        finalOperations = rawOps
          .map((op: any) => String(op).trim())
          .filter((op: string) => op.length > 0 && OPERATION_PATTERN.test(op));
      } catch (opError) {
        console.error("❌ Error processing operations:", opError);
        finalOperations = [];
      }

      console.log("✅ Operations processed:", finalOperations);

      // Chercher ou créer la DSFConfig de base
      console.log("🔍 Looking for base config with category:", cleanedCategory);

      let baseConfig = await (prisma as any).DSFConfig.findUnique({
        where: { category: cleanedCategory },
      });

      if (!baseConfig) {
        console.log(
          "📝 Creating new base config for category:",
          cleanedCategory
        );
        baseConfig = await (prisma as any).DSFConfig.create({
          data: {
            category: cleanedCategory,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log("✅ Base config created:", baseConfig.id);
      } else {
        console.log("✅ Base config found:", baseConfig.id);
      }

      // RÉPARATION IMPORTANTE : Vérifier la contrainte unique configId_ownerId
      // Pour SYSTEM, on peut avoir plusieurs configs avec le même ownerId
      // Pour ACCOUNTANT, on vérifie l'unicité

      if (finalOwnerType === "ACCOUNTANT") {
        console.log("🔍 Checking for existing ACCOUNTANT config...");

        const existingWhere: any = {
          configId: baseConfig.id,
          ownerId: userId,
          ownerType: "ACCOUNTANT",
          isActive: true,
        };

        if (finalExerciseId) {
          existingWhere.exerciseId = finalExerciseId;
        } else if (finalClientId) {
          existingWhere.clientId = finalClientId;
        }

        const existingConfig = await (
          prisma as any
        ).DSFComptableConfig.findFirst({
          where: existingWhere,
        });

        if (existingConfig) {
          console.error(
            "❌ Config already exists for this user/scope:",
            existingConfig
          );
          return ResponseBuilder.error(
            res,
            "Une configuration existe déjà pour cet utilisateur dans ce scope",
            400
          );
        }
      }

      // RÉPARATION : Pour les SYSTEM, on doit permettre plusieurs configs
      // Donc on ne vérifie pas l'existence pour SYSTEM

      // Préparer les données pour la création
      const comptableConfigData: any = {
        configId: baseConfig.id,
        ownerId: userId,
        ownerType: finalOwnerType,
        codeDsf: cleanedCodeDsf,
        libelle: cleanedLibelle,
        operations: finalOperations,
        destinationCell: destinationCell ? String(destinationCell).trim() : null,
        scope,
        isActive,
        isLocked: finalOwnerType === "SYSTEM" ? true : isLocked,
        isModified: finalOwnerType === "ACCOUNTANT" ? true : false,
        baseConfigId: baseConfigId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Ajouter clientId/exerciseId seulement si pas SYSTEM
      if (finalOwnerType !== "SYSTEM") {
        if (finalClientId) comptableConfigData.clientId = finalClientId;
        if (finalExerciseId) comptableConfigData.exerciseId = finalExerciseId;
      }

      console.log(
        "🔍 Creating comptable config with data:",
        JSON.stringify(comptableConfigData, null, 2)
      );

      // Créer la configuration
      const comptableConfig = await (prisma as any).DSFComptableConfig.create({
        data: comptableConfigData,
      });

      console.log(
        "✅ Comptable config created successfully:",
        comptableConfig.id
      );

      // Log audit event
      await auditService.logDSFConfigCreated(
        userId,
        {
          category: baseConfig.category,
          codeDsf: cleanedCodeDsf,
          libelle: cleanedLibelle,
          operations: finalOperations,
          destinationCell: comptableConfigData.destinationCell,
          scope,
          ownerType: finalOwnerType,
          clientId: finalClientId,
          exerciseId: finalExerciseId,
        },
        comptableConfig.id
      );

      console.log("========== FIN CREATE CONFIG ==========");

      return ResponseBuilder.success(
        res,
        {
          ...comptableConfig,
          category: baseConfig.category,
        },
        "Configuration créée avec succès"
      );
    } catch (error: any) {
      console.error("========== GLOBAL ERROR IN CREATE CONFIG ==========");
      console.error("❌ ERROR TYPE:", typeof error);
      console.error("❌ ERROR NAME:", error?.name);
      console.error("❌ ERROR MESSAGE:", error?.message);
      console.error("❌ ERROR STACK:", error?.stack);

      // Gestion spécifique des erreurs Prisma
      if (error?.code === "P2002") {
        const target = error?.meta?.target || [];
        console.error("❌ Unique constraint violation on:", target);

        if (target.includes("codeDsf")) {
          return ResponseBuilder.error(
            res,
            "Une configuration existe déjà avec ce code DSF",
            400
          );
        }
        if (target.includes("configId_ownerId")) {
          return ResponseBuilder.error(
            res,
            "Une configuration existe déjà pour cette catégorie et cet utilisateur",
            400
          );
        }
      }

      if (error?.code === "P2003") {
        return ResponseBuilder.error(
          res,
          "Référence invalide (clientId ou exerciseId non trouvé)",
          400
        );
      }

      return ResponseBuilder.error(
        res,
        error?.message || "Erreur lors de la création de la configuration"
      );
    }
  }

  /**
   * Update a DSF config - VERSION CORRIGÉE
   */
  async updateConfig(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      console.log("🔍 Update DSF config - ID:", id);
      console.log("🔍 Update DSF config - Updates:", updates);
      console.log("🔍 Update DSF config - User:", userId, userRole);

      // Trouver la configuration existante pour audit
      const existingConfig = await (
        prisma as any
      ).DSFComptableConfig.findUnique({
        where: { id },
        include: { config: true },
      });

      if (!existingConfig) {
        return ResponseBuilder.error(res, "Configuration non trouvée", 404);
      }

      // Vérification des permissions
      if (existingConfig.ownerType === "SYSTEM" && userRole !== "ADMIN") {
        return ResponseBuilder.error(
          res,
          "Seuls les administrateurs peuvent modifier les configurations système",
          403
        );
      }

      if (
        existingConfig.ownerType === "ACCOUNTANT" &&
        existingConfig.ownerId !== userId &&
        userRole !== "ADMIN"
      ) {
        return ResponseBuilder.error(
          res,
          "Vous ne pouvez modifier que vos propres configurations",
          403
        );
      }

      // Préparer les données de mise à jour
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Traiter les opérations si fournies — format "+20MD"/"-30MC" (signe +
      // numéro de compte + source 2 lettres), validé côté front par
      // dsfConfigValidators.ts.
      if (updates.operations !== undefined) {
        const OPERATION_PATTERN = /^[+-]\d+[A-Z]{2}$/;
        const rawOps = Array.isArray(updates.operations)
          ? updates.operations
          : String(updates.operations || "").split(",");
        updateData.operations = rawOps
          .map((op: string) => String(op).trim())
          .filter((op: string) => op.length > 0 && OPERATION_PATTERN.test(op));
      }

      // Autres champs pouvant être mis à jour
      const allowedFields = [
        "libelle",
        "destinationCell",
        "isActive",
        "isLocked",
        "isModified",
      ];

      allowedFields.forEach((field) => {
        if (updates[field] !== undefined) {
          updateData[field] = updates[field];
        }
      });

      // Pour les comptables, marquer comme modifié si des opérations changent
      if (
        existingConfig.ownerType === "ACCOUNTANT" &&
        updates.operations !== undefined
      ) {
        updateData.isModified = true;
      }

      // Mettre à jour la configuration
      const updatedConfig = await (prisma as any).DSFComptableConfig.update({
        where: { id },
        data: updateData,
        include: { config: true },
      });

      console.log("✅ Update DSF config - Successfully updated:", id);
 
      if(!userId){
        console.log("Action aborted: No authentication information available for audit logging.");
        return;
      }
      // Log audit event
      await auditService.logDSFConfigUpdated(
        userId , 
        id,
        existingConfig,
        updatedConfig
      );

      return ResponseBuilder.success(
        res,
        {
          ...updatedConfig,
          category: updatedConfig.config.category,
        },
        "Configuration mise à jour avec succès"
      );
    } catch (error: any) {
      console.error("❌ Error updating DSF config:", error);
      return ResponseBuilder.error(
        res,
        "Erreur lors de la mise à jour de la configuration"
      );
    }
  }

  /**
   * Delete a DSF config - VERSION CORRIGÉE
   */
  async deleteConfig(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      console.log("🔍 Delete DSF config - ID:", id);

      // Trouver la configuration
      const config = await (prisma as any).DSFComptableConfig.findUnique({
        where: { id },
      });

      if (!config) {
        return ResponseBuilder.error(res, "Configuration non trouvée", 404);
      }

      // Vérification des permissions
      if (config.ownerType === "SYSTEM" && userRole !== "ADMIN") {
        return ResponseBuilder.error(
          res,
          "Seuls les administrateurs peuvent supprimer les configurations système",
          403
        );
      }

      if (
        config.ownerType === "ACCOUNTANT" &&
        config.ownerId !== userId &&
        userRole !== "ADMIN"
      ) {
        return ResponseBuilder.error(
          res,
          "Vous ne pouvez supprimer que vos propres configurations",
          403
        );
      }

      // Désactiver la configuration au lieu de la supprimer
      await (prisma as any).DSFComptableConfig.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      console.log("✅ Delete DSF config - Successfully deactivated:", id);

      // Log audit event (soft delete)
      if (userId) {
        await auditService.logDSFConfigUpdated(userId, id, config, {
          ...config,
          isActive: false,
          updatedAt: new Date(),
        });
      }

      return ResponseBuilder.success(
        res,
        null,
        "Configuration supprimée avec succès"
      );
    } catch (error) {
      console.error("❌ Error deleting DSF config:", error);
      return ResponseBuilder.error(
        res,
        "Erreur lors de la suppression de la configuration"
      );
    }
  }

  /**
   * Get configs by folder ID - VERSION CORRIGÉE
   */
  async getConfigsByFolder(req: AuthenticatedRequest, res: Response) {
    try {
      const { folderId } = req.params;
      const { category } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      console.log("🔍 Get configs by folder - Params:", {
        folderId,
        category,
        userId,
        userRole,
      });

      // Valider le folderId
      if (!folderId) {
        return ResponseBuilder.error(res, "Folder ID requis", 400);
      }

      // Vérifier l'accès au dossier
      const hasAccess = await this.checkFolderAccess(
        folderId,
        userId!,
        userRole!
      );
      if (!hasAccess) {
        return ResponseBuilder.error(
          res,
          "Accès non autorisé à ce dossier",
          403
        );
      }

      // Construire la clause WHERE
      const whereClause: any = {
        isActive: true,
      };

      // Logique de permission selon le rôle
      if (userRole === "COMPTABLE") {
        // Comptables: SYSTEM + leurs propres ACCOUNTANT pour ce dossier
        whereClause.OR = [
          { ownerType: "SYSTEM" },
          {
            ownerType: "ACCOUNTANT",
            ownerId: userId,
            exerciseId: folderId,
          },
        ];
      } else if (userRole === "ADMIN") {
        // Admins: tout, mais pour ACCOUNTANT on filtre par dossier
        whereClause.OR = [
          { ownerType: "SYSTEM" },
          {
            ownerType: { in: ["ACCOUNTANT", "ADMIN"] },
            exerciseId: folderId,
          },
        ];
      } else {
        // Autres: seulement SYSTEM
        whereClause.ownerType = "SYSTEM";
      }

      // Récupérer les configurations
      const configs = await (prisma as any).DSFComptableConfig.findMany({
        where: whereClause,
        include: {
          config: true,
        },
        orderBy: [{ ownerType: "asc" }, { codeDsf: "asc" }],
      });

      // Transformer et filtrer par catégorie
      let transformedConfigs = configs.map((config: any) => ({
        ...config,
        category: config.config?.category || "unknown",
      }));

      if (category) {
        const categoryFilter = String(category).toLowerCase();
        transformedConfigs = transformedConfigs.filter(
          (config: any) => config.category.toLowerCase() === categoryFilter
        );
      }

      console.log(
        `✅ Get configs by folder - Found ${transformedConfigs.length} configs`
      );

      return ResponseBuilder.success(
        res,
        transformedConfigs,
        "Configurations du dossier récupérées avec succès"
      );
    } catch (error) {
      console.error("❌ Error getting configs by folder:", error);
      return ResponseBuilder.error(
        res,
        "Erreur lors de la récupération des configurations du dossier"
      );
    }
  }

  /**
   * Get user configs
   */
  async getUserConfigs(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId: targetUserId } = req.params;
      const { category } = req.query;
      const authUserId = req.user?.userId;
      const userRole = req.user?.role;

      console.log("🔍 Get user configs - Params:", {
        targetUserId,
        category,
        authUserId,
        userRole,
      });

      // Vérification des permissions
      const canView = targetUserId === authUserId || userRole === "ADMIN";
      if (!canView) {
        return ResponseBuilder.error(res, "Accès non autorisé", 403);
      }

      const whereClause: any = {
        isActive: true,
        ownerId: targetUserId,
        ownerType: "ACCOUNTANT",
      };

      const configs = await (prisma as any).DSFComptableConfig.findMany({
        where: whereClause,
        include: {
          config: true,
        },
      });

      // Transformer et filtrer par catégorie
      let transformedConfigs = configs.map((config: any) => ({
        ...config,
        category: config.config?.category || "unknown",
      }));

      if (category) {
        const categoryFilter = String(category).toLowerCase();
        transformedConfigs = transformedConfigs.filter(
          (config: any) => config.category.toLowerCase() === categoryFilter
        );
      }

      console.log(
        `✅ Get user configs - Found ${transformedConfigs.length} configs`
      );

      return ResponseBuilder.success(
        res,
        transformedConfigs,
        "Configurations utilisateur récupérées avec succès"
      );
    } catch (error) {
      console.error("❌ Error getting user configs:", error);
      return ResponseBuilder.error(
        res,
        "Erreur lors de la récupération des configurations utilisateur"
      );
    }
  }

  /**
   * Create default configs with scope
   */
  /**
   * Seed/rafraîchit les configs SYSTEM (portée GLOBAL) depuis le moteur de
   * mapping statique (ACCOUNT_MAPPING, account-mapping.data.ts) : une
   * DSFComptableConfig par ligne de mapping, pour que "Mapping comptable"
   * affiche les formules par défaut réelles de chaque note au lieu de rien.
   * Idempotent (upsert sur la contrainte unique) — relancer ne duplique pas
   * et met à jour le libellé/les opérations si le fichier statique a changé.
   * `clientId`/`folderId` du body sont ignorés ici : les défauts sont
   * globaux par nature (ce sont ceux du moteur statique, pas une surcharge
   * par client — celles-ci se créent via createConfig avec ownerType
   * ACCOUNTANT).
   */
  async createDefaultConfigs(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      // Seuls les admins peuvent créer des configs par défaut
      if (userRole !== "ADMIN") {
        return ResponseBuilder.error(
          res,
          "Seuls les administrateurs peuvent créer des configurations par défaut",
          403
        );
      }
      if (!userId) {
        return ResponseBuilder.error(res, "Utilisateur non authentifié", 401);
      }

      let categoriesSeeded = 0;
      let linesUpserted = 0;

      for (const noteCode of getAllMappingNoteCodes()) {
        const lines = getMappingLines(noteCode);
        if (lines.length === 0) continue;

        const category = noteCodeToCategory(noteCode);
        const dsfConfig = await (prisma as any).DSFConfig.upsert({
          where: { category },
          update: {},
          create: { category },
        });
        categoriesSeeded++;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const codeDsf = `${noteCode}.${i}`;
          const operations = mappingLineToOperations(line);

          // Prisma (5.22) refuse `null` dans un sélecteur `where` de clé
          // composite pour upsert ("Argument clientId must not be null") —
          // findFirst + create/update séparés contourne la limite, `null`
          // y est parfaitement supporté.
          const existing = await (prisma as any).DSFComptableConfig.findFirst({
            where: {
              configId: dsfConfig.id,
              ownerId: userId,
              ownerType: "SYSTEM",
              codeDsf,
              scope: "GLOBAL",
              clientId: null,
              exerciseId: null,
            },
            select: { id: true },
          });

          if (existing) {
            await (prisma as any).DSFComptableConfig.update({
              where: { id: existing.id },
              data: { libelle: line.label, operations },
            });
          } else {
            await (prisma as any).DSFComptableConfig.create({
              data: {
                configId: dsfConfig.id,
                ownerId: userId,
                ownerType: "SYSTEM",
                codeDsf,
                libelle: line.label,
                operations,
                destinationCell: null,
                scope: "GLOBAL",
                clientId: null,
                exerciseId: null,
                isActive: true,
                isLocked: true,
              },
            });
          }
          linesUpserted++;
        }
      }

      await auditService.logAction({
        userId,
        action: AuditAction.DSF_CONFIG_CREATED,
        entityType: EntityType.DSF_CONFIG,
        description: `Seed des mappings par défaut: ${categoriesSeeded} catégorie(s), ${linesUpserted} ligne(s)`,
        newValue: { categoriesSeeded, linesUpserted },
      });

      return ResponseBuilder.success(
        res,
        { categoriesSeeded, linesUpserted },
        `Mappings par défaut créés/mis à jour pour ${categoriesSeeded} catégorie(s), ${linesUpserted} ligne(s).`
      );
    } catch (error) {
      console.error("❌ Error creating default configs:", error);
      return ResponseBuilder.error(
        res,
        "Erreur lors de la création des configurations par défaut"
      );
    }
  }

  /**
   * Reset all configs with scope
   */
  async resetAllConfigs(req: AuthenticatedRequest, res: Response) {
    try {
      const { scope, clientId, folderId } = req.body;
      const userRole = req.user?.role;

      console.log("🔍 Reset all configs - Params:", {
        scope,
        clientId,
        folderId,
        userRole,
      });

      // Seuls les admins peuvent réinitialiser
      if (userRole !== "ADMIN") {
        return ResponseBuilder.error(
          res,
          "Seuls les administrateurs peuvent réinitialiser les configurations",
          403
        );
      }

      if (!scope) {
        return ResponseBuilder.error(res, "Scope requis", 400);
      }

      // Logique simplifiée
      return ResponseBuilder.success(
        res,
        { success: true, message: "Fonctionnalité à implémenter" },
        "Réinitialisation des configurations à implémenter"
      );
    } catch (error) {
      console.error("❌ Error resetting all configs:", error);
      return ResponseBuilder.error(
        res,
        "Erreur lors de la réinitialisation des configurations"
      );
    }
  }

  /**
   * Duplicate a config - VERSION CORRIGÉE
   */
  async duplicateConfig(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const authUserId = req.user?.userId;
      const userRole = req.user?.role;

      console.log("🔍 Duplicate config - ID:", id);

      // Seuls les admins peuvent dupliquer
      if (userRole !== "ADMIN") {
        return ResponseBuilder.error(
          res,
          "Seuls les administrateurs peuvent dupliquer des configurations",
          403
        );
      }

      // Trouver la config source
      const sourceConfig = await (prisma as any).DSFComptableConfig.findUnique({
        where: { id },
        include: { config: true },
      });

      if (!sourceConfig) {
        return ResponseBuilder.error(
          res,
          "Configuration source non trouvée",
          404
        );
      }

      // Créer la copie
      const duplicate = await (prisma as any).DSFComptableConfig.create({
        data: {
          configId: sourceConfig.configId,
          ownerId: authUserId,
          ownerType: "ACCOUNTANT", // Les copies sont toujours ACCOUNTANT
          codeDsf: `${sourceConfig.codeDsf}_COPY_${Date.now()}`,
          libelle: `${sourceConfig.libelle} (Copie)`,
          operations: sourceConfig.operations,
          destinationCell: sourceConfig.destinationCell,
          scope: sourceConfig.scope,
          clientId: sourceConfig.clientId,
          exerciseId: sourceConfig.exerciseId,
          isActive: true,
          isLocked: false,
          isModified: true,
          baseConfigId: sourceConfig.id,
        },
      });

      console.log("✅ Duplicate config - Successfully created:", duplicate.id);

      return ResponseBuilder.success(
        res,
        { ...duplicate, category: sourceConfig.config?.category },
        "Configuration dupliquée avec succès"
      );
    } catch (error) {
      console.error("❌ Error duplicating config:", error);
      return ResponseBuilder.error(
        res,
        "Erreur lors de la duplication de la configuration"
      );
    }
  }

  /**
   * Helper function to check folder access
   */
  private async checkFolderAccess(
    folderId: string,
    userId: string,
    userRole: string
  ): Promise<boolean> {
    try {
      if (userRole === "ADMIN") {
        return true; // Admins ont accès à tout
      }

      // Vérifier si l'utilisateur est propriétaire
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { ownerId: true },
      });

      if (folder && folder.ownerId === userId) {
        return true;
      }

      // Vérifier si l'utilisateur est assigné à ce dossier
      const assignment = await prisma.folderAssignment.findUnique({
        where: {
          folderId_userId: {
            folderId,
            userId,
          },
        },
      });

      return !!assignment;
    } catch (error) {
      console.error("Error checking folder access:", error);
      return false;
    }
  }
}

export const dsfConfigController = new DSFConfigController();
