// src/services/groq-chat.service.ts
// Groq (groq.com — fast inference hosting, not to be confused with xAI's
// Grok) chat provider — currently the primary provider for the DSF
// assistant. Groq's API is OpenAI-compatible (POST /openai/v1/chat/completions).
import axios, { isAxiosError } from "axios";
import { config } from "../config";
import { ChatTurn } from "../types/assistant.types";
import { ASSISTANT_SYSTEM_INSTRUCTION } from "./assistant-system-prompt";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

// Transient upstream failures worth retrying: 503 (model overloaded) and
// 429 (rate limited). Anything else (bad request, auth, etc.) fails fast.
const RETRYABLE_STATUS_CODES = new Set([429, 503]);
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 600;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function askGroq(
  question: string,
  history: ChatTurn[] = [],
  model?: string,
): Promise<string> {
  if (!config.groq.apiKey) {
    throw new Error("ASSISTANT_API_KEY_MISSING");
  }

  const messages = [
    { role: "system", content: ASSISTANT_SYSTEM_INSTRUCTION },
    ...history.map((turn) => ({
      role: turn.role === "assistant" ? "assistant" : "user",
      content: turn.content,
    })),
    { role: "user", content: question },
  ];

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await axios.post(
        `${GROQ_BASE_URL}/chat/completions`,
        { model: model || config.groq.model, messages },
        {
          headers: {
            Authorization: `Bearer ${config.groq.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

      const answer = response.data?.choices?.[0]?.message?.content?.trim();
      if (!answer) {
        throw new Error("ASSISTANT_EMPTY_RESPONSE");
      }
      return answer;
    } catch (error) {
      lastError = error;

      const status = isAxiosError(error) ? error.response?.status : undefined;
      const isRetryable = status !== undefined && RETRYABLE_STATUS_CODES.has(status);

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
