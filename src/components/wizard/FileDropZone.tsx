"use client";

/**
 * FileDropZone
 *
 * Drag & drop file upload component with visual feedback.
 * Supports file validation and upload progress display.
 */

import { useState, useRef, useCallback } from "react";
import { MIME_TYPE_NAMES, type SupportedMimeType } from "@/lib/extraction";

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  accept: SupportedMimeType[];
  maxSize: number; // bytes
  disabled?: boolean;
  isUploading?: boolean;
  uploadProgress?: number; // 0-100
  error?: string;
}

const FORMAT_BADGES = [
  { mime: "application/pdf" as SupportedMimeType, label: "PDF", color: "bg-red-100 text-red-700" },
  {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" as SupportedMimeType,
    label: "DOCX",
    color: "bg-blue-100 text-blue-700",
  },
  { mime: "text/plain" as SupportedMimeType, label: "TXT", color: "bg-gray-100 text-gray-700" },
];

export function FileDropZone({
  onFileSelect,
  accept,
  maxSize,
  disabled = false,
  isUploading = false,
  uploadProgress = 0,
  error,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeMB = Math.round(maxSize / (1024 * 1024));

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!accept.includes(file.type as SupportedMimeType)) {
        const acceptedFormats = accept
          .map((mime) => MIME_TYPE_NAMES[mime])
          .join(", ");
        return `Ugyldig filtype. Støttede formater: ${acceptedFormats}`;
      }

      // Check file size
      if (file.size > maxSize) {
        return `Filen er for stor. Maks størrelse: ${maxSizeMB} MB`;
      }

      // Check if empty
      if (file.size === 0) {
        return "Filen er tom";
      }

      return null;
    },
    [accept, maxSize, maxSizeMB]
  );

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        return;
      }

      setValidationError(null);
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input to allow selecting the same file again
    e.target.value = "";
  };

  const displayError = error || validationError;

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(",")}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Drop zone */}
      <button
        type="button"
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        disabled={disabled || isUploading}
        className={`
          w-full relative rounded-2xl border-2 border-dashed transition-all duration-200
          ${
            isDragging
              ? "border-emerald-500 bg-emerald-50"
              : displayError
              ? "border-red-300 bg-red-50"
              : "border-gray-300 bg-white hover:border-emerald-400 hover:bg-gray-50"
          }
          ${disabled || isUploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
        `}
      >
        <div className="py-12 px-6">
          {/* Upload icon */}
          <div
            className={`
              mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all
              ${
                isDragging
                  ? "bg-emerald-100 text-emerald-600 scale-110"
                  : "bg-gray-100 text-gray-500"
              }
            `}
          >
            {isUploading ? (
              <svg
                className="w-8 h-8 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
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
            ) : (
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
          </div>

          {/* Text */}
          <p className="text-base text-gray-700 mb-2">
            {isUploading
              ? "Laster opp..."
              : isDragging
              ? "Slipp filen her"
              : "Dra og slipp fil her, eller klikk"}
          </p>

          {/* Format badges */}
          <div className="flex justify-center gap-2 mb-3">
            {FORMAT_BADGES.filter((badge) =>
              accept.includes(badge.mime)
            ).map((badge) => (
              <span
                key={badge.mime}
                className={`px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}
              >
                {badge.label}
              </span>
            ))}
          </div>

          {/* Size limit */}
          <p className="text-xs text-gray-500">Maks {maxSizeMB} MB</p>
        </div>

        {/* Progress bar */}
        {isUploading && uploadProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-2xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </button>

      {/* Error message */}
      {displayError && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
