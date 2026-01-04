"use client";

/**
 * Dashboard Page
 *
 * Shows user's presentations with options to create new ones.
 */

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import Link from "next/link";
import { DeckList } from "@/components/dashboard";
import { Button } from "@/components/ui";
import { WorkspaceSwitcher } from "@/components/workspace/WorkspaceSwitcher";
import { DASHBOARD_TOUR_STEPS } from "@/lib/onboarding/tour-steps";
import { Settings } from "lucide-react";

// Lazy load ProductTour (only when needed)
const ProductTour = lazy(() =>
  import("@/components/onboarding/ProductTour").then((mod) => ({
    default: mod.ProductTour,
  }))
);

interface DeckData {
  id: string;
  title: string;
  themeId: string;
  slideCount: number;
  updatedAt: Date;
}

export default function DashboardPage() {
  const [decks, setDecks] = useState<DeckData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);

  const fetchDecks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/decks");
      if (!res.ok) {
        throw new Error("Kunne ikke hente presentasjoner");
      }
      const data = await res.json();
      setDecks(
        data.decks.map(
          (d: {
            id: string;
            title: string;
            themeId: string;
            _count?: { slides: number };
            slideCount?: number;
            updatedAt: string;
          }) => ({
            id: d.id,
            title: d.title,
            themeId: d.themeId,
            slideCount: d._count?.slides ?? d.slideCount ?? 0,
            updatedAt: new Date(d.updatedAt),
          })
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "En feil oppstod");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  // Check if we should show the onboarding tour
  useEffect(() => {
    async function checkOnboarding() {
      try {
        const res = await fetch('/api/user/onboarding-status');
        if (res.ok) {
          const data = await res.json();
          if (data.shouldShowTour) {
            setShowTour(true);
          }
        }
      } catch (err) {
        console.error('[dashboard] Failed to check onboarding status:', err);
      }
    }
    checkOnboarding();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/decks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Kunne ikke slette presentasjonen");
      }
      setDecks((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sletting feilet");
    }
  };

  const handleTourComplete = async () => {
    try {
      await fetch('/api/user/complete-onboarding', { method: 'POST' });
      setShowTour(false);
    } catch (err) {
      console.error('[dashboard] Failed to complete onboarding:', err);
      // Still hide tour even if API call fails
      setShowTour(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  ARTI Slides
                </span>
              </Link>
              <nav className="hidden sm:flex items-center gap-4">
                <span className="text-sm font-medium text-purple-600">
                  Mine presentasjoner
                </span>
                <WorkspaceSwitcher />
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Link>
              <Link href="/" data-tour="new-presentation">
                <Button>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Ny presentasjon
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Mine presentasjoner
          </h1>
          <p className="text-gray-600 mt-1">
            Administrer og rediger dine presentasjoner
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={fetchDecks}
              className="ml-2 underline hover:no-underline"
            >
              Prov igjen
            </button>
          </div>
        )}

        <div data-tour="deck-list">
          <DeckList decks={decks} onDelete={handleDelete} isLoading={isLoading} />
        </div>

        {/* Empty state with CTA */}
        {!isLoading && decks.length === 0 && !error && (
          <div className="text-center py-16 px-4">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>

            {/* Heading */}
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Ingen presentasjoner ennå
            </h3>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Lag din første AI-genererte presentasjon på noen sekunder.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
              {/* AI-generering */}
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-violet-50 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-violet-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">AI-generering</h4>
                <p className="text-sm text-gray-600">
                  Skriv tekst eller last opp møtenotater, AI lager presentasjonen
                </p>
              </div>

              {/* Inline redigering */}
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Inline redigering</h4>
                <p className="text-sm text-gray-600">
                  Rediger tekst, farger og layout direkte i presentasjonen
                </p>
              </div>

              {/* PDF/PPTX eksport */}
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">PDF & PPTX</h4>
                <p className="text-sm text-gray-600">
                  Eksporter til PDF eller redigerbar PowerPoint
                </p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/" data-tour="new-presentation">
                <Button size="lg">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Lag presentasjon
                </Button>
              </Link>
              <button
                onClick={() => setShowTour(true)}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                Se hvordan det fungerer →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Onboarding Tour */}
      {showTour && (
        <Suspense fallback={null}>
          <ProductTour
            steps={DASHBOARD_TOUR_STEPS}
            onComplete={handleTourComplete}
            onSkip={handleTourComplete}
          />
        </Suspense>
      )}
    </div>
  );
}
