/**
 * AI Actions API Route
 *
 * POST /api/decks/[id]/ai - Perform AI actions on slides
 *
 * Actions:
 * - shorten: Reduce content to fit within constraints
 * - split: Split slide into multiple slides
 * - transform: Apply AI transformation (simplify, expand, translate, etc.)
 * - generate_image: Generate a new AI image for a slide using DALL-E/Gemini
 * - repair_all: Repair all slides with constraint violations
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDeckById, saveDeckFromSchema, dbDeckToSchema } from "@/lib/db/deck";
import {
  aiShortenSlide,
  aiSplitSlide,
  aiRepairSlide,
  getSlideViolations,
} from "@/lib/ai/edit-actions";
import { transformSlideServer } from "@/lib/ai/slide-agent";
import { buildImagePrompt, updateSlideWithImage } from "@/lib/ai/image-generation";
import { getImageClient, ImageError } from "@/lib/ai/image-client";
import { uploadFile, generateSignedUrl } from "@/lib/storage/s3-client";
import type { Deck } from "@/lib/schemas/deck";

// MVP: Use fixed workspace ID (no auth yet)
const MVP_WORKSPACE_ID = "ws_default";

// ============================================================================
// Request Schema
// ============================================================================

const AIActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("shorten"),
    slideIndex: z.number().int().min(0),
  }),
  z.object({
    action: z.literal("split"),
    slideIndex: z.number().int().min(0),
  }),
  z.object({
    action: z.literal("transform"),
    slideIndex: z.number().int().min(0),
    instruction: z.string().min(1),
    deckTitle: z.string().optional(),
  }),
  z.object({
    action: z.literal("generate_image"),
    slideIndex: z.number().int().min(0),
    deckTitle: z.string().optional(),
  }),
  z.object({
    action: z.literal("repair_all"),
  }),
]);

// ============================================================================
// POST /api/decks/[id]/ai
// ============================================================================

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = AIActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Ugyldig input",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { action } = parsed.data;

    // Fetch the deck
    const deck = await getDeckById(id, MVP_WORKSPACE_ID);

    if (!deck) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Presentasjon ikke funnet" } },
        { status: 404 }
      );
    }

    // Convert to schema format
    const deckSchema = dbDeckToSchema(deck);

    // Handle repair_all action (no slideIndex required)
    if (action === "repair_all") {
      // Find all slides with violations
      const slidesWithViolations: Array<{
        index: number;
        violations: ReturnType<typeof getSlideViolations>;
      }> = [];

      for (let i = 0; i < deckSchema.slides.length; i++) {
        const slideViolations = getSlideViolations(deckSchema.slides[i]);
        if (slideViolations.length > 0) {
          slidesWithViolations.push({ index: i, violations: slideViolations });
        }
      }

      if (slidesWithViolations.length === 0) {
        return NextResponse.json({
          success: true,
          slides: deckSchema.slides,
          repairedCount: 0,
          message: "Ingen feil å reparere",
          action: "repair_all",
        });
      }

      // Repair each slide with violations
      const repairedSlides = [...deckSchema.slides];
      let repairedCount = 0;
      const errors: Array<{ slideIndex: number; error: string }> = [];

      for (const { index, violations } of slidesWithViolations) {
        try {
          const result = await aiRepairSlide(deckSchema.slides[index], { maxAttempts: 2 });

          if (result.success && result.data && result.data.length > 0) {
            // For now, only handle the case where we get exactly 1 repaired slide
            // (splitting would require restructuring the deck)
            if (result.data.length === 1) {
              repairedSlides[index] = result.data[0];
              repairedCount++;
            } else {
              // Multiple slides from split - for now, just use the first one
              // TODO: Implement proper split handling
              repairedSlides[index] = result.data[0];
              repairedCount++;
            }
          } else {
            errors.push({ slideIndex: index, error: result.error ?? "Ukjent feil" });
          }
        } catch (error) {
          errors.push({
            slideIndex: index,
            error: error instanceof Error ? error.message : "Ukjent feil",
          });
        }
      }

      return NextResponse.json({
        success: true,
        slides: repairedSlides,
        repairedCount,
        totalWithViolations: slidesWithViolations.length,
        errors: errors.length > 0 ? errors : undefined,
        message:
          errors.length > 0
            ? `Reparerte ${repairedCount} av ${slidesWithViolations.length} slides (${errors.length} feilet)`
            : `Reparerte ${repairedCount} slides`,
        action: "repair_all",
      });
    }

    // For other actions, validate slideIndex
    const slideIndex = "slideIndex" in parsed.data ? parsed.data.slideIndex : -1;
    if (slideIndex < 0 || slideIndex >= deckSchema.slides.length) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_SLIDE_INDEX",
            message: `Slide ${slideIndex + 1} finnes ikke`,
          },
        },
        { status: 400 }
      );
    }

    const slide = deckSchema.slides[slideIndex];
    const violations = getSlideViolations(slide);

    // Perform the AI action
    if (action === "shorten") {
      const result = await aiShortenSlide(slide, violations);

      if (!result.success || !result.data) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AI_ERROR",
              message: result.error ?? "Kunne ikke korte ned innhold",
            },
          },
          { status: 422 }
        );
      }

      // Return the single slide
      return NextResponse.json({
        success: true,
        slides: [result.data],
        action: "shorten",
      });
    }

    if (action === "split") {
      const result = await aiSplitSlide(slide, violations);

      if (!result.success || !result.data) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AI_ERROR",
              message: result.error ?? "Kunne ikke dele innhold",
            },
          },
          { status: 422 }
        );
      }

      // Return the split slides
      return NextResponse.json({
        success: true,
        slides: result.data,
        action: "split",
      });
    }

    if (action === "transform") {
      const { instruction, deckTitle } = parsed.data;

      const result = await transformSlideServer(slide, instruction, {
        deckTitle,
      });

      if (!result.success || !result.data) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AI_ERROR",
              message: result.error ?? "AI-transformasjon feilet",
            },
          },
          { status: 422 }
        );
      }

      // Return the transformed slide with explanation
      return NextResponse.json({
        success: true,
        slide: result.data.slide,
        changes: result.data.changes,
        explanation: result.data.explanation,
        action: "transform",
      });
    }

    if (action === "generate_image") {
      const { deckTitle } = parsed.data;

      // Check if slide has an image block
      const imageBlock = slide.blocks.find((b) => b.kind === "image");
      if (!imageBlock) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "NO_IMAGE_BLOCK",
              message: "Denne sliden har ikke en bilde-blokk",
            },
          },
          { status: 400 }
        );
      }

      try {
        // Build prompt from slide content
        const prompt = buildImagePrompt({
          slide,
          deckTitle: deckTitle ?? deckSchema.deck.title,
          slideIndex,
        });

        // Generate image using the configured provider (DALL-E or Gemini)
        const imageClient = getImageClient();
        const imageResult = await imageClient.generateImage(prompt, "default");

        // Check if the URL is already an S3 signed URL (from Gemini)
        let finalUrl = imageResult.url;

        // If not an S3 URL, download and persist to S3
        if (!finalUrl.includes(process.env.S3_BUCKET ?? "gamma-klone")) {
          // Download the image
          const response = await fetch(imageResult.url);
          if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status}`);
          }
          const imageBuffer = Buffer.from(await response.arrayBuffer());

          // Upload to S3
          const timestamp = Date.now();
          const s3Key = `images/${id}/slide-${slideIndex}-${timestamp}.png`;
          await uploadFile(s3Key, imageBuffer, "image/png");

          // Generate signed URL
          finalUrl = await generateSignedUrl(s3Key, 86400 * 7); // 7 days
        }

        // Update the slide with the new image URL
        const updatedSlide = updateSlideWithImage(slide, finalUrl);

        return NextResponse.json({
          success: true,
          slide: updatedSlide,
          changes: [
            {
              blockIndex: slide.blocks.findIndex((b) => b.kind === "image"),
              field: "url",
              oldValue: imageBlock.url?.slice(0, 50) ?? "(ingen)",
              newValue: finalUrl.slice(0, 50) + "...",
            },
          ],
          explanation: "Nytt AI-generert bilde ble opprettet for sliden",
          action: "generate_image",
        });
      } catch (error) {
        console.error("Image generation error:", error);

        let errorMessage = "Kunne ikke generere bilde";
        let errorCode = "IMAGE_ERROR";

        if (error instanceof ImageError) {
          errorCode = error.code;
          switch (error.code) {
            case "CONTENT_POLICY":
              errorMessage = "Bildet ble blokkert av innholdspolicy";
              break;
            case "RATE_LIMITED":
              errorMessage = "For mange forespørsler - prøv igjen om litt";
              break;
            default:
              errorMessage = error.message;
          }
        }

        return NextResponse.json(
          {
            success: false,
            error: {
              code: errorCode,
              message: errorMessage,
            },
          },
          { status: 422 }
        );
      }
    }

    // Should not reach here due to zod validation
    return NextResponse.json(
      { error: { code: "INVALID_ACTION", message: "Ugyldig handling" } },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/decks/[id]/ai error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "AI-handling feilet",
        },
      },
      { status: 500 }
    );
  }
}
