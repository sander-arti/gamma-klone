import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { OrganizationJsonLd, WebApplicationJsonLd } from "@/components/seo";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const siteConfig = {
  name: "ARTI Slides",
  description:
    "AI-presentasjoner som faktisk imponerer. Lag profesjonelle presentasjoner fra prompt eller notater på minutter - ikke timer.",
  url: "https://artislides.no",
  ogImage: "https://artislides.no/og-image.png",
  creator: "ARTI Slides",
  keywords: [
    "AI presentasjoner",
    "presentasjonsverktøy",
    "PowerPoint generator",
    "AI slides",
    "automatisk presentasjon",
    "norsk AI",
    "presentasjon fra tekst",
    "møtenotater til presentasjon",
    "profesjonelle slides",
    "ARTI Slides",
  ],
};

export const metadata: Metadata = {
  // Base metadata
  title: {
    default: `${siteConfig.name} - AI-presentasjoner som faktisk imponerer`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,

  // Author and creator
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  publisher: siteConfig.creator,

  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Open Graph metadata for social sharing
  openGraph: {
    type: "website",
    locale: "nb_NO",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - AI-presentasjoner som faktisk imponerer`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Lag profesjonelle AI-presentasjoner`,
      },
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - AI-presentasjoner som faktisk imponerer`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@artislides",
  },

  // Icons configuration
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },

  // Manifest for PWA
  manifest: "/manifest.json",

  // Canonical and alternate URLs
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
    languages: {
      "nb-NO": "/",
    },
  },

  // Category
  category: "technology",

  // Verification (add your verification codes here)
  // verification: {
  //   google: "your-google-verification-code",
  // },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#059669" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" className="scroll-smooth">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for potential external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={plusJakarta.className}>
        {/* Structured Data for SEO */}
        <OrganizationJsonLd
          name={siteConfig.name}
          url={siteConfig.url}
          logo={`${siteConfig.url}/icon.svg`}
          description={siteConfig.description}
          email="hei@artislides.no"
        />
        <WebApplicationJsonLd
          name={siteConfig.name}
          url={siteConfig.url}
          description={siteConfig.description}
          applicationCategory="BusinessApplication"
          operatingSystem="Web"
          offers={{
            price: "0",
            priceCurrency: "NOK",
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
