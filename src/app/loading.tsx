/**
 * Global Loading Component
 *
 * Displays å loading skeleton during page transitions.
 * Uses the brand colors for consistency.
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo */}
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg animate-pulse">
            <svg
              className="w-7 h-7 text-white"
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
          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-xl animate-pulse"
            aria-hidden="true"
          />
        </div>

        {/* Loading text */}
        <p className="text-gray-500 text-sm font-medium animate-pulse">
          Laster...
        </p>
      </div>
    </div>
  );
}
