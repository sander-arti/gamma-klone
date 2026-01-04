"use client";

/**
 * ImportInput
 *
 * Input for creating presentations from uploaded files (PDF, DOCX, TXT).
 * Handles presigned URL upload → S3 → extraction via SSE.
 * Theme/length configured in PromptEditor (step 2).
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui";
import { FileDropZone } from "../FileDropZone";
import type { InputData } from "../InputStep";
import { SUPPORTED_MIME_TYPES } from "@/lib/extraction";

interface ImportInputProps {
  onNext: (data: InputData & { sourceFileId?: string }) => void;
  initialData?: Partial<InputData>;
}

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number; filename: string }
  | { status: "processing"; filename: string; message: string }
  | {
      status: "ready";
      filename: string;
      extractedText: string;
      charCount: number;
      truncated: boolean;
      uploadId: string;
    }
  | { status: "error"; filename?: string; error: string };

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ImportInput({ onNext, initialData }: ImportInputProps) {
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
  const [showFullPreview, setShowFullPreview] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    // Reset state
    setUploadState({ status: "uploading", progress: 0, filename: file.name });

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Step 1: Get presigned URL
      const presignResponse = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!presignResponse.ok) {
        const errorData = await presignResponse.json();
        throw new Error(errorData.error?.message ?? "Kunne ikke starte opplasting");
      }

      const { uploadId, presignedUrl } = await presignResponse.json();

      // Step 2: Upload to S3 with progress
      await uploadToS3WithProgress(file, presignedUrl, (progress) => {
        setUploadState({ status: "uploading", progress, filename: file.name });
      });

      // Step 3: Confirm upload
      setUploadState({ status: "processing", filename: file.name, message: "Bekrefter opplasting..." });

      const confirmResponse = await fetch(`/api/upload/${uploadId}/confirm`, {
        method: "POST",
        signal: abortControllerRef.current.signal,
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.error?.message ?? "Kunne ikke bekrefte opplasting");
      }

      // Step 4: Listen for extraction status via SSE
      setUploadState({ status: "processing", filename: file.name, message: "Ekstraherer tekst fra fil..." });

      await subscribeToExtractionStatus(uploadId, file.name);

    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setUploadState({ status: "idle" });
        return;
      }

      setUploadState({
        status: "error",
        filename: file.name,
        error: error instanceof Error ? error.message : "Noe gikk galt under opplasting",
      });
    }
  }, []);

  const uploadToS3WithProgress = (
    file: File,
    presignedUrl: string,
    onProgress: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Opplasting feilet med status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Nettverksfeil under opplasting"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Opplasting avbrutt"));
      });

      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);

      // Store reference for potential abort
      abortControllerRef.current?.signal.addEventListener("abort", () => {
        xhr.abort();
      });
    });
  };

  const subscribeToExtractionStatus = (uploadId: string, filename: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`/api/upload/${uploadId}/status`);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener("processing", (event) => {
        const data = JSON.parse(event.data);
        setUploadState({
          status: "processing",
          filename,
          message: data.message ?? "Ekstraherer tekst...",
        });
      });

      eventSource.addEventListener("completed", (event) => {
        const data = JSON.parse(event.data);
        eventSource.close();
        eventSourceRef.current = null;

        setUploadState({
          status: "ready",
          filename,
          extractedText: data.extractedText,
          charCount: data.charCount,
          truncated: data.truncated ?? false,
          uploadId,
        });
        resolve();
      });

      eventSource.addEventListener("failed", (event) => {
        const data = JSON.parse(event.data);
        eventSource.close();
        eventSourceRef.current = null;

        setUploadState({
          status: "error",
          filename,
          error: data.error?.message ?? "Ekstraksjon feilet",
        });
        reject(new Error(data.error?.message ?? "Ekstraksjon feilet"));
      });

      eventSource.addEventListener("error", () => {
        // EventSource will auto-reconnect, but we set a timeout
        setTimeout(() => {
          if (eventSource.readyState === EventSource.CLOSED) {
            eventSource.close();
            eventSourceRef.current = null;
            setUploadState({
              status: "error",
              filename,
              error: "Mistet tilkobling til server",
            });
            reject(new Error("SSE connection lost"));
          }
        }, 5000);
      });
    });
  };

  const handleReset = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setUploadState({ status: "idle" });
  };

  const handleSubmit = () => {
    if (uploadState.status !== "ready") return;

    onNext({
      inputText: uploadState.extractedText,
      textMode: "condense", // Default for file imports
      language: "no",
      sourceFileId: uploadState.uploadId,
    });
  };

  const isReady = uploadState.status === "ready";
  const isProcessing = uploadState.status === "uploading" || uploadState.status === "processing";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative">
        {/* Gradient glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 rounded-2xl opacity-10 blur-lg" />

        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* File upload zone */}
          <div className="p-6">
            {uploadState.status === "idle" && (
              <FileDropZone
                onFileSelect={handleFileSelect}
                accept={[...SUPPORTED_MIME_TYPES]}
                maxSize={MAX_FILE_SIZE}
                disabled={false}
              />
            )}

            {uploadState.status === "uploading" && (
              <div className="py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-base font-medium text-gray-900 mb-1">{uploadState.filename}</p>
                <p className="text-sm text-gray-500 mb-4">Laster opp...</p>
                <div className="w-64 mx-auto h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{uploadState.progress}%</p>
              </div>
            )}

            {uploadState.status === "processing" && (
              <div className="py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <p className="text-base font-medium text-gray-900 mb-1">{uploadState.filename}</p>
                <p className="text-sm text-gray-500">{uploadState.message}</p>
              </div>
            )}

            {uploadState.status === "ready" && (
              <div>
                {/* File info */}
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{uploadState.filename}</p>
                      <p className="text-sm text-gray-500">
                        {uploadState.charCount.toLocaleString()} tegn ekstrahert
                        {uploadState.truncated && " (forkortet)"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Bytt fil
                  </button>
                </div>

                {/* Text preview */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forhåndsvisning av ekstrahert tekst
                  </label>
                  <div className="relative">
                    <div
                      className={`
                        p-4 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-wrap
                        ${showFullPreview ? "max-h-96 overflow-y-auto" : "max-h-32 overflow-hidden"}
                      `}
                    >
                      {uploadState.extractedText}
                    </div>
                    {uploadState.extractedText.length > 500 && !showFullPreview && (
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-50 to-transparent" />
                    )}
                  </div>
                  {uploadState.extractedText.length > 500 && (
                    <button
                      onClick={() => setShowFullPreview(!showFullPreview)}
                      className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      {showFullPreview ? "Vis mindre" : "Vis mer"}
                    </button>
                  )}
                </div>

                {uploadState.truncated && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg mb-4">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-amber-800">
                        Filen inneholdt mer enn 50 000 tegn. Teksten har blitt forkortet.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {uploadState.status === "error" && (
              <div className="py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                {uploadState.filename && (
                  <p className="text-base font-medium text-gray-900 mb-1">{uploadState.filename}</p>
                )}
                <p className="text-sm text-red-600 mb-4">{uploadState.error}</p>
                <Button onClick={handleReset} variant="secondary" size="sm">
                  Prøv igjen
                </Button>
              </div>
            )}
          </div>

          {/* Submit button */}
          {(isReady || isProcessing) && (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <Button
                onClick={handleSubmit}
                disabled={!isReady}
                className="
                  w-full py-3
                  bg-gradient-to-r from-emerald-600 to-teal-600
                  hover:from-emerald-700 hover:to-teal-700
                  disabled:from-gray-400 disabled:to-gray-400
                "
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Behandler...
                  </>
                ) : (
                  <>
                    Fortsett
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
