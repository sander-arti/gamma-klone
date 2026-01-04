/**
 * SplitWithCalloutsSlide Component
 *
 * 50/50 split layout with image on one side and callout cards on the other.
 * Layout variants: image_left, image_right
 */

import type { Slide } from "@/lib/schemas/slide";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer, ImageBlock } from "../blocks";
import {
  Circle,
  Zap,
  Shield,
  Globe,
  Heart,
  Star,
  Check,
  Clock,
  Users,
  Settings,
  TrendingUp,
  Target,
  Award,
  Lightbulb,
  Rocket,
  Lock,
  Cpu,
  Database,
  Cloud,
  BarChart,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon name to component mapping
 */
const iconMap: Record<string, LucideIcon> = {
  circle: Circle,
  zap: Zap,
  shield: Shield,
  globe: Globe,
  heart: Heart,
  star: Star,
  check: Check,
  clock: Clock,
  users: Users,
  settings: Settings,
  "trending-up": TrendingUp,
  trendingup: TrendingUp,
  target: Target,
  award: Award,
  lightbulb: Lightbulb,
  rocket: Rocket,
  lock: Lock,
  cpu: Cpu,
  database: Database,
  cloud: Cloud,
  "bar-chart": BarChart,
  barchart: BarChart,
};

function getIconComponent(iconName: string): LucideIcon {
  const normalizedName = iconName.toLowerCase();
  return iconMap[normalizedName] || Circle;
}

/**
 * Color presets for callout cards (matches IconCardBlock)
 */
const COLOR_PRESETS: Record<string, { bg: string; border: string; icon: string }> = {
  pink: {
    bg: "rgba(236, 72, 153, 0.12)",
    border: "#ec4899",
    icon: "#be185d",
  },
  purple: {
    bg: "rgba(147, 51, 234, 0.12)",
    border: "#9333ea",
    icon: "#7c3aed",
  },
  blue: {
    bg: "rgba(59, 130, 246, 0.12)",
    border: "#3b82f6",
    icon: "#2563eb",
  },
  cyan: {
    bg: "rgba(6, 182, 212, 0.12)",
    border: "#06b6d4",
    icon: "#0891b2",
  },
  green: {
    bg: "rgba(34, 197, 94, 0.12)",
    border: "#22c55e",
    icon: "#16a34a",
  },
  orange: {
    bg: "rgba(249, 115, 22, 0.12)",
    border: "#f97316",
    icon: "#ea580c",
  },
};

const DEFAULT_COLORS = ["pink", "purple", "cyan"];

interface SplitWithCalloutsSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
  /** Whether AI is currently generating an image for this slide */
  isImageGenerating?: boolean;
}

export function SplitWithCalloutsSlide({
  slide,
  editable = false,
  slideIndex = 0,
  isImageGenerating = false,
}: SplitWithCalloutsSlideProps) {
  const variant = slide.layoutVariant || "image_left";
  const imageOnLeft = variant === "image_left";

  // Find blocks
  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;

  const imageBlock = slide.blocks.find((b) => b.kind === "image");

  // Find callout blocks (using icon_card or bullets as callouts)
  const calloutBlocks = slide.blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.kind === "icon_card" || block.kind === "bullets");

  const textBlock = slide.blocks.find((b) => b.kind === "text");

  // Get color for a callout - use bgColor from block or cycle through defaults
  const getCalloutColor = (block: typeof calloutBlocks[0]["block"], colorIndex: number) => {
    if (block.kind === "icon_card" && block.bgColor) {
      const colorKey = block.bgColor.toLowerCase();
      if (colorKey in COLOR_PRESETS) {
        return COLOR_PRESETS[colorKey];
      }
    }
    // Fall back to default color cycling
    const defaultKey = DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length];
    return COLOR_PRESETS[defaultKey];
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: imageOnLeft ? "row" : "row-reverse",
    height: "100%",
    gap: 0,
  };

  const imageContainerStyle: React.CSSProperties = {
    flex: "0 0 50%",
    position: "relative",
    overflow: "hidden",
  };

  const contentContainerStyle: React.CSSProperties = {
    flex: 1,
    padding: "var(--theme-spacing-section, 2.5rem)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "var(--theme-spacing-block-gap, 1.5rem)",
  };

  const calloutStyle = (colors: typeof COLOR_PRESETS[string]): React.CSSProperties => {
    return {
      padding: "1rem 1.25rem",
      background: colors.bg,
      borderLeft: `4px solid ${colors.border}`,
      borderRadius: "0 0.75rem 0.75rem 0",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    };
  };

  const calloutTitleStyle = (colors: typeof COLOR_PRESETS[string]): React.CSSProperties => {
    return {
      fontSize: "1rem",
      fontWeight: 600,
      color: "var(--theme-color-foreground, #0f172a)",
      marginBottom: "0.35rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    };
  };

  const calloutTextStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    color: "var(--theme-color-foreground-muted, #64748b)",
    lineHeight: 1.6,
    paddingLeft: "1.75rem", // Align with text after icon
  };

  return (
    <SlideLayout className="p-0 overflow-hidden">
      <div style={containerStyle}>
        {/* Image side */}
        <div style={imageContainerStyle}>
          {imageBlock && (
            <ImageBlock
              url={imageBlock.url ?? ""}
              alt={imageBlock.alt ?? ""}
              cropMode="cover"
              isGenerating={isImageGenerating}
            />
          )}
        </div>

        {/* Content side */}
        <div style={contentContainerStyle}>
          {/* Title */}
          {titleBlock && (
            <SmartBlockRenderer
              block={titleBlock}
              slideIndex={slideIndex}
              blockIndex={titleBlockIndex}
              titleLevel={2}
              editable={editable}
            />
          )}

          {/* Description text */}
          {textBlock && (
            <p
              style={{
                fontSize: "var(--theme-font-size-body, 1rem)",
                color: "var(--theme-color-foreground-muted, #64748b)",
                maxWidth: "50ch",
              }}
            >
              {textBlock.text}
            </p>
          )}

          {/* Callout cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {calloutBlocks.map(({ block, index }, colorIndex) => {
              const colors = getCalloutColor(block, colorIndex);
              return (
                <div key={index} style={calloutStyle(colors)}>
                  {block.kind === "icon_card" && (
                    <>
                      <div style={calloutTitleStyle(colors)}>
                        {block.icon && (() => {
                          const IconComponent = getIconComponent(block.icon);
                          return (
                            <IconComponent
                              size={18}
                              strokeWidth={2.5}
                              style={{ color: colors.icon, flexShrink: 0 }}
                            />
                          );
                        })()}
                        {block.text}
                      </div>
                      {block.description && <div style={calloutTextStyle}>{block.description}</div>}
                    </>
                  )}
                  {block.kind === "bullets" && (
                    <>
                      <div style={calloutTitleStyle(colors)}>
                        {block.items?.[0]}
                      </div>
                      {block.items && block.items.length > 1 && (
                        <ul style={{ ...calloutTextStyle, paddingLeft: "1.5rem", margin: 0 }}>
                          {block.items.slice(1).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
