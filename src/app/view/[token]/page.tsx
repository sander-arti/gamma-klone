/**
 * Public View Page
 *
 * Allows anyone with å share token to view å presentation.
 */

import { notFound } from "next/navigation";
import { getDeckByShareToken, dbDeckToSchema } from "@/lib/db/deck";
import { DeckViewer } from "@/components/viewer";
import type { ThemeId } from "@/lib/schemas/deck";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicViewPage({ params }: PageProps) {
  const { token } = await params;

  const dbDeck = await getDeckByShareToken(token);

  if (!dbDeck) {
    notFound();
  }

  const deck = dbDeckToSchema(dbDeck);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-white font-medium truncate">{deck.deck.title}</h1>
          <span className="text-gray-400 text-sm">
            {deck.slides.length} slides
          </span>
        </div>
      </header>

      {/* Viewer */}
      <main className="flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl">
          <DeckViewer
            deck={deck}
            themeId={deck.deck.themeId as ThemeId}
            brandKit={deck.deck.brandKit}
          />
        </div>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params;
  const dbDeck = await getDeckByShareToken(token);

  if (!dbDeck) {
    return { title: "Presentasjon ikke funnet" };
  }

  return {
    title: dbDeck.title,
    description: `Se presentasjonen "${dbDeck.title}"`,
  };
}
