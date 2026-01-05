/**
 * CreateModeCard Component
 *
 * Premium card for selecting presentation creation mode.
 * Features warm cream design, emerald accents, and elegant animations.
 * Inspired by meetdara.no - Clean, Premium, Magical.
 */

"use client";

import Link from "next/link";
import { type ReactNode } from "react";

export type CreateMode = "generate" | "paste" | "import";

export interface CreateModeCardProps {
  mode: CreateMode;
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  gradient: string;
  disabled?: boolean;
}

const modeIcons: Record<CreateMode, { bg: string; iconColor: string }> = {
  generate: {
    bg: "from-emerald-500/15 to-emerald-600/15",
    iconColor: "text-emerald-600",
  },
  paste: {
    bg: "from-sky-500/15 to-sky-600/15",
    iconColor: "text-sky-600",
  },
  import: {
    bg: "from-amber-500/15 to-amber-600/15",
    iconColor: "text-amber-600",
  },
};

export function CreateModeCard({
  mode,
  title,
  description,
  icon,
  href,
  gradient,
  disabled = false,
}: CreateModeCardProps) {
  const { bg, iconColor } = modeIcons[mode];

  const CardContent = (
    <div
      className={`
        group relative overflow-hidden
        bg-white border border-gray-200/80
        rounded-2xl p-6
        transition-all duration-300 ease-out
        shadow-sm
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/[0.08] hover:border-emerald-300/60 cursor-pointer"
        }
      `}
    >
      {/* Subtle gradient overlay on hover */}
      <div
        className={`
          absolute inset-0 opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          bg-gradient-to-br ${gradient}
          pointer-events-none
        `}
        style={{ opacity: disabled ? 0 : undefined }}
      />

      {/* Glow effect */}
      <div
        className={`
          absolute -inset-1 opacity-0 group-hover:opacity-20
          transition-opacity duration-300 blur-xl
          bg-gradient-to-br ${gradient}
          pointer-events-none -z-10
        `}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon container with gradient background */}
        <div
          className={`
            w-14 h-14 mb-4 rounded-xl
            bg-gradient-to-br ${bg}
            flex items-center justify-center
            transition-transform duration-300
            group-hover:scale-110
          `}
        >
          <div className={`w-7 h-7 ${iconColor}`}>{icon}</div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>

        {/* Coming soon badge for disabled */}
        {disabled && (
          <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            Kommer snart
          </div>
        )}

        {/* Arrow indicator */}
        {!disabled && (
          <div
            className="
              mt-4 flex items-center text-sm font-medium
              text-emerald-600 opacity-0 group-hover:opacity-100
              transition-all duration-300 transform translate-x-0 group-hover:translate-x-1
            "
          >
            Kom i gang
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  if (disabled) {
    return CardContent;
  }

  return <Link href={href}>{CardContent}</Link>;
}

// Pre-configured cards for each mode
export function GenerateCard() {
  return (
    <CreateModeCard
      mode="generate"
      title="Generer"
      description="Lag en presentasjon fra et emne eller en kort beskrivelse. AI-en gjør resten."
      href="/new?mode=generate"
      gradient="from-emerald-500/5 to-emerald-600/5"
      icon={
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      }
    />
  );
}

export function PasteCard() {
  return (
    <CreateModeCard
      mode="paste"
      title="Lim inn tekst"
      description="Lim inn notater, dokumenter eller outline. AI-en strukturerer det til en presentasjon."
      href="/new?mode=paste"
      gradient="from-sky-500/5 to-sky-600/5"
      icon={
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      }
    />
  );
}

export function ImportCard({ disabled = false }: { disabled?: boolean }) {
  return (
    <CreateModeCard
      mode="import"
      title="Last opp fil"
      description="Last opp PDF, Word-dokument eller tekstfil. AI-en ekstraherer innholdet."
      href="/new?mode=import"
      gradient="from-amber-500/5 to-amber-600/5"
      disabled={disabled}
      icon={
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      }
    />
  );
}
