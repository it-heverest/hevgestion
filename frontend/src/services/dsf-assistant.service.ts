// services/dsf-assistant.service.ts
import api from "./api";

export interface AssistantChatResponse {
  answer: string;
  sources?: string[];
}

export interface AssistantChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantChatAttachment {
  /** Base64-encoded file content (no "data:...;base64," prefix). */
  data: string;
  mimeType: string;
  name?: string;
}

export type AssistantProvider = "groq" | "openrouter";

export interface AssistantSettings {
  provider: AssistantProvider;
  model: string;
}

export interface AssistantSettingsResponse {
  current: AssistantSettings;
  /** Fournisseurs dont la clé d'API est configurée côté serveur. */
  availability: Record<string, boolean>;
  defaults: Record<AssistantProvider, string>;
}

export interface AssistantModel {
  id: string;
  name: string;
  isFree: boolean;
  contextLength: number | null;
}

/**
 * Délai accordé à une question de chat. Le backend peut retenter jusqu'à
 * 4 fois (réponse vide ou fournisseur momentanément surchargé) avant de
 * conclure à un échec: le délai global de 15 s de l'instance axios (pensé
 * pour des appels CRUD) couperait la requête avant que ces reprises aient pu
 * aboutir. Même principe que pour le scanner de factures, calibré plus court
 * puisqu'une réponse de chat est nettement plus rapide à produire qu'une
 * extraction de document.
 */
export const CHAT_TIMEOUT_MS = 60_000;

class DSFAssistantService {
  async ask(
    question: string,
    history: AssistantChatTurn[] = [],
    attachment?: AssistantChatAttachment,
  ): Promise<AssistantChatResponse> {
    const response = await api.post(
      "/assistant/chat",
      { question, history, attachment },
      { timeout: CHAT_TIMEOUT_MS },
    );
    return response.data;
  }

  async getSettings(): Promise<AssistantSettingsResponse> {
    const response = await api.get("/assistant/settings");
    return response.data;
  }

  async updateSettings(settings: AssistantSettings): Promise<AssistantSettings> {
    const response = await api.put("/assistant/settings", settings);
    return response.data.current;
  }

  /** Modèles proposés par OpenRouter (réservé aux administrateurs). */
  async listModels(): Promise<AssistantModel[]> {
    const response = await api.get("/assistant/models");
    return response.data.models;
  }
}

export const dsfAssistantService = new DSFAssistantService();
