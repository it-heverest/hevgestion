// src/services/assistant-settings.service.ts
// Réglage du modèle IA de l'assistant, modifiable depuis l'écran Paramètres.
//
// La valeur est stockée en base (table app_settings) et non dans une variable
// d'environnement, afin d'être changeable sans redémarrage. Les clés d'API,
// elles, restent dans l'environnement: ce sont des secrets, ils n'ont pas à
// transiter par l'interface.
import { prisma } from "../lib/prisma";
import { config } from "../config";

export type AssistantProvider = "groq" | "openrouter";

export interface AssistantSettings {
  provider: AssistantProvider;
  model: string;
}

const SETTING_KEY = "assistant.model";

/** Repli utilisé tant qu'aucun réglage n'a été enregistré. */
function defaults(): AssistantSettings {
  return { provider: "groq", model: config.groq.model };
}

// Le réglage est lu à chaque tour de conversation: un cache court évite un
// aller-retour en base par message, tout en propageant vite un changement.
let cache: { value: AssistantSettings; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30_000;

export async function getAssistantSettings(): Promise<AssistantSettings> {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.value;
  }

  let value = defaults();
  try {
    const row = await prisma.appSetting.findUnique({
      where: { key: SETTING_KEY },
    });
    if (row?.value && typeof row.value === "object") {
      const stored = row.value as any;
      if (stored.provider && stored.model) {
        value = { provider: stored.provider, model: String(stored.model) };
      }
    }
  } catch (error) {
    // Un incident de lecture ne doit pas rendre l'assistant indisponible:
    // on retombe sur la configuration par défaut.
    console.error("Lecture du réglage assistant impossible:", error);
  }

  cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
  return value;
}

export async function setAssistantSettings(
  settings: AssistantSettings,
  updatedById?: string,
): Promise<AssistantSettings> {
  const value: AssistantSettings = {
    provider: settings.provider,
    model: settings.model.trim(),
  };

  await prisma.appSetting.upsert({
    where: { key: SETTING_KEY },
    update: { value: value as any, updatedById },
    create: { key: SETTING_KEY, value: value as any, updatedById },
  });

  cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
  return value;
}

/** Quels fournisseurs sont réellement utilisables (clé d'API présente). */
export function getProviderAvailability() {
  return {
    groq: Boolean(config.groq.apiKey),
    openrouter: Boolean(config.openrouter.apiKey),
    // Gemini n'est pas sélectionnable: il sert uniquement aux pièces jointes,
    // les autres fournisseurs configurés n'étant pas multimodaux.
    gemini: Boolean(config.gemini.apiKey),
  };
}
