// services/notification.service.ts
import axios from "axios";
import { API_CONFIG } from "../config/api";
import { authService } from "./auth.service";

export interface Notification {
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
  private api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use((config) => {
      const token = authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await this.api.get("/notifications");
      return response.data.notifications || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.api.get("/notifications/unread-count");
      return response.data.count || 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await this.api.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await this.api.put("/notifications/read-all");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }
}

export const notificationService = new NotificationService();