/**
 * Deck API Routes
 *
 * GET /api/decks - List all decks
 * POST /api/decks - Create a new deck
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listDecks, createDeck } from "@/lib/db/deck";

// MVP: Use fixed workspace/user IDs (no auth yet)
const MVP_WORKSPACE_ID = "ws_default";
const MVP_USER_ID = "user_default";

// ============================================================================
// GET /api/decks
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const result = await listDecks(MVP_WORKSPACE_ID, {
      limit: Math.min(limit, 100),
      offset: Math.max(offset, 0),
    });

    return NextResponse.json({
      decks: result.decks,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("GET /api/decks error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Kunne ikke hente presentasjoner" } },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/decks
// ============================================================================

const CreateDeckSchema = z.object({
  title: z.string().min(1).max(200),
  language: z.string().default("no"),
  themeId: z.string().default("nordic_light"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateDeckSchema.safeParse(body);

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

    const deck = await createDeck({
      workspaceId: MVP_WORKSPACE_ID,
      userId: MVP_USER_ID,
      title: parsed.data.title,
      language: parsed.data.language,
      themeId: parsed.data.themeId,
    });

    return NextResponse.json({ deck }, { status: 201 });
  } catch (error) {
    console.error("POST /api/decks error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Kunne ikke opprette presentasjon" } },
      { status: 500 }
    );
  }
}
