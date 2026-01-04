/**
 * 404 Not Found Page
 *
 * Custom 404 page with brand styling and helpful navigation.
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 illustration */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl">
            <span className="text-4xl font-bold text-white">404</span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Siden ble ikke funnet
        </h1>
        <p className="text-gray-600 mb-8">
          Beklager, men siden du leter etter eksisterer ikke eller har blitt
          flyttet.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
          >
            Gå til forsiden
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Kontakt support
          </Link>
        </div>

        {/* Helpful links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Eller prøv disse sidene:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/features"
              className="text-emerald-600 hover:text-emerald-700"
            >
              Funksjoner
            </Link>
            <Link
              href="/pricing"
              className="text-emerald-600 hover:text-emerald-700"
            >
              Priser
            </Link>
            <Link
              href="/docs"
              className="text-emerald-600 hover:text-emerald-700"
            >
              Hjelp
            </Link>
            <Link
              href="/about"
              className="text-emerald-600 hover:text-emerald-700"
            >
              Om oss
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
