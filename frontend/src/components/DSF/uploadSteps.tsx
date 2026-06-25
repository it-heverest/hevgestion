// components/upload/UploadSteps.tsx - Reusable upload step components
import React from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { formatFileSize } from "../../utils/filevalidation";
import { notesService } from "../../services/notes.service";
import {
  extraireDepuisFichier,
  obtenirNomsFeuillesDepuisFichier,
} from "../../services/excel/excelExtractor";

// ==================== TYPES ====================
export interface ExtractionResult {
  noteName: string;
  success: boolean;
  data?: any;
  error?: string;
}

// IMPORTANT: noteNumber values here MUST exactly match the keys in notesService.getConfig()
const NOTE_CONFIGS = {
  "NOTE 1": {
    noteNumber: "1",
    sheetName: "Note 1 ",
    transform: "transformNote1Data",
  },
  "NOTE 2": {
    noteNumber: "2",
    sheetName: "NOTE 2",
    transform: "transformNote2Data",
  },
  "NOTE 3A": {
    noteNumber: "3A",
    sheetName: "NOTE 3A",
    transform: "transformNote3AData",
  },
  "NOTE 3B": {
    noteNumber: "3B",
    sheetName: "NOTE 3B",
    transform: "transformNote3BData",
  },
  "NOTE 3C": {
    noteNumber: "3C",
    sheetName: "NOTE  3C",
    transform: "transformNote3CData",
  },
  // FIX: was "3C_CO1" (letter O) — must match getConfig() key "3C_C01" (digit zero)
  "NOTE 3C_CO1": {
    noteNumber: "3C_C01",
    sheetName: "CO1-NOTE 3C ",
    transform: "transformC01Note3CData",
  },
  "NOTE 3D": {
    noteNumber: "3D",
    sheetName: "NOTE 3D ",
    transform: "transformNote3DData",
  },
  "NOTE 3E": {
    noteNumber: "3E",
    sheetName: "NOTE 3E ",
    transform: "transformNote3EData",
  },
  "NOTE 3F": {
    noteNumber: "3F",
    sheetName: "NOTE 3F ",
    transform: "transformNote3FData",
  },
  "NOTE 4": {
    noteNumber: "4",
    sheetName: "NOTE 4 ",
    transform: "transformNote4Data",
  },
  "NOTE 5": {
    noteNumber: "5",
    sheetName: "NOTE 5 ",
    transform: "transformNote5Data",
  },
  "NOTE 6": {
    noteNumber: "6",
    sheetName: "NOTE 6 ",
    transform: "transformNote6Data",
  },
  "NOTE 7": {
    noteNumber: "7",
    sheetName: "NOTE 7 ",
    transform: "transformNote7Data",
  },
  "NOTE 8": {
    noteNumber: "8",
    sheetName: "NOTE 8 ",
    transform: "transformNote8Data",
  },
  "NOTE 9": {
    noteNumber: "9",
    sheetName: "NOTE 9 ",
    transform: "transformNote9Data",
  },
  "NOTE 10": {
    noteNumber: "10",
    sheetName: "NOTE 10 ",
    transform: "transformNote10Data",
  },
  "NOTE 11": {
    noteNumber: "11",
    sheetName: "NOTE 11 ",
    transform: "transformNote11Data",
  },
  "NOTE 12": {
    noteNumber: "12",
    sheetName: "NOTE 12 ",
    transform: "transformNote12Data",
  },
  "NOTE 13": {
    noteNumber: "13",
    sheetName: "NOTE 13 ",
    transform: "transformNote13Data",
  },
  "NOTE 14": {
    noteNumber: "14",
    sheetName: "NOTE 14   ",
    transform: "transformNote14Data",
  },
  "NOTE 15A": {
    noteNumber: "15A",
    sheetName: "NOTE 15A  ",
    transform: "transformNote15AData",
  },
  "NOTE 15B": {
    noteNumber: "15B",
    sheetName: "NOTE 15B ",
    transform: "transformNote15BData",
  },
  "NOTE 16A": {
    noteNumber: "16A",
    sheetName: "NOTE 16A ",
    transform: "transformNote16AData",
  },
  "NOTE 16B": {
    noteNumber: "16B",
    sheetName: "NOTE 16B",
    transform: "transformNote16BData",
  },
  // FIX: was "16B_BIS" — must match getConfig() key "16B bis"
  "NOTE 16B_BIS": {
    noteNumber: "16B bis",
    sheetName: "NOTE 16B BIS",
    transform: "transformNote16BBisData",
  },
  "NOTE 16C": {
    noteNumber: "16C",
    sheetName: "NOTE 16C",
    transform: "transformNote16CData",
  },
  "NOTE 17": {
    noteNumber: "17",
    sheetName: "NOTE 17  ",
    transform: "transformNote17Data",
  },
  // FIX: was "17_C1" — must match getConfig() key "C1/17"
  "NOTE 17_C1": {
    noteNumber: "C1/17",
    sheetName: "C1-NOTE 17 ",
    transform: "transformNote17C1Data",
  },
  "NOTE 18": {
    noteNumber: "18",
    sheetName: "NOTE 18",
    transform: "transformNote18Data",
  },
  "NOTE 19": {
    noteNumber: "19",
    sheetName: "NOTE 19 ",
    transform: "transformNote19Data",
  },
  "NOTE 20": {
    noteNumber: "20",
    sheetName: "NOTE 20 ",
    transform: "transformNote20Data",
  },
  "NOTE 21": {
    noteNumber: "21",
    sheetName: "NOTE 21",
    transform: "transformNote21Data",
  },
  "NOTE 22": {
    noteNumber: "22",
    sheetName: "NOTE 22",
    transform: "transformNote22Data",
  },
  "NOTE 23": {
    noteNumber: "23",
    sheetName: "NOTE 23",
    transform: "transformNote23Data",
  },
  "NOTE 24": {
    noteNumber: "24",
    sheetName: "NOTE 24",
    transform: "transformNote24Data",
  },
  "NOTE 25": {
    noteNumber: "25",
    sheetName: "NOTE 25",
    transform: "transformNote25Data",
  },
  // FIX: was "25_C1" — must match getConfig() key "C1/25"
  "NOTE 25_C1": {
    noteNumber: "C1/25",
    sheetName: "C1-NOTE 25",
    transform: "transformNote25C1Data",
  },
  // FIX: was "25_C2" — must match getConfig() key "C2/25"
  "NOTE 25_C2": {
    noteNumber: "C2/25",
    sheetName: "C2-NOTE 25",
    transform: "transformNote25C2Data",
  },
  "NOTE 26": {
    noteNumber: "26",
    sheetName: "NOTE 26",
    transform: "transformNote26Data",
  },
  "NOTE 27A": {
    noteNumber: "27A",
    sheetName: "NOTE 27A",
    transform: "transformNote27AData",
  },
  "NOTE 27A_C1": {
    noteNumber: "C1/27A",
    sheetName: "C1-NOTE 27A",
    transform: "transformNote27AC1Data",
  },
  "NOTE 27B": {
    noteNumber: "27B",
    sheetName: "NOTE 27B",
    transform: "transformNote27BData",
  },
  "NOTE 28": {
    noteNumber: "28",
    sheetName: "NOTE 28",
    transform: "transformNote28Data",
  },
  // FIX: was "28_C1" — must match getConfig() key "C1/28"
  "NOTE 28_C1": {
    noteNumber: "C1/28",
    sheetName: "C1-NOTE 28",
    transform: "transformNote28C1Data",
  },
  // FIX: was "28_C2" — must match getConfig() key "C2/28"
  "NOTE 28_C2": {
    noteNumber: "C2/28",
    sheetName: "C2-NOTE 28",
    transform: "transformNote28C2Data",
  },
  "NOTE 29": {
    noteNumber: "29",
    sheetName: "NOTE 29",
    transform: "transformNote29Data",
  },
  "NOTE 30": {
    noteNumber: "30",
    sheetName: "NOTE 30",
    transform: "transformNote30Data",
  },
  "NOTE 31": {
    noteNumber: "31",
    sheetName: "NOTE 31",
    transform: "transformNote31Data",
  },
  "NOTE 32": {
    noteNumber: "32",
    sheetName: "NOTE 32",
    transform: "transformNote32Data",
  },
  "NOTE 33": {
    noteNumber: "33",
    sheetName: "NOTE 33",
    transform: "transformNote33Data",
  },
  "NOTE 34": {
    noteNumber: "34",
    sheetName: "NOTE 34",
    transform: "transformNote34Data",
  },
  "NOTE 35": {
    noteNumber: "35",
    sheetName: "NOTE 35",
    transform: "transformNote35Data",
  },
} as const;

// ==================== EXTRACTION LOGIC ====================
export const extractAllNotesFromFile = async (
  file: File,
  folderId: string,
  onProgress?: (progress: number, note: string) => void,
): Promise<ExtractionResult[]> => {
  const results: ExtractionResult[] = [];
  const noteKeys = Object.keys(NOTE_CONFIGS) as Array<
    keyof typeof NOTE_CONFIGS
  >;

  // First, get available sheet names from the file
  let availableSheets: string[] = [];
  try {
    const { obtenirNomsFeuillesDepuisFichier } =
      await import("../../services/excel/excelExtractor");
    availableSheets = await obtenirNomsFeuillesDepuisFichier(file);
    console.log("📋 Available sheets in Excel file:", availableSheets);
  } catch (error) {
    console.warn("Could not read sheet names:", error);
  }

  for (let i = 0; i < noteKeys.length; i++) {
    const noteName = noteKeys[i];
    const { noteNumber, sheetName, transform } = NOTE_CONFIGS[noteName];

    try {
      // Update progress - starting extraction
      onProgress?.(
        Math.round(((i + 0.3) / noteKeys.length) * 90),
        `Extraction ${noteName}...`,
      );

      // Check if sheet exists — skip gracefully if missing (optional sheet)
      if (availableSheets.length > 0 && !availableSheets.includes(sheetName)) {
        console.warn(
          `Sheet "${sheetName}" not found in file — skipping ${noteName}`,
        );
        results.push({
          noteName,
          success: false,
          error: `Feuille "${sheetName}" absente du fichier`,
        });
        onProgress?.(
          Math.round(((i + 1) / noteKeys.length) * 90),
          `${noteName} ignorée ✗`,
        );
        continue; // Skip instead of throwing — allows other notes to proceed
      }

      // Get the config for this note
      const config = notesService.getConfig(noteNumber);

      if (!config) {
        // Log all available keys to help debug future mismatches
        console.error(
          `No config found for noteNumber="${noteNumber}" (noteName="${noteName}"). ` +
            `Check that this key exists in notesService.getConfig().`,
        );
        throw new Error(`Configuration non trouvée pour ${noteName}`);
      }

      // Extract data from Excel file using the correct sheet name
      const extractedData = await extraireDepuisFichier(
        file,
        config,
        sheetName,
      );

      // Update progress - transforming data
      onProgress?.(
        Math.round(((i + 0.6) / noteKeys.length) * 90),
        `Transformation ${noteName}...`,
      );

      // Transform extracted data using notes service
      const transformMethod = notesService[
        transform as keyof typeof notesService
      ] as Function;

      if (!transformMethod) {
        throw new Error(`Méthode de transformation non trouvée: ${transform}`);
      }

      const transformedData = transformMethod.call(notesService, extractedData);

      // Update progress - saving data
      onProgress?.(
        Math.round(((i + 0.8) / noteKeys.length) * 90),
        `Sauvegarde ${noteName}...`,
      );

      // Save to backend
      const saved = await notesService.saveNoteData(
        folderId,
        noteNumber,
        transformedData,
      );

      if (!saved) {
        throw new Error("Échec de la sauvegarde au backend");
      }

      results.push({
        noteName,
        success: true,
        data: transformedData,
      });

      // Update progress - completed
      onProgress?.(
        Math.round(((i + 1) / noteKeys.length) * 90),
        `${noteName} terminée ✓`,
      );
    } catch (error: any) {
      console.error(`Error extracting ${noteName}:`, error);

      const isSheetNotFound =
        error.message?.includes("introuvable") ||
        error.message?.includes("not found") ||
        error.message?.includes("non trouvée");

      results.push({
        noteName,
        success: false,
        error: isSheetNotFound
          ? `Feuille "${sheetName}" absente du fichier`
          : error.message || "Erreur d'extraction inconnue",
      });

      onProgress?.(
        Math.round(((i + 1) / noteKeys.length) * 90),
        `${noteName} ${isSheetNotFound ? "ignorée" : "échouée"} ✗`,
      );
    }
  }

  return results;
};

// ==================== FILE SELECTOR ====================
interface FileSelectorProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  errorMessage: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const FileSelector: React.FC<FileSelectorProps> = ({
  selectedFile,
  onFileSelect,
  errorMessage,
  fileInputRef,
  onDragOver,
  onDrop,
}) => (
  <div className="space-y-4">
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer"
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
        className="hidden"
      />

      {selectedFile ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-green-50 rounded-full">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Changer de fichier
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-orange-50 rounded-full">
              <Upload className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div>
            <p className="text-base font-medium text-gray-900">
              Cliquez pour sélectionner ou glissez-déposez
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Fichiers Excel (.xlsx, .xls) uniquement - Max 10MB
            </p>
          </div>
        </div>
      )}
    </div>

    {errorMessage && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      </div>
    )}

    <FormatInfo />
  </div>
);

// ==================== FORMAT INFO ====================
const FormatInfo: React.FC = () => (
  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
    <div className="flex items-start gap-3">
      <FileText className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-orange-900 mb-1">Format requis:</p>
        <ul className="text-orange-700 space-y-1">
          <li>• Fichier Excel (.xlsx ou .xls)</li>
          <li>• Taille maximale: 10 MB</li>
          <li>• Structure DSF complète avec toutes les feuilles requises</li>
          <li>• Notes SYSCOHADA: NOTE 1 à NOTE 35</li>
        </ul>
      </div>
    </div>
  </div>
);

// ==================== PROCESSING VIEW ====================
interface ProcessingViewProps {
  uploadProgress: number;
  processingNote: string | null;
  extractionResults: ExtractionResult[];
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({
  uploadProgress,
  processingNote,
  extractionResults,
}) => (
  <div className="space-y-6 py-4">
    <div className="text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="p-4 bg-orange-50 rounded-full">
          <Loader className="h-12 w-12 text-orange-600 animate-spin" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Traitement en cours...
      </h3>
      <p className="text-sm text-gray-600">
        {processingNote || "Extraction des données du fichier DSF"}
      </p>
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Progression</span>
        <span className="font-medium text-gray-900">{uploadProgress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-orange-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
    </div>

    {extractionResults.length > 0 && (
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <p className="text-sm font-medium text-gray-700">
          Résultats de l'extraction:
        </p>
        {extractionResults.map((result, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
          >
            <span className="font-medium">{result.noteName}</span>
            {result.success ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Extrait
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Échec
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

// ==================== SUCCESS VIEW ====================
interface SuccessViewProps {
  extractionResults: ExtractionResult[];
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  extractionResults,
}) => {
  const successCount = extractionResults.filter((r) => r.success).length;

  return (
    <div className="text-center py-6 space-y-4">
      <div className="flex items-center justify-center">
        <div className="p-4 bg-green-50 rounded-full">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload réussi !
        </h3>
        <p className="text-sm text-gray-600">
          Le fichier DSF a été importé et les données ont été extraites avec
          succès.
        </p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
        <p className="text-green-800">
          <strong>{successCount} notes</strong> ont été extraites avec succès
          sur <strong>{extractionResults.length} notes</strong> disponibles.
        </p>
      </div>
    </div>
  );
};

// ==================== ERROR VIEW ====================
interface ErrorViewProps {
  errorMessage: string | null;
  onClose: () => void;
  onRetry: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  errorMessage,
  onClose,
  onRetry,
}) => (
  <div className="text-center py-6 space-y-4">
    <div className="flex items-center justify-center">
      <div className="p-4 bg-red-50 rounded-full">
        <AlertCircle className="h-12 w-12 text-red-600" />
      </div>
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Erreur lors de l'upload
      </h3>
      <p className="text-sm text-gray-600">{errorMessage}</p>
    </div>
    <div className="flex justify-center gap-3 pt-4">
      <button
        onClick={onClose}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        Fermer
      </button>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
      >
        Réessayer
      </button>
    </div>
  </div>
);
