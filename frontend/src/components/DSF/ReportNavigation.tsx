import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ALL_REPORTS } from "./ReportRenderer";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { Button } from "../ui/button";

export const ReportNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Find current report by checking if the URL contains any report route
  const currentReport = ALL_REPORTS.find((report) => {
    const routePath = report.route.replace("rapport/", "");
    return location.pathname.toLowerCase().includes(routePath.toLowerCase());
  });

  if (!currentReport) return null;

  const currentIndex = ALL_REPORTS.indexOf(currentReport);
  const prevReport = currentIndex > 0 ? ALL_REPORTS[currentIndex - 1] : null;
  const nextReport =
    currentIndex < ALL_REPORTS.length - 1
      ? ALL_REPORTS[currentIndex + 1]
      : null;

  // Function to navigate to another report while preserving the prefix
  const navigateToReport = (reportRoute: string) => {
    if (!reportRoute) return;
    // The route is like "rapport/note1", we need to build the full path
    // URL format: /reports/:userId/reports/rapport/note1
    // We need to extract userId from the current URL
    const userIdMatch = location.pathname.match(/\/reports\/([^/]+)\//);
    const userId = userIdMatch ? userIdMatch[1] : "current";
    const newPath = `/fr/web/user/reports/${userId}/reports/${reportRoute}`;

    // Preserve folderId from current search params
    const searchParams = new URLSearchParams(location.search);
    const folderId = searchParams.get("folderId");
    const newSearch = folderId ? `?folderId=${folderId}` : "";

    navigate(`${newPath}${newSearch}`);
  };

  return (
    <div
      className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
      style={{ marginLeft: "224px" }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex-1">
          {prevReport && (
            <Button
              variant="ghost"
              onClick={() => navigateToReport(prevReport.route)}
              className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-black" strokeWidth={2.5} />
              <div className="flex flex-col items-start leading-tight">
                {/* <span className="text-[10px] text-gray-500 uppercase ">Précédent</span> */}
                <span className="text-sm font-semibold truncate max-w-[150px] text-gray-900">
                  {prevReport.name}
                </span>
              </div>
            </Button>
          )}
        </div>

        <div className="flex-none px-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Go back to exercises page
              navigate("/exercises");
            }}
            className="border-gray-300 hover:bg-gray-50"
            title="Retour à l'index"
          >
            <LayoutGrid className="h-4 w-4 mr-2 text-black" />
            <span className="font-medium">Index</span>
          </Button>
        </div>

        <div className="flex-1 flex justify-end">
          {nextReport && (
            <Button
              variant="ghost"
              onClick={() => navigateToReport(nextReport.route)}
              className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
              style={{ paddingLeft: "24px" }}
            >
              <div className="flex flex-col items-end leading-tight">
                {/* <span className="text-[10px] text-gray-500 uppercase font-bold">Suivant</span> */}
                <span className="px-2 text-sm font-semibold truncate max-w-[150px] text-gray-900">
                  {nextReport.name}
                </span>
              </div>
              <ChevronRight className="h-5 w-5 text-black" strokeWidth={2.5} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
