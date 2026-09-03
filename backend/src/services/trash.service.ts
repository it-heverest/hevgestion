// src/services/trash.service.ts
//
// Corbeille applicative: aucune suppression n'est définitive.
//
// Principe: la ligne quitte la table vivante (ce qui préserve les contraintes
// d'unicité et l'intégrité référentielle), mais une copie intégrale de
// l'enregistrement et de ses enfants est conservée dans `deleted_records`.
// L'élément disparaît donc des vues des utilisateurs, tout en restant
// consultable et restaurable par un administrateur.
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { BadRequestError, NotFoundError } from "../lib/errors";

export type TrashEntityType =
  | "Client"
  | "Folder"
  | "Balance"
  | "DSF"
  | "DSFImport"
  | "RevueFiscalCompany"
  // Contenu d'une note DSF effacé individuellement. Contrairement aux autres
  // types, la ligne DSF n'est pas supprimée: seul le champ JSON est vidé.
  // L'archivage est écrit directement par notes.service.
  | "DSFNote";

export interface TrashListFilters {
  entityType?: TrashEntityType;
  clientId?: string;
  folderId?: string;
  /** false = éléments encore en corbeille (défaut), true = déjà restaurés */
  restored?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

/** Ordre de restauration: un parent doit exister avant ses enfants. */
const RESTORE_DEPENDENCIES: Record<TrashEntityType, { model: string; field: string } | null> = {
  Client: null,
  Folder: { model: "client", field: "clientId" },
  Balance: { model: "folder", field: "folderId" },
  DSF: { model: "folder", field: "folderId" },
  DSFImport: { model: "folder", field: "folderId" },
  RevueFiscalCompany: null,
  DSFNote: null,
};

export class TrashService {
  // ─── SUPPRESSION ──────────────────────────────────────────────────────────

  /**
   * Archive un enregistrement dans la corbeille puis le retire de la table
   * vivante. Les deux opérations sont dans une transaction: on ne peut pas
   * perdre la donnée sans que la copie ait été écrite.
   */
  async archiveAndDelete(
    entityType: TrashEntityType,
    entityId: string,
    deletedById: string,
    reason?: string
  ): Promise<{ recordId: string; label: string }> {
    const snapshot = await this.buildSnapshot(entityType, entityId);

    return prisma.$transaction(async (tx) => {
      const record = await tx.deletedRecord.create({
        data: {
          entityType,
          entityId,
          label: snapshot.label,
          payload: snapshot.payload as Prisma.InputJsonValue,
          clientId: snapshot.clientId,
          folderId: snapshot.folderId,
          deletedById,
          reason: reason || null,
        },
      });

      await this.deleteLive(tx, entityType, entityId);

      return { recordId: record.id, label: snapshot.label };
    });
  }

  /**
   * Construit la copie complète de l'enregistrement, enfants compris.
   * Ce qui n'est pas capturé ici ne pourra pas être restauré.
   */
  private async buildSnapshot(
    entityType: TrashEntityType,
    entityId: string
  ): Promise<{ label: string; payload: any; clientId?: string; folderId?: string }> {
    switch (entityType) {
      case "Client": {
        const client = await prisma.client.findUnique({ where: { id: entityId } });
        if (!client) throw new NotFoundError("Client introuvable");
        return { label: client.name, payload: { client }, clientId: client.id };
      }

      case "Folder": {
        const folder = await prisma.folder.findUnique({
          where: { id: entityId },
          include: { assignments: true },
        });
        if (!folder) throw new NotFoundError("Dossier introuvable");
        const { assignments, ...rest } = folder as any;
        return {
          label: `${folder.name} (exercice ${folder.fiscalYear})`,
          payload: { folder: rest, assignments },
          clientId: folder.clientId,
          folderId: folder.id,
        };
      }

      case "Balance": {
        const balance = await prisma.balance.findUnique({
          where: { id: entityId },
          include: {
            equilibrium: true,
            accountIssues: true,
            fixedAssets: true,
            ventilationLogs: true,
            folder: { select: { clientId: true } },
          },
        });
        if (!balance) throw new NotFoundError("Balance introuvable");
        const {
          equilibrium,
          accountIssues,
          fixedAssets,
          ventilationLogs,
          folder,
          ...rest
        } = balance as any;
        return {
          label: `Balance ${balance.type} — ${balance.fileName}`,
          payload: { balance: rest, equilibrium, accountIssues, fixedAssets, ventilationLogs },
          clientId: folder?.clientId,
          folderId: balance.folderId,
        };
      }

      case "DSF": {
        const dsf = await prisma.dSF.findUnique({
          where: { id: entityId },
          include: {
            coherenceControl: true,
            folder: { select: { clientId: true, name: true, fiscalYear: true } },
          },
        });
        if (!dsf) throw new NotFoundError("DSF introuvable");
        const { coherenceControl, folder, ...rest } = dsf as any;
        return {
          label: `DSF ${folder?.name ?? ""} (exercice ${folder?.fiscalYear ?? "?"})`.trim(),
          payload: { dsf: rest, coherenceControl },
          clientId: folder?.clientId,
          folderId: dsf.folderId,
        };
      }

      case "DSFImport": {
        const dsfImport = await prisma.dSFImport.findUnique({
          where: { id: entityId },
        });
        if (!dsfImport) throw new NotFoundError("Import DSF introuvable");
        return {
          label: `Import DSF ${dsfImport.fileName} (exercice ${dsfImport.exerciseYear})`,
          payload: { dsfImport },
          clientId: dsfImport.clientId,
          folderId: dsfImport.folderId,
        };
      }

      case "RevueFiscalCompany": {
        const company = await prisma.revueFiscalCompany.findUnique({
          where: { id: entityId },
        });
        if (!company) throw new NotFoundError("Société de revue fiscale introuvable");
        return { label: (company as any).name ?? entityId, payload: { company } };
      }

      default:
        throw new BadRequestError(`Type d'entité non géré: ${entityType}`);
    }
  }

  /** Retire l'enregistrement (et ses enfants) des tables vivantes. */
  private async deleteLive(
    tx: Prisma.TransactionClient,
    entityType: TrashEntityType,
    entityId: string
  ): Promise<void> {
    switch (entityType) {
      case "Client":
        await tx.client.delete({ where: { id: entityId } });
        break;

      case "Folder":
        await tx.folderAssignment.deleteMany({ where: { folderId: entityId } });
        await tx.folder.delete({ where: { id: entityId } });
        break;

      case "Balance":
        await tx.ventilationLog.deleteMany({ where: { balanceId: entityId } });
        await tx.accountIssue.deleteMany({ where: { balanceId: entityId } });
        await tx.fixedAsset.deleteMany({ where: { balanceId: entityId } });
        await tx.balanceEquilibrium.deleteMany({ where: { balanceId: entityId } });
        await tx.balance.delete({ where: { id: entityId } });
        break;

      case "DSF":
        await tx.dSF.delete({ where: { id: entityId } });
        break;

      case "DSFImport":
        await tx.dSFImport.delete({ where: { id: entityId } });
        break;

      case "RevueFiscalCompany":
        await tx.revueFiscalCompany.delete({ where: { id: entityId } });
        break;
    }
  }

  // ─── CONSULTATION ─────────────────────────────────────────────────────────

  async list(filters: TrashListFilters = {}) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 25));

    const where: Prisma.DeletedRecordWhereInput = {
      restoredAt: filters.restored ? { not: null } : null,
      ...(filters.entityType ? { entityType: filters.entityType } : {}),
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
      ...(filters.folderId ? { folderId: filters.folderId } : {}),
      ...(filters.search
        ? { label: { contains: filters.search, mode: "insensitive" as const } }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.deletedRecord.findMany({
        where,
        include: {
          deletedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          restoredBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { deletedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.deletedRecord.count({ where }),
    ]);

    // Le payload complet est volumineux (une DSF contient toutes ses notes):
    // il n'est renvoyé que sur consultation unitaire.
    return {
      items: items.map(({ payload, ...rest }) => rest),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getById(recordId: string) {
    const record = await prisma.deletedRecord.findUnique({
      where: { id: recordId },
      include: {
        deletedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        restoredBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!record) throw new NotFoundError("Élément de corbeille introuvable");
    return record;
  }

  async getStats() {
    const grouped = await prisma.deletedRecord.groupBy({
      by: ["entityType"],
      where: { restoredAt: null },
      _count: { _all: true },
    });

    const restoredCount = await prisma.deletedRecord.count({
      where: { restoredAt: { not: null } },
    });

    return {
      pending: grouped.reduce((acc, g) => {
        acc[g.entityType] = g._count._all;
        return acc;
      }, {} as Record<string, number>),
      pendingTotal: grouped.reduce((t, g) => t + g._count._all, 0),
      restoredTotal: restoredCount,
    };
  }

  // ─── RESTAURATION ─────────────────────────────────────────────────────────

  /**
   * Réinsère l'enregistrement archivé dans les tables vivantes.
   * Échoue explicitement (plutôt que silencieusement) si l'élément parent
   * n'existe plus ou si l'identifiant a été réutilisé entre-temps.
   */
  async restore(recordId: string, restoredById: string): Promise<{ entityType: string; entityId: string }> {
    const record = await prisma.deletedRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundError("Élément de corbeille introuvable");
    if (record.restoredAt) {
      throw new BadRequestError("Cet élément a déjà été restauré");
    }

    const entityType = record.entityType as TrashEntityType;
    const payload = record.payload as any;

    await this.assertRestorable(entityType, record.entityId, payload);

    await prisma.$transaction(async (tx) => {
      await this.insertLive(tx, entityType, payload);
      await tx.deletedRecord.update({
        where: { id: recordId },
        data: { restoredAt: new Date(), restoredById },
      });
    });

    return { entityType, entityId: record.entityId };
  }

  /** Vérifie qu'aucun conflit n'empêche la réinsertion. */
  private async assertRestorable(
    entityType: TrashEntityType,
    entityId: string,
    payload: any
  ): Promise<void> {
    // Une note DSF se réinjecte dans une ligne existante: la seule condition
    // est que la DSF porteuse existe toujours.
    if (entityType === "DSFNote") {
      const dsf = await prisma.dSF.findUnique({ where: { id: payload.dsfId } });
      if (!dsf) {
        throw new BadRequestError(
          "La DSF qui portait cette note a été supprimée: restaurez-la d'abord"
        );
      }
      return;
    }

    // 1. L'identifiant ne doit pas avoir été réutilisé.
    const existing = await this.findLiveById(entityType, entityId);
    if (existing) {
      throw new BadRequestError(
        "Un enregistrement portant le même identifiant existe déjà: restauration impossible"
      );
    }

    // 2. Le parent doit toujours exister.
    const dep = RESTORE_DEPENDENCIES[entityType];
    if (dep) {
      const root = this.rootOf(entityType, payload);
      const parentId = root?.[dep.field];
      if (parentId) {
        const parent = await (prisma as any)[dep.model].findUnique({
          where: { id: parentId },
        });
        if (!parent) {
          throw new BadRequestError(
            `L'élément parent (${dep.model}) a lui aussi été supprimé: restaurez-le d'abord`
          );
        }
      }
    }

    // 3. Une DSF est en relation 1-1 avec son dossier: la place doit être libre.
    if (entityType === "DSF") {
      const root = this.rootOf(entityType, payload);
      const occupied = await prisma.dSF.findUnique({
        where: { folderId: root.folderId },
      });
      if (occupied) {
        throw new BadRequestError(
          "Une DSF a été régénérée pour ce dossier depuis la suppression: supprimez-la avant de restaurer celle-ci"
        );
      }
    }
  }

  private rootOf(entityType: TrashEntityType, payload: any): any {
    switch (entityType) {
      case "Client":
        return payload.client;
      case "Folder":
        return payload.folder;
      case "Balance":
        return payload.balance;
      case "DSF":
        return payload.dsf;
      case "DSFImport":
        return payload.dsfImport;
      case "RevueFiscalCompany":
        return payload.company;
      case "DSFNote":
        return payload;
    }
  }

  private async findLiveById(entityType: TrashEntityType, id: string) {
    switch (entityType) {
      case "Client":
        return prisma.client.findUnique({ where: { id } });
      case "Folder":
        return prisma.folder.findUnique({ where: { id } });
      case "Balance":
        return prisma.balance.findUnique({ where: { id } });
      case "DSF":
        return prisma.dSF.findUnique({ where: { id } });
      case "DSFImport":
        return prisma.dSFImport.findUnique({ where: { id } });
      case "RevueFiscalCompany":
        return prisma.revueFiscalCompany.findUnique({ where: { id } });
      case "DSFNote":
        return null; // pas de ligne dédiée: géré par assertRestorable
    }
  }

  private async insertLive(
    tx: Prisma.TransactionClient,
    entityType: TrashEntityType,
    payload: any
  ): Promise<void> {
    switch (entityType) {
      case "Client":
        await tx.client.create({ data: payload.client });
        break;

      case "Folder":
        await tx.folder.create({ data: payload.folder });
        if (payload.assignments?.length) {
          await tx.folderAssignment.createMany({
            data: payload.assignments,
            skipDuplicates: true,
          });
        }
        break;

      case "Balance":
        await tx.balance.create({ data: payload.balance });
        if (payload.equilibrium) {
          await tx.balanceEquilibrium.create({ data: payload.equilibrium });
        }
        if (payload.accountIssues?.length) {
          await tx.accountIssue.createMany({ data: payload.accountIssues });
        }
        if (payload.fixedAssets?.length) {
          await tx.fixedAsset.createMany({ data: payload.fixedAssets });
        }
        if (payload.ventilationLogs?.length) {
          await tx.ventilationLog.createMany({ data: payload.ventilationLogs });
        }
        break;

      case "DSF":
        await tx.dSF.create({ data: payload.dsf });
        if (payload.coherenceControl) {
          await tx.coherenceControl.create({ data: payload.coherenceControl });
        }
        break;

      case "DSFImport":
        await tx.dSFImport.create({ data: payload.dsfImport });
        break;

      case "RevueFiscalCompany":
        await tx.revueFiscalCompany.create({ data: payload.company });
        break;

      case "DSFNote":
        // Réinjection du contenu dans le champ JSON d'origine.
        await tx.dSF.update({
          where: { id: payload.dsfId },
          data: { [payload.fieldName]: payload.content },
        });
        break;
    }
  }
}

export const trashService = new TrashService();
