/**
 * LandingHero Component
 *
 * Hero section with elegant warm cream design for the landing page.
 * Features subtle gradients, emerald accents, and premium typography.
 * Inspired by meetdara.no - Clean, Premium, Magical.
 */

"use client";

import { type ReactNode } from "react";

export interface LandingHeroProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export function LandingHero({ title, subtitle, children }: LandingHeroProps) {
  return (
    <div className="relative overflow-hidden bg-[#faf8f5]">
      {/* Subtle warm gradient overlay */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-b from-white/60 via-transparent to-[#faf8f5]
        "
      />

      {/* Emerald accent glow - subtle top-left */}
      <div
        className="
          absolute -top-32 -left-32 w-96 h-96
          bg-emerald-500/[0.07] rounded-full blur-3xl
        "
      />

      {/* Warm accent glow - subtle bottom-right */}
      <div
        className="
          absolute -bottom-32 -right-32 w-80 h-80
          bg-amber-500/[0.05] rounded-full blur-3xl
        "
      />

      {/* Content */}
      <div className="relative z-10 px-4 py-20 sm:py-24 md:py-28">
        <div className="max-w-4xl mx-auto text-center">
          {/* Decorative badge */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/60 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-emerald-700">
                AI-drevet
              </span>
            </div>
          </div>

          {/* Title */}
          <h1
            className="
              text-4xl sm:text-5xl md:text-6xl font-bold
              text-gray-900 tracking-tight
              mb-5
            "
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p
            className="
              text-lg sm:text-xl text-gray-600
              max-w-2xl mx-auto
              leading-relaxed
            "
          >
            {subtitle}
          </p>

          {/* Children slot for additional content */}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>

      {/* Subtle bottom border instead of harsh gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </div>
  );
}

// Compact version for other pages
export function LandingHeroCompact({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative overflow-hidden bg-[#faf8f5] border-b border-gray-200/60">
      {/* Subtle emerald glow */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/[0.05] rounded-full blur-3xl" />

      <div className="relative z-10 px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-base text-gray-600">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
