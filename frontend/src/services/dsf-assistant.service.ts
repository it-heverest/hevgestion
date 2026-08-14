// services/dsf-assistant.service.ts
import api from "./api";

export interface AssistantChatResponse {
  answer: string;
  sources?: string[];
}

class DSFAssistantService {
  async ask(question: string): Promise<AssistantChatResponse> {
    const response = await api.post("/assistant/chat", { question });
    return response.data;
  }
}

export const dsfAssistantService = new DSFAssistantService();
