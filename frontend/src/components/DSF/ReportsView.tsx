// components/reports/ReportsView.tsx - Simple reports display with DSF check
import React, { useState, useMemo, useEffect, useRef, Suspense } from "react";
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
  Download,
  UploadCloud,
  Trash2,
  AlertCircle,
} from "lucide-react";
import type { ExtractionResult } from "./uploadSteps";
import { useNavigate, useLocation } from "react-router-dom";
import { dsfTemplateService } from "../../services/dsf-template.service";
import { notesService } from "../../services/notes.service";
import { useApp } from "../../contexts/AppContext";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import {
  REPORT_CATEGORIES,
  getNoteRoute,
  getReportByName,
  getReportOrderIndex,
  ALL_REPORTS,
  AllReportsGrid,
} from "./ReportRenderer";
import { ReportNavigation } from "./ReportNavigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Modal } from "../ui/modal";

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

  // Extract userId from URL path (no trailing slash required — this page's
  // own URL is ".../reports/:userId" with nothing after it)
  const userIdMatch = location.pathname.match(/\/reports\/([^/]+)(?:\/|$)/);
  const userId = userIdMatch ? userIdMatch[1] : "current";
  const langMatch = location.pathname.match(/^\/(en|fr)\//);
  const langPrefix = langMatch ? langMatch[1] : "fr";

  // Construit l'URL absolue attendue par les routes enregistrées
  // (".../reports/:userId/reports/rapport/:noteId?folderId=...") — un simple
  // navigate(routePath) relatif ne correspond à aucune route et affiche une
  // page blanche.
  const buildNoteUrl = (routePath: string) => {
    const newSearch = folderId ? `?folderId=${folderId}` : "";
    return `/${langPrefix}/web/user/reports/${userId}/reports/${routePath}${newSearch}`;
  };
  const [extractionResults, setExtractionResults] =
    useState<ExtractionResult[]>(initialResults);
  const [selectedReport, setSelectedReport] = useState<ExtractionResult | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 32; // 4 lignes x 8 colonnes sur grand écran
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
  const [selectedManualReport, setSelectedManualReport] = useState<{
    name: string;
    component: React.ComponentType<any>;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportFormatDialog, setShowExportFormatDialog] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [pdfCaptureReport, setPdfCaptureReport] = useState<{
    name: string;
    component: React.ComponentType<any>;
  } | null>(null);
  const pdfCaptureRef = useRef<HTMLDivElement>(null);
  const { selectedClient } = useApp();

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

  // Define additional reports to include in the display. The whole
  // "Structure Documentaire" section (cover/summary/identification pages)
  // is regime-agnostic and always shown, since the DSF extraction/
  // generation pipeline doesn't always produce an entry for these on its
  // own; `allReports` below dedupes by name so a note that IS also present
  // in `extractionResults` isn't shown twice. Assurance notes stay narrowly
  // filtered — showing the full Assurance set to every client regardless of
  // regime would undo the normal/SMT/Assurance separation.
  const additionalReports = useMemo(() => {
    const docsSpeciaux = REPORT_CATEGORIES["Structure Documentaire"] || [];
    const assuranceBase = REPORT_CATEGORIES["Assurance - Base"] || [];
    const assuranceToInclude = assuranceBase.filter(name =>
      ["BILAN ACTIF", "BILAN PASSIF"].includes(name.toUpperCase())
    );
    const toInclude = [...docsSpeciaux, ...assuranceToInclude];

    return toInclude.map(name => ({
      noteName: name,
      success: true,
      data: null,
      isAdditional: true,
    }));
  }, []);

  // Combine extracted results with additional reports, sorted into the
  // canonical DSF document order rather than backend/insertion order.
  // `additionalReports` always lists FICHE R3/BILAN PAYSAGE/etc. regardless
  // of whether the DSF was already generated with those same notes — dedupe
  // by name here so a note that exists in both isn't shown twice.
  const allReports = useMemo(() => {
    const existingNames = new Set(
      extractionResults.map((r) => r.noteName.toUpperCase().trim()),
    );
    const dedupedAdditional = additionalReports.filter(
      (r) => !existingNames.has(r.noteName.toUpperCase().trim()),
    );
    return [...extractionResults, ...dedupedAdditional].sort(
      (a, b) => getReportOrderIndex(a.noteName) - getReportOrderIndex(b.noteName),
    );
  }, [extractionResults, additionalReports]);

  const successCount = allReports.filter((r) => r.success).length;
  const totalPages = Math.ceil(allReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = allReports.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleViewReport = (report: ExtractionResult) => {
    // setSelectedReport(report);
    const normalizedNoteName = report.noteName.toUpperCase().trim();
    const routePath = getNoteRoute(normalizedNoteName);
    if (routePath && folderId) {
      navigate(buildNoteUrl(routePath));
    } else {
      console.warn(`No route found for note: ${report.noteName}`);
    }
  };

  const handleEditReport = (report: ExtractionResult) => {
    const normalizedNoteName = report.noteName.toUpperCase().trim();
    const routePath = getNoteRoute(normalizedNoteName);
    if (routePath && folderId) {
      navigate(buildNoteUrl(routePath));
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

  const handleChooseExportFormat = (format: "pdf" | "excel") => {
    setShowExportFormatDialog(false);
    if (format === "excel") {
      handleExportExcel();
    } else {
      handleExportPDF();
    }
  };

  // Combined PDF export: renders every note that applies to this client's
  // DSF regime (allReports already reflects that — see the comment above
  // its definition) off-screen, one at a time, captures each with
  // html2canvas the same way each note's own "Télécharger PDF" button does,
  // and stitches the pages into a single jsPDF document.
  const handleExportPDF = async () => {
    if (!folderId) {
      alert("Veuillez d'abord sélectionner un dossier.");
      return;
    }

    const reportsToExport: {
      noteName: string;
      def: NonNullable<ReturnType<typeof getReportByName>>;
    }[] = [];
    for (const r of allReports) {
      const def = getReportByName(r.noteName);
      if (def) reportsToExport.push({ noteName: r.noteName, def });
    }

    if (reportsToExport.length === 0) {
      alert("Aucune note à exporter.");
      return;
    }

    setIsExportingPdf(true);
    setPdfProgress({ current: 0, total: reportsToExport.length });

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      for (let i = 0; i < reportsToExport.length; i++) {
        const { def } = reportsToExport[i];
        setPdfProgress({ current: i + 1, total: reportsToExport.length });
        setPdfCaptureReport({ name: def.name, component: def.component });

        // Let the (possibly lazy-loaded) component mount and fetch its own
        // note data, same as when a user opens it directly.
        await new Promise((resolve) => setTimeout(resolve, 1100));

        const node = pdfCaptureRef.current;
        if (node) {
          const canvas = await html2canvas(node, {
            scale: 2,
            backgroundColor: "#ffffff",
          });
          const imgData = canvas.toDataURL("image/png");
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        }
      }

      const sanitizedName = (selectedClient?.name || "Client")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
      const date = new Date().toISOString().split("T")[0];
      pdf.save(`DSF_${sanitizedName}_${date}.pdf`);
    } catch (error: any) {
      console.error("Error exporting DSF PDF:", error);
      alert(error?.message || "Erreur lors de l'export PDF");
    } finally {
      setPdfCaptureReport(null);
      setPdfProgress(null);
      setIsExportingPdf(false);
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

  // Handle delete all DSF notes (confirmation happens via the AlertDialog below,
  // not window.confirm() — that native dialog can be blocked by the browser,
  // which made deletion silently impossible)
  const handleDeleteDSF = async () => {
    if (!folderId) return;

    setIsDeleting(true);
    try {
      await notesService.deleteAllNotes(folderId);
      // Clear the local state
      setExtractionResults([]);
      setShowDeleteConfirm(false);
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
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-7 w-7 text-primary animate-spin mr-3" />
        <p className="text-sm text-muted-foreground">
          Vérification des données DSF existantes...
        </p>
      </div>
    );
  }

  // Show choice modal when no DSF exists
  if (showChoiceModal && extractionResults.length === 0) {
    return (
      <Modal open onClose={onClose} size="lg" hideHeader bodyClassName="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-full mb-4">
            <FileText className="h-7 w-7 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-1.5">
            Aucune DSF trouvée
          </h2>
          <p className="text-sm text-muted-foreground">
            Comment souhaitez-vous créer vos rapports DSF ?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Import DSF Option */}
          <button
            onClick={() => {
              setShowChoiceModal(false);
              onNewUpload();
            }}
            className="group rounded-xl border border-border p-6 text-center transition-all hover:border-orange-400 hover:bg-orange-50/40 hover:shadow-sm"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-50 rounded-full mb-4 transition-colors group-hover:bg-orange-100">
              <Upload className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1.5">
              Importer DSF
            </h3>
            <p className="text-sm text-muted-foreground">
              Importer un fichier DSF existant pour extraire automatiquement les
              données
            </p>
          </button>

          {/* Normal Generation Option */}
          <button
            onClick={() => {
              setShowChoiceModal(false);
              setShowAllReportsGrid(true);
            }}
            className="group rounded-xl border border-border p-6 text-center transition-all hover:border-green-400 hover:bg-green-50/40 hover:shadow-sm"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-full mb-4 transition-colors group-hover:bg-green-100">
              <FileEdit className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1.5">
              Génération Manuelle
            </h3>
            <p className="text-sm text-muted-foreground">
              Créer et remplir manuellement les rapports DSF depuis zéro
            </p>
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>Vous pourrez changer de méthode plus tard</span>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full h-10 border border-border text-foreground rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium"
        >
          Annuler
        </button>
      </Modal>
    );
  }

  // Show All Reports Grid when manual generation is selected
  if (showAllReportsGrid) {
    return (
      <>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Tous les Rapports Disponibles
              </h2>
              <p className="text-sm text-muted-foreground">
                Sélectionnez un rapport pour le visualiser ou commencer à le remplir
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onNewUpload}
                className="inline-flex h-9 items-center px-3.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importer DSF
              </button>
              <button
                onClick={() => setShowAllReportsGrid(false)}
                className="inline-flex h-9 items-center px-3.5 text-sm font-medium border border-border bg-white text-foreground rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Retour
              </button>
            </div>
          </div>

          {/* All Reports Grid */}
          <AllReportsGrid
            folderId={folderId}
            onViewReport={(name, Component) => {
              const report = ALL_REPORTS.find((r) => r.name === name);
              const route =
                report?.route?.replace("rapport/", "") ||
                name.toLowerCase().replace(" ", "");

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
                const langMatch = location.pathname.match(/^\/(en|fr)\//);
                const langPrefix = langMatch ? langMatch[1] : "fr";
                window.open(
                  `/${langPrefix}/web/user/reports/${userId}/reports/rapport/${route}?folderId=${folderId || ""}`,
                  "_blank",
                );
              } else {
                setSelectedManualReport({ name, component: Component });
              }
            }}
          />
        </div>

        {/* Preview Modal for Manual Reports */}
        <Modal
          open={!!selectedManualReport}
          onClose={() => setSelectedManualReport(null)}
          size="2xl"
          title={selectedManualReport?.name}
          description="Prévisualisation du rapport"
        >
          {selectedManualReport && (
            <selectedManualReport.component folderId={folderId} />
          )}
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Notes DSF
            </h2>
            <p className="text-sm text-muted-foreground">
              {successCount} sur {allReports.length} rapports disponibles
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex h-9 items-center px-3.5 text-sm font-medium bg-white border border-border text-foreground rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              {isUploadingTemplate ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4 mr-2" />
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
              onClick={() => setShowExportFormatDialog(true)}
              disabled={isExporting || isExportingPdf}
              title="Exporter la DSF"
              className="inline-flex h-9 items-center px-3.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isExporting || isExportingPdf ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExportingPdf && pdfProgress
                ? `PDF ${pdfProgress.current}/${pdfProgress.total}`
                : "Exporter"}
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="inline-flex h-9 items-center px-3.5 text-sm font-medium bg-white border border-border text-red-600 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Supprimer
            </button>

            <button
              onClick={onClose}
              title="Fermer"
              className="inline-flex h-9 w-9 items-center justify-center border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {paginatedReports.map((report, idx) => (
                <ReportCard
                  key={idx}
                  report={report}
                  onView={() => handleViewReport(report)}
                />
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-9 items-center px-3.5 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Précédent
              </button>

              <span className="text-sm text-muted-foreground tabular-nums">
                {startIndex + 1}–
                {Math.min(startIndex + itemsPerPage, allReports.length)} sur{" "}
                {allReports.length}
              </span>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="inline-flex h-9 items-center px-3.5 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>

      <ReportPreviewModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        folderId={folderId}
      />

      <Modal
        open={showExportFormatDialog}
        onClose={() => setShowExportFormatDialog(false)}
        size="sm"
        title="Exporter la DSF"
        description="Choisissez un format d'export"
      >
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleChooseExportFormat("pdf")}
            className="flex flex-col items-center gap-2 rounded-lg border border-border p-5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <FileText className="h-6 w-6 text-gray-500" />
            PDF
          </button>
          <button
            onClick={() => handleChooseExportFormat("excel")}
            disabled={!templateStatus?.hasTemplate}
            title={
              !templateStatus?.hasTemplate
                ? "Importez d'abord un template Excel via le bouton « Template »"
                : undefined
            }
            className="flex flex-col items-center gap-2 rounded-lg border border-border p-5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <FileSpreadsheet className="h-6 w-6 text-gray-500" />
            Excel
          </button>
        </div>
      </Modal>

      {/* Off-screen render target used to capture each note as a PDF page.
          Buttons are hidden so only the report content is captured. */}
      {pdfCaptureReport && (
        <div style={{ position: "fixed", top: 0, left: "-10000px", zIndex: -1 }}>
          <div ref={pdfCaptureRef} className="bg-white [&_button]:hidden">
            <Suspense fallback={<div style={{ padding: 40 }}>Chargement…</div>}>
              <pdfCaptureReport.component folderId={folderId} />
            </Suspense>
          </div>
        </div>
      )}

      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => !isDeleting && setShowDeleteConfirm(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer toutes les données DSF ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer toutes les données DSF de ce
              dossier ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDSF}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ==================== REPORT CARD ====================
interface ReportCardProps {
  report: ExtractionResult & { isAdditional?: boolean };
  onView: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onView }) => {
  const isAdditional = report.isAdditional;
  const displayName = isAdditional
    ? report.noteName
    : report.noteName.replace("NOTE ", "").replace("NOTE", "");

  return (
    <button
      type="button"
      onClick={onView}
      title={
        report.success
          ? report.noteName
          : `${report.noteName} — données indisponibles`
      }
      className={`group relative flex min-h-[104px] w-full flex-col items-center justify-center gap-2.5 rounded-lg border border-border bg-secondary px-3 py-4 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-orange-50 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        !report.success ? "opacity-60" : ""
      }`}
    >
      {/* Pastille de statut */}
      <span
        className={`absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full ${
          report.success ? "bg-emerald-500" : "bg-muted-foreground/40"
        }`}
      />

      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-border/60 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
        <FileText className="h-4 w-4" />
      </span>

      <span className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
        {displayName}
      </span>
    </button>
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
                    ? "bg-orange-50 text-orange-600 font-medium"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Composant
              </button>
              <button
                onClick={() => setViewMode("data")}
                className={`px-3 py-2 text-sm border-l border-gray-300 ${
                  viewMode === "data"
                    ? "bg-orange-50 text-orange-600 font-medium"
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
