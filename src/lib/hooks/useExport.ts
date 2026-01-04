/**
 * useExport Hook
 *
 * React hook for managing deck exports (PDF and PPTX).
 * Handles triggering exports and polling for completion.
 */

import { useState, useCallback, useRef, useEffect } from "react";

export type ExportStatus = "idle" | "queued" | "running" | "completed" | "failed";
export type ExportFormat = "pdf" | "pptx";

interface ExportState {
  status: ExportStatus;
  jobId: string | null;
  fileUrl: string | null;
  error: string | null;
}

interface UseExportReturn {
  /** Trigger PDF export */
  exportPdf: () => Promise<void>;
  /** Trigger PPTX export */
  exportPptx: () => Promise<void>;
  /** PDF export status */
  pdfStatus: ExportStatus;
  /** PPTX export status */
  pptxStatus: ExportStatus;
  /** PDF download URL (when completed) */
  pdfUrl: string | null;
  /** PPTX download URL (when completed) */
  pptxUrl: string | null;
  /** PDF error message */
  pdfError: string | null;
  /** PPTX error message */
  pptxError: string | null;
  /** Whether any export is in progress */
  isExporting: boolean;
  /** Reset export state */
  reset: () => void;
}

const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_ATTEMPTS = 150; // 5 minutes max

/**
 * Hook for managing deck exports
 *
 * @param deckId - The deck ID to export
 */
export function useExport(deckId: string): UseExportReturn {
  const [pdfState, setPdfState] = useState<ExportState>({
    status: "idle",
    jobId: null,
    fileUrl: null,
    error: null,
  });
  const [pptxState, setPptxState] = useState<ExportState>({
    status: "idle",
    jobId: null,
    fileUrl: null,
    error: null,
  });

  // Polling intervals refs
  const pdfPollRef = useRef<NodeJS.Timeout | null>(null);
  const pptxPollRef = useRef<NodeJS.Timeout | null>(null);
  const pdfPollCountRef = useRef(0);
  const pptxPollCountRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfPollRef.current) clearInterval(pdfPollRef.current);
      if (pptxPollRef.current) clearInterval(pptxPollRef.current);
    };
  }, []);

  // Poll for export status
  const pollStatus = useCallback(
    async (
      format: ExportFormat,
      jobId: string,
      setState: React.Dispatch<React.SetStateAction<ExportState>>,
      pollRef: React.MutableRefObject<NodeJS.Timeout | null>,
      pollCountRef: React.MutableRefObject<number>
    ) => {
      try {
        const response = await fetch(`/api/decks/${deckId}/export/${jobId}`);
        const data = await response.json();

        if (!response.ok) {
          setState((prev) => ({
            ...prev,
            status: "failed",
            error: data.error?.message ?? "Kunne ikke hente eksportstatus",
          }));
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          return;
        }

        // Update state based on status
        const newStatus = data.status as ExportStatus;
        setState((prev) => ({
          ...prev,
          status: newStatus,
          fileUrl: data.fileUrl ?? null,
          error: data.error?.message ?? null,
        }));

        // Stop polling if completed or failed
        if (newStatus === "completed" || newStatus === "failed") {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }

        // Check max attempts
        pollCountRef.current++;
        if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
          setState((prev) => ({
            ...prev,
            status: "failed",
            error: "Eksporten tok for lang tid. Prøv igjen senere.",
          }));
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      } catch (err) {
        console.error(`useExport poll error (${format}):`, err);
        setState((prev) => ({
          ...prev,
          status: "failed",
          error: "Nettverksfeil ved sjekking av eksportstatus",
        }));
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    },
    [deckId]
  );

  // Trigger export
  const triggerExport = useCallback(
    async (format: ExportFormat) => {
      const setState = format === "pdf" ? setPdfState : setPptxState;
      const pollRef = format === "pdf" ? pdfPollRef : pptxPollRef;
      const pollCountRef = format === "pdf" ? pdfPollCountRef : pptxPollCountRef;

      // Reset state
      setState({
        status: "queued",
        jobId: null,
        fileUrl: null,
        error: null,
      });

      // Clear any existing poll
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      pollCountRef.current = 0;

      try {
        const response = await fetch(`/api/decks/${deckId}/export`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format }),
        });

        const data = await response.json();

        if (!response.ok) {
          setState({
            status: "failed",
            jobId: null,
            fileUrl: null,
            error: data.error?.message ?? "Kunne ikke starte eksport",
          });
          return;
        }

        const jobId = data.exportJobId;
        setState((prev) => ({
          ...prev,
          jobId,
        }));

        // Start polling
        pollRef.current = setInterval(() => {
          pollStatus(format, jobId, setState, pollRef, pollCountRef);
        }, POLL_INTERVAL);

        // Initial poll immediately
        pollStatus(format, jobId, setState, pollRef, pollCountRef);
      } catch (err) {
        console.error(`useExport triggerExport error (${format}):`, err);
        setState({
          status: "failed",
          jobId: null,
          fileUrl: null,
          error: "Nettverksfeil ved start av eksport",
        });
      }
    },
    [deckId, pollStatus]
  );

  const exportPdf = useCallback(async () => {
    await triggerExport("pdf");
  }, [triggerExport]);

  const exportPptx = useCallback(async () => {
    await triggerExport("pptx");
  }, [triggerExport]);

  const reset = useCallback(() => {
    if (pdfPollRef.current) clearInterval(pdfPollRef.current);
    if (pptxPollRef.current) clearInterval(pptxPollRef.current);
    pdfPollRef.current = null;
    pptxPollRef.current = null;
    pdfPollCountRef.current = 0;
    pptxPollCountRef.current = 0;

    setPdfState({
      status: "idle",
      jobId: null,
      fileUrl: null,
      error: null,
    });
    setPptxState({
      status: "idle",
      jobId: null,
      fileUrl: null,
      error: null,
    });
  }, []);

  const isExporting =
    pdfState.status === "queued" ||
    pdfState.status === "running" ||
    pptxState.status === "queued" ||
    pptxState.status === "running";

  return {
    exportPdf,
    exportPptx,
    pdfStatus: pdfState.status,
    pptxStatus: pptxState.status,
    pdfUrl: pdfState.fileUrl,
    pptxUrl: pptxState.fileUrl,
    pdfError: pdfState.error,
    pptxError: pptxState.error,
    isExporting,
    reset,
  };
}
