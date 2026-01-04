/**
 * Login Page Layout
 *
 * Provides metadata for the login page.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logg inn",
  description:
    "Logg inn på ARTI Slides-kontoen din for å fortsette å lage imponerende presentasjoner.",
  openGraph: {
    title: "Logg inn | ARTI Slides",
    description: "Logg inn på ARTI Slides-kontoen din.",
    url: "https://artislides.no/login",
  },
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
