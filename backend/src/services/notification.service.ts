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

  /**
   * Create daily greeting notification
   */
  static async createDailyGreeting(userId: string) {
    const firstName = await this.getUserFirstName(userId);

    const greetings = [
      "Bonjour",
      "Hello",
      "Salut",
      "Hi",
      "Good morning",
      "Hey there"
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    const title = `${greeting} ${firstName}!`;
    const message = "Welcome back to your Financial Dashboard. Have a productive day!";

    return this.createNotification(userId, NotificationType.DAILY_GREETING, title, message);
  }

  /**
   * Create inactivity reminder notification
   */
  static async createInactivityReminder(userId: string) {
    const firstName = await this.getUserFirstName(userId);

    const title = "Come back to your Dashboard!";
    const message = `Hi ${firstName}, it's been 30 minutes since your last activity. Don't forget to check your financial data!`;

    return this.createNotification(userId, NotificationType.INACTIVITY_REMINDER, title, message);
  }

  /**
   * Create DSF reminder notification
   */
  static async createDSFReminder(userId: string, folderName: string, reminderLevel: number) {
    const firstName = await this.getUserFirstName(userId);

    let title: string;
    let message: string;

    switch (reminderLevel) {
      case 1:
        title = "DSF Generation Reminder";
        message = `Hi ${firstName}, you imported a balance for "${folderName}" but haven't generated the DSF yet. Remember to complete this step!`;
        break;
      case 2:
        title = "DSF Still Pending";
        message = `Hi ${firstName}, it's been a day since you imported the balance for "${folderName}". Please generate the DSF to complete your financial reporting.`;
        break;
      case 3:
      default:
        title = "Urgent: DSF Generation Required";
        message = `Hi ${firstName}, it's been 2 days since importing the balance for "${folderName}". DSF generation is still pending - please complete this important step.`;
        break;
    }

    return this.createNotification(userId, NotificationType.DSF_REMINDER, title, message);
  }

  /**
   * Get unread notifications count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Get recent notifications for a user
   */
  static async getNotifications(userId: string, limit = 50) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Update user's last activity timestamp
   */
  static async updateLastActivity(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastActivity: new Date() },
    });
  }

  private static async getUserFirstName(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user?.firstName || "Client";
  }
}