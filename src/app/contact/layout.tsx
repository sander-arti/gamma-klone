/**
 * Contact Page Layout
 *
 * Provides metadata for the contact page.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt oss",
  description: "Ta kontakt med ARTI Slides. Send oss en melding, og vi svarer så raskt vi kan.",
  openGraph: {
    title: "Kontakt oss | ARTI Slides",
    description: "Ta kontakt med ARTI Slides-teamet.",
    url: "https://artislides.no/contact",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
