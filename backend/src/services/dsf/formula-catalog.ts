import { buildMappingCatalog } from "./formula-catalog.mapping";
import { buildBilanPaysageCatalog } from "./formula-catalog.bilan-paysage";
import { buildLegacyCatalog } from "./formula-catalog.legacy";
import { buildCustomCatalog, buildTftCustomOverrides } from "./formula-catalog.custom";
import { TFT_LINES } from "./tft-mapping.data";
import { FormulaCatalog } from "./formula-catalog.types";

export type { FormulaCatalog } from "./formula-catalog.types";

/**
 * Catalogue complet des formules du rapport DSF, servi tel quel par
 * `GET /api/dsf/formulas`. Fusionne les différentes sources: notes pilotées
 * par ACCOUNT_MAPPING, Bilan Paysage, notes ancien-style (sumAccounts),
 * notes au calcul mixte (note31, note16b, note16b_bis), et le TFT (formules
 * brutes de TFT_LINES + 4 lignes remplacées par un texte plus lisible).
 * Une note absente ici n'a simplement aucune formule disponible — le
 * frontend dégrade silencieusement vers une case non cliquable, ce n'est
 * pas une erreur.
 */
function buildTftCatalog(): FormulaCatalog {
  const overrides = buildTftCustomOverrides();
  const rows: Record<string, string> = {};
  for (const line of TFT_LINES) {
    if (overrides[line.ref]) {
      rows[line.ref] = overrides[line.ref];
    } else if (line.formula) {
      rows[line.ref] = line.formula;
    }
  }
  return { tableau_des_flux_tresorerie: { rows } };
}

export const FORMULA_CATALOG: FormulaCatalog = {
  ...buildMappingCatalog(),
  ...buildBilanPaysageCatalog(),
  ...buildLegacyCatalog(),
  ...buildCustomCatalog(),
  ...buildTftCatalog(),
};
