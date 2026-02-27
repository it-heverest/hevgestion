// services/report.service.ts
import axios from "axios";

export interface ExcelReport {
  id: string;
  name: string;
  category: string;
  description: string;
  sheetName: string;
  templateSheet?: string;
  canEdit: boolean;
  canPreview: boolean;
  requiresDsf?: boolean;
  isGenerated?: boolean;
}

export interface ReportListResponse {
  reports: ExcelReport[];
  fileExists: boolean;
  filePath: string;
}

export interface FileStatusResponse {
  fileExists: boolean;
  filePath: string;
  fileInfo?: {
    size: number;
    modified: string;
    sheets?: string[];
    sheetsCount?: number;
  };
}

export interface SheetPreviewResponse {
  sheetName: string;
  data: any[][];
  styles: Record<string, any>;
  range: string;
  merges: any[];
  columns: any[];
  rows: any[];
}

export interface UploadResponse {
  fileName: string;
  fileSize: number;
  sheetsCount: number;
  availableSheets: string[];
  availableReports: number;
  reports: ExcelReport[];
}

class ReportService {
  private baseURL = "http://localhost:5000/api/reports";

  async getReports(): Promise<ReportListResponse> {
    try {
      const response = await axios.get(this.baseURL, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  }

  async checkFileStatus(): Promise<FileStatusResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/status`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error checking file status:", error);
      throw error;
    }
  }

  async downloadCompleteFile(): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseURL}/download`, {
        responseType: "blob",
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error downloading complete file:", error);
      throw error;
    }
  }

  async downloadSheet(sheetName: string, reportName?: string): Promise<Blob> {
    try {
      const url = reportName
        ? `${this.baseURL}/download/${sheetName}/${encodeURIComponent(reportName)}`
        : `${this.baseURL}/download/${sheetName}`;

      const response = await axios.get(url, {
        responseType: "blob",
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error downloading sheet:", error);
      throw error;
    }
  }

  async getSheetPreview(sheetName: string): Promise<SheetPreviewResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/preview/${sheetName}`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error getting sheet preview:", error);
      throw error;
    }
  }

  async uploadFile(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${this.baseURL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }
}

export const reportService = new ReportService();