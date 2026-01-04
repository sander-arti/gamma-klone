/**
 * Share API Routes
 *
 * POST /api/decks/[id]/share - Generate a share link
 * DELETE /api/decks/[id]/share - Revoke share access
 * GET /api/decks/[id]/share - Get current share status
 */

import { NextRequest, NextResponse } from "next/server";
import { getDeckById, generateShareToken, revokeShareAccess } from "@/lib/db/deck";

// MVP: Use fixed workspace ID (no auth yet)
const MVP_WORKSPACE_ID = "ws_default";

/**
 * Build full share URL from token
 */
function buildShareUrl(token: string, request: NextRequest): string {
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("host") ?? "localhost:3000";
  return `${protocol}://${host}/view/${token}`;
}

// ============================================================================
// GET /api/decks/[id]/share - Get current share status
// ============================================================================

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deck = await getDeckById(id, MVP_WORKSPACE_ID);

    if (!deck) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Presentasjon ikke funnet" } },
        { status: 404 }
      );
    }

    // Return current share status
    if (deck.shareToken && deck.shareAccess === "anyone_with_link_can_view") {
      return NextResponse.json({
        shareToken: deck.shareToken,
        shareUrl: buildShareUrl(deck.shareToken, request),
        shareAccess: deck.shareAccess,
      });
    }

    return NextResponse.json({
      shareToken: null,
      shareUrl: null,
      shareAccess: "private",
    });
  } catch (error) {
    console.error("GET /api/decks/[id]/share error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Kunne ikke hente delingsstatus" } },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/decks/[id]/share - Generate share link
// ============================================================================

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Generate a new share token
    const token = await generateShareToken(id, MVP_WORKSPACE_ID);

    if (!token) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Presentasjon ikke funnet" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      shareToken: token,
      shareUrl: buildShareUrl(token, request),
      shareAccess: "anyone_with_link_can_view",
    });
  } catch (error) {
    console.error("POST /api/decks/[id]/share error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Kunne ikke generere delingslenke" } },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/decks/[id]/share - Revoke share access
// ============================================================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const revoked = await revokeShareAccess(id, MVP_WORKSPACE_ID);

    if (!revoked) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Presentasjon ikke funnet" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/decks/[id]/share error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Kunne ikke fjerne deling" } },
      { status: 500 }
    );
  }
}
