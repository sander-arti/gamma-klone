"use client";

/**
 * DeckList
 *
 * Grid list of deck cards for the dashboard.
 */

import { DeckCard } from "./DeckCard";

interface DeckData {
  id: string;
  title: string;
  themeId: string;
  slideCount: number;
  updatedAt: Date;
  isSample?: boolean;
}

interface DeckListProps {
  decks: DeckData[];
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function DeckList({ decks, onDelete, isLoading }: DeckListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 animate-pulse"
          >
            <div className="aspect-video bg-gray-200 rounded-t-lg" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="w-16 h-16 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Ingen presentasjoner ennå
        </h3>
        <p className="text-gray-500">
          Opprett din første presentasjon for å komme i gang.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {decks.map((deck) => (
        <DeckCard
          key={deck.id}
          id={deck.id}
          title={deck.title}
          themeId={deck.themeId}
          slideCount={deck.slideCount}
          updatedAt={deck.updatedAt}
          isSample={deck.isSample}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
