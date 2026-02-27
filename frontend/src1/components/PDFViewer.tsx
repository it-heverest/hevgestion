import React, { useState, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  X,
  Loader2,
} from "lucide-react";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  title: string;
  onClose: () => void;
  onDownload?: () => void;
  isExcelFile?: boolean;
}

export function PDFViewer({
  url,
  title,
  onClose,
  onDownload,
  isExcelFile = false,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [officeOnlineUrl, setOfficeOnlineUrl] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setLoading(false);
      setError(null);
    },
    []
  );

  // Check if file is Excel and prepare Office Online URL
  useEffect(() => {
    if (isExcelFile && url) {
      // Create Office Online viewing URL for Excel files
      const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        window.location.origin + url
      )}&wdHideWorksheetTabs=true`;
      setOfficeOnlineUrl(officeUrl);
      setLoading(false);
    }
  }, [isExcelFile, url]);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error("Error loading PDF:", error);
    setError("Erreur lors du chargement du PDF");
    setLoading(false);
  }, []);

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <div className="text-sm text-gray-500">PDF Viewer</div>
            </div>
          </div>
          <div className="flex space-x-2">
            {onDownload && (
              <Button variant="outline" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <X className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Erreur de chargement</p>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="text-sm text-gray-500">
              Page {pageNumber} sur {numPages || "?"}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {/* Navigation */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Zoom */}
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="flex items-center px-2 text-sm">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>

          {/* Rotation */}
          <Button variant="outline" size="sm" onClick={rotate}>
            <RotateCw className="h-4 w-4" />
          </Button>

          {/* Download */}
          {onDownload && (
            <Button variant="outline" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-100">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Chargement du PDF...</p>
            </div>
          </div>
        )}

        {!loading && (
          <div className="flex justify-center py-8">
            {isExcelFile && officeOnlineUrl ? (
              // Excel file - use Office Online viewer
              <iframe
                src={officeOnlineUrl}
                className="w-full h-full border-0 min-h-[600px]"
                title={`Excel ${title}`}
              />
            ) : (
              // PDF file - use react-pdf
              <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  loading={
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  }
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
