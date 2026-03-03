import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ALL_REPORTS } from "./ReportRenderer";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { Button } from "../ui/button";

export const ReportNavigation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Find current report index by checking if the current path ends with the report route
    const currentIndex = ALL_REPORTS.findIndex(
        (report) => location.pathname.toLowerCase().endsWith(report.route.toLowerCase())
    );

    if (currentIndex === -1) return null;

    const currentReport = ALL_REPORTS[currentIndex];
    const prevReport = currentIndex > 0 ? ALL_REPORTS[currentIndex - 1] : null;
    const nextReport = currentIndex < ALL_REPORTS.length - 1 ? ALL_REPORTS[currentIndex + 1] : null;

    // Function to navigate to another report while preserving the prefix
    const navigateToReport = (reportRoute: string) => {
        // Replace the current report's route part with the new one
        const newPath = location.pathname.replace(currentReport.route, reportRoute);
        navigate(`${newPath}${location.search}`);
    };

    return (
        <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]" style={{ marginLeft: '224px' }} >
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
                                <span className="text-sm font-semibold truncate max-w-[150px] text-gray-900">{prevReport.name}</span>
                            </div>
                        </Button>
                    )}
                </div>

                <div className="flex-none px-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(location.pathname.split('/rapport/')[0] + location.search)}
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
                            style={{ paddingLeft: '24px' }}
                        >
                            <div className="flex flex-col items-end leading-tight">
                                {/* <span className="text-[10px] text-gray-500 uppercase font-bold">Suivant</span> */}
                                <span className="px-2 text-sm font-semibold truncate max-w-[150px] text-gray-900">{nextReport.name}</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-black" strokeWidth={2.5} />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
