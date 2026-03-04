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
     */
    async uploadTemplate(file: File): Promise<TemplateStatus> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await this.api.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Échec de l'import");
    }

    /**
     * Get template status (uploaded or not)
     */
    async getTemplateStatus(): Promise<TemplateStatus> {
        const response = await this.api.get("/status");

        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Erreur");
    }

    /**
     * Delete the uploaded template
     */
    async deleteTemplate(): Promise<void> {
        const response = await this.api.delete("/");

        if (!response.data.success) {
            throw new Error(response.data.message || "Erreur");
        }
    }

    /**
     * Export filled Excel:
     * Triggers backend to fill the stored template with folder data.
     */
    async exportFilledExcel(folderId: string): Promise<void> {
        try {
            const response = await this.api.get(`/export/${folderId}`, {
                responseType: "blob",
            });

            // Trigger browser download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `DSF_Export_${folderId.substring(0, 8)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error("Error exporting DSF:", error);
            if (error.response?.data instanceof Blob) {
                const text = await error.response.data.text();
                try {
                    const json = JSON.parse(text);
                    throw new Error(json.message || "Erreur lors de l'export");
                } catch {
                    throw new Error("Erreur lors de l'export");
                }
            }
            throw new Error(error.response?.data?.message || "Erreur lors de l'export");
        }
    }
}

export const dsfTemplateService = new DsfTemplateService();
