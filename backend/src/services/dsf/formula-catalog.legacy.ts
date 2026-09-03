import { getMappingLines } from "./account-mapping.data";
import { formatMappingLine, formatNetBalance } from "./formula-format.util";
import { FormulaCatalog } from "./formula-catalog.types";

/**
 * Formules scalaires (un seul champ, pas un tableau de lignes):
 * - Les 4 notes ancien style (`this.sumAccounts`) encore en usage:
 *   c1Note25, c1Note27A, c1Note28, c2Note28. `sumAccounts` renvoie un solde
 *   NET signé (débit − crédit), pas un SD/SC comme les notes neuves — d'où
 *   `formatNetBalance` plutôt que `formatMappingLine`.
 * - Les lignes "Dépréciations" des notes 8 et 11, qui sont des champs
 *   scalaires séparés (voir generateNote8/generateNote11), pas des lignes
 *   du tableau principal.
 */
export function buildLegacyCatalog(): FormulaCatalog {
  return {
    note25_c1: {
      impotsVersesExploitation: formatNetBalance(["64"]),
      impotsHAO: formatNetBalance(["848"]),
      total: formatNetBalance(["64", "848"]),
    },
    note27a_c1: {
      masseSalariale: formatNetBalance(["661", "662", "663", "664"]),
      irppVerse: formatNetBalance(["4472"]),
      centimesCommunaux: formatNetBalance(["4473"]),
      cfpVerse: formatNetBalance(["4474"]),
      total: formatNetBalance(["4472", "4473", "4474"]),
    },
    note28_c1: {
      reprisesExploitation: formatNetBalance(["791"]),
      reprisesFinancieres: formatNetBalance(["797"]),
      reprisesHAO: formatNetBalance(["867"]),
      total: formatNetBalance(["791", "797", "867"]),
    },
    note28_c2: {
      dotationsExploitation: formatNetBalance(["691"]),
      dotationsFinancieres: formatNetBalance(["697"]),
      dotationsHAO: formatNetBalance(["857"]),
      total: formatNetBalance(["691", "697", "857"]),
    },
    note8: {
      depreciations: formatMappingLine(getMappingLines("8")[10]),
    },
    note11: {
      depreciations: formatMappingLine(getMappingLines("11")[6]),
    },
  };
}
