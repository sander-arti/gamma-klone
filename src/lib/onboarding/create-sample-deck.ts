/**
 * Sample deck creation service for new user onboarding
 *
 * Creates a sample presentation when a user signs up. This operation is
 * non-blocking - signup will succeed even if sample deck creation fails.
 */

import { supabaseAdmin } from "@/lib/db/supabase";
import { SAMPLE_DECK_CONTENT } from "./sample-deck-content";

export type CreateSampleDeckResult =
  | { success: true; deckId: string }
  | { success: false; error: unknown };

/**
 * Creates a sample deck for a new user
 *
 * @param userId - The ID of the user who just signed up
 * @param workspaceId - The ID of the user's default workspace
 * @returns Result indicating success/failure and deck ID if successful
 */
export async function createSampleDeck(
  userId: string,
  workspaceId: string
): Promise<CreateSampleDeckResult> {
  try {
    const deckId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Create the deck
    const { error: deckError } = await supabaseAdmin.from("decks").insert({
      id: deckId,
      workspace_id: workspaceId,
      user_id: userId,
      title: SAMPLE_DECK_CONTENT.title,
      theme_id: SAMPLE_DECK_CONTENT.theme_id,
      language: SAMPLE_DECK_CONTENT.language,
      is_sample: true, // Mark as sample deck for analytics
      created_at: now,
      updated_at: now,
    });

    if (deckError) {
      console.error("[createSampleDeck] Failed to create deck:", deckError);
      throw deckError;
    }

    // Create slides with blocks
    for (let slideIndex = 0; slideIndex < SAMPLE_DECK_CONTENT.slides.length; slideIndex++) {
      const slideData = SAMPLE_DECK_CONTENT.slides[slideIndex];
      const slideId = crypto.randomUUID();

      // Create slide
      const { error: slideError } = await supabaseAdmin.from("slides").insert({
        id: slideId,
        deck_id: deckId,
        position: slideIndex,
        type: slideData.type,
        created_at: now,
        updated_at: now,
      });

      if (slideError) {
        console.error(`[createSampleDeck] Failed to create slide ${slideIndex}:`, slideError);
        throw slideError;
      }

      // Create blocks for this slide
      for (let blockIndex = 0; blockIndex < slideData.blocks.length; blockIndex++) {
        const block = slideData.blocks[blockIndex];
        const blockId = crypto.randomUUID();

        // Build content JSON based on block type
        const content: any =
          "content" in block
            ? { text: block.content }
            : "items" in block
              ? { items: [...block.items] } // Convert readonly array to mutable
              : {};

        const { error: blockError } = await supabaseAdmin.from("blocks").insert({
          id: blockId,
          slide_id: slideId,
          position: blockIndex,
          kind: block.type,
          content: content,
          created_at: now,
          updated_at: now,
        });

        if (blockError) {
          console.error(
            `[createSampleDeck] Failed to create block ${blockIndex} for slide ${slideIndex}:`,
            blockError
          );
          throw blockError;
        }
      }
    }

    console.log(`[createSampleDeck] Successfully created sample deck ${deckId} for user ${userId}`);
    return { success: true, deckId };
  } catch (error) {
    console.error("[createSampleDeck] Sample deck creation failed:", error);
    return { success: false, error };
  }
}
