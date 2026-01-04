/**
 * Deck CRUD Operations
 *
 * Database operations for Deck, Slide, and Block models.
 * All operations enforce multi-tenant isolation via workspaceId.
 */

import { prisma } from "./prisma";
import type { Deck, Slide, Block } from "@prisma/client";
import type { Deck as DeckSchema, ThemeId } from "@/lib/schemas/deck";
import type { Slide as SlideSchema } from "@/lib/schemas/slide";
import { randomBytes } from "crypto";

// ============================================================================
// Types
// ============================================================================

export type DeckWithSlides = Deck & {
  slides: (Slide & { blocks: Block[] })[];
};

export interface CreateDeckInput {
  workspaceId: string;
  userId: string;
  title: string;
  language?: string;
  themeId?: string;
  outline?: unknown;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
}

export interface UpdateDeckInput {
  title?: string;
  language?: string;
  themeId?: string;
  outline?: unknown;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  shareAccess?: "private" | "anyone_with_link_can_view";
}

export interface CreateSlideInput {
  type: string;
  layoutVariant?: string;
  blocks: CreateBlockInput[];
}

export interface CreateBlockInput {
  kind: string;
  content: unknown;
}

// ============================================================================
// Deck Operations
// ============================================================================

/**
 * Create a new deck
 */
export async function createDeck(input: CreateDeckInput): Promise<Deck> {
  return prisma.deck.create({
    data: {
      workspaceId: input.workspaceId,
      userId: input.userId,
      title: input.title,
      language: input.language ?? "no",
      themeId: input.themeId ?? "nordic_light",
      outline: input.outline ?? undefined,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      logoUrl: input.logoUrl,
    },
  });
}

/**
 * Get a deck by ID with slides and blocks
 * Enforces workspace isolation
 */
export async function getDeckById(
  deckId: string,
  workspaceId: string
): Promise<DeckWithSlides | null> {
  return prisma.deck.findFirst({
    where: {
      id: deckId,
      workspaceId,
    },
    include: {
      slides: {
        orderBy: { position: "asc" },
        include: {
          blocks: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });
}

/**
 * Get a deck by share token (for public access)
 * No workspace isolation - token is the auth
 */
export async function getDeckByShareToken(shareToken: string): Promise<DeckWithSlides | null> {
  return prisma.deck.findFirst({
    where: {
      shareToken,
      shareAccess: "anyone_with_link_can_view",
    },
    include: {
      slides: {
        orderBy: { position: "asc" },
        include: {
          blocks: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });
}

/**
 * List all decks for a workspace
 */
export async function listDecks(
  workspaceId: string,
  options?: {
    userId?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ decks: Deck[]; total: number }> {
  const where = {
    workspaceId,
    ...(options?.userId ? { userId: options.userId } : {}),
  };

  const [decks, total] = await Promise.all([
    prisma.deck.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    }),
    prisma.deck.count({ where }),
  ]);

  return { decks, total };
}

/**
 * Update a deck
 */
export async function updateDeck(
  deckId: string,
  workspaceId: string,
  input: UpdateDeckInput
): Promise<Deck | null> {
  // Verify ownership first
  const existing = await prisma.deck.findFirst({
    where: { id: deckId, workspaceId },
  });

  if (!existing) {
    return null;
  }

  return prisma.deck.update({
    where: { id: deckId },
    data: {
      title: input.title,
      language: input.language,
      themeId: input.themeId,
      outline: input.outline ?? undefined,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      logoUrl: input.logoUrl,
      shareAccess: input.shareAccess,
    },
  });
}

/**
 * Delete a deck
 */
export async function deleteDeck(deckId: string, workspaceId: string): Promise<boolean> {
  // Verify ownership first
  const existing = await prisma.deck.findFirst({
    where: { id: deckId, workspaceId },
  });

  if (!existing) {
    return false;
  }

  await prisma.deck.delete({
    where: { id: deckId },
  });

  return true;
}

/**
 * Generate a share token for a deck
 */
export async function generateShareToken(
  deckId: string,
  workspaceId: string
): Promise<string | null> {
  // Verify ownership first
  const existing = await prisma.deck.findFirst({
    where: { id: deckId, workspaceId },
  });

  if (!existing) {
    return null;
  }

  // Generate a URL-safe token
  const token = randomBytes(16).toString("base64url");

  await prisma.deck.update({
    where: { id: deckId },
    data: {
      shareToken: token,
      shareAccess: "anyone_with_link_can_view",
    },
  });

  return token;
}

/**
 * Revoke share access for a deck
 */
export async function revokeShareAccess(deckId: string, workspaceId: string): Promise<boolean> {
  // Verify ownership first
  const existing = await prisma.deck.findFirst({
    where: { id: deckId, workspaceId },
  });

  if (!existing) {
    return false;
  }

  await prisma.deck.update({
    where: { id: deckId },
    data: {
      shareToken: null,
      shareAccess: "private",
    },
  });

  return true;
}

// ============================================================================
// Slide Operations
// ============================================================================

/**
 * Add a slide to a deck
 */
export async function addSlide(
  deckId: string,
  workspaceId: string,
  input: CreateSlideInput,
  position?: number
): Promise<Slide | null> {
  // Verify ownership first
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, workspaceId },
    include: { slides: { select: { position: true } } },
  });

  if (!deck) {
    return null;
  }

  // Calculate position
  const maxPosition = Math.max(...deck.slides.map((s) => s.position), -1);
  const slidePosition = position ?? maxPosition + 1;

  // If inserting, shift existing slides
  if (position !== undefined && position <= maxPosition) {
    await prisma.slide.updateMany({
      where: {
        deckId,
        position: { gte: position },
      },
      data: {
        position: { increment: 1 },
      },
    });
  }

  // Create slide with blocks
  return prisma.slide.create({
    data: {
      deckId,
      type: input.type,
      layoutVariant: input.layoutVariant ?? "default",
      position: slidePosition,
      blocks: {
        create: input.blocks.map((block, index) => ({
          kind: block.kind,
          content: block.content as object,
          position: index,
        })),
      },
    },
    include: {
      blocks: {
        orderBy: { position: "asc" },
      },
    },
  });
}

/**
 * Update a slide
 */
export async function updateSlide(
  slideId: string,
  workspaceId: string,
  input: Partial<CreateSlideInput>
): Promise<Slide | null> {
  // Verify ownership via deck
  const existing = await prisma.slide.findFirst({
    where: { id: slideId },
    include: { deck: { select: { workspaceId: true } } },
  });

  if (!existing || existing.deck.workspaceId !== workspaceId) {
    return null;
  }

  return prisma.slide.update({
    where: { id: slideId },
    data: {
      type: input.type,
      layoutVariant: input.layoutVariant,
    },
    include: {
      blocks: {
        orderBy: { position: "asc" },
      },
    },
  });
}

/**
 * Delete a slide
 */
export async function deleteSlide(slideId: string, workspaceId: string): Promise<boolean> {
  // Verify ownership via deck
  const existing = await prisma.slide.findFirst({
    where: { id: slideId },
    include: { deck: { select: { workspaceId: true, id: true } } },
  });

  if (!existing || existing.deck.workspaceId !== workspaceId) {
    return false;
  }

  // Delete the slide
  await prisma.slide.delete({
    where: { id: slideId },
  });

  // Reorder remaining slides
  await prisma.$executeRaw`
    UPDATE slides
    SET position = position - 1
    WHERE deck_id = ${existing.deck.id}
    AND position > ${existing.position}
  `;

  return true;
}

/**
 * Reorder slides in a deck
 */
export async function reorderSlides(
  deckId: string,
  workspaceId: string,
  slideOrder: string[]
): Promise<boolean> {
  // Verify ownership first
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, workspaceId },
    include: { slides: { select: { id: true } } },
  });

  if (!deck) {
    return false;
  }

  // Verify all slide IDs belong to this deck
  const deckSlideIds = new Set(deck.slides.map((s) => s.id));
  if (!slideOrder.every((id) => deckSlideIds.has(id))) {
    return false;
  }

  // Update positions in a transaction
  await prisma.$transaction(
    slideOrder.map((slideId, index) =>
      prisma.slide.update({
        where: { id: slideId },
        data: { position: index },
      })
    )
  );

  return true;
}

// ============================================================================
// Block Operations
// ============================================================================

/**
 * Update a block's content
 */
export async function updateBlock(
  blockId: string,
  workspaceId: string,
  content: unknown
): Promise<Block | null> {
  // Verify ownership via slide -> deck
  const existing = await prisma.block.findFirst({
    where: { id: blockId },
    include: {
      slide: {
        include: {
          deck: { select: { workspaceId: true } },
        },
      },
    },
  });

  if (!existing || existing.slide.deck.workspaceId !== workspaceId) {
    return null;
  }

  return prisma.block.update({
    where: { id: blockId },
    data: {
      content: content as object,
    },
  });
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Convert database Deck to schema Deck format
 */
export function dbDeckToSchema(dbDeck: DeckWithSlides): DeckSchema {
  return {
    deck: {
      title: dbDeck.title,
      language: dbDeck.language,
      themeId: dbDeck.themeId as ThemeId,
      ...(dbDeck.primaryColor || dbDeck.secondaryColor
        ? {
            brandKit: {
              primaryColor: dbDeck.primaryColor ?? undefined,
              secondaryColor: dbDeck.secondaryColor ?? undefined,
              logoUrl: dbDeck.logoUrl ?? undefined,
            },
          }
        : {}),
    },
    slides: dbDeck.slides.map((slide) => dbSlideToSchema(slide)),
  };
}

/**
 * Convert database Slide to schema Slide format
 */
function dbSlideToSchema(dbSlide: Slide & { blocks: Block[] }): SlideSchema {
  return {
    type: dbSlide.type,
    layoutVariant: dbSlide.layoutVariant,
    blocks: dbSlide.blocks.map((block) => ({
      kind: block.kind,
      ...(block.content as object),
    })),
  } as SlideSchema;
}

/**
 * Save a schema Deck to database
 * Creates slides and blocks from the schema format
 *
 * IMPORTANT: Uses a transaction with row locking to prevent race conditions
 * that could cause slide duplication during concurrent saves.
 */
export async function saveDeckFromSchema(
  deckId: string,
  workspaceId: string,
  schema: DeckSchema
): Promise<DeckWithSlides | null> {
  // Use a serializable transaction with row locking to prevent race conditions
  const result = await prisma.$transaction(
    async (tx) => {
      // Verify ownership AND lock the row for update
      const existing = await tx.deck.findFirst({
        where: { id: deckId, workspaceId },
      });

      if (!existing) {
        return null;
      }

      // Delete existing slides (cascade deletes blocks)
      await tx.slide.deleteMany({
        where: { deckId },
      });

      // Update deck and create new slides
      await tx.deck.update({
        where: { id: deckId },
        data: {
          title: schema.deck.title,
          language: schema.deck.language,
          themeId: schema.deck.themeId,
          primaryColor: schema.deck.brandKit?.primaryColor,
          secondaryColor: schema.deck.brandKit?.secondaryColor,
          logoUrl: schema.deck.brandKit?.logoUrl,
        },
      });

      // Create slides sequentially to ensure proper ordering
      for (let slideIndex = 0; slideIndex < schema.slides.length; slideIndex++) {
        const slide = schema.slides[slideIndex];
        await tx.slide.create({
          data: {
            deckId,
            type: slide.type,
            layoutVariant: slide.layoutVariant,
            position: slideIndex,
            blocks: {
              create: slide.blocks.map((block, blockIndex) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { kind, ...content } = block;
                return {
                  kind: block.kind,
                  content: content as object,
                  position: blockIndex,
                };
              }),
            },
          },
        });
      }

      // Return the deck ID for final fetch
      return existing.id;
    },
    {
      // Use serializable isolation to prevent concurrent modifications
      isolationLevel: "Serializable",
      // Set a reasonable timeout
      timeout: 30000,
    }
  );

  if (!result) {
    return null;
  }

  // Return the updated deck
  return getDeckById(deckId, workspaceId);
}
