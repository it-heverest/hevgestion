import axios from "axios";
import { API_CONFIG } from "../config/api";
import { authService } from "./auth.service";

interface TemplateStatus {
    hasTemplate: boolean;
    fileName?: string;
    uploadDate?: string;
    fileSize?: number;
}

class DsfTemplateService {
    private api = axios.create({
        baseURL: `${API_CONFIG.BASE_URL}/dsf-template`,
        withCredentials: true,
    });

    constructor() {
        this.api.interceptors.request.use((config) => {
            const token = authService.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    /**
     * Upload a DSF Excel template
     * If folderId is provided, uploads for that folder; otherwise uses user-level template
     */
    async uploadTemplate(file: File, folderId?: string): Promise<TemplateStatus> {
        const formData = new FormData();
        formData.append("file", file);

        const url = folderId ? `/upload/${folderId}` : "/upload";
        const response = await this.api.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Échec de l'import");
    }

    /**
     * Get template status
     * If folderId is provided, gets folder-level template; otherwise gets user-level template
     */
    async getTemplateStatus(folderId?: string): Promise<TemplateStatus> {
        const url = folderId ? `/status/${folderId}` : "/status";
        const response = await this.api.get(url);

        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Erreur");
    }

    /**
     * Delete the uploaded template
     * If folderId is provided, deletes folder-level template; otherwise deletes user-level template
     */
    async deleteTemplate(folderId?: string): Promise<void> {
        const url = folderId ? `/${folderId}` : "/";
        const response = await this.api.delete(url);

        if (!response.data.success) {
            throw new Error(response.data.message || "Erreur");
        }
    }

    /**
     * Download the raw template file
     * If folderId is provided, downloads folder-level template; otherwise downloads user-level template
     */
    async downloadTemplate(folderId?: string): Promise<void> {
        const url = folderId ? `/download/${folderId}` : "/download";
        const response = await this.api.get(url, {
            responseType: "blob",
        });

        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", folderId ? `template_${folderId.substring(0, 8)}.xlsx` : "template.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
    }

    /**
     * Export filled Excel:
     * Creates a copy of the template, fills it with DSF data,
     * and names the file with client name.
     */
    async exportFilledExcel(folderId: string): Promise<void> {
        try {
            const response = await this.api.get(`/export/${folderId}`, {
                responseType: "blob",
            });

            // Get filename from Content-Disposition header or create default
            const contentDisposition = response.headers["content-disposition"];
            let fileName = `DSF_Export_${folderId.substring(0, 8)}.xlsx`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?(.+)"?/);
                if (match) {
                    fileName = match[1];
                }
            }

            // Trigger browser download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error("Error exporting DSF:", error);
            if (error.response?.data instanceof Blob) {
                const text = await error.response.data.text();
                let message = "Erreur lors de l'export";
                try {
                    const json = JSON.parse(text);
                    message = json.message || message;
                } catch {
                    // JSON parse failed, use default message
                }
                throw new Error(message);
            }
            throw new Error(error.message || "Erreur lors de l'export");
        }
    }
}

export const dsfTemplateService = new DsfTemplateService();
