// components/rapport/shared/FormulaValue.tsx
import React from "react";
import { useFormulaPanel } from "../../../contexts/FormulaPanelContext";

interface FormulaValueProps {
  /** Clé du catalogue, ex. `note17.rows.${row.id}`. `null` si la note n'est
   * pas connectée au catalogue backend (utiliser `formula` à la place). */
  formulaKey?: string | null;
  /** Texte de la formule en clair (ex. "Ouverture + Acquisitions − Cessions"),
   * pour les notes dont le calcul est local (JS) et non dans le catalogue
   * backend. Prioritaire sur `formulaKey` si les deux sont fournis. */
  formula?: string | null;
  /** Libellé de la ligne, affiché en en-tête du panneau. */
  label: string;
  children: React.ReactNode;
}

/**
 * Enveloppe une case chiffrée du rapport DSF pour la rendre cliquable
 * ("voir la formule", comme dans Excel) et visuellement grisée. Se dégrade
 * silencieusement en case normale, non cliquable, quand ni `formula` ni
 * `formulaKey` ne donnent de texte — c'est le cas normal pour une case de
 * saisie manuelle ou tant que le catalogue est en cours de chargement.
 */
export function FormulaValue({ formulaKey, formula, label, children }: FormulaValueProps) {
  const { hasFormula, openFormula, openLocalFormula } = useFormulaPanel();
  const fromCatalog = !formula && formulaKey != null && hasFormula(formulaKey);
  const clickable = !!formula || fromCatalog;

  if (!clickable) return <>{children}</>;

  return (
    <span
      onClick={() =>
        formula ? openLocalFormula(formula, label) : openFormula(formulaKey!, label)
      }
      // `-m-1 p-1` annule le padding de la <td> parente (toujours p-1 dans
      // ces tableaux) puis le restitue sur ce span rendu `block` — le gris
      // remplit donc toute la cellule, pas juste une petite zone autour du
      // texte, tout en gardant l'alignement (text-right hérité de la <td>).
      className="cursor-pointer bg-gray-100 hover:bg-gray-200 hover:underline decoration-dotted underline-offset-2 block -m-1 p-1"
      title="Voir la formule"
    >
      {children}
    </span>
  );
}

export default FormulaValue;
