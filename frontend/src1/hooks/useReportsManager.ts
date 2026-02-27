// hooks/useReportsManager.ts
import { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";

export interface Report {
  id: string;
  name: string;
  data: any;
  file?: File;
}

export function useReportsManager(companyName: string) {
  const { selectedFolder, selectedClient } = useApp();

  // États
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [action, setAction] = useState<"view" | "edit" | "options" | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentYear = selectedFolder?.fiscalYear || new Date().getFullYear();

  // Données des rapports par année - fetched from backend
  const [reportsByYear, setReportsByYear] = useState<Record<string, Report[]>>({});

  // Fetch reports from backend when folder changes
  useEffect(() => {
    const fetchReports = async () => {
      if (!selectedFolder?.id) {
        setReportsByYear({});
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const reports = await fetchReportsFromBackend();
        if (reports && Array.isArray(reports)) {
          setReportsByYear({
            [currentYear]: reports.filter((r: any) => r.year === currentYear),
            [currentYear - 1]: reports.filter((r: any) => r.year === currentYear - 1),
          });
        } else {
          // Fallback to mock data if no reports returned
          setReportsByYear({
            [currentYear]: generateSimplifiedReports(currentYear),
            [currentYear - 1]: generateSimplifiedReports(currentYear - 1).slice(0, 6),
          });
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Erreur lors du chargement des rapports");
        // Fallback to mock data if backend fails
        setReportsByYear({
          [currentYear]: generateSimplifiedReports(currentYear),
          [currentYear - 1]: generateSimplifiedReports(currentYear - 1).slice(0, 6),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [selectedFolder?.id, currentYear]);

  // Générer les rapports simplifiés
  function generateSimplifiedReports(year: number): Report[] {
    const reports = [
      { id: "R1", name: "Bilan Actif" },
      { id: "R2", name: "Bilan Passif" },
      { id: "R3", name: "Compte Résultat" },
      { id: "note1", name: "Note 1" },
      { id: "note2", name: "Note 2" },
      { id: "note3", name: "Note 3" },
      { id: "note4", name: "Note 4" },
      { id: "note5", name: "Note 5" },
      { id: "fiche1", name: "Fiche 1" },
      { id: "fiche2", name: "Fiche 2" },
      { id: "annexe1", name: "Annexe 1" },
      { id: "annexe2", name: "Annexe 2" },
    ];

    return reports.map((report) => ({
      ...report,
      id: year === currentYear ? report.id : `prev-${report.id}`,
      data: generateSampleExcelData(report.id),
    }));
  }

  // Fetch reports from backend
  const fetchReportsFromBackend = async () => {
    if (!selectedFolder?.id) return;

    try {
      // TODO: Implement backend API call to fetch DSF reports
      // const response = await api.get(`/dsf/${selectedFolder.id}/reports`);
      // return response.data.reports;
      console.log("Fetching reports from backend for folder:", selectedFolder.id);
      return [];
    } catch (error) {
      console.error("Error fetching reports from backend:", error);
      return [];
    }
  };

  // Filtrer les rapports par terme de recherche
  const getReportsFor = (year: number) => {
    const reports = reportsByYear[year] || [];
    if (!searchTerm) return reports;

    return reports.filter(
      (report) =>
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Gérer le clic sur une carte
  const handleCardClick = (report: Report) => {
    setSelectedReport(report);
    setAction("options");
  };

  // Gérer les actions
  const handleAction = (
    actionType: "edit" | "download" | "delete" | "upload-dsf"
  ) => {
    if (!selectedReport) return;

    switch (actionType) {
      case "edit":
        setAction("edit");
        break;
      case "download":
        downloadReport(selectedReport);
        break;
      case "delete":
        deleteReport(selectedReport);
        break;
      case "upload-dsf":
        handleFileUpload();
        break;
    }
  };

  // Télécharger un rapport
  const downloadReport = (report: Report) => {
    alert(`Téléchargement: ${report.name}`);
    // Implémentation réelle du téléchargement
    console.log("Téléchargement du rapport:", report);
  };

  // Supprimer un rapport
  const deleteReport = (report: Report) => {
    if (confirm(`Supprimer ${report.name} ?`)) {
      setReportsByYear((prev) => ({
        ...prev,
        [currentYear]: prev[currentYear].filter((r) => r.id !== report.id),
      }));
      setAction(null);
      setSelectedReport(null);
    }
  };

  // Gérer l'upload de fichier
  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const tempReport: Report = {
          id: "uploaded-dsf",
          name: "DSF Téléversé",
          data: null,
          file: file,
        };
        setSelectedReport(tempReport);
        setAction("edit");
      }
    };
    input.click();
  };

  // Mettre à jour les données d'un rapport
  const updateReportData = (newData: any) => {
    if (!selectedReport) return;

    setReportsByYear((prev) => ({
      ...prev,
      [currentYear]: prev[currentYear].map((report) =>
        report.id === selectedReport.id ? { ...report, data: newData } : report
      ),
    }));

    setAction(null);
    setSelectedReport(null);
  };

  // Fermer le dialog
  const closeDialog = () => {
    setAction(null);
    setSelectedReport(null);
  };

  // Récupérer les rapports actuels et précédents
  const currentReports = getReportsFor(currentYear);
  const previousReports = getReportsFor(currentYear - 1);

  return {
    // États
    searchTerm,
    selectedReport,
    action,
    currentYear,
    currentReports,
    previousReports,
    companyName,
    loading,
    error,

    // Actions
    setSearchTerm,
    setAction,
    setSelectedReport,
    handleCardClick,
    handleAction,
    handleFileUpload,
    updateReportData,
    closeDialog,
  };
}

// Génère des données Excel factices
function generateSampleExcelData(reportId: string) {
  return [
    ["ID", "Description", "Valeur", "Statut"],
    ["001", "Ligne 1", "1000", "Actif"],
    ["002", "Ligne 2", "2500", "Passif"],
    ["003", "Ligne 3", "1800", "Actif"],
  ];
}
