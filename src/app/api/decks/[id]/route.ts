/**
 * Individual Deck API Routes
 *
 * GET /api/decks/[id] - Get a single deck with slides
 * PUT /api/decks/[id] - Update a deck
 * DELETE /api/decks/[id] - Delete a deck
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getDeckById,
  updateDeck,
  deleteDeck,
  saveDeckFromSchema,
  dbDeckToSchema,
} from "@/lib/db/deck";
import { DeckSchema } from "@/lib/schemas/deck";

// MVP: Use fixed workspace ID (no auth yet)
const MVP_WORKSPACE_ID = "ws_default";

// ============================================================================
// GET /api/decks/[id]
// ============================================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deck = await getDeckById(id, MVP_WORKSPACE_ID);

    if (!deck) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Presentasjon ikke funnet" } },
        { status: 404 }
      );
    }

    // Convert to schema format for frontend
    const deckSchema = dbDeckToSchema(deck);

    return NextResponse.json({
      id: deck.id,
      ...deckSchema,
      updatedAt: deck.updatedAt,
      createdAt: deck.createdAt,
      shareToken: deck.shareToken,
      shareAccess: deck.shareAccess,
    });
  } catch (error) {
    console.error("GET /api/decks/[id] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Kunne ikke hente presentasjon" } },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/decks/[id]
// ============================================================================

const UpdateDeckSchema = z.object({
  // Option 1: Update just metadata
  title: z.string().min(1).max(200).optional(),
  language: z.string().optional(),
  themeId: z.string().optional(),
  // Option 2: Replace entire deck content
  deck: DeckSchema.optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateDeckSchema.safeParse(body);

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

    // If full deck content is provided, save it
    if (parsed.data.deck) {
      const savedDeck = await saveDeckFromSchema(
        id,
        MVP_WORKSPACE_ID,
        parsed.data.deck
      );

      if (!savedDeck) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Presentasjon ikke funnet" } },
          { status: 404 }
        );
      }

      const deckSchema = dbDeckToSchema(savedDeck);
      return NextResponse.json({
        id: savedDeck.id,
        ...deckSchema,
        updatedAt: savedDeck.updatedAt,
      });
    }

    // Otherwise, update just metadata
    const updatedDeck = await updateDeck(id, MVP_WORKSPACE_ID, {
      title: parsed.data.title,
      language: parsed.data.language,
      themeId: parsed.data.themeId,
    });

    if (!updatedDeck) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Presentasjon ikke funnet" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: updatedDeck.id,
      title: updatedDeck.title,
      language: updatedDeck.language,
      themeId: updatedDeck.themeId,
      updatedAt: updatedDeck.updatedAt,
    });
  } catch (error) {
    console.error("PUT /api/decks/[id] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Kunne ikke oppdatere presentasjon" } },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/decks/[id]
// ============================================================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteDeck(id, MVP_WORKSPACE_ID);

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Presentasjon ikke funnet" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/decks/[id] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Kunne ikke slette presentasjon" } },
      { status: 500 }
    );
  }
}
