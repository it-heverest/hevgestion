// components/reports/ReportsView.tsx - Simple reports display with DSF check
import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Eye,
  RefreshCw,
  X,
  Search,
  Upload,
  FileEdit,
  Loader2,
  FileSpreadsheet,
  UploadCloud,
  Trash2,
} from "lucide-react";
import type { ExtractionResult } from "./uploadSteps";
import { useNavigate, useLocation } from "react-router-dom";
import { dsfTemplateService } from "../../services/dsf-template.service";
import { useAuth } from "../../contexts/AuthContext";
import { notesService } from "../../services/notes.service";
import { REPORT_CATEGORIES, getNoteRoute } from "./ReportRenderer";
import { ReportNavigation } from "./ReportNavigation";

interface ReportsViewProps {
  extractionResults: ExtractionResult[];
  onNewUpload: () => void;
  onClose: () => void;
  onNormalGeneration: () => void;
  folderId?: string;
  checkExistingDSF?: (folderId: string) => Promise<ExtractionResult[] | null>;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  extractionResults: initialResults,
  onNewUpload,
  onClose,
  folderId,
  checkExistingDSF,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract userId from URL path
  const userIdMatch = location.pathname.match(/\/reports\/([^/]+)\//);
  const userId = userIdMatch ? userIdMatch[1] : "current";
  const [extractionResults, setExtractionResults] =
    useState<ExtractionResult[]>(initialResults);
  const [selectedReport, setSelectedReport] = useState<ExtractionResult | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 36; // 6x6 grid
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [isCheckingDSF, setIsCheckingDSF] = useState(false);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [templateStatus, setTemplateStatus] = useState<{
    hasTemplate: boolean;
    fileName?: string;
  } | null>(null);
  const [showAllReportsGrid, setShowAllReportsGrid] = useState(false);

  // Check for existing DSF on mount
  useEffect(() => {
    const checkForExistingDSF = async () => {
      if (folderId && checkExistingDSF && initialResults.length === 0) {
        setIsCheckingDSF(true);
        try {
          const existingData = await checkExistingDSF(folderId);
          if (existingData && existingData.length > 0) {
            setExtractionResults(existingData);
          } else {
            // No existing DSF, show choice modal
            setShowChoiceModal(true);
          }
        } catch (error) {
          console.error("Error checking existing DSF:", error);
          setShowChoiceModal(true);
        } finally {
          setIsCheckingDSF(false);
        }
      } else if (initialResults.length > 0) {
        setExtractionResults(initialResults);
      } else {
        setShowChoiceModal(true);
      }
    };

    checkForExistingDSF();
  }, [folderId, checkExistingDSF, initialResults]);

  const successCount = extractionResults.filter((r) => r.success).length;
  const totalPages = Math.ceil(extractionResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = extractionResults.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleViewReport = (report: ExtractionResult) => {
    // setSelectedReport(report);
    const normalizedNoteName = report.noteName.toUpperCase().trim();
    const routePath = getNoteRoute(normalizedNoteName);
    if (routePath && folderId) {
      navigate(`${routePath}`);
      console.log(`${routePath}`);
    } else {
      console.warn(`No route found for note: ${report.noteName}`);
    }
  };

  const handleEditReport = (report: ExtractionResult) => {
    const normalizedNoteName = report.noteName.toUpperCase().trim();
    const routePath = getNoteRoute(normalizedNoteName);
    if (routePath && folderId) {
      navigate(`${routePath}`);
      console.log(`${routePath}`);
    } else {
      console.warn(`No route found for note: ${report.noteName}`);
    }
  };

  const handleExportExcel = async () => {
    if (!folderId) {
      alert("Veuillez d'abord sélectionner un dossier.");
      return;
    }

    try {
      setIsExporting(true);
      await dsfTemplateService.exportFilledExcel(folderId);
    } catch (error: any) {
      const message =
        error.response?.data instanceof Blob
          ? "Aucun template DSF importé pour ce dossier. Veuillez importer un template ci-dessous."
          : error.response?.data?.message ||
            error.message ||
            "Erreur lors de l'export Excel";
      alert(message);
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch template status when folderId changes
  useEffect(() => {
    if (folderId) {
      dsfTemplateService
        .getTemplateStatus(folderId)
        .then((status) => setTemplateStatus(status))
        .catch(console.error);
    }
  }, [folderId]);

  // Handle template upload
  const handleTemplateUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !folderId) return;

    setIsUploadingTemplate(true);
    try {
      const status = await dsfTemplateService.uploadTemplate(file, folderId);
      setTemplateStatus(status);
      alert("Template importé avec succès!");
    } catch (error: any) {
      alert(error.message || "Erreur lors de l'import du template");
    } finally {
      setIsUploadingTemplate(false);
      // Reset input
      e.target.value = "";
    }
  };

  // Handle delete all DSF notes
  const handleDeleteDSF = async () => {
    if (!folderId) return;

    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer toutes les données DSF de ce dossier ? Cette action est irréversible.",
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await notesService.deleteAllNotes(folderId);
      // Clear the local state
      setExtractionResults([]);
      alert("Toutes les données DSF ont été supprimées avec succès.");
      // Optionally refresh or navigate away
      onClose();
    } catch (error: any) {
      alert(error.message || "Erreur lors de la suppression des données DSF");
    } finally {
      setIsDeleting(false);
    }
  };

  // Show loading state while checking
  if (isCheckingDSF) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            Vérification des données DSF existantes...
          </p>
        </div>
      </div>
    );
  }

  // Show choice modal when no DSF exists
  if (showChoiceModal && extractionResults.length === 0) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-black mb-2">
                Aucune DSF trouvée
              </h2>
              <p className="text-gray-600">
                Comment souhaitez-vous créer vos rapports DSF ?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap的四">
              {/* Import DSF Option */}
              <button
                onClick={() => {
                  setShowChoiceModal(false);
                  onNewUpload();
                }}
                className="group relative overflow-hidden rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Importer DSF
                  </h3>
                  <p className="text-sm text-gray-600">
                    Importer un fichier DSF existant pour extraire
                    automatiquement les données
                  </p>
                </div>
              </button>

              {/* Normal Generation Option */}
              <button
                onClick={() => {
                  setShowChoiceModal(false);
                  setShowAllReportsGrid(true);
                }}
                className="group relative overflow-hidden rounded-lg border-2 border-gray-200 p-6 hover:border-green-500 hover:shadow-lg transition-all"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-full mb-4 group-hover:bg-green-100 transition-colors">
                    <FileEdit className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Génération Manuelle
                  </h3>
                  <p className="text-sm text-gray-600">
                    Créer et remplir manuellement les rapports DSF depuis zéro
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <AlertCircle className="h-4 w-4" />
              <span>Vous pourrez changer de méthode plus tard</span>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </>
    );
  }

  // Show All Reports Grid when manual generation is selected
  if (showAllReportsGrid) {
    return (
      <>
        <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
          <div className="min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-black">
                      Tous les Rapports Disponibles
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Sélectionnez un rapport pour le visualiser ou commencer à
                      le remplir
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={onNewUpload}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Importer DSF
                    </button>
                    <button
                      onClick={() => setShowAllReportsGrid(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Retour
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* All Reports Grid */}
            <div className="max-w-7xl mx-auto px-6 py-6">
              <AllReportsGrid
                folderId={folderId}
                onViewReport={(name, Component) => {
                  // Find the report route from ALL_REPORTS
                  const report = ALL_REPORTS.find((r) => r.name === name);
                  const route =
                    report?.route?.replace("rapport/", "") ||
                    name.toLowerCase().replace(" ", "");

                  // Open notes in a new tab instead of modal
                  const newTabReports = [
                    "NOTE 1",
                    "NOTE 2",
                    "NOTE 3A",
                    "NOTE 3B",
                    "NOTE 3C",
                    "NOTE 3D",
                    "NOTE 3F",
                    "ASS 1",
                    "ASS 2",
                    "TVA",
                  ];
                  if (newTabReports.includes(name)) {
                    const userId = user?.id || "current";
                    window.open(
                      `/reports/${userId}/reports/rapport/${route}?folderId=${folderId || ""}`,
                      "_blank",
                    );
                  } else {
                    setSelectedManualReport({ name, component: Component });
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Preview Modal for Manual Reports */}
        {selectedManualReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-black">
                    {selectedManualReport.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Prévisualisation du rapport
                  </p>
                </div>
                <button
                  onClick={() => setSelectedManualReport(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-6">
                <selectedManualReport.component folderId={folderId} />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
        <div className="min-h-screen">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <div style={{ paddingLeft: "550px" }}>
                  <h1 className="text-xl font-bold text-black text-center ">
                    Notes DSF
                  </h1>
                  <p className="text-sm text-gray-600">
                    {successCount} sur {extractionResults.length} extraites
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm">
                    {isUploadingTemplate ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <UploadCloud className="h-4 w-4 mr-1" />
                    )}
                    Template
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleTemplateUpload}
                      disabled={isUploadingTemplate}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleExportExcel}
                    disabled={isExporting}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                    )}
                    Export
                  </button>

                  <button
                    onClick={handleDeleteDSF}
                    disabled={isDeleting}
                    className=" inline-flex items-center px-3 py-2 bg-orange-600 text-black rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    Supprimer
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content
            <div className="max-w-6xl mx-auto px-4 py-8">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div>
                  <div className="text-xl font-bold text-green-600">
                    {successCount}
                  </div>
                  <div className="text-xs text-gray-600">Réussis</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-red-600">
                    {extractionResults.length - successCount}
                  </div>
                  <div className="text-xs text-gray-600">Échecs</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-orange-600">
                    {extractionResults.length > 0
                      ? Math.round(
                          (successCount / extractionResults.length) * 100,
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-xs text-gray-600">Taux</div>
                </div>
              </div>
            </div> */}

            {/* Grid */}
            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
                  {paginatedReports.map((report, idx) => (
                    <ReportCard
                      key={idx}
                      report={report}
                      onView={() => handleViewReport(report)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Précédent
                    </button>

                    <span className="text-sm text-gray-600">
                      {startIndex + 1}-
                      {Math.min(
                        startIndex + itemsPerPage,
                        extractionResults.length,
                      )}{" "}
                      / {extractionResults.length}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReportPreviewModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        folderId={folderId}
      />
    </>
  );
};

// ==================== REPORT CARD ====================
interface ReportCardProps {
  report: ExtractionResult;
  onView: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onView }) => {
  return (
    <div
      className={`bg-gray-100 border border-gray-300 rounded-lg p-3 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 ${
        !report.success ? "opacity-75" : ""
      }`}
      onClick={onView}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
            report.success
              ? "bg-green-200 text-green-700"
              : "bg-red-200 text-red-700"
          }`}
        >
          <FileText className="h-4 w-4" />
        </div>
        <div className="text-xs font-medium text-gray-800 leading-tight">
          {report.noteName.replace("NOTE ", "").replace("NOTE", "")}
        </div>
        <div
          className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
            report.success
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {report.success ? "✓" : "✗"}
        </div>
      </div>
    </div>
  );
};

// ==================== REPORT PREVIEW MODAL ====================
interface ReportPreviewModalProps {
  report: ExtractionResult | null;
  onClose: () => void;
  folderId?: string;
}

const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  report,
  onClose,
  folderId,
}) => {
  if (!report) return null;

  const [viewMode, setViewMode] = React.useState<"component" | "data">(
    "component",
  );

  const formatData = (data: any) => {
    if (!data) return { type: "empty", content: "Aucune donnée disponible" };

    try {
      if (typeof data === "object") {
        const sections: { title: string; content: any }[] = [];

        if (data.entete) {
          sections.push({
            title: "En-tête",
            content: data.entete,
          });
        }

        Object.keys(data).forEach((key) => {
          if (key !== "entete" && data[key]) {
            sections.push({
              title: key.charAt(0).toUpperCase() + key.slice(1),
              content: data[key],
            });
          }
        });

        return { type: "structured", sections };
      }

      return { type: "json", content: JSON.stringify(data, null, 2) };
    } catch (error) {
      return { type: "error", content: "Erreur lors du formatage des données" };
    }
  };

  const formattedData = formatData(report.data);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {report.noteName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Prévisualisation du rapport
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Toggle View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("component")}
                className={`px-3 py-2 text-sm ${
                  viewMode === "component"
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Composant
              </button>
              <button
                onClick={() => setViewMode("data")}
                className={`px-3 py-2 text-sm border-l border-gray-300 ${
                  viewMode === "data"
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Données
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1">
          {viewMode === "component" ? (
            // Render the actual component
            <div className="p-6">
              <AllReportsGrid
                noteName={report.noteName}
                data={report.data}
                folderId={folderId}
              />
            </div>
          ) : (
            // Show raw data
            <div className="p-6">
              {formattedData.type === "structured" && formattedData.sections ? (
                <div className="space-y-6">
                  {formattedData.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">
                        {section.title}
                      </h3>
                      <div className="space-y-2">
                        {typeof section.content === "object" ? (
                          Object.entries(section.content).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between py-2 border-b border-gray-200 last:border-0"
                              >
                                <span className="text-sm font-medium text-gray-700">
                                  {key
                                    .replace(/_/g, " ")
                                    .charAt(0)
                                    .toUpperCase() +
                                    key.slice(1).replace(/_/g, " ")}
                                  :
                                </span>
                                <span className="text-sm text-gray-900 font-mono">
                                  {typeof value === "object"
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </span>
                              </div>
                            ),
                          )
                        ) : (
                          <div className="text-sm text-gray-700 font-mono">
                            {String(section.content)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : formattedData.type === "json" ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono overflow-x-auto">
                    {formattedData.content}
                  </pre>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-800">
                    {formattedData.content}
                  </p>
                </div>
              )}

              {/* Info Footer */}
              <div className="mt-6 pt-4 border-t border-gray-300">
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>
                    Les données ont été extraites avec succès du fichier DSF.
                    Cliquez sur "Éditer" pour ouvrir l'éditeur complet et
                    modifier ces informations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
