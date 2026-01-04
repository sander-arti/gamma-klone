/**
 * ExportModal Component
 *
 * Modal for exporting decks to PDF and PPTX formats.
 * Shows export progress and download links.
 */

"use client";

import { useEffect } from "react";
import { Modal, Button, useToast } from "@/components/ui";
import { useExport, type ExportStatus } from "@/lib/hooks";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: string;
}

function ExportStatusIndicator({ status, error }: { status: ExportStatus; error: string | null }) {
  if (status === "idle") return null;

  if (status === "queued" || status === "running") {
    return (
      <div className="flex items-center gap-2 text-blue-600">
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-sm">{status === "queued" ? "Venter i kø..." : "Eksporterer..."}</span>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm">Klar for nedlasting!</span>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <span className="text-sm">{error ?? "Eksport feilet"}</span>
      </div>
    );
  }

  return null;
}

export function ExportModal({ isOpen, onClose, deckId }: ExportModalProps) {
  const {
    exportPdf,
    exportPptx,
    pdfStatus,
    pptxStatus,
    pdfUrl,
    pptxUrl,
    pdfError,
    pptxError,
    isExporting,
    reset,
  } = useExport(deckId);
  const { addToast } = useToast();

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to allow modal animation to complete
      const timeout = setTimeout(() => reset(), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, reset]);

  const handleExportPdf = async () => {
    await exportPdf();
  };

  const handleExportPptx = async () => {
    await exportPptx();
  };

  const handleDownload = (url: string, format: "pdf" | "pptx") => {
    window.open(url, "_blank");
    addToast({ type: "success", message: `${format.toUpperCase()}-fil åpnes i ny fane` });
  };

  const isPdfBusy = pdfStatus === "queued" || pdfStatus === "running";
  const isPptxBusy = pptxStatus === "queued" || pptxStatus === "running";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eksporter presentasjon"
      description="Last ned presentasjonen som PDF eller PowerPoint-fil."
      size="md"
    >
      <div className="space-y-6">
        {/* PDF Export */}
        <div className="p-4 border border-gray-200 rounded-xl">
          <div className="flex items-start gap-4">
            {/* PDF Icon */}
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13.5v3h1v-1h.5a1.5 1.5 0 0 0 0-3h-1.5zm1 1h.5a.5.5 0 1 1 0 1h-.5v-1zm3-1v3h1.25a1.5 1.5 0 0 0 0-3H12.5zm1 1v1h.25a.5.5 0 1 0 0-1h-.25zm2.5-1v3h1v-1.25h.75v-1h-.75V14.5h1v-1h-2z" />
              </svg>
            </div>

            {/* PDF Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900">PDF</h3>
              <p className="text-sm text-gray-500 mb-3">Perfekt for visning og utskrift</p>

              <ExportStatusIndicator status={pdfStatus} error={pdfError} />

              {pdfStatus === "idle" && (
                <Button
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  variant="secondary"
                  size="sm"
                >
                  Eksporter PDF
                </Button>
              )}

              {pdfStatus === "completed" && pdfUrl && (
                <Button onClick={() => handleDownload(pdfUrl, "pdf")} size="sm">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Last ned PDF
                </Button>
              )}

              {pdfStatus === "failed" && (
                <Button
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  variant="secondary"
                  size="sm"
                >
                  Prøv igjen
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* PPTX Export */}
        <div className="p-4 border border-gray-200 rounded-xl">
          <div className="flex items-start gap-4">
            {/* PPTX Icon */}
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8 12h3a2 2 0 1 1 0 4H9v2H8v-6zm1 3h2a1 1 0 1 0 0-2H9v2zm5-3h3a2 2 0 1 1 0 4h-2v2h-1v-6zm1 3h2a1 1 0 1 0 0-2h-2v2z" />
              </svg>
            </div>

            {/* PPTX Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900">PowerPoint</h3>
              <p className="text-sm text-gray-500 mb-3">Redigerbar fil for Microsoft PowerPoint</p>

              <ExportStatusIndicator status={pptxStatus} error={pptxError} />

              {pptxStatus === "idle" && (
                <Button
                  onClick={handleExportPptx}
                  disabled={isExporting}
                  variant="secondary"
                  size="sm"
                >
                  Eksporter PowerPoint
                </Button>
              )}

              {pptxStatus === "completed" && pptxUrl && (
                <Button onClick={() => handleDownload(pptxUrl, "pptx")} size="sm">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Last ned PowerPoint
                </Button>
              )}

              {pptxStatus === "failed" && (
                <Button
                  onClick={handleExportPptx}
                  disabled={isExporting}
                  variant="secondary"
                  size="sm"
                >
                  Prøv igjen
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Progress warning */}
        {isExporting && (
          <p className="text-xs text-gray-500 text-center">
            Eksport kan ta opptil et minutt avhengig av presentasjonens størrelse.
          </p>
        )}
      </div>
    </Modal>
  );
}
