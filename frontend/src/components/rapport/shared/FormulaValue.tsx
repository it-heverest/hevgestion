// components/rapport/shared/FormulaValue.tsx
import React from "react";
import { useFormulaPanel } from "../../../contexts/FormulaPanelContext";

interface FormulaValueProps {
  /** Clé du catalogue, ex. `note17.rows.${row.id}`. `null` désactive tout clic (ex. en mode édition). */
  formulaKey: string | null;
  /** Libellé de la ligne, affiché en en-tête du panneau. */
  label: string;
  children: React.ReactNode;
}

/**
 * Enveloppe une case chiffrée du rapport DSF pour la rendre cliquable
 * ("voir la formule", comme dans Excel). Se dégrade silencieusement en case
 * normale, non cliquable, quand aucune formule n'est disponible pour cette
 * clé — c'est le cas normal pour une note sans mapping de comptes (saisie
 * manuelle) ou tant que le catalogue est en cours de chargement.
 */
export function FormulaValue({ formulaKey, label, children }: FormulaValueProps) {
  const { hasFormula, openFormula } = useFormulaPanel();
  const clickable = formulaKey !== null && hasFormula(formulaKey);

  if (!clickable) return <>{children}</>;

  return (
    <span
      onClick={() => openFormula(formulaKey!, label)}
      className="cursor-pointer hover:underline decoration-dotted underline-offset-2"
      title="Voir la formule"
    >
      {children}
    </span>
  );
}

export default FormulaValue;
