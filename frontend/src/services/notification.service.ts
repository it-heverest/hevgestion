// services/notification.service.ts
import api from "./api";
import { API_CONFIG } from "../config/api";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

class NotificationService {

  async getNotifications(limit = 50): Promise<AppNotification[]> {
    try {
      const response = await api.get(`/notifications?limit=${limit}`);
      return response.data.notifications || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get("/notifications/unread-count");
      return response.data.count || 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await api.put("/notifications/read-all");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }
}

export const notificationService = new NotificationService();