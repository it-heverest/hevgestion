// src/services/dsf-assistant.service.ts
// Orchestrateur du chat de l'assistant DSF.
//
// Les tours de texte partent vers le fournisseur choisi dans Paramètres
// (Groq ou OpenRouter). Les tours comportant une pièce jointe partent vers
// Gemini, seul fournisseur configuré nativement multimodal.
import { askGroq } from "./groq-chat.service";
import { askOpenRouter } from "./openrouter-chat.service";
import { askGeminiWithAttachment } from "./gemini-chat.service";
import { getAssistantSettings } from "./assistant-settings.service";
import { ChatAttachment, ChatTurn } from "../types/assistant.types";

export type { ChatTurn, ChatAttachment };

class DSFAssistantService {
  async ask(
    question: string,
    history: ChatTurn[] = [],
    attachment?: ChatAttachment,
  ): Promise<string> {
    if (attachment) {
      return askGeminiWithAttachment(question, attachment, history);
    }

    const { provider, model } = await getAssistantSettings();

    if (provider === "openrouter") {
      return askOpenRouter(question, history, model);
    }
    return askGroq(question, history, model);
  }
}

export const dsfAssistantService = new DSFAssistantService();
