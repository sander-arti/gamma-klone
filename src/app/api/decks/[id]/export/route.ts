/**
 * Export API Routes
 *
 * POST /api/decks/[id]/export - Trigger a PDF or PPTX export
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDeckById } from "@/lib/db/deck";
import { createExportJob } from "@/lib/db/export-job";
import { addExportJob, type ExportFormat } from "@/lib/queue/export-queue";
import type { ThemeId } from "@/lib/themes";

// MVP: Use fixed workspace ID (no auth yet)
const MVP_WORKSPACE_ID = "ws_default";

const ExportRequestSchema = z.object({
  format: z.enum(["pdf", "pptx"]),
});

// ============================================================================
// POST /api/decks/[id]/export - Trigger export
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const parsed = ExportRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Ugyldig format. Må være 'pdf' eller 'pptx'.",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { format } = parsed.data;

    // Verify deck exists and get theme info
    const deck = await getDeckById(id, MVP_WORKSPACE_ID);

    if (!deck) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Presentasjon ikke funnet" } },
        { status: 404 }
      );
    }

    // Create export job in database
    const exportJob = await createExportJob({
      deckId: id,
      format: format as ExportFormat,
    });

    // Add to BullMQ queue for processing
    await addExportJob({
      exportJobId: exportJob.id,
      generationJobId: exportJob.id, // Use exportJobId as fallback
      deckId: id,
      format: format as ExportFormat,
      themeId: (deck.themeId ?? "nordic_light") as ThemeId,
      brandKit: deck.primaryColor || deck.secondaryColor
        ? {
            primaryColor: deck.primaryColor ?? undefined,
            secondaryColor: deck.secondaryColor ?? undefined,
            logoUrl: deck.logoUrl ?? undefined,
          }
        : undefined,
    });

    return NextResponse.json({
      exportJobId: exportJob.id,
      status: "queued",
    });
  } catch (error) {
    console.error("POST /api/decks/[id]/export error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Kunne ikke starte eksport" } },
      { status: 500 }
    );
  }
}
