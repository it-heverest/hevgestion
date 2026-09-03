// src/controllers/invoice-scan.controller.ts
//
// Scanner de factures. Deux étapes, toutes deux en lecture seule:
//   1. extraction + contrôle de conformité
//   2. proposition d'écriture (jamais comptabilisée automatiquement)
//
// Aucune donnée n'est écrite en base: le comptable reste seul décideur.
import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { extractInvoice } from "../services/invoice-extraction.service";
import { checkConformity } from "../services/invoice-conformity.service";
import { proposeEntry } from "../services/invoice-entry.service";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

// ~15 Mo décodés, marge confortable sous la limite de corps d'express.json().
const MAX_BASE64_LENGTH = 20_000_000;

export class InvoiceScanController {
  /**
   * POST /api/invoice-scan/analyze
   * Corps: { document: { data, mimeType }, folderId? }
   */
  analyze = async (req: AuthRequest, res: Response) => {
    try {
      const { document, folderId } = req.body as {
        document?: { data?: string; mimeType?: string };
        folderId?: string;
      };

      if (!document?.data || !document?.mimeType) {
        return res.status(400).json({ message: "Document manquant." });
      }
      if (!ALLOWED_TYPES.has(document.mimeType)) {
        return res.status(400).json({
          message:
            "Format non supporté. Utilisez une image (JPEG, PNG, WEBP, HEIC) ou un PDF.",
        });
      }
      if (document.data.length > MAX_BASE64_LENGTH) {
        return res
          .status(400)
          .json({ message: "Le fichier est trop volumineux (15 Mo maximum)." });
      }

      // Les bornes de l'exercice permettent de signaler une facture hors
      // période, source classique de redressement.
      let exerciceRange: { start: Date; end: Date } | undefined;
      if (folderId) {
        const folder = await prisma.folder.findUnique({
          where: { id: folderId },
          select: { startDate: true, endDate: true },
        });
        if (folder) {
          exerciceRange = { start: folder.startDate, end: folder.endDate };
        }
      }

      const extraction = await extractInvoice({
        data: document.data,
        mimeType: document.mimeType,
      });

      const conformity = checkConformity(extraction, exerciceRange);
      const proposedEntry = proposeEntry(extraction, conformity);

      return res.json({ extraction, conformity, proposedEntry });
    } catch (error) {
      console.error("Erreur analyse de facture:", error);

      if (error instanceof Error) {
        if (error.message === "EXTRACTION_API_KEY_MISSING") {
          return res.status(503).json({
            message:
              "Le service de lecture de documents n'est pas configuré côté serveur (GEMINI_API_KEY).",
          });
        }
        if (error.message === "EXTRACTION_PROVIDER_OVERLOADED") {
          return res.status(503).json({
            message:
              "Le service de lecture est temporairement surchargé. Réessayez dans quelques instants.",
          });
        }
        if (
          error.message === "EXTRACTION_INVALID_JSON" ||
          error.message === "EXTRACTION_EMPTY_RESPONSE"
        ) {
          return res.status(502).json({
            message:
              "La facture n'a pas pu être lue. Vérifiez la netteté du document et réessayez.",
          });
        }
      }

      return res
        .status(502)
        .json({ message: "Une erreur est survenue lors de l'analyse de la facture." });
    }
  };
}

export const invoiceScanController = new InvoiceScanController();
