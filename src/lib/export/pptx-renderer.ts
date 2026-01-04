/**
 * PPTX Renderer
 *
 * Generates PowerPoint files using PptxGenJS.
 * Each slide type is mapped to appropriate PPTX elements.
 */

import PptxGenJS from "pptxgenjs";
import type { Slide } from "@/lib/schemas/slide";
import type { Block } from "@/lib/schemas/block";
import type { Deck } from "@/lib/schemas/deck";
import type { ThemeId, BrandKitOverrides } from "@/lib/themes";
import { getTheme, applyBrandKit } from "@/lib/themes";
import {
  themeToPptxStyles,
  PPTX_DIMENSIONS,
  SLIDE_MARGINS,
  CONTENT_AREA,
  type PptxThemeStyles,
} from "./pptx-theme-mapper";

/**
 * Extract text content from a block
 */
function getBlockText(block: Block): string {
  const content = block as { text?: string };
  return content.text ?? "";
}

/**
 * Extract items from a bullets block
 */
function getBlockItems(block: Block): string[] {
  const content = block as { items?: string[] };
  return content.items ?? [];
}

/**
 * Extract table data from a table block
 */
function getBlockTable(block: Block): { columns: string[]; rows: string[][] } {
  const content = block as { columns?: string[]; rows?: string[][] };
  return {
    columns: content.columns ?? [],
    rows: content.rows ?? [],
  };
}

/**
 * Extract callout data from a callout block
 */
function getCalloutData(block: Block): {
  text: string;
  style?: "info" | "warning" | "success" | "quote";
} {
  const content = block as {
    text?: string;
    style?: "info" | "warning" | "success" | "quote";
  };
  return {
    text: content.text ?? "",
    style: content.style,
  };
}

/**
 * Extract image data from an image block
 */
function getImageData(block: Block): {
  url: string;
  alt: string;
  cropMode?: "cover" | "contain" | "fill";
} {
  const content = block as {
    url?: string;
    alt?: string;
    cropMode?: "cover" | "contain" | "fill";
  };
  return {
    url: content.url ?? "",
    alt: content.alt ?? "",
    cropMode: content.cropMode,
  };
}

/**
 * Extract stat_block data from a stat_block (Phase 7)
 */
function getStatBlockData(block: Block): {
  value: string;
  label: string;
  sublabel?: string;
} {
  const content = block as {
    value?: string;
    label?: string;
    sublabel?: string;
  };
  return {
    value: content.value ?? "",
    label: content.label ?? "",
    sublabel: content.sublabel,
  };
}

/**
 * Extract timeline_step data from a timeline_step block (Phase 7)
 */
function getTimelineStepData(block: Block): {
  step: number;
  title: string;
  description?: string;
  status?: "completed" | "current" | "upcoming";
} {
  const content = block as {
    step?: number;
    text?: string;
    description?: string;
    status?: "completed" | "current" | "upcoming";
  };
  return {
    step: content.step ?? 1,
    title: content.text ?? "",
    description: content.description,
    status: content.status,
  };
}

/**
 * Extract icon_card data from an icon_card block (Phase 7 Sprint 4)
 */
function getIconCardData(block: Block): {
  icon: string;
  text: string;
  description?: string;
  bgColor?: string;
} {
  const content = block as {
    icon?: string;
    text?: string;
    description?: string;
    bgColor?: string;
  };
  return {
    icon: content.icon ?? "circle",
    text: content.text ?? "",
    description: content.description,
    bgColor: content.bgColor,
  };
}

/**
 * Extract numbered_card data from a numbered_card block (Phase 7 Sprint 4)
 */
function getNumberedCardData(block: Block): {
  number: number;
  text: string;
  description?: string;
} {
  const content = block as {
    number?: number;
    text?: string;
    description?: string;
  };
  return {
    number: content.number ?? 1,
    text: content.text ?? "",
    description: content.description,
  };
}

/**
 * Download an image and return as base64 data URL
 * Returns null if download fails
 */
async function downloadImageAsBase64(url: string): Promise<string | null> {
  try {
    // Skip placeholder URLs
    if (!url || url.includes("placeholder") || url.includes("placehold.co")) {
      return null;
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to download image: ${response.status}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Determine content type from URL or response
    const contentType = response.headers.get("content-type") ?? "image/png";

    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.warn("Failed to download image for PPTX:", error);
    return null;
  }
}

/**
 * Add image to slide
 */
async function addImage(
  pptxSlide: PptxGenJS.Slide,
  imageUrl: string,
  options: {
    x: number;
    y: number;
    w: number;
    h: number;
    sizing?: { type: "cover" | "contain" | "crop"; w: number; h: number };
  }
): Promise<boolean> {
  const base64Data = await downloadImageAsBase64(imageUrl);
  if (!base64Data) {
    return false;
  }

  pptxSlide.addImage({
    data: base64Data,
    x: options.x,
    y: options.y,
    w: options.w,
    h: options.h,
    sizing: options.sizing,
  });

  return true;
}

/**
 * Get callout border color based on style
 */
function getCalloutColor(style: string | undefined, styles: PptxThemeStyles): string {
  switch (style) {
    case "warning":
      return styles.colors.warning;
    case "success":
      return styles.colors.success;
    case "error":
      return styles.colors.error;
    case "quote":
      return styles.colors.primary;
    case "info":
    default:
      return styles.colors.info;
  }
}

/**
 * Add title to slide
 */
function addTitle(
  pptxSlide: PptxGenJS.Slide,
  text: string,
  styles: PptxThemeStyles,
  options?: { y?: number; w?: number; h?: number; align?: "left" | "center" }
): void {
  pptxSlide.addText(text, {
    x: CONTENT_AREA.x,
    y: options?.y ?? CONTENT_AREA.y,
    w: options?.w ?? CONTENT_AREA.width,
    h: options?.h ?? 1,
    fontSize: styles.title.fontSize,
    fontFace: styles.title.fontFace,
    color: styles.title.color,
    bold: styles.title.bold,
    align: options?.align ?? "left",
  });
}

/**
 * Add body text to slide
 */
function addBodyText(
  pptxSlide: PptxGenJS.Slide,
  text: string,
  styles: PptxThemeStyles,
  options: { x: number; y: number; w: number; h: number }
): void {
  pptxSlide.addText(text, {
    x: options.x,
    y: options.y,
    w: options.w,
    h: options.h,
    fontSize: styles.body.fontSize,
    fontFace: styles.body.fontFace,
    color: styles.body.color,
    valign: "top",
  });
}

/**
 * Add bullet list to slide
 */
function addBulletList(
  pptxSlide: PptxGenJS.Slide,
  items: string[],
  styles: PptxThemeStyles,
  options: { x: number; y: number; w: number; h: number; numbered?: boolean }
): void {
  const textItems = items.map((item) => ({
    text: item,
    options: {
      bullet: options.numbered ? { type: "number" as const } : true,
      fontSize: styles.body.fontSize,
      fontFace: styles.body.fontFace,
      color: styles.body.color,
    },
  }));

  pptxSlide.addText(textItems, {
    x: options.x,
    y: options.y,
    w: options.w,
    h: options.h,
    valign: "top",
  });
}

/**
 * Add table to slide
 */
function addTable(
  pptxSlide: PptxGenJS.Slide,
  data: { columns: string[]; rows: string[][] },
  styles: PptxThemeStyles,
  options: { x: number; y: number; w: number }
): void {
  const tableData: PptxGenJS.TableRow[] = [];

  // Header row
  tableData.push(
    data.columns.map((col) => ({
      text: col,
      options: {
        bold: true,
        fill: { color: styles.colors.backgroundSubtle },
        fontSize: styles.body.fontSize,
        fontFace: styles.body.fontFace,
        color: styles.body.color,
      },
    }))
  );

  // Data rows
  for (const row of data.rows) {
    tableData.push(
      row.map((cell) => ({
        text: cell,
        options: {
          fontSize: styles.body.fontSize,
          fontFace: styles.body.fontFace,
          color: styles.body.color,
        },
      }))
    );
  }

  pptxSlide.addTable(tableData, {
    x: options.x,
    y: options.y,
    w: options.w,
    colW: Array(data.columns.length).fill(options.w / data.columns.length),
    border: { type: "solid", color: styles.colors.border, pt: 0.5 },
  });
}

/**
 * Add a stat block to slide (Phase 7)
 * Renders a large statistic with label and optional sublabel
 */
function addStatBlock(
  pptxSlide: PptxGenJS.Slide,
  data: { value: string; label: string; sublabel?: string },
  styles: PptxThemeStyles,
  options: { x: number; y: number; w: number; h: number }
): void {
  const centerX = options.x + options.w / 2;

  // Large value
  pptxSlide.addText(data.value, {
    x: options.x,
    y: options.y,
    w: options.w,
    h: 1.2,
    fontSize: 48,
    fontFace: styles.title.fontFace,
    color: styles.colors.primary,
    bold: true,
    align: "center",
    valign: "bottom",
  });

  // Label
  pptxSlide.addText(data.label, {
    x: options.x,
    y: options.y + 1.2,
    w: options.w,
    h: 0.5,
    fontSize: styles.heading.fontSize,
    fontFace: styles.body.fontFace,
    color: styles.body.color,
    bold: true,
    align: "center",
    valign: "top",
  });

  // Optional sublabel
  if (data.sublabel) {
    pptxSlide.addText(data.sublabel, {
      x: options.x,
      y: options.y + 1.7,
      w: options.w,
      h: 0.4,
      fontSize: styles.body.fontSize * 0.9,
      fontFace: styles.body.fontFace,
      color: styles.colors.foregroundMuted,
      align: "center",
      valign: "top",
    });
  }
}

/**
 * Add a timeline step to slide (Phase 7)
 * Renders a step with circle indicator, title, and optional description
 * Returns the height used for this step
 */
function addTimelineStep(
  pptxSlide: PptxGenJS.Slide,
  data: { step: number; title: string; description?: string; status?: string },
  styles: PptxThemeStyles,
  options: { x: number; y: number; w: number; isLast: boolean }
): number {
  const circleSize = 0.3;
  const lineWidth = 0.03;
  const stepHeight = data.description ? 1.0 : 0.7;

  // Get status-based colors
  const getStatusColor = (): string => {
    switch (data.status) {
      case "completed":
        return styles.colors.success;
      case "current":
        return styles.colors.primary;
      default:
        return styles.colors.border;
    }
  };

  const statusColor = getStatusColor();

  // Draw circle/node
  pptxSlide.addShape("ellipse", {
    x: options.x,
    y: options.y,
    w: circleSize,
    h: circleSize,
    fill: { color: data.status === "upcoming" ? styles.colors.background : statusColor },
    line: { color: statusColor, width: 2 },
  });

  // Draw step number or checkmark inside circle
  if (data.status === "completed") {
    pptxSlide.addText("✓", {
      x: options.x,
      y: options.y,
      w: circleSize,
      h: circleSize,
      fontSize: 10,
      color: styles.colors.background,
      align: "center",
      valign: "middle",
    });
  } else {
    pptxSlide.addText(String(data.step), {
      x: options.x,
      y: options.y,
      w: circleSize,
      h: circleSize,
      fontSize: 10,
      color: data.status === "upcoming" ? styles.colors.foregroundMuted : styles.colors.background,
      align: "center",
      valign: "middle",
    });
  }

  // Draw connecting line (if not last step)
  if (!options.isLast) {
    pptxSlide.addShape("rect", {
      x: options.x + circleSize / 2 - lineWidth / 2,
      y: options.y + circleSize,
      w: lineWidth,
      h: stepHeight - circleSize + 0.2,
      fill: { color: styles.colors.border },
    });
  }

  // Title (to the right of the circle)
  pptxSlide.addText(data.title, {
    x: options.x + circleSize + 0.2,
    y: options.y,
    w: options.w - circleSize - 0.2,
    h: 0.35,
    fontSize: styles.heading.fontSize,
    fontFace: styles.heading.fontFace,
    color: styles.heading.color,
    bold: true,
    valign: "middle",
  });

  // Description (below title, if present)
  if (data.description) {
    pptxSlide.addText(data.description, {
      x: options.x + circleSize + 0.2,
      y: options.y + 0.35,
      w: options.w - circleSize - 0.2,
      h: 0.45,
      fontSize: styles.body.fontSize * 0.9,
      fontFace: styles.body.fontFace,
      color: styles.colors.foregroundMuted,
      valign: "top",
    });
  }

  return stepHeight;
}

/**
 * Add an icon card to slide (Phase 7 Sprint 4)
 * Renders a card with icon indicator, title, and optional description
 */
function addIconCard(
  pptxSlide: PptxGenJS.Slide,
  data: { icon: string; text: string; description?: string; bgColor?: string },
  styles: PptxThemeStyles,
  options: { x: number; y: number; w: number; h: number }
): void {
  // Get background color based on preset or default
  const getBgColor = (): string => {
    const presets: Record<string, string> = {
      pink: "FFE4E6",
      blue: "DBEAFE",
      green: "DCFCE7",
      purple: "F3E8FF",
      orange: "FFEDD5",
      yellow: "FEF9C3",
      cyan: "CFFAFE",
      red: "FEE2E2",
    };
    return presets[data.bgColor?.toLowerCase() ?? ""] ?? styles.colors.backgroundSubtle;
  };

  // Card background
  pptxSlide.addShape("roundRect", {
    x: options.x,
    y: options.y,
    w: options.w,
    h: options.h,
    fill: { color: getBgColor() },
    rectRadius: 0.1,
  });

  // Icon circle (simplified - just show icon name as text placeholder)
  pptxSlide.addShape("ellipse", {
    x: options.x + 0.2,
    y: options.y + 0.2,
    w: 0.5,
    h: 0.5,
    fill: { color: styles.colors.background },
    line: { color: styles.colors.border, width: 1 },
  });

  // Icon text placeholder (first letter of icon name)
  pptxSlide.addText(data.icon.charAt(0).toUpperCase(), {
    x: options.x + 0.2,
    y: options.y + 0.2,
    w: 0.5,
    h: 0.5,
    fontSize: 14,
    color: styles.colors.primary,
    align: "center",
    valign: "middle",
    bold: true,
  });

  // Title
  pptxSlide.addText(data.text, {
    x: options.x + 0.2,
    y: options.y + 0.85,
    w: options.w - 0.4,
    h: 0.4,
    fontSize: styles.heading.fontSize,
    fontFace: styles.heading.fontFace,
    color: styles.heading.color,
    bold: true,
    valign: "top",
  });

  // Description
  if (data.description) {
    pptxSlide.addText(data.description, {
      x: options.x + 0.2,
      y: options.y + 1.25,
      w: options.w - 0.4,
      h: options.h - 1.45,
      fontSize: styles.body.fontSize * 0.9,
      fontFace: styles.body.fontFace,
      color: styles.colors.foregroundMuted,
      valign: "top",
    });
  }
}

/**
 * Add a numbered card to slide (Phase 7 Sprint 4)
 * Renders a card with number badge, title, and optional description
 */
function addNumberedCard(
  pptxSlide: PptxGenJS.Slide,
  data: { number: number; text: string; description?: string },
  styles: PptxThemeStyles,
  options: { x: number; y: number; w: number; h: number }
): void {
  // Card background
  pptxSlide.addShape("roundRect", {
    x: options.x,
    y: options.y,
    w: options.w,
    h: options.h,
    fill: { color: styles.colors.backgroundSubtle },
    line: { color: styles.colors.border, width: 1 },
    rectRadius: 0.1,
  });

  // Number badge (circle)
  pptxSlide.addShape("ellipse", {
    x: options.x + 0.2,
    y: options.y + 0.2,
    w: 0.45,
    h: 0.45,
    fill: { color: styles.colors.primary },
  });

  // Number text
  pptxSlide.addText(String(data.number), {
    x: options.x + 0.2,
    y: options.y + 0.2,
    w: 0.45,
    h: 0.45,
    fontSize: 14,
    color: styles.colors.background,
    align: "center",
    valign: "middle",
    bold: true,
  });

  // Title
  pptxSlide.addText(data.text, {
    x: options.x + 0.2,
    y: options.y + 0.8,
    w: options.w - 0.4,
    h: 0.4,
    fontSize: styles.heading.fontSize,
    fontFace: styles.heading.fontFace,
    color: styles.heading.color,
    bold: true,
    valign: "top",
  });

  // Description
  if (data.description) {
    pptxSlide.addText(data.description, {
      x: options.x + 0.2,
      y: options.y + 1.2,
      w: options.w - 0.4,
      h: options.h - 1.4,
      fontSize: styles.body.fontSize * 0.9,
      fontFace: styles.body.fontFace,
      color: styles.colors.foregroundMuted,
      valign: "top",
    });
  }
}

/**
 * Render a numbered grid slide (Phase 7 Sprint 4)
 */
function renderNumberedGridSlide(
  pptxSlide: PptxGenJS.Slide,
  blocks: Block[],
  styles: PptxThemeStyles
): void {
  pptxSlide.background = { color: styles.colors.background };

  const titleBlock = blocks.find((b) => b.kind === "title");
  const numberedCards = blocks.filter((b) => b.kind === "numbered_card");

  let contentY = CONTENT_AREA.y;

  // Title
  if (titleBlock) {
    addTitle(pptxSlide, getBlockText(titleBlock), styles);
    contentY += 1.2;
  }

  // Render numbered cards in grid
  const cardCount = numberedCards.length;
  const cardHeight = 2.2;

  if (cardCount === 4) {
    // 2x2 grid
    const cardWidth = (CONTENT_AREA.width - 0.5) / 2;
    numberedCards.forEach((block, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      addNumberedCard(pptxSlide, getNumberedCardData(block), styles, {
        x: CONTENT_AREA.x + col * (cardWidth + 0.5),
        y: contentY + row * (cardHeight + 0.3),
        w: cardWidth,
        h: cardHeight,
      });
    });
  } else {
    // Single row
    const cardWidth = (CONTENT_AREA.width - 0.5 * (cardCount - 1)) / cardCount;
    numberedCards.forEach((block, index) => {
      addNumberedCard(pptxSlide, getNumberedCardData(block), styles, {
        x: CONTENT_AREA.x + index * (cardWidth + 0.5),
        y: contentY,
        w: cardWidth,
        h: cardHeight,
      });
    });
  }
}

/**
 * Render an icon cards with image slide (Phase 7 Sprint 4)
 */
async function renderIconCardsWithImageSlide(
  pptxSlide: PptxGenJS.Slide,
  blocks: Block[],
  styles: PptxThemeStyles
): Promise<void> {
  pptxSlide.background = { color: styles.colors.background };

  const titleBlock = blocks.find((b) => b.kind === "title");
  const iconCards = blocks.filter((b) => b.kind === "icon_card");
  const imageBlock = blocks.find((b) => b.kind === "image");

  let contentY = CONTENT_AREA.y;

  // Title
  if (titleBlock) {
    addTitle(pptxSlide, getBlockText(titleBlock), styles);
    contentY += 1.2;
  }

  const cardHeight = 1.8;
  const hasImage = imageBlock !== undefined;

  if (hasImage) {
    // Cards on left, image on right
    const cardsWidth = (CONTENT_AREA.width - 0.5) * 0.5;
    const imageWidth = (CONTENT_AREA.width - 0.5) * 0.5;

    // Render icon cards vertically on left
    iconCards.forEach((block, index) => {
      addIconCard(pptxSlide, getIconCardData(block), styles, {
        x: CONTENT_AREA.x,
        y: contentY + index * (cardHeight + 0.2),
        w: cardsWidth,
        h: cardHeight,
      });
    });

    // Image on right
    const imageData = getImageData(imageBlock);
    if (imageData.url) {
      const imageHeight = iconCards.length * (cardHeight + 0.2) - 0.2;
      await addImage(pptxSlide, imageData.url, {
        x: CONTENT_AREA.x + cardsWidth + 0.5,
        y: contentY,
        w: imageWidth,
        h: Math.max(imageHeight, 3),
        sizing: { type: "contain", w: imageWidth, h: Math.max(imageHeight, 3) },
      });
    }
  } else {
    // Cards only - render in a row
    const cardWidth = (CONTENT_AREA.width - 0.5 * (iconCards.length - 1)) / iconCards.length;
    iconCards.forEach((block, index) => {
      addIconCard(pptxSlide, getIconCardData(block), styles, {
        x: CONTENT_AREA.x + index * (cardWidth + 0.5),
        y: contentY,
        w: cardWidth,
        h: cardHeight + 0.5,
      });
    });
  }
}

/**
 * Render a summary with stats slide (Phase 7 Sprint 4)
 */
function renderSummaryWithStatsSlide(
  pptxSlide: PptxGenJS.Slide,
  blocks: Block[],
  styles: PptxThemeStyles
): void {
  pptxSlide.background = { color: styles.colors.background };

  const titleBlock = blocks.find((b) => b.kind === "title");
  const textBlocks = blocks.filter((b) => b.kind === "text");
  const statBlocks = blocks.filter((b) => b.kind === "stat_block");

  let contentY = CONTENT_AREA.y;

  // Title
  if (titleBlock) {
    addTitle(pptxSlide, getBlockText(titleBlock), styles);
    contentY += 1.2;
  }

  // Text content
  if (textBlocks.length > 0) {
    const textHeight = 1.5;
    textBlocks.forEach((block) => {
      addBodyText(pptxSlide, getBlockText(block), styles, {
        x: CONTENT_AREA.x,
        y: contentY,
        w: CONTENT_AREA.width,
        h: textHeight,
      });
      contentY += textHeight + 0.3;
    });
  }

  // Stat blocks at bottom in a row
  if (statBlocks.length > 0) {
    const statWidth = CONTENT_AREA.width / statBlocks.length;
    const statY = Math.max(contentY + 0.5, CONTENT_AREA.y + CONTENT_AREA.height - 2.5);

    statBlocks.forEach((block, index) => {
      addStatBlock(pptxSlide, getStatBlockData(block), styles, {
        x: CONTENT_AREA.x + index * statWidth,
        y: statY,
        w: statWidth,
        h: 2.2,
      });
    });
  }
}

/**
 * Render a timeline roadmap slide (Phase 7)
 */
function renderTimelineRoadmapSlide(
  pptxSlide: PptxGenJS.Slide,
  blocks: Block[],
  styles: PptxThemeStyles
): void {
  pptxSlide.background = { color: styles.colors.background };

  const titleBlock = blocks.find((b) => b.kind === "title");
  const timelineSteps = blocks.filter((b) => b.kind === "timeline_step");

  let contentY = CONTENT_AREA.y;

  // Title
  if (titleBlock) {
    addTitle(pptxSlide, getBlockText(titleBlock), styles);
    contentY += 1.2;
  }

  // Render timeline steps vertically
  timelineSteps.forEach((block, index) => {
    const stepData = getTimelineStepData(block);
    const height = addTimelineStep(pptxSlide, stepData, styles, {
      x: CONTENT_AREA.x + 0.3,
      y: contentY,
      w: CONTENT_AREA.width - 0.6,
      isLast: index === timelineSteps.length - 1,
    });
    contentY += height;
  });
}

/**
 * Render a cover slide
 */
async function renderCoverSlide(
  pptxSlide: PptxGenJS.Slide,
  blocks: Block[],
  styles: PptxThemeStyles
): Promise<void> {
  pptxSlide.background = { color: styles.colors.background };

  const titleBlock = blocks.find((b) => b.kind === "title");
  const textBlock = blocks.find((b) => b.kind === "text");
  const imageBlock = blocks.find((b) => b.kind === "image");

  // Add background image if present (semi-transparent overlay for text visibility)
  if (imageBlock) {
    const imageData = getImageData(imageBlock);
    if (imageData.url) {
      const added = await addImage(pptxSlide, imageData.url, {
        x: 0,
        y: 0,
        w: PPTX_DIMENSIONS.width,
        h: PPTX_DIMENSIONS.height,
        sizing: { type: "cover", w: PPTX_DIMENSIONS.width, h: PPTX_DIMENSIONS.height },
      });

      // Add semi-transparent overlay for text readability
      if (added) {
        pptxSlide.addShape("rect", {
          x: 0,
          y: 0,
          w: PPTX_DIMENSIONS.width,
          h: PPTX_DIMENSIONS.height,
          fill: { color: styles.colors.background, transparency: 40 },
        });
      }
    }
  }

  // Centered title
  if (titleBlock) {
    pptxSlide.addText(getBlockText(titleBlock), {
      x: CONTENT_AREA.x,
      y: PPTX_DIMENSIONS.height / 2 - 1,
      w: CONTENT_AREA.width,
      h: 1.5,
      fontSize: styles.title.fontSize * 1.2,
      fontFace: styles.title.fontFace,
      color: styles.title.color,
      bold: styles.title.bold,
      align: "center",
      valign: "middle",
    });
  }

  // Subtitle
  if (textBlock) {
    pptxSlide.addText(getBlockText(textBlock), {
      x: CONTENT_AREA.x,
      y: PPTX_DIMENSIONS.height / 2 + 0.7,
      w: CONTENT_AREA.width,
      h: 0.8,
      fontSize: styles.heading.fontSize,
      fontFace: styles.body.fontFace,
      color: styles.colors.foregroundMuted,
      align: "center",
      valign: "middle",
    });
  }
}

/**
 * Render a standard content slide (bullets, agenda, etc.)
 */
function renderContentSlide(
  pptxSlide: PptxGenJS.Slide,
  blocks: Block[],
  styles: PptxThemeStyles,
  options?: { numbered?: boolean }
): void {
  pptxSlide.background = { color: styles.colors.background };

  const titleBlock = blocks.find((b) => b.kind === "title");
  const bulletsBlock = blocks.find((b) => b.kind === "bullets");
  const textBlock = blocks.find((b) => b.kind === "text");
  const statBlocks = blocks.filter((b) => b.kind === "stat_block");

  let contentY = CONTENT_AREA.y;

  // Title
  if (titleBlock) {
    addTitle(pptxSlide, getBlockText(titleBlock), styles);
    contentY += 1.2;
  }

  // Stat blocks (Phase 7) - render in a row
  if (statBlocks.length > 0) {
    const statWidth = CONTENT_AREA.width / statBlocks.length;
    statBlocks.forEach((block, index) => {
      addStatBlock(pptxSlide, getStatBlockData(block), styles, {
        x: CONTENT_AREA.x + index * statWidth,
        y: contentY,
        w: statWidth,
        h: 2.5,
      });
    });
    contentY += 2.8;
  }

  // Bullets
  if (bulletsBlock) {
    addBulletList(pptxSlide, getBlockItems(bulletsBlock), styles, {
      x: CONTENT_AREA.x,
      y: contentY,
      w: CONTENT_AREA.width,
      h: CONTENT_AREA.height - contentY + SLIDE_MARGINS.top,
      numbered: options?.numbered,
    });
  }

  // Text (if no bullets)
  if (textBlock && !bulletsBlock) {
    addBodyText(pptxSlide, getBlockText(textBlock), styles, {
      x: CONTENT_AREA.x,
      y: contentY,
      w: CONTENT_AREA.width,
      h: CONTENT_AREA.height - contentY + SLIDE_MARGINS.top,
    });
  }
}

/**
 * Render a section header slide
 */
function renderSectionHeaderSlide(
  pptxSlide: PptxGenJS.Slide,
  blocks: Block[],
  styles: PptxThemeStyles
): void {
  pptxSlide.background = { color: styles.colors.backgroundSubtle };

  const titleBlock = blocks.find((b) => b.kind === "title");
  const textBlock = blocks.find((b) => b.kind === "text");

  // Large centered title
  if (titleBlock) {
    pptxSlide.addText(getBlockText(titleBlock), {
      x: CONTENT_AREA.x,
      y: PPTX_DIMENSIONS.height / 2 - 0.8,
      w: CONTENT_AREA.width,
      h: 1.5,
      fontSize: styles.title.fontSize * 1.3,
      fontFace: styles.title.fontFace,
      color: styles.colors.primary,
      bold: styles.title.bold,
      align: "center",
      valign: "middle",
    });
  }

  // Optional subtitle
  if (textBlock) {
    pptxSlide.addText(getBlockText(textBlock), {
      x: CONTENT_AREA.x,
      y: PPTX_DIMENSIONS.height / 2 + 0.9,
      w: CONTENT_AREA.width,
      h: 0.6,
      fontSize: styles.body.fontSize,
      fontFace: styles.body.fontFace,
      color: styles.colors.foregroundMuted,
      align: "center",
    });
  }
}

/**
 * Render a two-column slide (also used for text_plus_image)
 */
async function renderTwoColumnSlide(
  pptxSlide: PptxGenJS.Slide,
  blocks: Block[],
  styles: PptxThemeStyles
): Promise<void> {
  pptxSlide.background = { color: styles.colors.background };

  const titleBlock = blocks.find((b) => b.kind === "title");
  const textBlocks = blocks.filter((b) => b.kind === "text");
  const bulletsBlock = blocks.find((b) => b.kind === "bullets");
  const imageBlock = blocks.find((b) => b.kind === "image");

  let contentY = CONTENT_AREA.y;
  const columnWidth = (CONTENT_AREA.width - 0.5) / 2;
  const contentHeight = CONTENT_AREA.height - 1.2;

  // Title
  if (titleBlock) {
    addTitle(pptxSlide, getBlockText(titleBlock), styles);
    contentY += 1.2;
  }

  // If we have an image, render text/bullets on left, image on right
  if (imageBlock) {
    const imageData = getImageData(imageBlock);

    // Left column: text or bullets
    if (textBlocks[0]) {
      addBodyText(pptxSlide, getBlockText(textBlocks[0]), styles, {
        x: CONTENT_AREA.x,
        y: contentY,
        w: columnWidth,
        h: contentHeight,
      });
    } else if (bulletsBlock) {
      addBulletList(pptxSlide, getBlockItems(bulletsBlock), styles, {
        x: CONTENT_AREA.x,
        y: contentY,
        w: columnWidth,
        h: contentHeight,
      });
    }

    // Right column: image
    if (imageData.url) {
      await addImage(pptxSlide, imageData.url, {
        x: CONTENT_AREA.x + columnWidth + 0.5,
        y: contentY,
        w: columnWidth,
        h: contentHeight,
        sizing: { type: "contain", w: columnWidth, h: contentHeight },
      });
    }
  } else {
    // No image - standard two-column text layout
    // Left column
    if (textBlocks[0]) {
      addBodyText(pptxSlide, getBlockText(textBlocks[0]), styles, {
        x: CONTENT_AREA.x,
        y: contentY,
        w: columnWidth,
        h: contentHeight,
      });
    }

    // Right column
    if (textBlocks[1]) {
      addBodyText(pptxSlide, getBlockText(textBlocks[1]), styles, {
        x: CONTENT_AREA.x + columnWidth + 0.5,
        y: contentY,
        w: columnWidth,
        h: contentHeight,
      });
    }
  }
}

/**
 * Render a table slide
 */
function renderTableSlide(
  pptxSlide: PptxGenJS.Slide,
  blocks: Block[],
  styles: PptxThemeStyles
): void {
  pptxSlide.background = { color: styles.colors.background };

  const titleBlock = blocks.find((b) => b.kind === "title");
  const tableBlock = blocks.find((b) => b.kind === "table");

  let contentY = CONTENT_AREA.y;

  // Title
  if (titleBlock) {
    addTitle(pptxSlide, getBlockText(titleBlock), styles);
    contentY += 1.2;
  }

  // Table
  if (tableBlock) {
    addTable(pptxSlide, getBlockTable(tableBlock), styles, {
      x: CONTENT_AREA.x,
      y: contentY,
      w: CONTENT_AREA.width,
    });
  }
}

/**
 * Render a quote/callout slide
 */
function renderQuoteSlide(
  pptxSlide: PptxGenJS.Slide,
  blocks: Block[],
  styles: PptxThemeStyles
): void {
  pptxSlide.background = { color: styles.colors.background };

  const titleBlock = blocks.find((b) => b.kind === "title");
  const calloutBlock = blocks.find((b) => b.kind === "callout");
  const textBlock = blocks.find((b) => b.kind === "text");

  let contentY = CONTENT_AREA.y;

  // Title
  if (titleBlock) {
    addTitle(pptxSlide, getBlockText(titleBlock), styles);
    contentY += 1.2;
  }

  // Quote/callout
  const quoteContent = calloutBlock
    ? getCalloutData(calloutBlock)
    : { text: textBlock ? getBlockText(textBlock) : "", style: "quote" };

  if (quoteContent.text) {
    // Add a colored bar on the left
    pptxSlide.addShape("rect", {
      x: CONTENT_AREA.x,
      y: contentY,
      w: 0.1,
      h: 2,
      fill: { color: getCalloutColor(quoteContent.style, styles) },
    });

    // Quote text
    pptxSlide.addText(quoteContent.text, {
      x: CONTENT_AREA.x + 0.3,
      y: contentY,
      w: CONTENT_AREA.width - 0.3,
      h: 2,
      fontSize: styles.quote.fontSize,
      fontFace: styles.quote.fontFace,
      color: styles.quote.color,
      italic: styles.quote.italic,
      valign: "top",
    });
  }
}

/**
 * Render slide based on type
 */
async function renderSlide(pptx: PptxGenJS, slide: Slide, styles: PptxThemeStyles): Promise<void> {
  const pptxSlide = pptx.addSlide();

  switch (slide.type) {
    case "cover":
      await renderCoverSlide(pptxSlide, slide.blocks, styles);
      break;

    case "section_header":
      renderSectionHeaderSlide(pptxSlide, slide.blocks, styles);
      break;

    case "agenda":
      renderContentSlide(pptxSlide, slide.blocks, styles, { numbered: true });
      break;

    case "bullets":
    case "decisions_list":
    case "summary_next_steps":
      renderContentSlide(pptxSlide, slide.blocks, styles);
      break;

    case "two_column_text":
    case "text_plus_image":
      await renderTwoColumnSlide(pptxSlide, slide.blocks, styles);
      break;

    case "action_items_table":
      renderTableSlide(pptxSlide, slide.blocks, styles);
      break;

    case "quote_callout":
      renderQuoteSlide(pptxSlide, slide.blocks, styles);
      break;

    case "timeline_roadmap":
      renderTimelineRoadmapSlide(pptxSlide, slide.blocks, styles);
      break;

    case "numbered_grid":
      renderNumberedGridSlide(pptxSlide, slide.blocks, styles);
      break;

    case "icon_cards_with_image":
      await renderIconCardsWithImageSlide(pptxSlide, slide.blocks, styles);
      break;

    case "summary_with_stats":
      renderSummaryWithStatsSlide(pptxSlide, slide.blocks, styles);
      break;

    default:
      // Fallback to content slide
      renderContentSlide(pptxSlide, slide.blocks, styles);
  }
}

/**
 * Render a deck to PPTX
 *
 * @param deck - The deck data to render
 * @param themeId - The theme to apply
 * @param brandKit - Optional brand kit color overrides
 * @returns PPTX as a Buffer
 */
export async function renderDeckToPptx(
  deck: Deck,
  themeId: ThemeId,
  brandKit?: BrandKitOverrides
): Promise<Buffer> {
  // Get and apply theme
  const baseTheme = getTheme(themeId);
  const theme = applyBrandKit(baseTheme, brandKit);
  const styles = themeToPptxStyles(theme.tokens);

  // Create presentation
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33" x 7.5"
  pptx.title = deck.deck.title;
  pptx.author = "ARTI Slides";

  // Render each slide
  for (const slide of deck.slides) {
    await renderSlide(pptx, slide, styles);
  }

  // Generate buffer
  const data = await pptx.write({ outputType: "nodebuffer" });
  return data as Buffer;
}

/**
 * Render slides array to PPTX
 *
 * @param slides - Array of slides to render
 * @param themeId - The theme to apply
 * @param brandKit - Optional brand kit color overrides
 * @param title - Optional presentation title
 * @returns PPTX as a Buffer
 */
export async function renderSlidesToPptx(
  slides: Slide[],
  themeId: ThemeId,
  brandKit?: BrandKitOverrides,
  title?: string
): Promise<Buffer> {
  const baseTheme = getTheme(themeId);
  const theme = applyBrandKit(baseTheme, brandKit);
  const styles = themeToPptxStyles(theme.tokens);

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.title = title ?? "Presentation";
  pptx.author = "ARTI Slides";

  for (const slide of slides) {
    await renderSlide(pptx, slide, styles);
  }

  const data = await pptx.write({ outputType: "nodebuffer" });
  return data as Buffer;
}
