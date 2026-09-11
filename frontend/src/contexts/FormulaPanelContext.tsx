// contexts/FormulaPanelContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { formulaCatalogService, FormulaCatalog } from "../services/formula-catalog.service";

interface FormulaPanelContextType {
  isOpen: boolean;
  activeLabel: string | null;
  activeFormula: string | null;
  openFormula: (key: string, label: string) => void;
  /** Ouvre le panneau avec un texte de formule fourni directement par la
   * note (calcul local en JS), pour les notes non encore connectées au
   * catalogue backend — pas de lookup, toujours affiché. */
  openLocalFormula: (formula: string, label: string) => void;
  close: () => void;
  hasFormula: (key: string) => boolean;
}

const FormulaPanelContext = createContext<FormulaPanelContextType | undefined>(undefined);

/** Aplati le catalogue en Map<"noteKey.champ.id", texte> pour des lookups instantanés. */
function flattenCatalog(catalog: FormulaCatalog): Map<string, string> {
  const flat = new Map<string, string>();
  for (const [noteKey, fields] of Object.entries(catalog)) {
    for (const [fieldName, value] of Object.entries(fields)) {
      if (typeof value === "string") {
        flat.set(`${noteKey}.${fieldName}`, value);
      } else {
        for (const [rowId, text] of Object.entries(value)) {
          flat.set(`${noteKey}.${fieldName}.${rowId}`, text);
        }
      }
    }
  }
  return flat;
}

export const FormulaPanelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [localFormula, setLocalFormula] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  // État (pas une ref): le catalogue arrive de façon asynchrone après le
  // premier rendu des cases du rapport — il faut redéclencher un rendu pour
  // qu'elles deviennent cliquables une fois chargé.
  const [flatCatalog, setFlatCatalog] = useState<Map<string, string>>(new Map());
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    formulaCatalogService
      .getCatalog()
      .then((catalog) => {
        setFlatCatalog(flattenCatalog(catalog));
      })
      .catch((error) => {
        console.error("Impossible de charger le catalogue de formules:", error);
      });
  }, []);

  const hasFormula = useCallback(
    (key: string) => flatCatalog.has(key),
    [flatCatalog],
  );

  const openFormula = useCallback(
    (key: string, label: string) => {
      if (!flatCatalog.has(key)) return;
      setLocalFormula(null);
      setActiveKey(key);
      setActiveLabel(label);
      setIsOpen(true);
    },
    [flatCatalog],
  );

  const openLocalFormula = useCallback((formula: string, label: string) => {
    setActiveKey(null);
    setLocalFormula(formula);
    setActiveLabel(label);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const activeFormula =
    localFormula ?? (activeKey ? flatCatalog.get(activeKey) ?? null : null);

  return (
    <FormulaPanelContext.Provider
      value={{
        isOpen,
        activeLabel,
        activeFormula,
        openFormula,
        openLocalFormula,
        close,
        hasFormula,
      }}
    >
      {children}
    </FormulaPanelContext.Provider>
  );
};

export function useFormulaPanel(): FormulaPanelContextType {
  const ctx = useContext(FormulaPanelContext);
  if (!ctx) {
    throw new Error("useFormulaPanel must be used within a FormulaPanelProvider");
  }
  return ctx;
}
