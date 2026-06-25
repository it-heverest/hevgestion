// src/controllers/ventilation-config.controller.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { BadRequestError, NotFoundError, ForbiddenError } from "../lib/errors";
import { auditService } from "../services/audit.service";

interface SubAccountInput {
  accountNumber: string;
  accountName: string;
}

export class VentilationConfigController {
  async getConfigs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { clientId } = req.query as { clientId: string };
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      await this.checkClientAccess(clientId, userId, userRole);

      const configs = await prisma.ventilationConfig.findMany({
        where: { clientId },
        include: {
          subAccounts: { orderBy: { order: "asc" } },
        },
        orderBy: { mainAccountNumber: "asc" },
      });

      res.json({ configs });
    } catch (error) {
      next(error);
    }
  }

  async createConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { clientId, mainAccountNumber, mainAccountName, subAccounts } =
        req.body as {
          clientId: string;
          mainAccountNumber: string;
          mainAccountName: string;
          subAccounts: SubAccountInput[];
        };

      await this.checkClientAccess(clientId, userId, userRole);

      const duplicateAccountNumbers = this.findDuplicates(
        subAccounts.map((s) => s.accountNumber)
      );
      if (duplicateAccountNumbers.length > 0) {
        throw new BadRequestError(
          `Numéros de sous-compte en double: ${duplicateAccountNumbers.join(", ")}`
        );
      }

      const existing = await prisma.ventilationConfig.findUnique({
        where: { clientId_mainAccountNumber: { clientId, mainAccountNumber } },
      });
      if (existing) {
        throw new BadRequestError(
          `Une configuration existe déjà pour le compte ${mainAccountNumber}`
        );
      }

      const config = await prisma.ventilationConfig.create({
        data: {
          clientId,
          mainAccountNumber,
          mainAccountName,
          createdBy: userId,
          subAccounts: {
            create: subAccounts.map((sub, index) => ({
              accountNumber: sub.accountNumber,
              accountName: sub.accountName,
              order: index,
            })),
          },
        },
        include: { subAccounts: { orderBy: { order: "asc" } } },
      });

      await auditService.logUserAction(
        userId,
        "VENTILATION_CONFIG_CREATED",
        `Configuration de ventilation créée pour le compte ${mainAccountNumber}`,
        { clientId, configId: config.id }
      );

      res.status(201).json({
        message: "Configuration de ventilation créée avec succès",
        config,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { mainAccountNumber, mainAccountName, subAccounts } =
        req.body as {
          mainAccountNumber?: string;
          mainAccountName?: string;
          subAccounts?: SubAccountInput[];
        };

      const existing = await prisma.ventilationConfig.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundError("Configuration de ventilation introuvable");
      }

      await this.checkClientAccess(existing.clientId, userId, userRole);

      if (subAccounts) {
        const duplicateAccountNumbers = this.findDuplicates(
          subAccounts.map((s) => s.accountNumber)
        );
        if (duplicateAccountNumbers.length > 0) {
          throw new BadRequestError(
            `Numéros de sous-compte en double: ${duplicateAccountNumbers.join(", ")}`
          );
        }
      }

      if (
        mainAccountNumber &&
        mainAccountNumber !== existing.mainAccountNumber
      ) {
        const duplicate = await prisma.ventilationConfig.findUnique({
          where: {
            clientId_mainAccountNumber: {
              clientId: existing.clientId,
              mainAccountNumber,
            },
          },
        });
        if (duplicate) {
          throw new BadRequestError(
            `Une configuration existe déjà pour le compte ${mainAccountNumber}`
          );
        }
      }

      const config = await prisma.$transaction(async (tx) => {
        if (subAccounts) {
          await tx.ventilationSubAccount.deleteMany({
            where: { configId: id },
          });
        }

        return tx.ventilationConfig.update({
          where: { id },
          data: {
            mainAccountNumber,
            mainAccountName,
            ...(subAccounts
              ? {
                  subAccounts: {
                    create: subAccounts.map((sub, index) => ({
                      accountNumber: sub.accountNumber,
                      accountName: sub.accountName,
                      order: index,
                    })),
                  },
                }
              : {}),
          },
          include: { subAccounts: { orderBy: { order: "asc" } } },
        });
      });

      await auditService.logUserAction(
        userId,
        "VENTILATION_CONFIG_UPDATED",
        `Configuration de ventilation mise à jour pour le compte ${config.mainAccountNumber}`,
        { clientId: existing.clientId, configId: id }
      );

      res.json({
        message: "Configuration de ventilation mise à jour avec succès",
        config,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const existing = await prisma.ventilationConfig.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundError("Configuration de ventilation introuvable");
      }

      await this.checkClientAccess(existing.clientId, userId, userRole);

      await prisma.ventilationConfig.delete({ where: { id } });

      await auditService.logUserAction(
        userId,
        "VENTILATION_CONFIG_DELETED",
        `Configuration de ventilation supprimée pour le compte ${existing.mainAccountNumber}`,
        { clientId: existing.clientId, configId: id }
      );

      res.json({ message: "Configuration de ventilation supprimée avec succès" });
    } catch (error) {
      next(error);
    }
  }

  private findDuplicates(values: string[]): string[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const value of values) {
      if (seen.has(value)) duplicates.add(value);
      seen.add(value);
    }
    return Array.from(duplicates);
  }

  private async checkClientAccess(
    clientId: string,
    userId: string,
    userRole: string
  ) {
    const client = await prisma.client.findUnique({ where: { id: clientId } });

    if (!client) {
      throw new NotFoundError("Client not found");
    }

    if (userRole === "ADMIN") {
      return true;
    }

    if (userRole === "COMPTABLE") {
      if (client.createdBy !== userId) {
        throw new ForbiddenError("Access denied to this client");
      }
      return true;
    }

    if (userRole === "ASSISTANT") {
      const hasAccess = await prisma.folderAssignment.findFirst({
        where: { userId, folder: { clientId } },
      });
      if (!hasAccess) {
        throw new ForbiddenError("Access denied to this client");
      }
      return true;
    }

    throw new ForbiddenError("Access denied to this client");
  }
}

export const ventilationConfigController = new VentilationConfigController();
