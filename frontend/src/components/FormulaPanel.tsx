// components/FormulaPanel.tsx
import React from "react";
import { X, Sigma } from "lucide-react";
import { useFormulaPanel } from "../contexts/FormulaPanelContext";

/**
 * Panneau latéral fixe affichant la formule de la dernière case cliquée
 * dans le rapport DSF. Non modal (pas de fond assombri): les clics
 * ailleurs dans l'application continuent de fonctionner pendant qu'il est
 * ouvert. Monté au niveau du layout (voir App.tsx), donc survit à la
 * navigation entre notes.
 */
export function FormulaPanel() {
  const { isOpen, activeLabel, activeFormula, close } = useFormulaPanel();

  if (!isOpen) return null;

  return (
    <div className="fixed top-11 right-0 bottom-0 z-40 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col border-l border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
          <Sigma className="h-4 w-4 text-orange-600" />
          Formule
        </div>
        <button
          onClick={close}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          title="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {activeLabel && (
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {activeLabel}
          </p>
        )}
        <p className="text-sm text-gray-800 dark:text-gray-200">
          {activeFormula || "Aucune formule disponible pour cette case."}
        </p>
      </div>
    </div>
  );
}

export default FormulaPanel;
