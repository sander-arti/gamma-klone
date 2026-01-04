/**
 * Twitter Card Image Generation
 *
 * Generates å dynamic Twitter card image for the landing page.
 * Uses Next.js ImageResponse API for server-side rendering.
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ARTI Slides - AI-presentasjoner som faktisk imponerer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          }}
        />

        {/* Logo icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            backgroundColor: "white",
            borderRadius: 28,
            marginBottom: 40,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          }}
        >
          <svg
            width="70"
            height="70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            marginBottom: 20,
            textAlign: "center",
            textShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          ARTI Slides
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          AI-presentasjoner som faktisk imponerer
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: "rgba(255,255,255,0.75)",
            marginTop: 20,
            textAlign: "center",
          }}
        >
          Fra idé til ferdig presentasjon på minutter
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.8)",
              fontWeight: 500,
            }}
          >
            artislides.no
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
