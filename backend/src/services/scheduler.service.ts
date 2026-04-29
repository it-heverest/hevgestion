// src/services/scheduler.service.ts
import * as cron from "node-cron";
import { NotificationService } from "./notification.service";
import { prisma } from "../lib/prisma";

export class SchedulerService {
  private static isInitialized = false;

  /**
   * Initialize all scheduled jobs
   */
  static initialize() {
    if (this.isInitialized) {
      console.log("🔄 Scheduler already initialized");
      return;
    }

    console.log("⏰ Initializing scheduler service...");

    // Daily greetings at 9 AM
    cron.schedule("0 9 * * *", async () => {
      console.log("🌅 Running daily greeting job...");
      await this.sendDailyGreetings();
    });

    // Check for inactive users every 30 minutes
    cron.schedule("*/30 * * * *", async () => {
      console.log("👀 Checking for inactive users...");
      await this.checkInactiveUsers();
    });

    // Check for DSF reminders every hour
    cron.schedule("0 * * * *", async () => {
      console.log("📊 Checking DSF reminders...");
      await this.checkDSFReminders();
    });

    this.isInitialized = true;
    console.log("✅ Scheduler initialized successfully");
  }

  /**
   * Send daily greetings to all active users
   */
  private static async sendDailyGreetings() {
    try {
      const activeUsers = await prisma.user.findMany({
        where: {
          isActive: true,
          // Optional: only send to users who logged in recently
          lastActivity: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        select: { id: true },
      });

      console.log(`📢 Sending daily greetings to ${activeUsers.length} users`);

      const promises = activeUsers.map(user =>
        NotificationService.createDailyGreeting(user.id)
      );

      await Promise.all(promises);
      console.log("✅ Daily greetings sent successfully");
    } catch (error) {
      console.error("❌ Error sending daily greetings:", error);
    }
  }

  /**
   * Check for users inactive for 30 minutes and send reminders
   */
  private static async checkInactiveUsers() {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      const inactiveUsers = await prisma.user.findMany({
        where: {
          isActive: true,
          lastActivity: {
            lt: thirtyMinutesAgo,
            not: null,
          },
        },
        select: { id: true },
      });

      console.log(`👤 Found ${inactiveUsers.length} inactive users`);

      const promises = inactiveUsers.map(user =>
        NotificationService.createInactivityReminder(user.id)
      );

      await Promise.all(promises);
      console.log("✅ Inactivity reminders sent");
    } catch (error) {
      console.error("❌ Error checking inactive users:", error);
    }
  }

  /**
   * Check for folders with imported balances but no DSF generated
   */
  private static async checkDSFReminders() {
    try {
      // Find folders with balances imported but no DSF
      const foldersWithoutDSF = await prisma.folder.findMany({
        where: {
          balances: {
            some: {
              status: "PROCESSED", // Assuming processed means imported
            },
          },
          dsf: null, // No DSF generated
          status: {
            not: "COMPLETED", // Not completed
          },
        },
        include: {
          balances: {
            where: { status: "PROCESSED" },
            orderBy: { importedAt: "desc" },
            take: 1,
          },
          owner: true,
        },
      });

      console.log(`📁 Found ${foldersWithoutDSF.length} folders without DSF`);

      for (const folder of foldersWithoutDSF) {
        const latestBalance = folder.balances[0];
        if (!latestBalance?.importedAt) continue;

        const daysSinceImport = Math.floor(
          (Date.now() - latestBalance.importedAt.getTime()) / (24 * 60 * 60 * 1000)
        );

        let reminderLevel = 0;
        if (daysSinceImport >= 2) {
          reminderLevel = 3; // Every 3 days after 2 days
        } else if (daysSinceImport >= 1) {
          reminderLevel = 2; // After 1 day
        } else if (Date.now() - latestBalance.importedAt.getTime() >= 5 * 60 * 1000) {
          reminderLevel = 1; // After 5 minutes
        }

        if (reminderLevel > 0) {
          // Check if we already sent a reminder at this level recently
          const recentReminder = await prisma.notification.findFirst({
            where: {
              userId: folder.ownerId,
              type: "DSF_REMINDER",
              message: { contains: folder.name }, // Check folder name in message
              createdAt: {
                gte: new Date(Date.now() - this.getReminderInterval(reminderLevel) * 24 * 60 * 60 * 1000),
              },
            },
          });

          if (!recentReminder) {
            await NotificationService.createDSFReminder(
              folder.ownerId,
              folder.name,
              reminderLevel
            );
          }
        }
      }

      console.log("✅ DSF reminders checked");
    } catch (error) {
      console.error("❌ Error checking DSF reminders:", error);
    }
  }

  /**
   * Get reminder interval in days based on level
   */
  private static getReminderInterval(level: number): number {
    switch (level) {
      case 1: return 0; // 5 minutes, but we check every hour
      case 2: return 1;
      case 3: return 3;
      default: return 3;
    }
  }

  /**
   * Manually trigger daily greetings (for testing)
   */
  static async triggerDailyGreetings() {
    await this.sendDailyGreetings();
  }

  /**
   * Manually trigger inactivity check (for testing)
   */
  static async triggerInactivityCheck() {
    await this.checkInactiveUsers();
  }

  /**
   * Manually trigger DSF reminder check (for testing)
   */
  static async triggerDSFReminderCheck() {
    await this.checkDSFReminders();
  }
}