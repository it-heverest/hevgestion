// components/reports/ReportsView.tsx - Reports display component with DSF check
import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Eye,
  Edit,
  RefreshCw,
  X,
  Search,
  Filter,
  Grid,
  List,
  Upload,
  FileEdit,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { ExtractionResult } from "./uploadSteps";
import { useNavigate } from "react-router-dom";
import {
  AllReportsGrid,
  REPORT_CATEGORIES,
  getNoteRoute,
  getCategories,
  ALL_REPORTS,
} from "./ReportRenderer";

interface ReportsViewProps {
  extractionResults: ExtractionResult[];
  onNewUpload: () => void;
  onClose: () => void;
  onNormalGeneration: () => void;
  folderId?: string;
  checkExistingDSF?: (folderId: string) => Promise<ExtractionResult[] | null>;
}

// Categories from consolidated source
const CATEGORY_LIST = getCategories();

export const ReportsView: React.FC<ReportsViewProps> = ({
  extractionResults: initialResults,
  onNewUpload,
  onClose,
  onNormalGeneration,
  folderId,
  checkExistingDSF,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedReport, setSelectedReport] = useState<ExtractionResult | null>(
    null,
  );
  const [isCheckingDSF, setIsCheckingDSF] = useState(false);
  const [extractionResults, setExtractionResults] =
    useState<ExtractionResult[]>(initialResults);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showAllReportsGrid, setShowAllReportsGrid] = useState(false);
  const [selectedManualReport, setSelectedManualReport] = useState<{
    name: string;
    component: React.ComponentType<any>;
  } | null>(null);

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

  // Filter and organize reports
  const { filteredReports, categorizedReports } = useMemo(() => {
    const filtered = extractionResults.filter((report) => {
      const matchesSearch = report.noteName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "Tous" ||
        (REPORT_CATEGORIES[selectedCategory] || []).includes(
          report.noteName.toUpperCase(),
        );
      return matchesSearch && matchesCategory;
    });

    const categorized: Record<string, ExtractionResult[]> = {};
    Object.keys(REPORT_CATEGORIES).forEach((cat) => {
      categorized[cat] = extractionResults.filter((r) =>
        (REPORT_CATEGORIES[cat] || []).includes(r.noteName.toUpperCase()),
      );
    });

    return { filteredReports: filtered, categorizedReports: categorized };
  }, [extractionResults, searchQuery, selectedCategory]);

  const handleViewReport = (report: ExtractionResult) => {
    setSelectedReport(report);
  };

  const handleEditReport = (report: ExtractionResult) => {
    const normalizedNoteName = report.noteName.toUpperCase().trim();
    const routePath = getNoteRoute(normalizedNoteName);
    if (routePath && folderId) {
      navigate(`${routePath}?folderId=${folderId}`);
    } else {
      console.warn(`No route found for note: ${report.noteName}`);
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
                    <h1 className="text-2xl font-bold text-gray-900">
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
                  // Open notes in a new tab instead of modal
                  if (name === "NOTE 1") {
                    window.open(
                      `/rapport/note1?folderId=${folderId || ""}`,
                      "_blank",
                    );
                  } else if (name === "NOTE 2") {
                    window.open(
                      `/rapport/note2?folderId=${folderId || ""}`,
                      "_blank",
                    );
                  } else if (name === "NOTE 3A") {
                    window.open(
                      `/rapport/note3A?folderId=${folderId || ""}`,
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
                  <h2 className="text-xl font-semibold text-gray-900">
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
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Rapports DSF Extraits
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {successCount} rapports extraits avec succès sur{" "}
                    {extractionResults.length}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAllReportsGrid(true)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FileEdit className="h-4 w-4 mr-2" />
                    Tous les Rapports
                  </button>
                  <button
                    onClick={onNewUpload}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Nouveau Fichier
                  </button>
                  <button
                    onClick={onClose}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Fermer
                  </button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un rapport..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Tous">Toutes catégories</option>
                    {CATEGORY_LIST.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2 ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-600"} hover:bg-gray-50`}
                    >
                      <Grid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-2 ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-600"} hover:bg-gray-50 border-l border-gray-300`}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-6 py-6">
            {selectedCategory === "Tous" ? (
              <div className="space-y-8">
                {Object.entries(categorizedReports).map(
                  ([category, reports]) =>
                    reports.length > 0 && (
                      <div key={category}>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Filter className="h-5 w-5 mr-2 text-blue-600" />
                          {category}
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            ({reports.length})
                          </span>
                        </h2>
                        <div
                          className={
                            viewMode === "grid"
                              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                              : "space-y-2"
                          }
                        >
                          {reports.map((report, idx) => (
                            <ReportCard
                              key={idx}
                              report={report}
                              viewMode={viewMode}
                              onView={() => handleViewReport(report)}
                              onEdit={() => handleEditReport(report)}
                            />
                          ))}
                        </div>
                      </div>
                    ),
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {filteredReports.length} résultat
                  {filteredReports.length !== 1 ? "s" : ""}
                </h2>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                      : "space-y-2"
                  }
                >
                  {filteredReports.map((report, idx) => (
                    <ReportCard
                      key={idx}
                      report={report}
                      viewMode={viewMode}
                      onView={() => handleViewReport(report)}
                      onEdit={() => handleEditReport(report)}
                    />
                  ))}
                </div>
              </div>
            )}
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
  viewMode: "grid" | "list";
  onView: () => void;
  onEdit: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  viewMode,
  onView,
  onEdit,
}) => {
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{report.noteName}</h3>
            <p className="text-sm text-gray-600">
              {report.success
                ? "Données extraites avec succès"
                : report.error || "Échec d'extraction"}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              report.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {report.success ? "Extrait" : "Échec"}
          </span>
        </div>
        {report.success && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={onView}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 mr-1" />
              Voir
            </button>
            <button
              onClick={onEdit}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-1" />
              Éditer
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {report.noteName}
          </h3>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
              report.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {report.success ? "Extrait" : "Échec"}
          </span>
        </div>
      </div>

      {report.success ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Données extraites avec succès</p>
          <div className="flex gap-2">
            <button
              onClick={onView}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 mr-1" />
              Voir
            </button>
            <button
              onClick={onEdit}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-1" />
              Éditer
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-red-600">
          {report.error || "Impossible d'extraire"}
        </div>
      )}
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
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
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
