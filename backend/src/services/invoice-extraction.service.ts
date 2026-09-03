// src/services/invoice-extraction.service.ts
//
// Lecture d'une facture (photo ou PDF) par un modèle multimodal.
//
// Le rôle de l'IA s'arrête ici: elle transcrit ce qu'elle voit, elle ne juge
// rien et ne choisit aucun compte. La conformité et l'imputation sont
// décidées par du code déterministe (invoice-conformity / invoice-entry).
//
// Consigne de fond donnée au modèle: ne jamais deviner. Un champ absent doit
// revenir à null — une valeur inventée deviendrait une écriture fausse.
//
// Deux moteurs, dans cet ordre:
//   1. OpenRouter / Ox Alpha (gratuit, multimodal) — essayé en premier.
//   2. Gemini — filet de sécurité si Ox Alpha échoue ou n'est pas configuré.
//
// Ox Alpha a été mesuré empiriquement avant intégration (pas seulement testé
// "ça marche une fois"): sur une même facture de test, avec un schéma JSON
// strict il ignore le schéma et invente ses propres clés imbriquées; avec
// `response_format: json_object` il a mis 182 s pour ne rien renvoyer. La
// seule configuration fiable trouvée est un prompt système explicite listant
// les clés à plat, SANS contrainte `response_format` — c'est celle utilisée
// ci-dessous. La latence reste variable (15 s à plus de 3 min observées):
// d'où le nombre de tentatives volontairement bas et le filet Gemini.
import { GoogleGenAI, ApiError, Type } from "@google/genai";
import axios, { isAxiosError } from "axios";
import { config } from "../config";
import { ExtractedInvoice } from "../types/invoice.types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Normalisation commune aux deux moteurs ────────────────────────────────

const EMPTY: ExtractedInvoice = {
  direction: null,
  fournisseurNom: null,
  fournisseurNiu: null,
  fournisseurRccm: null,
  fournisseurAdresse: null,
  fournisseurTelephone: null,
  regimeFiscal: null,
  centreImpots: null,
  clientNom: null,
  clientNiu: null,
  numeroFacture: null,
  dateFacture: null,
  devise: null,
  montantHT: null,
  tauxTVA: null,
  montantTVA: null,
  montantTTC: null,
  droitTimbre: null,
  autresTaxes: null,
  mentionFactureNormalisee: null,
  natureOperation: null,
  lignes: [],
  remarques: null,
};

/** Un nombre venu du modèle n'est retenu que s'il est réellement exploitable. */
function num(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseFloat(String(value).replace(/\s/g, ""));
  return Number.isFinite(n) ? n : null;
}

function str(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t === "" ? null : t;
}

/** Normalise la réponse du modèle (l'un ou l'autre moteur) vers la forme attendue. */
function normalize(raw: any): ExtractedInvoice {
  const lignes = Array.isArray(raw?.lignes)
    ? raw.lignes
        .map((l: any) => ({
          designation: str(l?.designation) ?? "",
          quantite: num(l?.quantite),
          prixUnitaireHT: num(l?.prixUnitaireHT),
          montantHT: num(l?.montantHT),
        }))
        .filter((l: any) => l.designation !== "")
    : [];

  const direction = str(raw?.direction)?.toUpperCase();

  return {
    ...EMPTY,
    direction: direction === "VENTE" ? "VENTE" : direction === "ACHAT" ? "ACHAT" : null,
    fournisseurNom: str(raw?.fournisseurNom),
    fournisseurNiu: str(raw?.fournisseurNiu)?.replace(/\s/g, "") ?? null,
    fournisseurRccm: str(raw?.fournisseurRccm),
    fournisseurAdresse: str(raw?.fournisseurAdresse),
    fournisseurTelephone: str(raw?.fournisseurTelephone),
    regimeFiscal: str(raw?.regimeFiscal),
    centreImpots: str(raw?.centreImpots),
    clientNom: str(raw?.clientNom),
    clientNiu: str(raw?.clientNiu)?.replace(/\s/g, "") ?? null,
    numeroFacture: str(raw?.numeroFacture),
    dateFacture: str(raw?.dateFacture),
    devise: str(raw?.devise),
    montantHT: num(raw?.montantHT),
    tauxTVA: num(raw?.tauxTVA),
    montantTVA: num(raw?.montantTVA),
    montantTTC: num(raw?.montantTTC),
    droitTimbre: num(raw?.droitTimbre),
    autresTaxes: num(raw?.autresTaxes),
    mentionFactureNormalisee:
      typeof raw?.mentionFactureNormalisee === "boolean"
        ? raw.mentionFactureNormalisee
        : null,
    natureOperation: str(raw?.natureOperation),
    lignes,
    remarques: str(raw?.remarques),
  };
}

export interface InvoiceDocument {
  /** Contenu encodé en base64, sans préfixe "data:...;base64,". */
  data: string;
  mimeType: string;
}

// ─── Moteur 1: OpenRouter / Ox Alpha ───────────────────────────────────────

// Prompt à clés plates, sans contrainte `response_format`: c'est la seule
// configuration qui, sur nos tests, a produit un JSON conforme sans
// balises markdown ni renommage de champs (voir note en tête de fichier).
const OPENROUTER_SYSTEM_PROMPT = `Tu transcris fidèlement une facture pour un cabinet comptable au Cameroun (référentiel OHADA).

Réponds UNIQUEMENT avec un objet JSON brut sur une seule structure à plat (jamais imbriquée), sans aucun texte avant ou après, sans balises markdown ni \`\`\`, utilisant EXACTEMENT ces clés:

{"direction": "ACHAT" ou "VENTE" ou null, "fournisseurNom": string ou null, "fournisseurNiu": string ou null, "fournisseurRccm": string ou null, "fournisseurAdresse": string ou null, "fournisseurTelephone": string ou null, "regimeFiscal": string ou null, "centreImpots": string ou null, "clientNom": string ou null, "clientNiu": string ou null, "numeroFacture": string ou null, "dateFacture": string(AAAA-MM-JJ) ou null, "devise": string ou null, "montantHT": number ou null, "tauxTVA": number ou null, "montantTVA": number ou null, "montantTTC": number ou null, "droitTimbre": number ou null, "autresTaxes": number ou null, "mentionFactureNormalisee": boolean ou null, "natureOperation": string ou null, "lignes": [{"designation": string, "quantite": number ou null, "prixUnitaireHT": number ou null, "montantHT": number ou null}], "remarques": string ou null}

Règles absolues:
- Ne devine JAMAIS une valeur. Si une information n'apparaît pas clairement, mets null.
- Ne calcule aucun montant manquant: transcris uniquement les montants imprimés.
- Le NIU camerounais s'écrit une lettre, douze chiffres, une lettre (ex. M021712603971A).
- "direction" vaut ACHAT si le document est une facture reçue d'un fournisseur, VENTE si émise par l'entité.
- "mentionFactureNormalisee" vaut true uniquement si la mention "facture normalisée" ou un timbre fiscal est visible.
- "lignes" est un tableau, jamais absent (tableau vide si aucune ligne lisible).
- Dans "remarques", signale ce qui est illisible, raturé, ou douteux.`;

// Une seule tentative: la latence observée sur ce modèle va de 15 s à plus
// de 3 minutes par appel, y compris pour renvoyer un contenu vide. Retenter
// le même appel ne fait qu'additionner ces pires cas — mieux vaut basculer
// tout de suite sur Gemini que de faire attendre l'utilisateur deux fois.
const OPENROUTER_MAX_ATTEMPTS = 1;
const OPENROUTER_REQUEST_TIMEOUT_MS = 100_000;

function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    const firstNewline = cleaned.indexOf("\n");
    cleaned = cleaned.slice(firstNewline === -1 ? 3 : firstNewline + 1);
    const lastFence = cleaned.lastIndexOf("```");
    if (lastFence !== -1) cleaned = cleaned.slice(0, lastFence);
  }
  return cleaned.trim();
}

async function extractInvoiceViaOpenRouter(
  document: InvoiceDocument,
): Promise<ExtractedInvoice> {
  if (!config.openrouter.apiKey) {
    throw new Error("EXTRACTION_OPENROUTER_NOT_CONFIGURED");
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= OPENROUTER_MAX_ATTEMPTS; attempt++) {
    try {
      const response = await axios.post(
        `${config.openrouter.baseUrl}/chat/completions`,
        {
          model: config.openrouter.visionModel,
          messages: [
            { role: "system", content: OPENROUTER_SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                { type: "text", text: "Transcris cette facture." },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${document.mimeType};base64,${document.data}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 4096,
          temperature: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${config.openrouter.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": config.openrouter.appUrl,
            "X-Title": config.openrouter.appName,
          },
          timeout: OPENROUTER_REQUEST_TIMEOUT_MS,
        },
      );

      const upstreamError = response.data?.error;
      if (upstreamError) {
        throw new Error(
          `EXTRACTION_PROVIDER_ERROR: ${upstreamError.message || "erreur amont"}`,
        );
      }

      const content: string | undefined =
        response.data?.choices?.[0]?.message?.content;
      const cleaned = content ? stripMarkdownFences(content) : "";

      if (!cleaned) {
        // Constaté en test: ce modèle peut renvoyer un contenu vide après
        // une longue réflexion cachée. Traité comme transitoire, au même
        // titre qu'un 429/503, pour bénéficier d'une reprise.
        throw new Error("EXTRACTION_EMPTY_RESPONSE");
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        throw new Error("EXTRACTION_INVALID_JSON");
      }

      return normalize(parsed);
    } catch (error) {
      lastError = error;

      const status = isAxiosError(error) ? error.response?.status : undefined;
      const isEmptyResponse =
        error instanceof Error && error.message === "EXTRACTION_EMPTY_RESPONSE";
      const isRetryable = isEmptyResponse || status === 429 || status === 503;

      if (!isRetryable || attempt === OPENROUTER_MAX_ATTEMPTS) {
        throw error;
      }

      await sleep(1000);
    }
  }

  throw lastError;
}

// ─── Moteur 2: Gemini (filet de sécurité) ──────────────────────────────────

const GEMINI_RETRYABLE_STATUS_CODES = new Set([429, 503]);
const GEMINI_MAX_ATTEMPTS = 5;
const GEMINI_BASE_DELAY_MS = 600;

/**
 * Budget total accordé au filet Gemini, reprises comprises.
 *
 * Le client abandonne au bout de ANALYSIS_TIMEOUT_MS côté frontend (voir
 * invoice-scan.service.ts), qui tient compte du temps déjà passé sur Ox
 * Alpha avant d'arriver ici. Sans cette borne, une reprise pourrait démarrer
 * alors que personne n'attend plus la réponse.
 */
const GEMINI_TOTAL_BUDGET_MS = 90_000;

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!config.gemini.apiKey) {
    throw new Error("EXTRACTION_API_KEY_MISSING");
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: config.gemini.apiKey });
  }
  return geminiClient;
}

const GEMINI_SYSTEM_INSTRUCTION = `Tu es un assistant de saisie comptable pour un cabinet au Cameroun (référentiel OHADA).

Ta seule tâche est de TRANSCRIRE fidèlement ce qui est écrit sur la facture fournie.

Règles absolues:
- Ne devine JAMAIS une valeur. Si une information n'apparaît pas clairement sur le document, renvoie null.
- Ne calcule aucun montant manquant: transcris uniquement les montants imprimés.
- Les montants sont des nombres sans séparateur de milliers ni symbole monétaire.
- La date est au format AAAA-MM-JJ. Si l'année est ambiguë, renvoie null.
- Le NIU camerounais s'écrit une lettre, douze chiffres, une lettre (ex. M021712603971A).
- "direction" vaut ACHAT si le document est une facture reçue d'un fournisseur, VENTE s'il s'agit d'une facture émise par l'entité.
- mentionFactureNormalisee vaut true uniquement si la mention "facture normalisée" ou un timbre fiscal est visible.
- Dans "remarques", signale ce qui est illisible, raturé, ou douteux.`;

/** Schéma imposé à la réponse: garantit une sortie exploitable sans parsing hasardeux. */
const GEMINI_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    direction: { type: Type.STRING, nullable: true, enum: ["ACHAT", "VENTE"] },
    fournisseurNom: { type: Type.STRING, nullable: true },
    fournisseurNiu: { type: Type.STRING, nullable: true },
    fournisseurRccm: { type: Type.STRING, nullable: true },
    fournisseurAdresse: { type: Type.STRING, nullable: true },
    fournisseurTelephone: { type: Type.STRING, nullable: true },
    regimeFiscal: { type: Type.STRING, nullable: true },
    centreImpots: { type: Type.STRING, nullable: true },
    clientNom: { type: Type.STRING, nullable: true },
    clientNiu: { type: Type.STRING, nullable: true },
    numeroFacture: { type: Type.STRING, nullable: true },
    dateFacture: { type: Type.STRING, nullable: true },
    devise: { type: Type.STRING, nullable: true },
    montantHT: { type: Type.NUMBER, nullable: true },
    tauxTVA: { type: Type.NUMBER, nullable: true },
    montantTVA: { type: Type.NUMBER, nullable: true },
    montantTTC: { type: Type.NUMBER, nullable: true },
    droitTimbre: { type: Type.NUMBER, nullable: true },
    autresTaxes: { type: Type.NUMBER, nullable: true },
    mentionFactureNormalisee: { type: Type.BOOLEAN, nullable: true },
    natureOperation: { type: Type.STRING, nullable: true },
    lignes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          designation: { type: Type.STRING },
          quantite: { type: Type.NUMBER, nullable: true },
          prixUnitaireHT: { type: Type.NUMBER, nullable: true },
          montantHT: { type: Type.NUMBER, nullable: true },
        },
        required: ["designation"],
      },
    },
    remarques: { type: Type.STRING, nullable: true },
  },
  required: ["direction", "lignes"],
} as const;

async function extractInvoiceViaGemini(
  document: InvoiceDocument,
): Promise<ExtractedInvoice> {
  const genAI = getGeminiClient();
  const deadline = Date.now() + GEMINI_TOTAL_BUDGET_MS;
  let lastError: unknown;

  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
    try {
      const response = await genAI.models.generateContent({
        model: config.gemini.model,
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: document.mimeType, data: document.data } },
              { text: "Transcris cette facture en respectant strictement le schéma." },
            ],
          },
        ],
        config: {
          systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: GEMINI_RESPONSE_SCHEMA as any,
          temperature: 0,
        },
      });

      const text = response.text?.trim();
      if (!text) throw new Error("EXTRACTION_EMPTY_RESPONSE");

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("EXTRACTION_INVALID_JSON");
      }

      return normalize(parsed);
    } catch (error) {
      lastError = error;
      const isRetryable =
        error instanceof ApiError && GEMINI_RETRYABLE_STATUS_CODES.has(error.status);

      const delay = GEMINI_BASE_DELAY_MS * 2 ** (attempt - 1) + Math.random() * 300;
      const budgetEpuise = Date.now() + delay >= deadline;

      if (!isRetryable || attempt === GEMINI_MAX_ATTEMPTS || budgetEpuise) {
        if (isRetryable) throw new Error("EXTRACTION_PROVIDER_OVERLOADED");
        throw error;
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

// ─── Point d'entrée: Ox Alpha d'abord, Gemini en filet ─────────────────────

export async function extractInvoice(
  document: InvoiceDocument,
): Promise<ExtractedInvoice> {
  if (config.openrouter.apiKey) {
    try {
      return await extractInvoiceViaOpenRouter(document);
    } catch (error) {
      console.warn(
        "Extraction via OpenRouter/Ox Alpha en échec, repli sur Gemini:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return extractInvoiceViaGemini(document);
}
