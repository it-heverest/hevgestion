import { buildMappingCatalog } from "./formula-catalog.mapping";
import { buildBilanPaysageCatalog } from "./formula-catalog.bilan-paysage";
import { FormulaCatalog } from "./formula-catalog.types";

export type { FormulaCatalog } from "./formula-catalog.types";

/**
 * Catalogue complet des formules du rapport DSF, servi tel quel par
 * `GET /api/dsf/formulas`. Fusionne les différentes sources (notes pilotées
 * par ACCOUNT_MAPPING, Bilan Paysage). Une note absente ici n'a simplement
 * aucune formule disponible — le frontend dégrade silencieusement vers une
 * case non cliquable, ce n'est pas une erreur.
 *
 * Étendu progressivement: la couverture actuelle correspond au lot pilote
 * (note1, note17, bilan_paysage). Les notes ancien-style (cf1_bis, cf2, ...)
 * et le TFT seront ajoutés dans une passe suivante.
 */
export const FORMULA_CATALOG: FormulaCatalog = {
  ...buildMappingCatalog(),
  ...buildBilanPaysageCatalog(),
};
