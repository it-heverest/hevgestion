// src/controllers/dsf-assistant.controller.ts
import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  dsfAssistantService,
  ChatAttachment,
  ChatTurn,
} from "../services/dsf-assistant.service";
import {
  AssistantProvider,
  getAssistantSettings,
  getProviderAvailability,
  setAssistantSettings,
} from "../services/assistant-settings.service";
import { listOpenRouterModels } from "../services/openrouter-chat.service";
import { config } from "../config";

const VALID_PROVIDERS = new Set<AssistantProvider>(["groq", "openrouter"]);

const MAX_HISTORY_TURNS = 10;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);
// ~15MB decoded, generous margin under the 50mb express.json() body limit.
const MAX_ATTACHMENT_BASE64_LENGTH = 20_000_000;

export class DSFAssistantController {
  async chat(req: AuthRequest, res: Response) {
    try {
      const { question, history, attachment } = req.body as {
        question?: string;
        history?: ChatTurn[];
        attachment?: ChatAttachment;
      };

      const trimmedQuestion = typeof question === "string" ? question.trim() : "";

      let safeAttachment: ChatAttachment | undefined;
      if (attachment) {
        if (
          typeof attachment.data !== "string" ||
          typeof attachment.mimeType !== "string" ||
          !attachment.data
        ) {
          return res.status(400).json({ message: "Pièce jointe invalide" });
        }
        if (!ALLOWED_ATTACHMENT_TYPES.has(attachment.mimeType)) {
          return res.status(400).json({
            message:
              "Type de fichier non supporté. Utilisez une image (JPEG, PNG, WEBP) ou un PDF.",
          });
        }
        if (attachment.data.length > MAX_ATTACHMENT_BASE64_LENGTH) {
          return res.status(400).json({
            message: "Le fichier est trop volumineux (15 Mo maximum).",
          });
        }
        safeAttachment = {
          data: attachment.data,
          mimeType: attachment.mimeType,
          name: typeof attachment.name === "string" ? attachment.name : undefined,
        };
      }

      if (!trimmedQuestion && !safeAttachment) {
        return res.status(400).json({ message: "La question est requise" });
      }

      const safeHistory = Array.isArray(history)
        ? history
            .filter(
              (turn): turn is ChatTurn =>
                !!turn &&
                (turn.role === "user" || turn.role === "assistant") &&
                typeof turn.content === "string",
            )
            .slice(-MAX_HISTORY_TURNS)
        : [];

      const answer = await dsfAssistantService.ask(
        trimmedQuestion,
        safeHistory,
        safeAttachment,
      );

      return res.json({ answer });
    } catch (error) {
      console.error("Error in DSF assistant chat:", error);

      if (error instanceof Error && error.message === "ASSISTANT_API_KEY_MISSING") {
        return res.status(503).json({
          message: "Le service IA n'est pas encore configuré côté serveur.",
        });
      }

      if (error instanceof Error && error.message === "ASSISTANT_PROVIDER_OVERLOADED") {
        return res.status(503).json({
          message:
            "Le service IA est temporairement surchargé. Veuillez réessayer dans quelques instants.",
        });
      }

      if (error instanceof Error && error.message === "ASSISTANT_EMPTY_RESPONSE") {
        return res.status(502).json({
          message:
            "Le modèle n'a pas produit de réponse exploitable après plusieurs tentatives. " +
            "Reformulez la question plus brièvement, ou changez de modèle dans Paramètres.",
        });
      }

      return res.status(502).json({
        message: "Une erreur est survenue lors de la génération de la réponse.",
      });
    }
  }

  /** GET /api/assistant/settings — réglage courant + fournisseurs utilisables */
  async getSettings(req: AuthRequest, res: Response) {
    try {
      const current = await getAssistantSettings();
      return res.json({
        current,
        availability: getProviderAvailability(),
        defaults: {
          groq: config.groq.model,
          openrouter: config.openrouter.model,
        },
      });
    } catch (error) {
      console.error("Erreur lecture réglages assistant:", error);
      return res
        .status(500)
        .json({ message: "Impossible de lire les réglages de l'assistant." });
    }
  }

  /** PUT /api/assistant/settings — change le fournisseur et le modèle */
  async updateSettings(req: AuthRequest, res: Response) {
    try {
      const { provider, model } = req.body as {
        provider?: string;
        model?: string;
      };

      if (!provider || !VALID_PROVIDERS.has(provider as AssistantProvider)) {
        return res.status(400).json({
          message: "Fournisseur invalide (valeurs acceptées: groq, openrouter).",
        });
      }
      if (!model || typeof model !== "string" || !model.trim()) {
        return res.status(400).json({ message: "Le modèle est requis." });
      }

      // Refuser un fournisseur dont la clé d'API n'est pas configurée: sinon
      // l'erreur ne se manifesterait qu'au premier message de l'utilisateur.
      const availability = getProviderAvailability();
      if (!availability[provider as AssistantProvider]) {
        return res.status(400).json({
          message: `La clé d'API du fournisseur « ${provider} » n'est pas configurée côté serveur.`,
        });
      }

      const saved = await setAssistantSettings(
        { provider: provider as AssistantProvider, model },
        req.user?.userId,
      );

      return res.json({ current: saved });
    } catch (error) {
      console.error("Erreur enregistrement réglages assistant:", error);
      return res
        .status(500)
        .json({ message: "Impossible d'enregistrer les réglages." });
    }
  }

  /** GET /api/assistant/models — modèles proposés par OpenRouter */
  async listModels(req: AuthRequest, res: Response) {
    try {
      const models = await listOpenRouterModels();
      return res.json({ models });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "ASSISTANT_API_KEY_MISSING"
      ) {
        return res.status(503).json({
          message:
            "La clé d'API OpenRouter n'est pas configurée côté serveur (OPENROUTER_API_KEY).",
        });
      }
      console.error("Erreur récupération des modèles OpenRouter:", error);
      return res
        .status(502)
        .json({ message: "Impossible de récupérer la liste des modèles." });
    }
  }
}

export const dsfAssistantController = new DSFAssistantController();
