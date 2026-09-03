import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ALL_REPORTS } from "./ReportRenderer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFormulaPanel } from "../../contexts/FormulaPanelContext";
import { useSidebar } from "../ui/sidebar";

/**
 * Bascule entre notes: deux flèches fixes dans les marges gauche/droite de
 * la page (larges et vides sur toutes les notes, format "feuille A4"),
 * plutôt qu'une barre collée en bas — invisible tant qu'on ne défile pas
 * jusqu'en bas d'une note, qui peut être longue. L'accès à l'index se fait
 * déjà via "Notes DSF" dans la barre latérale, donc pas de bouton dédié ici.
 */
export const ReportNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen: isFormulaPanelOpen } = useFormulaPanel();
  // La flèche gauche doit tomber dans la marge entre la barre latérale et le
  // contenu, pas à `left-4` depuis le bord de la fenêtre — sinon elle
  // atterrit par-dessus les liens de navigation quand la barre est
  // dépliée (16rem). En mode réduit (icônes seules), la barre ne fait
  // plus que 3rem.
  const { state: sidebarState } = useSidebar();
  const leftOffsetClass =
    sidebarState === "expanded" ? "left-[calc(16rem+1rem)]" : "left-[calc(3rem+1rem)]";

  // Trouve la note courante par égalité exacte sur le dernier segment de
  // l'URL — jamais par `.includes()`: "c01note3c" contient "note3c" comme
  // sous-chaîne, donc un simple `pathname.includes(routePath)` faisait
  // toujours matcher "NOTE 3C" en premier (il précède "C01 NOTE 3C" dans
  // ALL_REPORTS) dès qu'on était réellement sur la page C01/NOTE 3C — la
  // flèche "suivant" repointait alors vers la page déjà affichée, comme si
  // la navigation s'arrêtait net. Même collision pour note17/C1, note25/
  // C1/C2, note27a/C1, note28/C1/C2.
  const currentPathSegment =
    location.pathname.split("/").filter(Boolean).pop()?.toLowerCase() ?? "";
  const currentReport = ALL_REPORTS.find((report) => {
    const routePath = report.route.replace("rapport/", "").toLowerCase();
    return currentPathSegment === routePath;
  });

  if (!currentReport) return null;

  const currentIndex = ALL_REPORTS.indexOf(currentReport);
  const prevReport = currentIndex > 0 ? ALL_REPORTS[currentIndex - 1] : null;
  const nextReport =
    currentIndex < ALL_REPORTS.length - 1
      ? ALL_REPORTS[currentIndex + 1]
      : null;

  // Extract userId and language prefix from the current URL
  const userIdMatch = location.pathname.match(/\/reports\/([^/]+)\//);
  const userId = userIdMatch ? userIdMatch[1] : "current";
  const langMatch = location.pathname.match(/^\/(en|fr)\//);
  const langPrefix = langMatch ? langMatch[1] : "fr";

  // Function to navigate to another report while preserving the prefix
  const navigateToReport = (reportRoute: string) => {
    if (!reportRoute) return;
    // The route is like "rapport/note1", we need to build the full path
    // URL format: /reports/:userId/reports/rapport/note1
    const newPath = `/${langPrefix}/web/user/reports/${userId}/reports/${reportRoute}`;

    // Preserve folderId from current search params
    const searchParams = new URLSearchParams(location.search);
    const folderId = searchParams.get("folderId");
    const newSearch = folderId ? `?folderId=${folderId}` : "";

    navigate(`${newPath}${newSearch}`);
  };

  const arrowBase =
    "fixed top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground shadow-md backdrop-blur-sm transition-all hover:bg-card hover:text-foreground hover:scale-105";

  return (
    <>
      {prevReport && (
        <button
          onClick={() => navigateToReport(prevReport.route)}
          className={`${arrowBase} ${leftOffsetClass} transition-[left]`}
          title={prevReport.name}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {nextReport && (
        <button
          onClick={() => navigateToReport(nextReport.route)}
          className={`${arrowBase} ${isFormulaPanelOpen ? "right-[404px]" : "right-4"}`}
          title={nextReport.name}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </>
  );
};
