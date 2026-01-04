/**
 * Signup Page Layout
 *
 * Provides metadata for the signup page.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opprett konto",
  description:
    "Opprett en gratis ARTI Slides-konto og begynn å lage imponerende AI-presentasjoner i dag.",
  openGraph: {
    title: "Opprett konto | ARTI Slides",
    description: "Opprett en gratis konto og kom i gang med ARTI Slides.",
    url: "https://artislides.no/signup",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/signup",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
