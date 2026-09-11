// src/services/dsf/mapping-resolver.ts
//
// Remplace `getMappingLines`/`getMappingLine` (statique, ACCOUNT_MAPPING en
// dur) par une version consciente de la config admin "Mapping comptable"
// (DSFComptableConfig en base). Fallback intégral vers le statique tant
// qu'aucune config n'a été créée pour une catégorie — comportement
// identique à aujourd'hui pour toute note jamais seedée/éditée.
//
// Résolution en un seul aller-retour DB (resolveAllMappingLines), plutôt
// qu'un appel par note : le résultat est attaché une fois pour toutes sur
// le `folder` de la requête en cours (voir dsf-generator.service.ts,
// generateAllNotes) et relu de façon synchrone par chaque générateur de
// note — ceux-ci restent donc synchrones, pas besoin de les convertir un
// par un en async/await (folder est déjà propre à chaque requête, jamais
// partagé entre requêtes concurrentes : le muter est sans risque).
import { prisma } from "../../lib/prisma";
import {
  BalanceSide,
  MappingLine,
  getAllMappingNoteCodes,
  getMappingLines,
  noteCodeToCategory,
} from "./account-mapping.data";

interface FolderScope {
  id: string;
  clientId: string;
}

/** Reconstruit une MappingLine (accounts/excludedAccounts/side) à partir des
 * opérations signées d'une DSFComptableConfig, pour rester un remplacement
 * transparent de sumMappingLine/sumMovement aux points d'appel existants.
 * Hypothèse (vraie pour les défauts seedés et les éditions usuelles) : une
 * ligne ne mélange pas plusieurs sources SD/SC — si elle le fait, la
 * dernière source SD/SC rencontrée l'emporte pour `side`. */
function operationsToLine(libelle: string, operations: string[]): MappingLine {
  const accounts: string[] = [];
  const excludedAccounts: string[] = [];
  let side: BalanceSide = "SD";

  for (const op of operations) {
    const isExclusion = op.startsWith("-");
    const rest = op.replace(/^[+-]/, "");
    const source = rest.slice(-2);
    const account = rest.slice(0, -2);
    if (!account) continue;
    if (source === "SD" || source === "SC") side = source;
    if (isExclusion) excludedAccounts.push(account);
    else accounts.push(account);
  }

  return { label: libelle, accounts, excludedAccounts, side };
}

/**
 * Résout, en un seul aller-retour DB, les MappingLine effectives de toutes
 * les notes couvertes par le moteur statique (ACCOUNT_MAPPING), en tenant
 * compte des surcharges/défauts stockés en base (DSFComptableConfig) pour
 * ce dossier/client. Une note jamais seedée/éditée retombe sur sa
 * MappingLine[] statique — comportement inchangé.
 */
export async function resolveAllMappingLines(
  folder: FolderScope
): Promise<Map<string, MappingLine[]>> {
  const noteCodes = getAllMappingNoteCodes();
  const categories = noteCodes.map(noteCodeToCategory);

  const configs = await prisma.dSFConfig.findMany({
    where: { category: { in: categories } },
    include: { comptableConfigs: { where: { isActive: true } } },
  });
  const byCategory = new Map(configs.map((c) => [c.category, c]));

  const result = new Map<string, MappingLine[]>();

  for (const noteCode of noteCodes) {
    const config = byCategory.get(noteCodeToCategory(noteCode));
    if (!config || config.comptableConfigs.length === 0) {
      result.set(noteCode, getMappingLines(noteCode));
      continue;
    }

    // Une config ACCOUNTANT scoped à ce dossier (ou à ce client, sans
    // exercice précis) l'emporte sur la config SYSTEM pour le même codeDsf.
    const byCode = new Map<string, (typeof config.comptableConfigs)[number]>();
    for (const c of config.comptableConfigs) {
      if (c.ownerType === "SYSTEM") {
        if (!byCode.has(c.codeDsf)) byCode.set(c.codeDsf, c);
        continue;
      }
      const matchesFolder = c.exerciseId === folder.id;
      const matchesClient = c.clientId === folder.clientId && !c.exerciseId;
      if (matchesFolder || matchesClient) {
        byCode.set(c.codeDsf, c);
      }
    }

    const lines = Array.from(byCode.values())
      .sort((a, b) => a.codeDsf.localeCompare(b.codeDsf, undefined, { numeric: true }))
      .map((c) => operationsToLine(c.libelle, c.operations));
    result.set(noteCode, lines);
  }

  return result;
}
