import { z } from "zod";
import type { LLMClient, StreamingCallback } from "./llm-client";
import { getLLMClient, LLMError } from "./llm-client";
import type { BlockKind } from "@/lib/schemas/block";
import type { GenerationRequest, Deck, DeckMeta } from "@/lib/schemas/deck";
import { OutlineLenientSchema, SlideSchema, sanitizeOutline } from "@/lib/schemas/slide";
import type { Outline, OutlineSlide, Slide, SlideType } from "@/lib/schemas/slide";
import { buildOutlineSystemPrompt, buildOutlineUserPrompt } from "./prompts/outline";
import { buildContentSystemPrompt, buildContentUserPrompt } from "./prompts/content";
import {
  buildRepairSystemPrompt,
  buildRepairUserPrompt,
  buildSplitSystemPrompt,
  buildSplitUserPrompt,
} from "./prompts/repair";
import {
  buildGoldenStatsPrompt,
  buildGoldenBulletsPrompt,
  buildGoldenCoverPrompt,
  buildGoldenCTAPrompt,
  buildGoldenContentPrompt,
} from "./prompts/golden-content";
import { validateDeck, needsRepair, getSlidesNeedingRepair } from "./validation";
import { assignLayoutVariant, assignLayoutVariantsWithContext } from "./layout";
import type { ConstraintViolation } from "@/lib/validation/constraints";
import { analyzeContent } from "./content-analysis";
import { enforceSlideConstraints } from "@/lib/editor/constraints";
import { composeDeck, getComposerStats } from "./deck-composer";
import {
  generateImagesForDeck,
  shouldGenerateImages,
  shouldGenerateImage,
  getImageStyle,
} from "./image-generation";
import { enforceSlideDistribution, getDistributionStats } from "./outline-enforcer";
import {
  getGoldenTemplate,
  type GoldenTemplate,
  type GoldenSlot,
  type SlotContent,
  type GoldenSlideType,
} from "@/lib/templates";
import { toNorwegianSentenceCase } from "@/lib/text/sentence-case";

/**
 * Pipeline error types
 */
export class PipelineError extends Error {
  constructor(
    message: string,
    public code:
      | "OUTLINE_FAILED"
      | "CONTENT_FAILED"
      | "VALIDATION_FAILED"
      | "REPAIR_FAILED"
      | "MAX_RETRIES"
      | "TEMPLATE_NOT_FOUND"
      | "TEMPLATE_GENERATION_FAILED",
    public cause?: unknown
  ) {
    super(message);
    this.name = "PipelineError";
  }
}

/**
 * Pipeline progress callback
 */
export interface PipelineProgress {
  stage: "outline" | "content" | "validation" | "repair" | "images" | "template";
  slideIndex?: number;
  totalSlides?: number;
  message: string;
  /** Completed outline (when stage is "outline" and complete) */
  outline?: Outline;
  /** Completed slide (when stage is "content" and slide is done) */
  slide?: Slide;
  /** Slot content for golden templates */
  slotContent?: SlotContent;

  // Character-level streaming fields (Gamma-style typing effect)
  /** Block index within the slide (0-based) */
  blockIndex?: number;
  /** Type of block being generated */
  blockKind?: BlockKind;
  /** Text delta/chunk to append (only the new characters) */
  delta?: string;

  // Image generation fields (for "images" stage)
  /** Total number of images being generated */
  totalImages?: number;
  /** Current image index (1-based for display) */
  imageIndex?: number;
  /** Generated image URL (when complete) */
  imageUrl?: string;
}

/**
 * Extract text content from a partial slide JSON for streaming
 * Returns the last block with text content that we can display
 */
interface ExtractedText {
  blockIndex: number;
  text: string;
  kind: BlockKind;
}

function extractTextFromPartialSlide(partial: unknown): ExtractedText | null {
  if (!partial || typeof partial !== "object") return null;

  const slide = partial as { blocks?: Array<{ kind?: string; text?: string; items?: string[] }> };
  if (!slide.blocks || !Array.isArray(slide.blocks)) return null;

  // Find the last block with text content
  for (let i = slide.blocks.length - 1; i >= 0; i--) {
    const block = slide.blocks[i];
    if (!block) continue;

    // Handle text-based blocks
    if (block.text && typeof block.text === "string") {
      return {
        blockIndex: i,
        text: block.text,
        kind: (block.kind as BlockKind) ?? "text",
      };
    }

    // Handle bullets/items
    if (block.items && Array.isArray(block.items) && block.items.length > 0) {
      const lastItem = block.items[block.items.length - 1];
      if (typeof lastItem === "string") {
        return {
          blockIndex: i,
          text: lastItem,
          kind: (block.kind as BlockKind) ?? "bullets",
        };
      }
    }
  }

  return null;
}

/**
 * Pipeline options
 */
export interface PipelineOptions {
  llmClient?: LLMClient;
  maxRepairAttempts?: number;
  /** Progress callback - can be async for operations like DB updates */
  onProgress?: (progress: PipelineProgress) => void | Promise<void>;
  /** Deck ID for image storage (required when imageMode is 'ai') */
  deckId?: string;
}

/**
 * Post-process slide to fix Norwegian sentence case on title and text blocks
 * This is a "hard enforcement" that ALWAYS applies sentence case conversion,
 * guaranteeing correct Norwegian capitalization regardless of AI output.
 *
 * Preserves:
 * - First word capitalization
 * - Proper nouns (Oslo, Norge, Microsoft, etc.)
 * - Acronyms (AI, GDPR, KS, NAV, etc.)
 */
function applyNorwegianSentenceCase(slide: Slide): Slide {
  const processedBlocks = slide.blocks.map((block) => {
    // Apply sentence case to title blocks - ALWAYS convert
    if (block.kind === "title" && block.text) {
      return { ...block, text: toNorwegianSentenceCase(block.text) };
    }
    // Apply to numbered_card and icon_card text (titles within cards)
    if ((block.kind === "numbered_card" || block.kind === "icon_card") && block.text) {
      return { ...block, text: toNorwegianSentenceCase(block.text) };
    }
    // Apply to timeline_step text
    if (block.kind === "timeline_step" && block.text) {
      return { ...block, text: toNorwegianSentenceCase(block.text) };
    }
    return block;
  });

  return { ...slide, blocks: processedBlocks };
}

/**
 * Generation Pipeline - orchestrates outline → content → validation → repair → images
 */
export class GenerationPipeline {
  private llm: LLMClient;
  private maxRepairAttempts: number;
  private onProgress?: (progress: PipelineProgress) => void | Promise<void>;
  private deckId?: string;

  constructor(options: PipelineOptions = {}) {
    this.llm = options.llmClient ?? getLLMClient();
    this.maxRepairAttempts = options.maxRepairAttempts ?? 3;
    this.onProgress = options.onProgress;
    this.deckId = options.deckId;
  }

  /**
   * Report progress - awaits async callbacks to ensure DB operations complete
   */
  private async report(progress: PipelineProgress): Promise<void> {
    await this.onProgress?.(progress);
  }

  /**
   * Generate outline from user input
   *
   * "Compose First, Count Once" - this method generates FREELY.
   * No count validation here - count enforcement happens AFTER composition in generate().
   * The LLM is asked for approximate content slides, composition adds structural slides.
   */
  async generateOutline(request: GenerationRequest): Promise<Outline> {
    // Analyze content first (no LLM call, just regex/heuristics)
    const analysis = analyzeContent(request.inputText);

    await this.report({
      stage: "outline",
      message: `Analyzing input: ${analysis.wordCount} words, ${analysis.statistics.length} stats, ${analysis.quotes.length} quotes`,
    });

    await this.report({
      stage: "outline",
      message: "Generating presentation outline...",
    });

    try {
      // Pass analysis to system prompt for better structure
      const systemPrompt = buildOutlineSystemPrompt(request, analysis);
      const userPrompt = buildOutlineUserPrompt(request);

      // Use lenient schema to allow AI to exceed limits, then sanitize
      const rawOutline = await this.llm.generateJSON(
        systemPrompt,
        userPrompt,
        OutlineLenientSchema
      );

      // Sanitize to strict schema constraints (truncate hints to 3, etc.)
      const outline = sanitizeOutline(rawOutline);

      // Log what we got (count enforcement happens later in generate())
      // NOTE: Do NOT include outline here - it will be sent AFTER composition
      // in generate() to prevent race conditions where frontend fetches
      // incomplete outline before structural slides are added
      await this.report({
        stage: "outline",
        message: `Outline generated: ${outline.slides.length} raw slides`,
        // outline intentionally omitted - sent after composition
      });

      return outline;
    } catch (error) {
      if (error instanceof LLMError) {
        throw new PipelineError(`Outline generation failed: ${error.message}`, "OUTLINE_FAILED", error);
      }
      throw error;
    }
  }

  /**
   * Generate content for a single slide with character-level streaming
   */
  private async generateSlideContent(
    outlineSlide: OutlineSlide,
    request: GenerationRequest,
    slideIndex: number,
    totalSlides: number
  ): Promise<Slide> {
    await this.report({
      stage: "content",
      slideIndex,
      totalSlides,
      message: `Generating slide ${slideIndex + 1}/${totalSlides}: ${outlineSlide.title}`,
    });

    // Track last reported state for delta calculation
    let lastReportedText: string | null = null;
    let lastBlockIndex: number | null = null;

    // Streaming callbacks for character-level updates
    // Note: These are sync callbacks for UI updates, not awaited
    const streamingCallbacks: StreamingCallback = {
      onPartialJSON: (partial) => {
        const extracted = extractTextFromPartialSlide(partial);
        if (!extracted) return;

        // Calculate delta (only the new characters)
        const isNewBlock = extracted.blockIndex !== lastBlockIndex;
        const delta = isNewBlock || !lastReportedText
          ? extracted.text
          : extracted.text.slice(lastReportedText.length);

        // Only report if there's new content
        // Not awaited - these are fire-and-forget UI updates
        if (delta) {
          void this.report({
            stage: "content",
            slideIndex,
            totalSlides,
            blockIndex: extracted.blockIndex,
            blockKind: extracted.kind,
            message: isNewBlock
              ? `Block ${extracted.blockIndex + 1} started`
              : "Streaming",
            delta,
          });
        }

        lastReportedText = extracted.text;
        lastBlockIndex = extracted.blockIndex;
      },
    };

    try {
      const systemPrompt = buildContentSystemPrompt(outlineSlide, request, slideIndex, totalSlides);
      const userPrompt = buildContentUserPrompt(outlineSlide, request, request.inputText);

      // Use streaming generation for character-level updates
      const slide = await this.llm.generateJSONStreaming(
        systemPrompt,
        userPrompt,
        SlideSchema,
        streamingCallbacks
      );

      // Assign layout variant based on content
      const layoutVariant = assignLayoutVariant(slide);

      const slideWithLayout = {
        ...slide,
        layoutVariant,
      };

      // Post-process: Apply Norwegian sentence case to titles
      const finalSlide = applyNorwegianSentenceCase(slideWithLayout);

      // Report completion with full slide data - MUST await for DB insertion
      await this.report({
        stage: "content",
        slideIndex,
        totalSlides,
        message: `Completed slide ${slideIndex + 1}/${totalSlides}`,
        slide: finalSlide,
      });

      return finalSlide;
    } catch (error) {
      if (error instanceof LLMError) {
        throw new PipelineError(
          `Content generation failed for slide ${slideIndex + 1}: ${error.message}`,
          "CONTENT_FAILED",
          error
        );
      }
      throw error;
    }
  }

  /**
   * Repair a slide with constraint violations
   */
  private async repairSlide(slide: Slide, violations: ConstraintViolation[]): Promise<Slide[]> {
    // Check if we should split instead of shorten
    const shouldSplit = violations.some((v) => v.action === "split") || violations.length >= 3;

    if (shouldSplit) {
      return this.splitSlide(slide, violations);
    }

    // Try to repair (shorten)
    const systemPrompt = buildRepairSystemPrompt(violations, slide.type);
    const userPrompt = buildRepairUserPrompt(slide);

    const repaired = await this.llm.generateJSON(systemPrompt, userPrompt, SlideSchema);

    // Post-process: Apply Norwegian sentence case after repair
    const repairedWithLayout = {
      ...repaired,
      layoutVariant: assignLayoutVariant(repaired),
    };

    return [applyNorwegianSentenceCase(repairedWithLayout)];
  }

  /**
   * Split a slide into multiple slides
   */
  private async splitSlide(slide: Slide, violations: ConstraintViolation[]): Promise<Slide[]> {
    const titleBlock = slide.blocks.find((b) => b.kind === "title");
    const originalTitle = titleBlock?.text ?? "Slide";

    const systemPrompt = buildSplitSystemPrompt(originalTitle);
    const userPrompt = buildSplitUserPrompt(slide, violations);

    // Schema for split result
    const SplitResultSchema = z.object({
      slides: z.array(SlideSchema).min(2).max(4),
    });

    const result = await this.llm.generateJSON(systemPrompt, userPrompt, SplitResultSchema);

    // Assign layout variants and apply sentence case to split slides
    return result.slides.map((s) => {
      const withLayout = { ...s, layoutVariant: assignLayoutVariant(s) };
      return applyNorwegianSentenceCase(withLayout);
    });
  }

  /**
   * Validate and repair deck until constraints are satisfied
   */
  private async validateAndRepair(slides: Slide[], request: GenerationRequest): Promise<Slide[]> {
    let currentSlides = [...slides];

    for (let attempt = 0; attempt < this.maxRepairAttempts; attempt++) {
      // Create temporary deck for validation
      const tempDeck: Deck = {
        deck: {
          title: "Temp",
          language: request.language,
          themeId: request.themeId ?? "nordic_light",
        },
        slides: currentSlides,
      };

      const validationResult = validateDeck(tempDeck);

      if (!needsRepair(validationResult)) {
        await this.report({
          stage: "validation",
          message: "All slides pass validation",
        });
        return currentSlides;
      }

      await this.report({
        stage: "repair",
        message: `Repair attempt ${attempt + 1}/${this.maxRepairAttempts}: ${validationResult.totalViolations} violations`,
      });

      const slidesNeedingRepair = getSlidesNeedingRepair(tempDeck, validationResult);

      // Process repairs
      const repairedSlides: Slide[] = [];
      let slideOffset = 0;

      for (let i = 0; i < currentSlides.length; i++) {
        const needsRepairData = slidesNeedingRepair.find((s) => s.index === i);

        if (needsRepairData) {
          try {
            const repaired = await this.repairSlide(needsRepairData.slide, needsRepairData.violations);
            repairedSlides.push(...repaired);
            slideOffset += repaired.length - 1;
          } catch (error) {
            // If repair fails, keep original slide
            repairedSlides.push(currentSlides[i]);
          }
        } else {
          repairedSlides.push(currentSlides[i]);
        }
      }

      currentSlides = repairedSlides;
    }

    // Check final validation
    const finalDeck: Deck = {
      deck: {
        title: "Temp",
        language: request.language,
        themeId: request.themeId ?? "nordic_light",
      },
      slides: currentSlides,
    };

    const finalResult = validateDeck(finalDeck);

    if (needsRepair(finalResult)) {
      // Apply deterministic truncation as last resort
      console.log(
        `[pipeline] LLM repair incomplete, applying deterministic truncation for ${finalResult.totalViolations} violations`
      );

      currentSlides = this.applyDeterministicFixes(currentSlides, finalResult);

      // Re-validate after deterministic fixes
      const postFixDeck: Deck = {
        deck: { title: "Temp", language: request.language, themeId: request.themeId ?? "nordic_light" },
        slides: currentSlides,
      };
      const postFixResult = validateDeck(postFixDeck);

      if (needsRepair(postFixResult)) {
        // Still have violations - apply block-level enforcement as final guarantee
        console.log(
          `[pipeline] Applying block-level constraint enforcement for ${postFixResult.totalViolations} remaining violations`
        );
        currentSlides = currentSlides.map((slide) => enforceSlideConstraints(slide) as Slide);

        await this.report({
          stage: "validation",
          message: "Alle constraint-brudd fikset",
        });
      } else {
        await this.report({
          stage: "validation",
          message: "Alle constraint-brudd fikset",
        });
      }
    }

    // Final guarantee: Enforce block-level constraints on all slides
    // This catches any edge cases missed by previous validation steps
    currentSlides = currentSlides.map((slide) => enforceSlideConstraints(slide) as Slide);

    return currentSlides;
  }

  /**
   * Truncate text at word boundary with ellipsis
   * Preserves meaning by not cutting mid-word
   */
  private truncateAtWordBoundary(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;

    // Reserve space for ellipsis
    const targetLength = maxLength - 3;
    if (targetLength <= 0) return text.slice(0, maxLength);

    // Find last space before target length
    const truncated = text.slice(0, targetLength);
    const lastSpace = truncated.lastIndexOf(" ");

    if (lastSpace > targetLength * 0.5) {
      // Cut at word boundary if we don't lose too much
      return truncated.slice(0, lastSpace) + "...";
    }

    // Otherwise just cut at character limit
    return truncated + "...";
  }

  /**
   * Apply deterministic fixes to slides with constraint violations
   * This is the fallback when LLM-based repair fails
   */
  private applyDeterministicFixes(
    slides: Slide[],
    validationResult: ReturnType<typeof validateDeck>
  ): Slide[] {
    const fixedSlides = [...slides];

    for (const slideResult of validationResult.slideResults) {
      if (slideResult.isValid) continue;

      const slide = fixedSlides[slideResult.slideIndex];
      const fixedBlocks = [...slide.blocks];

      for (const violation of slideResult.violations) {
        // Only handle "shorten" actions - split/expand need LLM
        if (violation.action !== "shorten") continue;

        const field = violation.field;
        const limit = violation.limit;

        // Handle different field types
        if (field === "title") {
          const titleBlock = fixedBlocks.find((b) => b.kind === "title");
          if (titleBlock && titleBlock.text) {
            titleBlock.text = this.truncateAtWordBoundary(titleBlock.text, limit);
          }
        } else if (field === "text" || field === "subtitle") {
          // Text blocks (including callout which uses text field)
          const textBlock = fixedBlocks.find((b) => b.kind === "text" || b.kind === "callout");
          if (textBlock && textBlock.text) {
            textBlock.text = this.truncateAtWordBoundary(textBlock.text, limit);
          }
        } else if (field.startsWith("bullets[")) {
          // Individual bullet: bullets[0], bullets[1], etc.
          const match = field.match(/bullets\[(\d+)\]/);
          if (match) {
            const bulletIndex = parseInt(match[1], 10);
            const bulletsBlock = fixedBlocks.find((b) => b.kind === "bullets");
            if (bulletsBlock?.items && bulletsBlock.items[bulletIndex]) {
              bulletsBlock.items[bulletIndex] = this.truncateAtWordBoundary(
                bulletsBlock.items[bulletIndex],
                limit
              );
            }
          }
        } else if (field.startsWith("items[")) {
          // Individual item (for icon_card, numbered_card, timeline_step, etc.)
          const match = field.match(/items\[(\d+)\]/);
          if (match) {
            const itemIndex = parseInt(match[1], 10);
            // Find the card-type blocks and truncate the right one
            const cardBlocks = fixedBlocks.filter(
              (b) => b.kind === "icon_card" || b.kind === "numbered_card" || b.kind === "timeline_step"
            );
            if (cardBlocks[itemIndex] && cardBlocks[itemIndex].text) {
              cardBlocks[itemIndex].text = this.truncateAtWordBoundary(
                cardBlocks[itemIndex].text!,
                limit
              );
            }
          }
        } else if (field.startsWith("columns[")) {
          // Column text (for two_column_text)
          const match = field.match(/columns\[(\d+)\]/);
          if (match) {
            const colIndex = parseInt(match[1], 10);
            const textBlocks = fixedBlocks.filter((b) => b.kind === "text");
            if (textBlocks[colIndex] && textBlocks[colIndex].text) {
              textBlocks[colIndex].text = this.truncateAtWordBoundary(
                textBlocks[colIndex].text!,
                limit
              );
            }
          }
        }
      }

      fixedSlides[slideResult.slideIndex] = {
        ...slide,
        blocks: fixedBlocks,
      };
    }

    console.log(`[pipeline] Applied deterministic fixes to ${validationResult.slideResults.filter(r => !r.isValid).length} slides`);

    return fixedSlides;
  }

  /**
   * Generate complete deck from outline
   *
   * "Compose First, Count Once" - this method NO LONGER composes.
   * Composition happens in generate() BEFORE count enforcement.
   * This method just generates content for the pre-composed outline.
   */
  async generateDeck(
    outline: Outline,
    request: GenerationRequest,
    analysis?: ReturnType<typeof analyzeContent>
  ): Promise<Deck> {
    // NOTE: No composition here - outline is already composed in generate()
    const totalSlides = outline.slides.length;

    // Generate content for each slide
    const slides: Slide[] = [];

    for (let i = 0; i < outline.slides.length; i++) {
      const slide = await this.generateSlideContent(outline.slides[i], request, i, totalSlides);
      slides.push(slide);
    }

    // Validate and repair
    await this.report({
      stage: "validation",
      message: "Validating generated content...",
    });

    const validatedSlides = await this.validateAndRepair(slides, request);

    // Phase 7 Sprint 4: Re-assign layouts with context for variation
    // This ensures alternation for image slides and avoids monotony
    const layoutOptimizedSlides = assignLayoutVariantsWithContext(validatedSlides);

    await this.report({
      stage: "validation",
      message: "Layout variants optimized for variation",
    });

    // Build deck metadata
    const deckMeta: DeckMeta = {
      title: outline.title,
      language: request.language,
      themeId: request.themeId ?? "nordic_light",
      brandKit: undefined,
    };

    let finalDeck: Deck = {
      deck: deckMeta,
      slides: layoutOptimizedSlides, // Phase 7 Sprint 4: Use context-optimized layouts
    };

    // Generate AI images if requested
    // Phase 7 Sprint 4: Pass analysis for semantic image prompts
    if (shouldGenerateImages(request) && this.deckId) {
      // Calculate total images BEFORE starting (same logic as generateImagesForDeck)
      const imageSlidesToProcess = finalDeck.slides.filter((slide) => shouldGenerateImage(slide));
      const totalImagesToGenerate = imageSlidesToProcess.length;

      await this.report({
        stage: "images",
        totalImages: totalImagesToGenerate,
        message: `Generating AI images for ${totalImagesToGenerate} slides...`,
      });

      try {
        finalDeck = await generateImagesForDeck(finalDeck, this.deckId, {
          style: getImageStyle(request),
          analysis, // Phase 7 Sprint 4: Pass ContentAnalysis for smarter prompts
          onProgress: (progress) => {
            // Fire-and-forget for UI updates during image generation
            void this.report({
              stage: "images",
              slideIndex: progress.slideIndex,
              totalSlides: finalDeck.slides.length, // Keep slide count for context
              totalImages: progress.totalImages, // Add image count for progress display
              imageIndex: progress.imageIndex, // Use actual image counter from image-generation.ts
              imageUrl: progress.imageResult?.imageUrl, // Include URL when image is complete
              message: progress.message,
            });
          },
        });

        await this.report({
          stage: "images",
          message: "Image generation complete",
        });
      } catch (error) {
        // Log error but don't fail the entire deck generation
        console.error("Image generation failed:", error);
        await this.report({
          stage: "images",
          message: "Image generation failed, continuing without images",
        });
      }
    }

    return finalDeck;
  }

  /**
   * Enforce exact slide count AFTER composition
   * This is the single source of truth for slide count - no prediction needed
   */
  private enforceExactSlideCount(
    outline: Outline,
    targetCount: number,
    analysis: ReturnType<typeof analyzeContent>
  ): Outline {
    const currentCount = outline.slides.length;

    if (currentCount === targetCount) {
      console.log(`[pipeline] Slide count already correct: ${currentCount}`);
      return outline;
    }

    if (currentCount > targetCount) {
      console.log(`[pipeline] Trimming ${currentCount - targetCount} slides to reach ${targetCount}`);
      return this.trimComposedOutline(outline, targetCount);
    } else {
      console.log(`[pipeline] Padding ${targetCount - currentCount} slides to reach ${targetCount}`);
      return this.padComposedOutline(outline, targetCount, analysis);
    }
  }

  /**
   * Trim a COMPOSED outline to reach target count
   * Removes content slides from the middle, preserving structure (cover, agenda, summary)
   */
  private trimComposedOutline(outline: Outline, targetCount: number): Outline {
    const excessSlides = outline.slides.length - targetCount;
    if (excessSlides <= 0) return outline;

    const slides = [...outline.slides];

    // Identify structural slides that should NOT be removed
    const structuralTypes: SlideType[] = ["cover", "agenda", "summary_next_steps", "section_header", "quote_callout"];

    // Find removable content slides (from the end, before summary)
    const removableIndices: number[] = [];
    for (let i = slides.length - 1; i >= 0; i--) {
      const type = slides[i].suggestedType ?? "bullets";
      if (!structuralTypes.includes(type)) {
        removableIndices.push(i);
      }
    }

    // Remove from end first (preserve intro flow)
    const indicesToRemove = removableIndices.slice(0, excessSlides);
    indicesToRemove.sort((a, b) => b - a); // Sort descending to remove from end

    for (const idx of indicesToRemove) {
      slides.splice(idx, 1);
    }

    console.log(`[pipeline] Trimmed ${indicesToRemove.length} content slides`);

    return { ...outline, slides };
  }

  /**
   * Pad a COMPOSED outline to reach target count
   * Adds content slides based on analysis, inserting before summary
   */
  private padComposedOutline(
    outline: Outline,
    targetCount: number,
    analysis: ReturnType<typeof analyzeContent>
  ): Outline {
    const slidesToAdd = targetCount - outline.slides.length;
    if (slidesToAdd <= 0) return outline;

    const newSlides = [...outline.slides];

    // Find insertion point (before last slide if it's a summary)
    const lastSlide = newSlides[newSlides.length - 1];
    const lastIsSummary =
      lastSlide?.suggestedType === "summary_next_steps" ||
      lastSlide?.suggestedType === "quote_callout";
    const insertionIndex = lastIsSummary ? newSlides.length - 1 : newSlides.length;

    // Create additional slides based on content analysis
    const additionalSlideTypes: Array<{ type: SlideType; title: string; hints: string[] }> = [];

    // Add slides based on available content
    if (analysis.features.length >= 2 && slidesToAdd > 0) {
      additionalSlideTypes.push({
        type: "icon_cards_with_image",
        title: "Nøkkelfunksjoner",
        hints: analysis.features.slice(0, 3).map((f) => f.title),
      });
    }
    if (analysis.statistics.length >= 2 && slidesToAdd > additionalSlideTypes.length) {
      additionalSlideTypes.push({
        type: "summary_with_stats",
        title: "Viktige tall",
        hints: analysis.statistics.slice(0, 3),
      });
    }
    if (analysis.sequentialProcess.length >= 3 && slidesToAdd > additionalSlideTypes.length) {
      additionalSlideTypes.push({
        type: "timeline_roadmap",
        title: "Prosess og milepæler",
        hints: analysis.sequentialProcess.slice(0, 3).map((s) => s.text.slice(0, 60)),
      });
    }
    if (analysis.comparisons.length >= 1 && slidesToAdd > additionalSlideTypes.length) {
      additionalSlideTypes.push({
        type: "two_column_text",
        title: "Sammenligning",
        hints: ["Alternativ A", "Alternativ B"],
      });
    }

    // Fill remaining with generic content slides
    while (additionalSlideTypes.length < slidesToAdd) {
      const slideNum = additionalSlideTypes.length + 1;
      additionalSlideTypes.push({
        type: "text_plus_image",
        title: `Utdypende informasjon ${slideNum}`,
        hints: ["Detaljer", "Kontekst", "Eksempler"],
      });
    }

    // Create and insert the slides
    for (let i = 0; i < slidesToAdd; i++) {
      const slideConfig = additionalSlideTypes[i];
      const newSlide: OutlineSlide = {
        title: slideConfig.title,
        suggestedType: slideConfig.type,
        hints: slideConfig.hints,
      };
      newSlides.splice(insertionIndex + i, 0, newSlide);
    }

    console.log(`[pipeline] Added ${slidesToAdd} slides: ${additionalSlideTypes.map((s) => s.type).join(", ")}`);

    return { ...outline, slides: newSlides };
  }

  /**
   * Full pipeline: input → outline → COMPOSE → enforce count → enforce distribution → deck
   *
   * "Compose First, Count Once" architecture:
   * 1. Generate/receive raw outline (LLM generates freely)
   * 2. Compose immediately (add cover/agenda/summary)
   * 3. Enforce exact count AFTER composition (trim/pad)
   * 4. Enforce distribution (types only, never changes count)
   * 5. Generate deck content (no composition here)
   */
  async generate(request: GenerationRequest): Promise<{ outline: Outline; deck: Deck }> {
    // Check if using golden template
    if (request.templateId) {
      const deck = await this.generateFromTemplate(request);
      // Create a minimal outline for compatibility
      const outline: Outline = {
        title: deck.deck.title,
        slides: deck.slides.map((s) => ({
          type: s.type,
          title: s.blocks.find((b) => b.kind === "title")?.text ?? "",
          hints: [],
        })),
      };
      return { outline, deck };
    }

    // Step 1: Get or generate outline (LLM generates freely, no count enforcement)
    let rawOutline: Outline;

    if (request.outline) {
      // Use provided outline (freeform-first mode)
      rawOutline = request.outline;
      await this.report({
        stage: "outline",
        message: `Using provided outline: ${rawOutline.slides.length} slides`,
        outline: rawOutline,
      });
    } else {
      // Generate outline inline (simplified, no prediction logic)
      await this.report({
        stage: "outline",
        message: "Generating outline...",
      });
      rawOutline = await this.generateOutline(request);
    }

    // Step 2: Analyze content (deterministic, no LLM)
    const analysis = analyzeContent(request.inputText);

    // Step 3: COMPOSE IMMEDIATELY - add structural slides (cover, agenda, summary)
    // This is the KEY change - composition happens BEFORE count enforcement
    const composedOutline = composeDeck(rawOutline, {
      ensureCover: true,
      ensureAgenda: rawOutline.slides.length > 4, // Add agenda if raw outline has >4 content slides
      ensureSummary: true,
    });

    const composerStats = getComposerStats(rawOutline, composedOutline);
    if (composerStats.slidesAdded > 0) {
      await this.report({
        stage: "outline",
        message: `Composed: ${rawOutline.slides.length} → ${composedOutline.slides.length} slides (${composerStats.addedCover ? "+cover " : ""}${composerStats.addedAgenda ? "+agenda " : ""}${composerStats.addedSummary ? "+summary" : ""})`.trim(),
      });
    }

    // Step 4: Enforce EXACT slide count AFTER composition
    // This is the ONLY place where slide count is adjusted
    let countEnforcedOutline = composedOutline;
    if (request.numSlides) {
      countEnforcedOutline = this.enforceExactSlideCount(composedOutline, request.numSlides, analysis);

      if (countEnforcedOutline.slides.length !== request.numSlides) {
        console.warn(`[pipeline] Count enforcement failed: wanted ${request.numSlides}, got ${countEnforcedOutline.slides.length}`);
      }

      await this.report({
        stage: "outline",
        message: `Count enforced: ${composedOutline.slides.length} → ${countEnforcedOutline.slides.length} slides (target: ${request.numSlides})`,
      });
    }

    // Step 5: Enforce slide distribution rules (type modifications ONLY, never changes count)
    const outline = enforceSlideDistribution(countEnforcedOutline, analysis);

    // Log distribution stats
    const stats = getDistributionStats(outline);
    await this.report({
      stage: "outline",
      message: `Distribution enforced: ${stats.bulletLikeCount} bullet-like, ${stats.premiumCount} premium, ${stats.uniqueTypes} unique types`,
      outline,
    });

    // Step 6: Generate deck content (NO composition here - already done)
    const deck = await this.generateDeck(outline, request, analysis);

    return { outline, deck };
  }

  /**
   * Generate deck from a golden template
   * Phase 8: Template-based generation with fixed structure
   */
  async generateFromTemplate(request: GenerationRequest): Promise<Deck> {
    const templateId = request.templateId;

    if (!templateId) {
      throw new PipelineError(
        "No template ID provided",
        "TEMPLATE_NOT_FOUND"
      );
    }

    const template = getGoldenTemplate(templateId);

    if (!template) {
      throw new PipelineError(
        `Template not found: ${templateId}`,
        "TEMPLATE_NOT_FOUND"
      );
    }

    await this.report({
      stage: "template",
      message: `Using golden template: ${template.name} (${template.slideCount} slides)`,
    });

    // Generate content for each slot
    const slotContents: SlotContent[] = [];

    for (const slot of template.slots) {
      await this.report({
        stage: "template",
        slideIndex: slot.position - 1,
        totalSlides: template.slideCount,
        message: `Generating slot ${slot.position}/${template.slideCount}: ${slot.slideType}`,
      });

      try {
        const content = await this.generateSlotContent(slot, request);
        slotContents.push(content);

        await this.report({
          stage: "template",
          slideIndex: slot.position - 1,
          totalSlides: template.slideCount,
          message: `Completed slot ${slot.position}/${template.slideCount}`,
          slotContent: content,
        });
      } catch (error) {
        throw new PipelineError(
          `Failed to generate content for slot ${slot.position}: ${error}`,
          "TEMPLATE_GENERATION_FAILED",
          error
        );
      }
    }

    // Convert slot contents to slides
    const slides = this.convertSlotsToSlides(template, slotContents);

    // Generate images if requested
    let finalDeck: Deck = {
      deck: {
        title: slotContents[0]?.title ?? template.name,
        language: request.language,
        themeId: "nordic_light", // Golden templates use fixed styling
      },
      slides,
    };

    if (shouldGenerateImages(request) && this.deckId) {
      // Calculate total images BEFORE starting
      const goldenImagesToProcess = finalDeck.slides.filter((slide) => shouldGenerateImage(slide));
      const goldenTotalImages = goldenImagesToProcess.length;

      await this.report({
        stage: "images",
        totalImages: goldenTotalImages,
        message: `Generating AI images for ${goldenTotalImages} golden slides...`,
      });

      try {
        finalDeck = await generateImagesForDeck(finalDeck, this.deckId, {
          style: getImageStyle(request),
          onProgress: (progress) => {
            // Fire-and-forget for UI updates during image generation
            void this.report({
              stage: "images",
              slideIndex: progress.slideIndex,
              totalSlides: finalDeck.slides.length, // Keep slide count for context
              totalImages: progress.totalImages, // Add image count for progress display
              imageIndex: progress.slideIndex !== undefined ? progress.slideIndex + 1 : undefined, // 1-based for display
              imageUrl: progress.imageResult?.imageUrl, // Include URL when image is complete
              message: progress.message,
            });
          },
        });
      } catch (error) {
        console.error("Image generation failed:", error);
      }
    }

    return finalDeck;
  }

  /**
   * Generate content for a single golden template slot
   */
  private async generateSlotContent(
    slot: GoldenSlot,
    request: GenerationRequest
  ): Promise<SlotContent> {
    // Build prompt based on slot type
    let prompt: string;

    switch (slot.slideType) {
      case "cover":
        prompt = buildGoldenCoverPrompt(request.inputText, request.language);
        break;
      case "stats":
        prompt = buildGoldenStatsPrompt(request.inputText, request.language);
        break;
      case "bullets":
        prompt = buildGoldenBulletsPrompt(
          request.inputText,
          request.language,
          slot.constraints.itemCountMin ?? 4,
          slot.constraints.itemCountMax ?? 5
        );
        break;
      case "cta":
        prompt = buildGoldenCTAPrompt(request.inputText, request.language);
        break;
      case "content":
        prompt = buildGoldenContentPrompt(
          request.inputText,
          request.language,
          slot.purpose
        );
        break;
      default:
        // Generic prompt for other slot types
        prompt = `Generate content for a ${slot.slideType} slide based on:
${request.inputText}

Return JSON with title, body, and items as appropriate.`;
    }

    // Schema for slot content response
    // Note: text is optional because stats items use value/label instead
    const SlotContentSchema = z.object({
      title: z.string().optional(),
      body: z.string().optional(),
      items: z.array(z.object({
        text: z.string().optional(),
        value: z.string().optional(),
        label: z.string().optional(),
        sublabel: z.string().optional(),
        icon: z.string().optional(),
        description: z.string().optional(),
      })).optional(),
      imageDescription: z.string().optional(),
    });

    const systemPrompt = `You are a professional presentation content writer.
Generate concise, high-quality content. Return ONLY valid JSON, no markdown.`;

    const result = await this.llm.generateJSON(
      systemPrompt,
      prompt,
      SlotContentSchema
    );

    return {
      position: slot.position,
      title: result.title,
      body: result.body,
      items: result.items,
    };
  }

  /**
   * Convert slot contents to Slide objects
   */
  private convertSlotsToSlides(
    template: GoldenTemplate,
    slotContents: SlotContent[]
  ): Slide[] {
    return template.slots.map((slot, index) => {
      const content = slotContents[index];
      const slideType = this.goldenSlideTypeToSlideType(slot.slideType);

      // Build blocks based on content
      const blocks: Slide["blocks"] = [];

      // Add title block
      if (content.title) {
        blocks.push({ kind: "title", text: content.title });
      }

      // Add text/body block
      if (content.body) {
        blocks.push({ kind: "text", text: content.body });
      }

      // Add items based on slot type
      if (content.items && content.items.length > 0) {
        if (slot.slideType === "stats") {
          // Convert to stat_block blocks
          for (const item of content.items) {
            blocks.push({
              kind: "stat_block",
              value: item.value ?? item.text,
              label: item.label ?? "",
              sublabel: item.sublabel,
            });
          }
        } else if (slot.slideType === "bullets" || slot.slideType === "cta") {
          // Convert to bullets block
          blocks.push({
            kind: "bullets",
            items: content.items.map((item) => item.text ?? item.label ?? "").filter(Boolean) as string[],
          });
        }
      }

      // Add placeholder image block if slot requires image
      if (slot.constraints.requiresImage) {
        blocks.push({
          kind: "image",
          url: "",
          alt: content.title ?? "",
        });
      }

      const slide: Slide = {
        type: slideType,
        layoutVariant: slot.layoutVariant,
        blocks,
      };

      // Apply Norwegian sentence case to golden template slides
      return applyNorwegianSentenceCase(slide);
    });
  }

  /**
   * Map golden slide type to standard Slide type
   */
  private goldenSlideTypeToSlideType(goldenType: GoldenSlideType): SlideType {
    const mapping: Record<GoldenSlideType, SlideType> = {
      cover: "cover",
      stats: "summary_with_stats",
      content: "text_plus_image",
      bullets: "bullets",
      cta: "summary_next_steps",
      icon_grid: "icon_cards_with_image",
      timeline: "timeline_roadmap",
      checklist: "bullets",
      numbered_steps: "numbered_grid",
      circle_diagram: "bullets",
    };
    return mapping[goldenType];
  }
}

/**
 * Create a pipeline with default settings
 */
export function createPipeline(options?: PipelineOptions): GenerationPipeline {
  return new GenerationPipeline(options);
}

/**
 * Convenience function: generate deck from request
 */
export async function generatePresentation(
  request: GenerationRequest,
  options?: PipelineOptions
): Promise<{ outline: Outline; deck: Deck }> {
  const pipeline = createPipeline(options);
  return pipeline.generate(request);
}
