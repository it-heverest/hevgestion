// src/services/openrouter-chat.service.ts
// OpenRouter — passerelle donnant accès à de nombreux modèles (dont des
// modèles gratuits) via une API compatible OpenAI:
// POST {baseUrl}/chat/completions.
import axios, { isAxiosError } from "axios";
import { config } from "../config";
import { ChatTurn } from "../types/assistant.types";
import { ASSISTANT_SYSTEM_INSTRUCTION } from "./assistant-system-prompt";

// Échecs amont transitoires méritant une nouvelle tentative: 503 (modèle
// surchargé) et 429 (limite de débit). Le reste échoue immédiatement.
const RETRYABLE_STATUS_CODES = new Set([429, 503]);
const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 600;

// Le modèle par défaut (Dots3-Note, gratuit) est un modèle "raisonneur": une
// partie de sa réponse part dans un champ `reasoning` séparé avant le texte
// final. Sans plafond explicite, un raisonnement inhabituellement long peut
// consommer tout le budget de complétion et couper la réponse avant qu'elle
// n'atteigne `content`, qui revient alors vide. On laisse une marge large
// pour couvrir raisonnement + réponse.
const MAX_COMPLETION_TOKENS = 4096;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function headers() {
  return {
    Authorization: `Bearer ${config.openrouter.apiKey}`,
    "Content-Type": "application/json",
    // En-têtes d'attribution recommandés par OpenRouter.
    "HTTP-Referer": config.openrouter.appUrl,
    "X-Title": config.openrouter.appName,
  };
}

export async function askOpenRouter(
  question: string,
  history: ChatTurn[] = [],
  model?: string,
): Promise<string> {
  if (!config.openrouter.apiKey) {
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
        `${config.openrouter.baseUrl}/chat/completions`,
        {
          model: model || config.openrouter.model,
          messages,
          max_tokens: MAX_COMPLETION_TOKENS,
        },
        { headers: headers(), timeout: 60000 },
      );

      // OpenRouter renvoie les erreurs amont dans un champ `error` avec un
      // statut HTTP 200: sans ce test, l'échec passerait pour une réponse vide.
      const upstreamError = response.data?.error;
      if (upstreamError) {
        throw new Error(
          `ASSISTANT_PROVIDER_ERROR: ${upstreamError.message || "erreur amont"}`,
        );
      }

      const answer = response.data?.choices?.[0]?.message?.content?.trim();
      if (!answer) {
        // Constaté en usage réel: le modèle renvoie parfois un `content` vide
        // (raisonnement coupé avant la réponse finale) alors que la requête
        // HTTP a réussi. Ce n'est pas une erreur axios, donc le classement
        // par code de statut ci-dessous ne la couvrirait pas — elle est
        // traitée comme transitoire ici, dans la boucle, pour bénéficier des
        // mêmes reprises qu'un 429/503.
        throw new Error("ASSISTANT_EMPTY_RESPONSE");
      }
      return answer;
    } catch (error) {
      lastError = error;

      const status = isAxiosError(error) ? error.response?.status : undefined;
      const isEmptyResponse =
        error instanceof Error && error.message === "ASSISTANT_EMPTY_RESPONSE";
      const isRetryable =
        isEmptyResponse ||
        (status !== undefined && RETRYABLE_STATUS_CODES.has(status));

      if (!isRetryable || attempt === MAX_ATTEMPTS) {
        if (isRetryable) {
          throw new Error(
            isEmptyResponse
              ? "ASSISTANT_EMPTY_RESPONSE"
              : "ASSISTANT_PROVIDER_OVERLOADED",
          );
        }
        throw error;
      }

      const delay = BASE_DELAY_MS * 2 ** (attempt - 1) + Math.random() * 300;
      await sleep(delay);
    }
  }

  throw lastError;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  /** true lorsque le tarif d'entrée et de sortie est nul. */
  isFree: boolean;
  contextLength: number | null;
}

/**
 * Liste les modèles disponibles sur le compte OpenRouter, pour alimenter le
 * sélecteur de l'écran Paramètres. Évite de coder en dur des identifiants de
 * modèles qui changent au fil du temps.
 */
export async function listOpenRouterModels(): Promise<OpenRouterModel[]> {
  if (!config.openrouter.apiKey) {
    throw new Error("ASSISTANT_API_KEY_MISSING");
  }

  const response = await axios.get(`${config.openrouter.baseUrl}/models`, {
    headers: headers(),
    timeout: 20000,
  });

  const rawModels: any[] = response.data?.data ?? [];

  return rawModels
    .map((m) => {
      const prompt = parseFloat(m?.pricing?.prompt ?? "0");
      const completion = parseFloat(m?.pricing?.completion ?? "0");
      return {
        id: String(m.id),
        name: String(m.name || m.id),
        isFree: prompt === 0 && completion === 0,
        contextLength:
          typeof m.context_length === "number" ? m.context_length : null,
      };
    })
    .sort((a, b) => {
      // Les modèles gratuits en tête, puis par ordre alphabétique.
      if (a.isFree !== b.isFree) return a.isFree ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}
