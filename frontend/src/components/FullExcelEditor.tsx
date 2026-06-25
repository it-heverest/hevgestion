import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
  Download,
  Save,
  RefreshCw,
  Lock,
  Unlock,
  ArrowLeft,
  FileSpreadsheet,
  Upload,
  Undo2,
  Redo2,
  AlertTriangle,
  FileText,
  Info,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";

interface FullExcelEditorProps {
  reportName: string;
  reportId: string;
  onSave: (data: any) => void;
  onBack: () => void;
  initialData?: any[];
  balanceType?: "current" | "previous";
  uploadedFile?: File;
}

interface CellData {
  value: string | number;
  formula?: string;
  formattedValue?: string;
  bold?: boolean;
  bgColor?: string;
  align?: "left" | "center" | "right";
  locked?: boolean;
}

interface HistoryState {
  data: Record<string, CellData>;
  timestamp: number;
}

// Fonction utilitaire pour formater les nombres
const formatNumber = (num: number): string => {
  return num.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
};

export function FullExcelEditor({
  reportName,
  reportId,
  onSave,
  onBack,
  initialData = [],
  balanceType = "current",
  uploadedFile,
}: FullExcelEditorProps) {
  const { user } = useAuth();
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<string[]>([]);
  const [formulaBarValue, setFormulaBarValue] = useState("");
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Historique pour undo/redo
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const gridRef = useRef<HTMLTableElement>(null);

  // Déterminer le type de rapport
  const getReportCategory = ():
    | "balance"
    | "bilan"
    | "compte-resultat"
    | "note"
    | "fiche"
    | "annexe"
    | "dsf"
    | "generic" => {
    if (uploadedFile) return "dsf";

    const id = reportId.toLowerCase();
    if (id.includes("balance")) return "balance";
    if (id.includes("bilan")) return "bilan";
    if (id.includes("resultat") || id.includes("compte"))
      return "compte-resultat";
    if (id.includes("note")) return "note";
    if (id.includes("fiche")) return "fiche";
    if (id.includes("annexe")) return "annexe";

    // Fallback basé sur le nom
    const name = reportName.toLowerCase();
    if (name.includes("bilan")) return "bilan";
    if (name.includes("compte de résultat")) return "compte-resultat";

    return "generic";
  };

  const reportCategory = getReportCategory();

  // Convertir les données selon le type de rapport
  const convertDataToGridFormat = useCallback(
    (data: any[]): Record<string, CellData> => {
      switch (reportCategory) {
        case "balance":
          return convertBalanceToGridData(data);
        case "bilan":
          return convertBilanToGridData(data);
        case "compte-resultat":
          return convertCompteResultatToGridData(data);
        case "dsf":
          return generateEmptyGrid();
        default:
          return convertGenericToGridData(data);
      }
    },
    [reportCategory]
  );

  // Convertir les données de balance
  const convertBalanceToGridData = (
    balanceData: any[]
  ): Record<string, CellData> => {
    const gridData: Record<string, CellData> = {};
    const headers = [
      "Compte",
      "Libellé",
      "Entrée Débit",
      "Entrée Crédit",
      "Mouvement Débit",
      "Mouvement Crédit",
      "Solde Débit",
      "Solde Crédit",
    ];

    // En-têtes
    headers.forEach((header, index) => {
      const cellKey = `${String.fromCharCode(65 + index)}1`;
      gridData[cellKey] = {
        value: header,
        bold: true,
        bgColor: "#d3d3d3ff",
        align: "center" as const,
      };
    });

    // Données
    balanceData.forEach((row, rowIndex) => {
      const rowNum = rowIndex + 2;
      const rowData = [
        row.compte,
        row.libelle,
        row.entre_debit,
        row.entre_credit,
        row.mouvement_debit,
        row.mouvement_credit,
        row.solde_debit,
        row.solde_credit,
      ];

      rowData.forEach((value, colIndex) => {
        const cellKey = `${String.fromCharCode(65 + colIndex)}${rowNum}`;
        const isNumber = typeof value === "number";

        gridData[cellKey] = {
          value: value,
          formattedValue: isNumber ? formatNumber(value) : String(value),
          align: isNumber ? ("right" as const) : ("left" as const),
        };
      });
    });

    return gridData;
  };

  // Convertir les données de bilan
  const convertBilanToGridData = (
    bilanData: any[]
  ): Record<string, CellData> => {
    const gridData: Record<string, CellData> = {};

    // En-têtes pour bilan
    const headers = ["Rubrique", "Montant N", "Montant N-1", "Variation"];

    headers.forEach((header, index) => {
      const cellKey = `${String.fromCharCode(65 + index)}1`;
      gridData[cellKey] = {
        value: header,
        bold: true,
        bgColor: "#d3d3d3ff",
        align: "center" as const,
      };
    });

    // Données de bilan
    bilanData.forEach((item, index) => {
      const rowNum = index + 2;
      gridData[`A${rowNum}`] = { value: item.rubrique || item.libelle || "" };
      gridData[`B${rowNum}`] = {
        value: item.montant_n || 0,
        formattedValue: formatNumber(item.montant_n || 0),
        align: "right" as const,
      };
      gridData[`C${rowNum}`] = {
        value: item.montant_n1 || 0,
        formattedValue: formatNumber(item.montant_n1 || 0),
        align: "right" as const,
      };
      gridData[`D${rowNum}`] = {
        value: item.variation || 0,
        formattedValue: formatNumber(item.variation || 0),
        align: "right" as const,
      };
    });

    return gridData;
  };

  // Convertir les données de compte de résultat
  const convertCompteResultatToGridData = (
    crData: any[]
  ): Record<string, CellData> => {
    const gridData: Record<string, CellData> = {};

    const headers = ["Poste", "Montant", "Pourcentage"];

    headers.forEach((header, index) => {
      const cellKey = `${String.fromCharCode(65 + index)}1`;
      gridData[cellKey] = {
        value: header,
        bold: true,
        bgColor: "#d3d3d3ff",
        align: "center" as const,
      };
    });

    crData.forEach((item, index) => {
      const rowNum = index + 2;
      gridData[`A${rowNum}`] = { value: item.poste || item.libelle || "" };
      gridData[`B${rowNum}`] = {
        value: item.montant || 0,
        formattedValue: formatNumber(item.montant || 0),
        align: "right" as const,
      };
      gridData[`C${rowNum}`] = {
        value: item.pourcentage || 0,
        formattedValue: `${item.pourcentage || 0}%`,
        align: "right" as const,
      };
    });

    return gridData;
  };

  // Convertir données génériques
  const convertGenericToGridData = (data: any[]): Record<string, CellData> => {
    const gridData: Record<string, CellData> = {};

    if (!data || data.length === 0) return generateEmptyGrid();

    // Utiliser la première ligne comme en-têtes
    const firstRow = data[0];
    const headers = Object.keys(firstRow);

    headers.forEach((header, colIndex) => {
      const cellKey = `${String.fromCharCode(65 + colIndex)}1`;
      gridData[cellKey] = {
        value: header,
        bold: true,
        bgColor: "#d3d3d3ff",
        align: "center" as const,
      };
    });

    // Données
    data.forEach((row, rowIndex) => {
      const rowNum = rowIndex + 2;
      headers.forEach((header, colIndex) => {
        const cellKey = `${String.fromCharCode(65 + colIndex)}${rowNum}`;
        const value = row[header];
        const isNumber = typeof value === "number";

        gridData[cellKey] = {
          value: value,
          formattedValue: isNumber ? formatNumber(value) : String(value || ""),
          align: isNumber ? ("right" as const) : ("left" as const),
        };
      });
    });

    return gridData;
  };

  // Générer une grille vide
  const generateEmptyGrid = (): Record<string, CellData> => {
    const gridData: Record<string, CellData> = {};

    // Ajouter quelques en-têtes par défaut
    const defaultHeaders = ["Colonne A", "Colonne B", "Colonne C", "Colonne D"];

    defaultHeaders.forEach((header, index) => {
      const cellKey = `${String.fromCharCode(65 + index)}1`;
      gridData[cellKey] = {
        value: header,
        bold: true,
        bgColor: "#d3d3d3ff",
        align: "center" as const,
      };
    });

    return gridData;
  };

  // Charger le fichier Excel uploadé
  const loadUploadedFile = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convertir en données JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Convertir en format de grille
      const gridData = convertExcelToGridData(jsonData);

      setSheetData(gridData);
      setOriginalData(JSON.parse(JSON.stringify(gridData)));

      // Réinitialiser l'historique
      setHistory([
        { data: JSON.parse(JSON.stringify(gridData)), timestamp: Date.now() },
      ]);
      setHistoryIndex(0);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Erreur chargement fichier:", error);
      alert("Erreur lors du chargement du fichier");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Convertir les données Excel en format de grille
  const convertExcelToGridData = (
    excelData: any[][]
  ): Record<string, CellData> => {
    const gridData: Record<string, CellData> = {};

    excelData.forEach((row, rowIndex) => {
      row.forEach((cellValue, colIndex) => {
        if (cellValue !== null && cellValue !== undefined) {
          const cellKey = `${String.fromCharCode(65 + colIndex)}${
            rowIndex + 1
          }`;
          const isNumber = typeof cellValue === "number";

          gridData[cellKey] = {
            value: cellValue,
            formattedValue: isNumber
              ? formatNumber(cellValue)
              : String(cellValue),
            align: isNumber ? ("right" as const) : ("left" as const),
          };
        }
      });
    });

    return gridData;
  };

  // Données originales pour la réinitialisation
  const [originalData, setOriginalData] = useState<Record<string, CellData>>(
    initialData && initialData.length > 0
      ? convertDataToGridFormat(initialData)
      : generateSampleData(reportId, reportCategory)
  );

  // Données actuelles
  const [sheetData, setSheetData] =
    useState<Record<string, CellData>>(originalData);

  // Colonnes et lignes étendues pour le plein écran
  const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const rows = Array.from({ length: 50 }, (_, i) => i + 1);

  // Charger le fichier uploadé si présent
  useEffect(() => {
    if (uploadedFile) {
      loadUploadedFile(uploadedFile);
    }
  }, [uploadedFile, loadUploadedFile]);

  // Mettre à jour les données quand initialData change
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      const newData = convertDataToGridFormat(initialData);
      setOriginalData(newData);
      setSheetData(newData);

      // Réinitialiser l'historique
      setHistory([
        { data: JSON.parse(JSON.stringify(newData)), timestamp: Date.now() },
      ]);
      setHistoryIndex(0);
      setHasUnsavedChanges(false);
    }
  }, [initialData, convertDataToGridFormat]);

  // Initialiser l'historique
  useEffect(() => {
    if (history.length === 0) {
      addToHistory(sheetData);
    }
  }, []);

  const addToHistory = useCallback(
    (data: Record<string, CellData>) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        data: JSON.parse(JSON.stringify(data)),
        timestamp: Date.now(),
      });

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setHasUnsavedChanges(true);
    },
    [history, historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSheetData(JSON.parse(JSON.stringify(history[newIndex].data)));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSheetData(JSON.parse(JSON.stringify(history[newIndex].data)));
    }
  }, [history, historyIndex]);

  // Réinitialiser aux données originales
  const handleReset = () => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir réinitialiser toutes les modifications ?"
      )
    ) {
      setSheetData(JSON.parse(JSON.stringify(originalData)));
      setHistory([
        {
          data: JSON.parse(JSON.stringify(originalData)),
          timestamp: Date.now(),
        },
      ]);
      setHistoryIndex(0);
      setHasUnsavedChanges(false);
      setSelectedCell(null);
      setSelectedRange([]);
      setFormulaBarValue("");
    }
  };

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z pour undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y ou Ctrl+Shift+Z pour redo
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
      // Ctrl+C pour copier
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        handleCopy();
      }
      // Ctrl+V pour coller
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        handlePaste();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const isCellLocked = (cellKey: string): boolean => {
    if (user?.role === "ADMIN") return false;

    const cellData = sheetData[cellKey];
    if (user?.role === "ASSISTANT") {
      return cellData?.value !== undefined && cellData?.value !== "";
    }

    if (user?.role === "COMPTABLE") {
      return cellData?.formula !== undefined || cellData?.bold === true;
    }

    return false;
  };

  const formatCellValue = (cellData: CellData | undefined): string => {
    if (!cellData) return "";
    return cellData.formattedValue || cellData.value?.toString() || "";
  };

  const handleCellClick = (cellKey: string, e: React.MouseEvent) => {
    if (e.shiftKey && selectedCell) {
      // Sélection de plage avec Shift
      const startCell = selectedCell;
      const endCell = cellKey;
      const range = getCellRange(startCell, endCell);
      setSelectedRange(range);
    } else {
      // Sélection simple
      setSelectedCell(cellKey);
      setSelectedRange([cellKey]);
      const cellData = sheetData[cellKey];
      setFormulaBarValue(
        cellData?.formula || cellData?.value?.toString() || ""
      );
    }
  };

  const getCellRange = (start: string, end: string): string[] => {
    const startCol = start.charCodeAt(0);
    const startRow = parseInt(start.slice(1));
    const endCol = end.charCodeAt(0);
    const endRow = parseInt(end.slice(1));

    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    const range: string[] = [];
    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        range.push(`${String.fromCharCode(col)}${row}`);
      }
    }
    return range;
  };

  const handleCellDoubleClick = (cellKey: string) => {
    if (isCellLocked(cellKey)) return;

    setEditingCell(cellKey);
    setSelectedCell(cellKey);
    const cellData = sheetData[cellKey];
    setFormulaBarValue(cellData?.formula || cellData?.value?.toString() || "");
  };

  const evaluateFormula = (formula: string): number => {
    try {
      if (formula.startsWith("=SUM(")) {
        const range = formula.match(/=SUM\(([A-Z]\d+):([A-Z]\d+)\)/);
        if (range) {
          const [, start, end] = range;
          let sum = 0;

          const startRow = parseInt(start.slice(1));
          const endRow = parseInt(end.slice(1));
          const col = start[0];

          for (let r = startRow; r <= endRow; r++) {
            const cellKey = `${col}${r}`;
            const value = sheetData[cellKey]?.value;
            sum += typeof value === "number" ? value : 0;
          }
          return sum;
        }
      }

      const simpleFormula = formula.substring(1);
      const cellRefs = simpleFormula.match(/[A-Z]\d+/g) || [];

      let evaluatedFormula = simpleFormula;
      cellRefs.forEach((ref) => {
        const value =
          typeof sheetData[ref]?.value === "number" ? sheetData[ref].value : 0;
        evaluatedFormula = evaluatedFormula.replace(ref, value.toString());
      });

      const result = Function(`'use strict'; return (${evaluatedFormula})`)();
      return typeof result === "number" ? result : 0;
    } catch (error) {
      return 0;
    }
  };

  const handleFormulaBarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && selectedCell) {
      if (isCellLocked(selectedCell)) {
        setEditingCell(null);
        return;
      }

      const isFormula = formulaBarValue.startsWith("=");
      let calculatedValue = formulaBarValue;

      if (isFormula) {
        const numValue = evaluateFormula(formulaBarValue);
        calculatedValue = numValue.toString();
      }

      const newData = {
        ...sheetData,
        [selectedCell]: {
          ...sheetData[selectedCell],
          value: isFormula ? parseFloat(calculatedValue) || 0 : formulaBarValue,
          formula: isFormula ? formulaBarValue : undefined,
          formattedValue: isFormula
            ? formatNumber(parseFloat(calculatedValue) || 0)
            : formulaBarValue,
        },
      };

      setSheetData(newData);
      setEditingCell(null);
      addToHistory(newData);
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const handleSave = () => {
    // Convertir les données de grille vers le format approprié selon le type
    let exportData;

    switch (reportCategory) {
      case "balance":
        exportData = convertGridToBalanceData(sheetData);
        break;
      case "bilan":
        exportData = convertGridToBilanData(sheetData);
        break;
      case "compte-resultat":
        exportData = convertGridToCompteResultatData(sheetData);
        break;
      default:
        exportData = convertGridToGenericData(sheetData);
    }

    onSave(exportData);
    setHasUnsavedChanges(false);
    setOriginalData(JSON.parse(JSON.stringify(sheetData)));
  };

  // Convertir les données de grille vers le format de balance
  const convertGridToBalanceData = (
    gridData: Record<string, CellData>
  ): any[] => {
    const balanceData: any[] = [];

    for (let row = 2; row <= 50; row++) {
      const compte = gridData[`A${row}`]?.value;

      if (compte && compte.toString().trim() !== "") {
        balanceData.push({
          compte: gridData[`A${row}`]?.value?.toString() || "",
          libelle: gridData[`B${row}`]?.value?.toString() || "",
          entre_debit: Number(gridData[`C${row}`]?.value) || 0,
          entre_credit: Number(gridData[`D${row}`]?.value) || 0,
          mouvement_debit: Number(gridData[`E${row}`]?.value) || 0,
          mouvement_credit: Number(gridData[`F${row}`]?.value) || 0,
          sortir_debit: Number(gridData[`G${row}`]?.value) || 0,
          sortir_credit: Number(gridData[`H${row}`]?.value) || 0,
          solde_debit: Number(gridData[`I${row}`]?.value) || 0,
          solde_credit: Number(gridData[`J${row}`]?.value) || 0,
        });
      }
    }

    return balanceData;
  };

  // Convertir les données de grille vers le format de bilan
  const convertGridToBilanData = (
    gridData: Record<string, CellData>
  ): any[] => {
    const bilanData: any[] = [];

    for (let row = 2; row <= 50; row++) {
      const rubrique = gridData[`A${row}`]?.value;

      if (rubrique && rubrique.toString().trim() !== "") {
        bilanData.push({
          rubrique: rubrique.toString(),
          montant_n: Number(gridData[`B${row}`]?.value) || 0,
          montant_n1: Number(gridData[`C${row}`]?.value) || 0,
          variation: Number(gridData[`D${row}`]?.value) || 0,
        });
      }
    }

    return bilanData;
  };

  // Convertir les données de grille vers le format de compte de résultat
  const convertGridToCompteResultatData = (
    gridData: Record<string, CellData>
  ): any[] => {
    const crData: any[] = [];

    for (let row = 2; row <= 50; row++) {
      const poste = gridData[`A${row}`]?.value;

      if (poste && poste.toString().trim() !== "") {
        crData.push({
          poste: poste.toString(),
          montant: Number(gridData[`B${row}`]?.value) || 0,
          pourcentage: Number(gridData[`C${row}`]?.value) || 0,
        });
      }
    }

    return crData;
  };

  // Convertir les données de grille vers un format générique
  const convertGridToGenericData = (
    gridData: Record<string, CellData>
  ): any[] => {
    const genericData: any[] = [];

    // Trouver les en-têtes
    const headers: string[] = [];
    for (let col = 0; col < columns.length; col++) {
      const header = gridData[`${columns[col]}1`]?.value?.toString();
      if (header && header.trim() !== "") {
        headers.push(header);
      }
    }

    if (headers.length === 0) return [];

    // Ajouter les données
    for (let row = 2; row <= 50; row++) {
      const firstCell = gridData[`A${row}`]?.value;
      if (firstCell && firstCell.toString().trim() !== "") {
        const rowData: any = {};
        headers.forEach((header, colIndex) => {
          const cellKey = `${columns[colIndex]}${row}`;
          rowData[header] = gridData[cellKey]?.value || "";
        });
        genericData.push(rowData);
      }
    }

    return genericData;
  };

  const handleExportExcel = () => {
    try {
      const worksheet = XLSX.utils.aoa_to_sheet(convertToAOA(sheetData));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, reportName);
      XLSX.writeFile(workbook, `${reportName}_${new Date().getTime()}.xlsx`);
    } catch (error) {
      console.error("Erreur export Excel:", error);
      alert("Erreur lors de l'export Excel");
    }
  };

  const handleExportPDF = () => {
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Veuillez autoriser les pop-ups pour l'export PDF");
        return;
      }

      const tableHTML = generateTableHTML();

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${reportName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px;
                color: #333;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px;
                border-bottom: 2px solid #d3d3d3ff;
                padding-bottom: 10px;
              }
              .header h1 { 
                color: #d3d3d3ff; 
                margin: 0;
                font-size: 24px;
              }
              .header .subtitle { 
                color: #666; 
                margin-top: 5px;
                font-size: 14px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px 12px;
                text-align: left;
                font-size: 12px;
              }
              th {
                background-color: #f8f9fa;
                font-weight: bold;
              }
              .bold { font-weight: bold; }
              .center { text-align: center; }
              .right { text-align: right; }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 10px;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${reportName}</h1>
              <div class="subtitle">${reportId} - ${getReportTypeDisplayName(
        reportCategory
      )} - Généré le ${new Date().toLocaleDateString("fr-FR")}</div>
            </div>
            ${tableHTML}
            <div class="footer">
              Document généré par SYSCOHADA - ${new Date().getFullYear()}
            </div>
            <div class="no-print" style="margin-top: 20px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #d3d3d3ff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Imprimer / Sauvegarder en PDF
              </button>
              <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                Fermer
              </button>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
    } catch (error) {
      console.error("Erreur export PDF:", error);
      alert("Erreur lors de l'export PDF");
    }
  };

  const generateTableHTML = (): string => {
    const aoa = convertToAOA(sheetData);

    let tableHTML = "<table>";

    // En-têtes de colonnes
    tableHTML += "<thead><tr>";
    tableHTML += "<th></th>";
    columns.forEach((col) => {
      tableHTML += `<th>${col}</th>`;
    });
    tableHTML += "</tr></thead>";

    // Données
    tableHTML += "<tbody>";
    aoa.forEach((row, rowIndex) => {
      tableHTML += "<tr>";
      tableHTML += `<td style="background-color: #f8f9fa; font-weight: bold;">${
        rowIndex + 1
      }</td>`;

      row.forEach((cell, colIndex) => {
        if (cell !== "") {
          const cellKey = `${columns[colIndex]}${rowIndex + 1}`;
          const cellData = sheetData[cellKey];
          const cellClass = [
            cellData?.bold ? "bold" : "",
            cellData?.align === "center"
              ? "center"
              : cellData?.align === "right"
              ? "right"
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          const style = cellData?.bgColor
            ? `style="background-color: ${cellData.bgColor};"`
            : "";
          tableHTML += `<td ${style} class="${cellClass}">${cell}</td>`;
        } else {
          tableHTML += "<td></td>";
        }
      });

      tableHTML += "</tr>";
    });
    tableHTML += "</tbody></table>";

    return tableHTML;
  };

  const convertToAOA = (data: Record<string, CellData>): any[][] => {
    const aoa: any[][] = [];
    for (let row = 1; row <= 50; row++) {
      const rowData: any[] = [];
      for (let col = 0; col < 10; col++) {
        const colChar = String.fromCharCode(65 + col);
        const cellKey = `${colChar}${row}`;
        const cellData = data[cellKey];
        rowData.push(cellData?.value || "");
      }
      aoa.push(rowData);
    }
    return aoa;
  };

  // Trouver les cellules qui référencent une cellule donnée
  const findDependentCells = (cellKey: string): string[] => {
    const dependents: string[] = [];
    Object.entries(sheetData).forEach(([key, cellData]) => {
      if (cellData.formula && cellData.formula.includes(cellKey)) {
        dependents.push(key);
      }
    });
    return dependents;
  };

  // Copier le contenu des cellules sélectionnées
  const handleCopy = () => {
    if (selectedRange.length === 0) return;

    const copyData = selectedRange
      .map((cellKey) => sheetData[cellKey]?.value || "")
      .join("\t");
    navigator.clipboard.writeText(copyData).catch((err) => {
      console.error("Erreur copie:", err);
    });
  };

  // Coller le contenu depuis le presse-papier
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const rows = text.split("\n");

      if (selectedRange.length === 0) return;

      const startCell = selectedRange[0];
      const startCol = startCell.charCodeAt(0);
      const startRow = parseInt(startCell.slice(1));

      const newData = { ...sheetData };

      rows.forEach((row, rowOffset) => {
        const cells = row.split("\t");
        cells.forEach((cellValue, colOffset) => {
          const cellCol = String.fromCharCode(startCol + colOffset);
          const cellRow = startRow + rowOffset;
          const cellKey = `${cellCol}${cellRow}`;

          if (!isCellLocked(cellKey)) {
            newData[cellKey] = {
              value: cellValue,
              formattedValue: cellValue,
            };
          }
        });
      });

      setSheetData(newData);
      addToHistory(newData);
    } catch (error) {
      console.error("Erreur collage:", error);
    }
  };

  const handleBackWithCheck = () => {
    if (hasUnsavedChanges) {
      setPendingAction(() => onBack);
      setShowUnsavedDialog(true);
    } else {
      onBack();
    }
  };

  const handleForceBack = () => {
    setShowUnsavedDialog(false);
    setPendingAction(null);
    onBack();
  };

  const handleContinueEditing = () => {
    setShowUnsavedDialog(false);
    setPendingAction(null);
  };

  const handleSaveAndQuit = () => {
    handleSave();
    setShowUnsavedDialog(false);
    onBack();
  };

  const selectedCellData = selectedCell ? sheetData[selectedCell] : null;
  const dependentCells = selectedCell ? findDependentCells(selectedCell) : [];

  // Afficher un indicateur de chargement pour les fichiers DSF
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Chargement du fichier DSF...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header fixe */}
      <div className="flex items-center justify-between p-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBackWithCheck}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h2 className="font-semibold text-lg">{reportName}</h2>
            <p className="text-sm text-muted-foreground">
              {reportId} - {getReportTypeDisplayName(reportCategory)}
              {balanceType &&
                ` - Balance ${
                  balanceType === "current" ? "Courante" : "Précédente"
                }`}
              {uploadedFile && ` - Fichier DSF: ${uploadedFile.name}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Annuler (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Rétablir (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              title="Réinitialiser"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <Badge variant="outline">
            {user?.role === "admin" ? (
              <Unlock className="h-3 w-3 mr-1" />
            ) : (
              <Lock className="h-3 w-3 mr-1" />
            )}
            {user?.role === "admin" ? "Modifiable" : "Lecture seule"}
          </Badge>

          {/* Menu déroulant pour les exports */}
          <div className="relative group">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exporter en Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exporter en PDF
                </button>
              </div>
            </div>
          </div>

          {/* BOUTON SAUVEGARDE TOUJOURS VISIBLE */}
          <Button
            size="sm"
            onClick={handleSave}
            className={"bg-orange-600 hover:bg-orange-700"}
          >
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
            {hasUnsavedChanges && " •"}
          </Button>
        </div>
      </div>

      {/* Barre de formule */}
      <div className="p-2 border-b bg-gray-50">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <Badge variant="outline" className="font-mono">
            {selectedRange.length > 1
              ? `${selectedRange.length} cellules`
              : selectedCell || "A1"}
          </Badge>
          <Input
            value={formulaBarValue}
            onChange={(e) => setFormulaBarValue(e.target.value)}
            onKeyDown={handleFormulaBarKeyDown}
            placeholder="Entrez une valeur ou formule (=SUM(...))"
            className="flex-1 font-mono text-sm"
            disabled={selectedCell ? isCellLocked(selectedCell) : false}
          />
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              title="Copier (Ctrl+C)"
            >
              Copier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePaste}
              title="Coller (Ctrl+V)"
            >
              Coller
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex">
        {/* Grille Excel */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 max-w-7xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-auto max-h-[calc(100vh-140px)]">
                  <table ref={gridRef} className="w-full border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr>
                        <th className="w-8 bg-muted border p-0 sticky left-0 z-20"></th>
                        {columns.map((col) => (
                          <th
                            key={col}
                            className="bg-muted border p-0 min-w-[100px]"
                          >
                            <div className="h-6 flex items-center justify-center font-mono text-xs">
                              {col}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row}>
                          <td className="bg-muted border p-0 sticky left-0 z-10">
                            <div className="h-8 flex items-center justify-center font-mono text-xs">
                              {row}
                            </div>
                          </td>
                          {columns.map((col) => {
                            const cellKey = `${col}${row}`;
                            const cellData = sheetData[cellKey];
                            const isSelected = selectedRange.includes(cellKey);
                            const isEditing = editingCell === cellKey;
                            const locked = isCellLocked(cellKey);

                            return (
                              <td
                                key={cellKey}
                                className={`border p-0 cursor-cell hover:bg-orange-50 ${
                                  isSelected
                                    ? "ring-1 ring-orange-500 bg-orange-100"
                                    : ""
                                } ${locked ? "bg-gray-50" : ""}`}
                                style={{
                                  backgroundColor:
                                    cellData?.bgColor || "transparent",
                                  minWidth: "100px",
                                  height: "32px",
                                }}
                                onClick={(e) => handleCellClick(cellKey, e)}
                                onDoubleClick={() =>
                                  handleCellDoubleClick(cellKey)
                                }
                              >
                                {isEditing ? (
                                  <Input
                                    value={formulaBarValue}
                                    onChange={(e) =>
                                      setFormulaBarValue(e.target.value)
                                    }
                                    onKeyDown={handleFormulaBarKeyDown}
                                    onBlur={() => setEditingCell(null)}
                                    className="border-0 h-8 text-sm rounded-none focus-visible:ring-0 w-full"
                                    autoFocus
                                  />
                                ) : (
                                  <div
                                    className={`h-8 px-2 flex items-center ${
                                      cellData?.align === "center"
                                        ? "justify-center"
                                        : cellData?.align === "right"
                                        ? "justify-end"
                                        : "justify-start"
                                    } ${cellData?.bold ? "font-bold" : ""}`}
                                  >
                                    <span className="text-xs truncate w-full">
                                      {formatCellValue(cellData)}
                                    </span>
                                    {cellData?.formula && (
                                      <Badge
                                        variant="outline"
                                        className="ml-1 text-[10px] px-1 shrink-0"
                                      >
                                        fx
                                      </Badge>
                                    )}
                                    {locked && (
                                      <Lock className="h-3 w-3 ml-1 text-muted-foreground shrink-0" />
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Panneau latéral d'informations */}
        <div className="w-80 border-l bg-white flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <Info className="h-4 w-4" />
              Informations
            </h3>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="p-4 space-y-4">
              {selectedCell ? (
                <>
                  <div>
                    <Label className="text-sm font-medium">
                      Cellule sélectionnée
                    </Label>
                    <p className="font-mono text-sm mt-1 bg-orange-50 p-2 rounded">
                      {selectedCell}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Valeur</Label>
                    <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                      {formatCellValue(selectedCellData)}
                    </p>
                  </div>

                  {selectedCellData?.formula && (
                    <div>
                      <Label className="text-sm font-medium">Formule</Label>
                      <div className="border border-gray-300 p-2 text-left font-medium text-sm bg-gray-100 text-black">
                        {selectedCellData.formula}
                      </div>
                    </div>
                  )}

                  {dependentCells.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">
                        Cellules dépendantes
                      </Label>
                      <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                        {dependentCells.map((cell) => (
                          <div
                            key={cell}
                            className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm"
                          >
                            <span className="font-mono">{cell}</span>
                            <Badge variant="outline" className="text-xs">
                              {sheetData[cell]?.formula
                                ? "Formule"
                                : "Référence"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Sélectionnez une cellule pour voir ses informations
                  </p>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Astuces :</strong>
                  <br />• Double-clic pour éditer
                  <br />• Shift+clic pour sélection multiple
                  <br />• Ctrl+C/V pour copier/coller
                  <br />• Ctrl+Z/Y pour annuler/rétablir
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog d'avertissement modifications non sauvegardées */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent className="w-[100vw] max-w-4xl h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              Modifications non sauvegardées
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 py-6 flex items-center justify-center">
            <div className="text-center max-w-2xl">
              <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Vous avez des modifications non sauvegardées
              </h3>
              <p className="text-muted-foreground">
                Si vous quittez sans sauvegarder, toutes les modifications
                effectuées depuis votre dernière sauvegarde seront perdues.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-4 sm:gap-4">
            <Button
              variant="outline"
              onClick={handleForceBack}
              className="h-12 px-6"
            >
              Quitter sans sauvegarder
            </Button>
            <Button onClick={handleContinueEditing} className="h-12 px-6">
              Continuer l'édition
            </Button>
            <Button
              onClick={handleSaveAndQuit}
              className="h-12 px-6 bg-green-600 hover:bg-green-700"
            >
              <Save className="h-5 w-5 mr-2" />
              Sauvegarder et quitter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Fonction utilitaire pour obtenir le nom d'affichage du type de rapport
function getReportTypeDisplayName(category: string): string {
  switch (category) {
    case "balance":
      return "Balance";
    case "bilan":
      return "Bilan";
    case "compte-resultat":
      return "Compte de Résultat";
    case "note":
      return "Note";
    case "fiche":
      return "Fiche";
    case "annexe":
      return "Annexe";
    case "dsf":
      return "Document DSF";
    default:
      return "Rapport";
  }
}

// Génère des données d'exemple selon le type de rapport
function generateSampleData(
  reportId: string,
  category: string
): Record<string, CellData> {
  switch (category) {
    case "bilan":
      return generateBilanSampleData();
    case "compte-resultat":
      return generateCompteResultatSampleData();
    case "note":
      return generateNoteSampleData();
    case "fiche":
      return generateFicheSampleData();
    case "annexe":
      return generateAnnexeSampleData();
    default:
      return generateBalanceSampleData();
  }
}

function generateBilanSampleData(): Record<string, CellData> {
  const baseData: Record<string, CellData> = {
    A1: { value: "Actif", bold: true, bgColor: "#d3d3d3ff", align: "center" },
    B1: {
      value: "Montant N",
      bold: true,
      bgColor: "#d3d3d3ff",
      align: "center",
    },
    C1: {
      value: "Montant N-1",
      bold: true,
      bgColor: "#d3d3d3ff",
      align: "center",
    },
    D1: {
      value: "Variation",
      bold: true,
      bgColor: "#d3d3d3ff",
      align: "center",
    },
  };

  const sampleData = [
    { rubrique: "ACTIF IMMOBILISÉ", montant_n: 500000, montant_n1: 450000 },
    {
      rubrique: "Immobilisations incorporelles",
      montant_n: 75000,
      montant_n1: 70000,
    },
    {
      rubrique: "Immobilisations corporelles",
      montant_n: 350000,
      montant_n1: 320000,
    },
    { rubrique: "ACTIF CIRCULANT", montant_n: 250000, montant_n1: 220000 },
    { rubrique: "Stocks", montant_n: 120000, montant_n1: 110000 },
    { rubrique: "Créances", montant_n: 80000, montant_n1: 70000 },
  ];

  sampleData.forEach((item, index) => {
    const rowNum = index + 2;
    const variation = item.montant_n - item.montant_n1;

    baseData[`A${rowNum}`] = { value: item.rubrique };
    baseData[`B${rowNum}`] = {
      value: item.montant_n,
      formattedValue: formatNumber(item.montant_n),
      align: "right" as const,
    };
    baseData[`C${rowNum}`] = {
      value: item.montant_n1,
      formattedValue: formatNumber(item.montant_n1),
      align: "right" as const,
    };
    baseData[`D${rowNum}`] = {
      value: variation,
      formattedValue: formatNumber(variation),
      align: "right" as const,
    };
  });

  return baseData;
}

function generateCompteResultatSampleData(): Record<string, CellData> {
  const baseData: Record<string, CellData> = {
    A1: { value: "Poste", bold: true, bgColor: "#d3d3d3ff", align: "center" },
    B1: { value: "Montant", bold: true, bgColor: "#d3d3d3ff", align: "center" },
    C1: {
      value: "Pourcentage",
      bold: true,
      bgColor: "#d3d3d3ff",
      align: "center",
    },
  };

  const sampleData = [
    { poste: "Chiffre d'affaires", montant: 1000000, pourcentage: 100 },
    { poste: "Achats consommés", montant: -600000, pourcentage: -60 },
    { poste: "Marge commerciale", montant: 400000, pourcentage: 40 },
    { poste: "Charges personnel", montant: -200000, pourcentage: -20 },
    { poste: "Résultat exploitation", montant: 200000, pourcentage: 20 },
  ];

  sampleData.forEach((item, index) => {
    const rowNum = index + 2;
    baseData[`A${rowNum}`] = { value: item.poste };
    baseData[`B${rowNum}`] = {
      value: item.montant,
      formattedValue: formatNumber(item.montant),
      align: "right" as const,
    };
    baseData[`C${rowNum}`] = {
      value: item.pourcentage,
      formattedValue: `${item.pourcentage}%`,
      align: "right" as const,
    };
  });

  return baseData;
}

function generateNoteSampleData(): Record<string, CellData> {
  return {
    A1: {
      value: "Note Comptable",
      bold: true,
      bgColor: "#d3d3d3ff",
      align: "center",
    },
    A2: { value: "Description des méthodes comptables", bold: true },
    A3: { value: "Principe de comptabilisation :", bold: true },
    A4: {
      value:
        "Les opérations sont comptabilisées selon le principe des exercices.",
    },
    A5: { value: "Méthodes d'évaluation :", bold: true },
    A6: { value: "Les stocks sont évalués au coût moyen pondéré." },
  };
}

function generateFicheSampleData(): Record<string, CellData> {
  return {
    A1: {
      value: "Fiche Technique",
      bold: true,
      bgColor: "#d3d3d3ff",
      align: "center",
    },
    B1: { value: "Valeur", bold: true, bgColor: "#d3d3d3ff", align: "center" },
    A2: { value: "Date création", bold: true },
    B2: { value: new Date().toLocaleDateString("fr-FR") },
    A3: { value: "Dernière modification", bold: true },
    B3: { value: new Date().toLocaleDateString("fr-FR") },
    A4: { value: "Statut", bold: true },
    B4: { value: "En cours" },
  };
}

function generateAnnexeSampleData(): Record<string, CellData> {
  return {
    A1: {
      value: "Annexe Documentaire",
      bold: true,
      bgColor: "#d3d3d3ff",
      align: "center",
    },
    A2: {
      value: "Document annexe contenant les informations complémentaires",
      align: "center",
    },
    A4: { value: "Détails supplémentaires :", bold: true },
    A5: { value: "• Information 1" },
    A6: { value: "• Information 2" },
    A7: { value: "• Information 3" },
  };
}

function generateBalanceSampleData(): Record<string, CellData> {
  const baseData: Record<string, CellData> = {
    A1: { value: "Compte", bold: true, bgColor: "#d3d3d3ff", align: "center" },
    B1: { value: "Libellé", bold: true, bgColor: "#d3d3d3ff", align: "center" },
    C1: {
      value: "Entrée Débit",
      bold: true,
      bgColor: "#d3d3d3ff",
      align: "center",
    },
    D1: {
      value: "Entrée Crédit",
      bold: true,
      bgColor: "#d3d3d3ff",
      align: "center",
    },
    E1: {
      value: "Mouvement Débit",
      bold: true,
      bgColor: "#d3d3d3ff",
      align: "center",
    },
    F1: {
      value: "Mouvement Crédit",
      bold: true,
      bgColor: "#d3d3d3ff",
      align: "center",
    },
    G1: {
      value: "Sortie Débit",
      bold: true,
      bgColor: "#d3d3d3ff",
      align: "center",
    },
    H1: {
      value: "Sortie Crédit",
      bold: true,
      bgColor: "#d3d3d3ff",
      align: "center",
    },
    I1: {
      value: "Solde Débit",
      bold: true,
      bgColor: "#d3d3d3ff",
      align: "center",
    },
    J1: {
      value: "Solde Crédit",
      bold: true,
      bgColor: "#d3d3d3ff",
      align: "center",
    },
  };

  const sampleRows = [
    {
      compte: "101000",
      libelle: "Capital social",
      entre_debit: 0,
      entre_credit: 1000000,
      mouvement_debit: 0,
      mouvement_credit: 0,
      sortir_debit: 0,
      sortir_credit: 0,
      solde_debit: 0,
      solde_credit: 1000000,
    },
    {
      compte: "106100",
      libelle: "Réserve légale",
      entre_debit: 0,
      entre_credit: 50000,
      mouvement_debit: 0,
      mouvement_credit: 0,
      sortir_debit: 0,
      sortir_credit: 0,
      solde_debit: 0,
      solde_credit: 50000,
    },
    {
      compte: "211000",
      libelle: "Terrains",
      entre_debit: 250000,
      entre_credit: 0,
      mouvement_debit: 0,
      mouvement_credit: 0,
      sortir_debit: 0,
      sortir_credit: 0,
      solde_debit: 250000,
      solde_credit: 0,
    },
  ];

  sampleRows.forEach((row, index) => {
    const rowNum = index + 2;
    baseData[`A${rowNum}`] = { value: row.compte, formattedValue: row.compte };
    baseData[`B${rowNum}`] = {
      value: row.libelle,
      formattedValue: row.libelle,
    };
    baseData[`C${rowNum}`] = {
      value: row.entre_debit,
      formattedValue: formatNumber(row.entre_debit),
      align: "right" as const,
    };
    baseData[`D${rowNum}`] = {
      value: row.entre_credit,
      formattedValue: formatNumber(row.entre_credit),
      align: "right" as const,
    };
    baseData[`E${rowNum}`] = {
      value: row.mouvement_debit,
      formattedValue: formatNumber(row.mouvement_debit),
      align: "right" as const,
    };
    baseData[`F${rowNum}`] = {
      value: row.mouvement_credit,
      formattedValue: formatNumber(row.mouvement_credit),
      align: "right" as const,
    };
    baseData[`G${rowNum}`] = {
      value: row.sortir_debit,
      formattedValue: formatNumber(row.sortir_debit),
      align: "right" as const,
    };
    baseData[`H${rowNum}`] = {
      value: row.sortir_credit,
      formattedValue: formatNumber(row.sortir_credit),
      align: "right" as const,
    };
    baseData[`I${rowNum}`] = {
      value: row.solde_debit,
      formattedValue: formatNumber(row.solde_debit),
      align: "right" as const,
    };
    baseData[`J${rowNum}`] = {
      value: row.solde_credit,
      formattedValue: formatNumber(row.solde_credit),
      align: "right" as const,
    };
  });

  return baseData;
}
