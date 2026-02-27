// services/audit.service.ts
import axios from "axios";

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  action: string;
  entityType: string;
  entityId?: string;
  folderId?: string;
  clientId?: string;
  description: string;
  oldValue?: any;
  newValue?: any;
  metadata?: any;
  cellAddress?: string;
  worksheet?: string;
  fieldName?: string;
  changeType?: string;
  folder?: {
    id: string;
    name: string;
    client: {
      id: string;
      name: string;
    };
  };
  client?: {
    id: string;
    name: string;
  };
}

export interface AuditStats {
  period: string;
  totalLogs: number;
  actionStats: Array<{
    action: string;
    _count: { id: number };
  }>;
  userStats: Array<{
    userId: string;
    _count: { id: number };
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  entityStats: Array<{
    entityType: string;
    _count: { id: number };
  }>;
  recentLogs: AuditLog[];
}

export interface AuditFilters {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  folderId?: string;
  startDate?: string;
  endDate?: string;
}

class AuditService {
  private baseURL = "/api/audit";

  async getAuditLogs(filters: AuditFilters = {}): Promise<{
    logs: AuditLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await axios.get(`${this.baseURL}?${params}`, {
      withCredentials: true,
    });
    return response.data.data;
  }

  async getAuditStats(period: string = "30d"): Promise<AuditStats> {
    const response = await axios.get(`${this.baseURL}/stats?period=${period}`, {
      withCredentials: true,
    });
    return response.data.data;
  }

  async getAuditLogById(id: string): Promise<AuditLog> {
    const response = await axios.get(`${this.baseURL}/${id}`, {
      withCredentials: true,
    });
    return response.data.data;
  }

  // Helper methods for common audit queries
  async getUserActivity(
    userId: string,
    days: number = 30
  ): Promise<AuditLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.getAuditLogs({
      userId,
      startDate: startDate.toISOString(),
      limit: 100,
    });

    return result.logs;
  }

  async getFolderActivity(
    folderId: string,
    days: number = 30
  ): Promise<AuditLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.getAuditLogs({
      folderId,
      startDate: startDate.toISOString(),
      limit: 100,
    });

    return result.logs;
  }

  async getRecentActivity(limit: number = 50): Promise<AuditLog[]> {
    const result = await this.getAuditLogs({
      limit,
    });

    return result.logs;
  }

  async getUserAuditLogs(userId: string, limit: number = 100): Promise<AuditLog[]> {
    const result = await this.getAuditLogs({
      userId,
      limit,
    });

    return result.logs;
  }
}

export const auditService = new AuditService();
