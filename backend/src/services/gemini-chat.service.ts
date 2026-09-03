// src/services/gemini-chat.service.ts
// Gemini chat provider. Handles document/image attachments (Gemini is
// natively multimodal) — Groq is still the provider for plain text turns,
// see dsf-assistant.service.ts for the routing.
import {
  GoogleGenAI,
  ApiError,
  type ContentListUnion,
} from "@google/genai";
import { config } from "../config";
import { ChatAttachment, ChatTurn } from "../types/assistant.types";
import { ASSISTANT_SYSTEM_INSTRUCTION } from "./assistant-system-prompt";

// Transient upstream failures worth retrying: 503 (model overloaded) and
// 429 (rate limited). Anything else (bad request, auth, etc.) fails fast.
const RETRYABLE_STATUS_CODES = new Set([429, 503]);
const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 600;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!config.gemini.apiKey) {
    throw new Error("ASSISTANT_API_KEY_MISSING");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: config.gemini.apiKey });
  }
  return client;
}

async function generateWithRetry(contents: ContentListUnion): Promise<string> {
  const genAI = getClient();
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await genAI.models.generateContent({
        model: config.gemini.model,
        contents,
        config: {
          systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION,
        },
      });

      const answer = response.text?.trim();
      if (!answer) {
        throw new Error("ASSISTANT_EMPTY_RESPONSE");
      }
      return answer;
    } catch (error) {
      lastError = error;

      const isRetryable =
        error instanceof ApiError && RETRYABLE_STATUS_CODES.has(error.status);

      if (!isRetryable || attempt === MAX_ATTEMPTS) {
        if (isRetryable) {
          throw new Error("ASSISTANT_PROVIDER_OVERLOADED");
        }
        throw error;
      }

      // Exponential backoff with jitter before retrying a transient failure.
      const delay = BASE_DELAY_MS * 2 ** (attempt - 1) + Math.random() * 300;
      await sleep(delay);
    }
  }

  // Unreachable, but keeps TypeScript happy about the return type.
  throw lastError;
}

export async function askGemini(
  question: string,
  history: ChatTurn[] = [],
): Promise<string> {
  const contents = [
    ...history.map((turn) => ({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.content }],
    })),
    { role: "user", parts: [{ text: question }] },
  ];

  return generateWithRetry(contents);
}

export async function askGeminiWithAttachment(
  question: string,
  attachment: ChatAttachment,
  history: ChatTurn[] = [],
): Promise<string> {
  const contents = [
    ...history.map((turn) => ({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.content }],
    })),
    {
      role: "user",
      parts: [
        { inlineData: { mimeType: attachment.mimeType, data: attachment.data } },
        {
          text:
            question.trim() ||
            "Analyse ce document et résume les informations comptables ou fiscales pertinentes qu'il contient.",
        },
      ],
    },
  ];

  return generateWithRetry(contents);
}
