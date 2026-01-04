"use client";

/**
 * SlideBackground Component (Punkt 3 + Punkt 6)
 *
 * Renders multi-layer background effects for slides.
 * Uses theme tokens for all colors and gradients.
 *
 * Updated in Punkt 6: Enhanced visibility and decorative accents.
 *
 * Layers (bottom to top):
 * 1. Solid background color
 * 2. Gradient overlay (depth - more visible)
 * 3. Radial vignette (focus - enhanced)
 * 4. Corner accent blob (modern touch - larger)
 * 5. Floating orb accent (new - decorative)
 * 6. Pattern overlay (texture, optional)
 */

export type SlideBackgroundVariant =
  | "solid" // Just the background color
  | "gradient" // Adds gradient overlay
  | "depth" // Gradient + radial vignette
  | "accent" // Gradient + corner accent
  | "full"; // All layers (most visual depth)

interface SlideBackgroundProps {
  /** Background variant - controls which layers are applied */
  variant?: SlideBackgroundVariant;
  /** Show pattern overlay (dots) */
  showPattern?: boolean;
  /** Show floating decorative orb */
  showOrb?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom background color (overrides theme) */
  customBackground?: string;
  /** Custom gradient (overrides theme) */
  customGradient?: string;
}

export function SlideBackground({
  variant = "depth",
  showPattern = false,
  showOrb = false,
  className = "",
  customBackground,
  customGradient,
}: SlideBackgroundProps) {
  // Determine which layers to show based on variant
  const showGradient = variant !== "solid";
  const showRadial = variant === "depth" || variant === "full";
  const showCorner = variant === "accent" || variant === "full";
  const showFloatingOrb = showOrb || variant === "full";

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        backgroundColor: customBackground ?? "var(--theme-color-background, #f8fafc)",
      }}
      aria-hidden="true"
    >
      {/* Layer 1: Enhanced gradient overlay - more visible */}
      {showGradient && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              customGradient ??
              `
              linear-gradient(
                180deg,
                rgba(255, 255, 255, 0.8) 0%,
                var(--theme-color-background-subtle, rgba(241, 245, 249, 0.6)) 50%,
                var(--theme-color-background-muted, rgba(226, 232, 240, 0.4)) 100%
              )
            `,
          }}
        />
      )}

      {/* Layer 2: Enhanced radial vignette - creates focus */}
      {showRadial && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(
                ellipse 120% 100% at 50% 0%,
                transparent 0%,
                transparent 50%,
                rgba(0, 0, 0, 0.03) 100%
              )
            `,
          }}
        />
      )}

      {/* Layer 3: Primary color corner accent - larger and more visible */}
      {showCorner && (
        <>
          {/* Top-right accent blob */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "-10%",
              right: "-5%",
              width: "45%",
              height: "50%",
              background: `
                radial-gradient(
                  ellipse at center,
                  var(--theme-color-accent-blue-light, rgba(59, 130, 246, 0.08)) 0%,
                  var(--theme-color-accent-purple-light, rgba(139, 92, 246, 0.04)) 40%,
                  transparent 70%
                )
              `,
              filter: "blur(40px)",
              transform: "rotate(-15deg)",
            }}
          />
          {/* Bottom-left subtle accent */}
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: "-15%",
              left: "-10%",
              width: "40%",
              height: "45%",
              background: `
                radial-gradient(
                  ellipse at center,
                  var(--theme-color-accent-pink-light, rgba(236, 72, 153, 0.05)) 0%,
                  transparent 60%
                )
              `,
              filter: "blur(50px)",
            }}
          />
        </>
      )}

      {/* Layer 4: Floating decorative orb - for visual interest */}
      {showFloatingOrb && (
        <div
          className="absolute pointer-events-none animate-float-slow"
          style={{
            top: "15%",
            right: "10%",
            width: "clamp(80px, 15cqw, 150px)",
            height: "clamp(80px, 15cqw, 150px)",
            background: `
              radial-gradient(
                circle at 30% 30%,
                var(--theme-color-accent-blue-light, rgba(59, 130, 246, 0.12)) 0%,
                var(--theme-color-accent-purple-light, rgba(139, 92, 246, 0.08)) 50%,
                transparent 100%
              )
            `,
            borderRadius: "50%",
            filter: "blur(20px)",
          }}
        />
      )}

      {/* Layer 5: Pattern overlay (enhanced dots) */}
      {showPattern && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(
                circle,
                var(--theme-color-primary, rgba(37, 99, 235, 0.06)) 1px,
                transparent 1px
              )
            `,
            backgroundSize: "24px 24px",
            opacity: 0.6,
          }}
        />
      )}

      {/* Layer 6: Subtle grid lines for structure (always on for non-solid) */}
      {showGradient && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(
                to right,
                var(--theme-color-border-subtle, rgba(226, 232, 240, 0.3)) 1px,
                transparent 1px
              ),
              linear-gradient(
                to bottom,
                var(--theme-color-border-subtle, rgba(226, 232, 240, 0.3)) 1px,
                transparent 1px
              )
            `,
            backgroundSize: "100% 100%",
            backgroundPosition: "0 0, 0 0",
            opacity: 0,
            // Only show on edges - creates subtle frame
            mask: `
              linear-gradient(to right, black 2px, transparent 2px, transparent calc(100% - 2px), black calc(100% - 2px)),
              linear-gradient(to bottom, black 2px, transparent 2px, transparent calc(100% - 2px), black calc(100% - 2px))
            `,
            WebkitMask: `
              linear-gradient(to right, black 2px, transparent 2px, transparent calc(100% - 2px), black calc(100% - 2px)),
              linear-gradient(to bottom, black 2px, transparent 2px, transparent calc(100% - 2px), black calc(100% - 2px))
            `,
          }}
        />
      )}
    </div>
  );
}
