// src/services/notification.service.ts
import { prisma } from "../lib/prisma";
import { NotificationType } from "@prisma/client";

export class NotificationService {
  static async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });
  }

  static async createWelcomeNotification(userId: string) {
    const firstName = await this.getUserFirstName(userId);
    
    return this.createNotification(
      userId,
      NotificationType.WELCOME,
      "Bienvenue sur HevGestion !",
      `Bonjour ${firstName}, nous sommes ravis de vous compter parmi nos utilisateurs. HevGestion vous aide à gérer facilement votre comptabilité selon les normes OHADA.`,
      "/web/dashboard"
    );
  }

  static async createGuideNotification(userId: string) {
    return this.createNotification(
      userId,
      NotificationType.GUIDE,
      "Téléchargez le guide d'utilisation",
      "Pour bien démarrer, téléchargez notre guide complet qui explique toutes les fonctionnalités de l'application.",
      "/api/files/guide-utilisation.pdf"
    );
  }

  static async createBalanceImportedNotification(
    userId: string,
    period: string,
    fileName: string
  ) {
    return this.createNotification(
      userId,
      NotificationType.BALANCE_IMPORTED,
      "Balance importée avec succès",
      `La balance "${fileName}" pour la période ${period} a été importée et traitée.`,
      "/web/dashboard/balance"
    );
  }

  static async createDSFGeneratedNotification(
    userId: string,
    period: string,
    exerciseYear: number
  ) {
    return this.createNotification(
      userId,
      NotificationType.DSF_GENERATED,
      "DSF généré",
      `La Déclaration Statistique et Fiscale pour l'exercice ${exerciseYear} période ${period} a été générée avec succès.`,
      "/web/dashboard/dsf"
    );
  }

  private static async getUserFirstName(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user?.firstName || "Client";
  }
}