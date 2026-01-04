"use client";

/**
 * DeckCard
 *
 * Card component for displaying a deck in the dashboard.
 */

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui";
import { onboarding } from "@/lib/analytics/events";

interface DeckCardProps {
  id: string;
  title: string;
  themeId: string;
  slideCount: number;
  updatedAt: Date;
  isSample?: boolean;
  onDelete?: (id: string) => void;
}

export function DeckCard({
  id,
  title,
  themeId,
  slideCount,
  updatedAt,
  isSample,
  onDelete,
}: DeckCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeckClick = () => {
    if (isSample) {
      onboarding.sampleDeckOpened(id);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm(`Er du sikker på at du vil slette "${title}"?`)) return;

    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("nb-NO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Thumbnail placeholder */}
      <Link href={`/deck/${id}`} onClick={handleDeckClick}>
        <div
          className="aspect-video rounded-t-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center cursor-pointer"
          style={{
            background:
              themeId === "nordic_dark"
                ? "linear-gradient(135deg, #1a1a2e, #16213e)"
                : themeId === "corporate_blue"
                  ? "linear-gradient(135deg, #e8f0fe, #cfe2ff)"
                  : themeId === "minimal_warm"
                    ? "linear-gradient(135deg, #fef7f0, #ffeee0)"
                    : themeId === "modern_contrast"
                      ? "linear-gradient(135deg, #f0f0f0, #e0e0e0)"
                      : "linear-gradient(135deg, #f8fafc, #e2e8f0)",
          }}
        >
          <div className="text-center opacity-60">
            <svg
              className="w-12 h-12 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm text-gray-500">{slideCount} slides</span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/deck/${id}`} onClick={handleDeckClick}>
          <h3 className="font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1">
          Oppdatert {formatDate(updatedAt)}
        </p>
      </div>

      {/* Actions (visible on hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <Link href={`/deck/${id}`} onClick={handleDeckClick}>
            <Button variant="secondary" size="sm">
              Rediger
            </Button>
          </Link>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              loading={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Slett
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
