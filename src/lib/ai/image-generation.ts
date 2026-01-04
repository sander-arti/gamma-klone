/**
 * Image Generation Module
 *
 * Orchestrates AI image generation for presentation slides.
 * Builds contextual prompts from slide content, generates images via DALL-E 3,
 * and persists them to S3.
 *
 * Phase 7 Sprint 4 (Layer 3.2): Now uses ContentAnalysis for smarter prompts.
 */

import type { Slide } from "@/lib/schemas/slide";
import type { Block } from "@/lib/schemas/block";
import type { Deck, GenerationRequest } from "@/lib/schemas/deck";
import type { ContentAnalysis } from "./content-analysis";
import { getImageClient, ImageStyle, ImageError } from "./image-client";
import { uploadFile, generateSignedUrl } from "@/lib/storage/s3-client";

/**
 * Context for building image prompts with semantic data
 * Phase 7 Sprint 4: Enables smarter, content-aware image generation
 */
export interface ImagePromptContext {
  slide: Slide;
  deckTitle?: string;
  /** ContentAnalysis from the input text - used for semantic keywords */
  analysis?: ContentAnalysis;
  /** Position in deck (0-indexed) */
  slideIndex: number;
}

/**
 * Critical instruction to prevent text in AI-generated images
 * DALL-E and similar models often add unwanted text/letters
 */
const NO_TEXT_INSTRUCTION = `
CRITICAL: The image must NOT contain any:
- Text, words, letters, or numbers
- Signs, labels, banners, or watermarks
- UI elements, buttons, or interface text
- Logos with readable text
Use photographic or abstract styles that naturally avoid text.`;

/**
 * Slides that should have AI-generated images
 * Expanded to include premium slide types for Gamma-level quality
 */
const IMAGE_ELIGIBLE_SLIDE_TYPES = [
  // Core slides that always get images
  "cover",
  "section_header",
  "text_plus_image",
  "summary_next_steps",
  // Premium visual slides
  "hero_stats",
  "split_with_callouts",
  "person_spotlight",
  "icon_cards_with_image",
  // Content slides that benefit from visuals
  "two_column_text",
  "timeline_roadmap",
  "numbered_grid",
];

/**
 * Result of image generation for a slide
 */
export interface SlideImageResult {
  slideIndex: number;
  imageUrl: string;
  prompt: string;
  revisedPrompt?: string;
}

/**
 * Progress callback for image generation
 */
export interface ImageGenerationProgress {
  slideIndex: number;
  /** 1-based index of current image in the generation queue (NOT slideIndex) */
  imageIndex: number;
  totalImages: number;
  message: string;
  imageResult?: SlideImageResult;
}

/**
 * Options for image generation
 */
export interface ImageGenerationOptions {
  /** Image style preset */
  style?: ImageStyle;
  /** Progress callback */
  onProgress?: (progress: ImageGenerationProgress) => void;
  /** Skip specific slide indices */
  skipSlideIndices?: number[];
  /** Phase 7 Sprint 4: ContentAnalysis for smarter prompts */
  analysis?: ContentAnalysis;
  /** Max retries per slide for rate limit errors (default: 1) */
  maxRetriesPerSlide?: number;
  /** Base delay between images to prevent rate limiting (default: 3000ms) */
  baseDelayMs?: number;
}

/**
 * Information about a failed image generation
 */
export interface FailedImageInfo {
  slideIndex: number;
  error: string;
  errorCode: string;
  /** Whether this can be retried (rate limits can, content policy cannot) */
  retryable: boolean;
}

/**
 * Extended result from generateImagesForDeck
 */
export interface ImageGenerationResult {
  deck: Deck;
  /** Slides that failed image generation */
  failedImages: FailedImageInfo[];
  /** Total images attempted */
  totalAttempted: number;
  /** Total images successfully generated */
  totalSuccess: number;
}

/**
 * Extract text content from a block for prompt building
 */
function extractBlockText(block: Block): string {
  switch (block.kind) {
    case "title":
    case "text":
    case "callout":
      return block.text ?? "";
    case "bullets":
      return (block.items ?? []).join(". ");
    case "table":
      // Use column headers for context
      return (block.columns ?? []).join(", ");
    default:
      return "";
  }
}

/**
 * Extract semantic keywords from slide content and ContentAnalysis
 * Phase 7 Sprint 4: Used to make image prompts more relevant
 *
 * Strategy:
 * 1. Extract nouns/key phrases from slide title
 * 2. Add statistics from analysis (max 2) - gives concrete context
 * 3. Add feature titles from analysis (max 3)
 * 4. Add topics from analysis (max 2)
 * 5. Dedupe and limit to 5 keywords total
 */
function extractKeywords(slide: Slide, analysis?: ContentAnalysis): string[] {
  const keywords: string[] = [];

  // 1. From slide title - extract key phrases
  const titleBlock = slide.blocks.find((b) => b.kind === "title");
  const title = titleBlock?.text ?? "";
  if (title) {
    // Extract capitalized words and key phrases (simple heuristic)
    const titleWords = title
      .split(/\s+/)
      .filter(
        (w) => w.length > 3 && !/^(og|med|for|til|fra|som|det|den|de|en|et|i|på|av)$/i.test(w)
      )
      .slice(0, 3);
    keywords.push(...titleWords);
  }

  if (analysis) {
    // 2. From statistics - concrete numbers give context
    if (analysis.statistics.length > 0) {
      keywords.push(...analysis.statistics.slice(0, 2));
    }

    // 3. From features - titles describe capabilities/benefits
    if (analysis.features.length > 0) {
      keywords.push(...analysis.features.slice(0, 3).map((f) => f.title));
    }

    // 4. From topics - main themes
    if (analysis.topics.length > 0) {
      keywords.push(...analysis.topics.slice(0, 2));
    }

    // 5. From sequential process if relevant
    if (analysis.sequentialProcess.length >= 3) {
      // Add first and last step to show progression
      keywords.push(analysis.sequentialProcess[0].text.slice(0, 30));
    }
  }

  // Dedupe and limit to 5 keywords, max 40 chars each
  return [...new Set(keywords)].map((k) => k.slice(0, 40)).slice(0, 5);
}

/**
 * Build an image prompt from slide content
 *
 * Phase 7 Sprint 4: Enhanced with ContentAnalysis support.
 * Now extracts semantic keywords to create more relevant prompts.
 *
 * @param slideOrContext - Either a Slide (legacy) or ImagePromptContext (new)
 * @param deckTitle - Deck title (only used with legacy signature)
 * @param analysis - ContentAnalysis (only used with legacy signature)
 */
export function buildImagePrompt(
  slideOrContext: Slide | ImagePromptContext,
  deckTitle?: string,
  analysis?: ContentAnalysis
): string {
  // Handle both legacy (slide, deckTitle) and new (context) signatures
  let slide: Slide;
  let title: string | undefined;
  let contentAnalysis: ContentAnalysis | undefined;

  if ("slide" in slideOrContext) {
    // New ImagePromptContext signature
    slide = slideOrContext.slide;
    title = slideOrContext.deckTitle;
    contentAnalysis = slideOrContext.analysis;
  } else {
    // Legacy signature
    slide = slideOrContext;
    title = deckTitle;
    contentAnalysis = analysis;
  }

  // Extract title
  const titleBlock = slide.blocks.find((b) => b.kind === "title");
  const slideTitle = titleBlock?.text ?? "";

  // Extract key content (first 2-3 content blocks)
  const contentBlocks = slide.blocks.filter((b) => b.kind !== "title" && b.kind !== "image");
  const keyContent = contentBlocks
    .slice(0, 2)
    .map(extractBlockText)
    .filter(Boolean)
    .join(". ")
    .slice(0, 200);

  // Phase 7 Sprint 4: Extract semantic keywords from analysis
  const keywords = extractKeywords(slide, contentAnalysis);
  const keywordsText = keywords.length > 0 ? `Key concepts: ${keywords.join(", ")}.` : "";

  // Build prompt based on slide type with analysis-enhanced context
  let prompt = "";

  switch (slide.type) {
    case "cover":
      prompt = `Professional business presentation cover image for "${slideTitle}". ${title ? `Topic: ${title}.` : ""} ${keywordsText} Cinematic, modern, visually stunning background. High-end corporate aesthetic with dramatic lighting. Photorealistic quality.`;
      break;

    case "section_header":
      prompt = `Section divider visual for "${slideTitle}". ${keywordsText} Abstract geometric shapes or gradients representing the concept. Modern, sophisticated, premium corporate aesthetic. Subtle depth and dimension.`;
      break;

    case "text_plus_image":
      prompt = `High-quality visual representation of: "${slideTitle}". ${keywordsText || (keyContent ? `Context: ${keyContent}.` : "")} Professional, photorealistic image that perfectly illustrates this concept. Magazine-quality photography or striking illustration.`;
      break;

    case "two_column_text":
      prompt = `Split or dual concept illustration for "${slideTitle}". ${keywordsText} Visual showing comparison or contrast. Modern business style with clear visual distinction between two elements. Premium quality.`;
      break;

    case "summary_next_steps":
      prompt = `Inspirational conclusion visual for "${slideTitle}". ${keywordsText} Representing achievement, success, and forward momentum. Cinematic, aspirational business imagery with warm lighting.`;
      break;

    case "person_spotlight":
      // Special prompt for portrait generation - no keywords needed
      prompt = `Professional corporate headshot portrait. Business executive in modern office setting. Confident, approachable expression. Natural lighting, shallow depth of field. High-end corporate photography style. Clean background with soft bokeh.`;
      break;

    case "hero_stats": {
      // Phase 7 Sprint 4: Include actual statistics in prompt
      const statsText = contentAnalysis?.statistics?.slice(0, 3).join(", ");
      prompt = `Dramatic business hero image for "${slideTitle}". ${statsText ? `Key metrics: ${statsText}.` : ""} ${keywordsText} Wide cinematic shot with dramatic lighting. Premium corporate aesthetic suitable for overlaying statistics and text.`;
      break;
    }

    case "split_with_callouts":
      prompt = `Modern architectural or business interior image for "${slideTitle}". ${keywordsText || (keyContent ? `Context: ${keyContent}.` : "")} Clean lines, professional environment. High-end photography suitable for a split-layout presentation slide.`;
      break;

    case "icon_cards_with_image": {
      // Phase 7 Sprint 4: Include feature names in prompt
      const featuresText = contentAnalysis?.features
        ?.slice(0, 3)
        .map((f) => f.title)
        .join(", ");
      prompt = `Professional concept image for "${slideTitle}". ${featuresText ? `Features: ${featuresText}.` : ""} ${keywordsText} Modern, clean aesthetic that complements icon cards. Subtle, not overpowering. Premium business photography.`;
      break;
    }

    case "timeline_roadmap": {
      // Phase 7 Sprint 4: Include phases/steps in prompt
      const steps = contentAnalysis?.sequentialProcess?.slice(0, 3);
      const phasesText =
        steps && steps.length > 0
          ? `Phases: ${steps.map((s) => s.text.slice(0, 25)).join(", ")}.`
          : "";
      prompt = `Conceptual image representing progress and milestones for "${slideTitle}". ${phasesText} ${keywordsText} Abstract or architectural imagery suggesting journey, phases, or progression. Modern, clean, aspirational.`;
      break;
    }

    case "numbered_grid":
      prompt = `Professional concept visualization for "${slideTitle}". ${keywordsText || (keyContent ? `Related to: ${keyContent}.` : "")} Modern, abstract or business imagery that complements numbered content cards.`;
      break;

    default:
      // Generic premium business image
      prompt = `Premium professional business image for "${slideTitle}". ${keywordsText || (keyContent ? `Related to: ${keyContent}.` : "")} Modern, sophisticated corporate aesthetic. High-end photography or illustration suitable for executive presentations.`;
  }

  // Add NO_TEXT_INSTRUCTION to prevent AI from adding unwanted text
  prompt += ` ${NO_TEXT_INSTRUCTION}`;

  // Ensure prompt doesn't exceed reasonable length (DALL-E has limits)
  return prompt.slice(0, 1000);
}

/**
 * Slide types that should ALWAYS have images generated
 */
const ALWAYS_NEEDS_IMAGE = [
  "cover",
  "text_plus_image",
  "hero_stats",
  "split_with_callouts",
  "person_spotlight",
  "icon_cards_with_image",
];

/**
 * Check if a slide should have an AI-generated image
 */
export function shouldGenerateImage(slide: Slide): boolean {
  // Check if slide type is eligible
  if (!IMAGE_ELIGIBLE_SLIDE_TYPES.includes(slide.type)) {
    return false;
  }

  // Check if slide has an image block that needs generation
  const imageBlock = slide.blocks.find((b) => b.kind === "image");

  // If no image block, check if slide type typically needs one
  if (!imageBlock) {
    // These types should always have images
    return ALWAYS_NEEDS_IMAGE.includes(slide.type);
  }

  // If image block exists but has placeholder/empty URL, generate
  const url = imageBlock.url ?? "";
  if (!url || url.includes("placeholder") || url.includes("placehold.co")) {
    return true;
  }

  return false;
}

/**
 * Download image from URL and return as Buffer
 */
async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate an S3 key for storing a generated image
 */
function generateImageKey(deckId: string, slideIndex: number): string {
  const timestamp = Date.now();
  return `images/${deckId}/slide-${slideIndex}-${timestamp}.png`;
}

/**
 * Check if a URL is already an S3 signed URL (from our bucket)
 * This is used to avoid re-downloading and re-uploading Gemini images
 */
function isS3SignedUrl(url: string): boolean {
  const s3Bucket = process.env.S3_BUCKET ?? "gamma-klone";
  const s3Endpoint = process.env.S3_ENDPOINT ?? "";
  return url.includes(s3Bucket) || url.includes(s3Endpoint);
}

/**
 * Generate image for a single slide
 * Phase 7 Sprint 4: Now accepts ContentAnalysis for smarter prompts
 *
 * Supports both DALL-E (URL → download → S3) and Gemini (already S3 URL) workflows.
 */
async function generateSlideImage(
  slide: Slide,
  slideIndex: number,
  deckId: string,
  deckTitle: string,
  style: ImageStyle,
  analysis?: ContentAnalysis
): Promise<SlideImageResult> {
  const imageClient = getImageClient();

  // Build prompt from slide content with semantic analysis
  const prompt = buildImagePrompt({
    slide,
    deckTitle,
    analysis,
    slideIndex,
  });

  // Generate image via configured provider (Gemini or DALL-E)
  const result = await imageClient.generateImage(prompt, style);

  // Check if the URL is already an S3 signed URL (Gemini returns these directly)
  // If so, skip the download/re-upload step to avoid duplication
  if (isS3SignedUrl(result.url)) {
    return {
      slideIndex,
      imageUrl: result.url,
      prompt,
      revisedPrompt: result.revisedPrompt,
    };
  }

  // DALL-E path: Download the image from temporary URL and persist to S3
  const imageBuffer = await downloadImage(result.url);

  // Upload to S3 with deck-specific key for organization
  const s3Key = generateImageKey(deckId, slideIndex);
  await uploadFile(s3Key, imageBuffer, "image/png");

  // Generate a signed URL for the persisted image
  const persistedUrl = await generateSignedUrl(s3Key, 86400 * 7); // 7 days

  return {
    slideIndex,
    imageUrl: persistedUrl,
    prompt,
    revisedPrompt: result.revisedPrompt,
  };
}

/**
 * Update a slide with a generated image URL
 */
export function updateSlideWithImage(slide: Slide, imageUrl: string): Slide {
  const updatedBlocks = slide.blocks.map((block) => {
    if (block.kind === "image") {
      return {
        ...block,
        url: imageUrl,
      };
    }
    return block;
  });

  // If no image block exists, add one for slide types that need images
  const hasImageBlock = slide.blocks.some((b) => b.kind === "image");
  if (!hasImageBlock && ALWAYS_NEEDS_IMAGE.includes(slide.type)) {
    const titleText = slide.blocks.find((b) => b.kind === "title")?.text ?? "slide";
    updatedBlocks.push({
      kind: "image" as const,
      url: imageUrl,
      alt: `AI-generated image for ${titleText}`,
      cropMode: "cover" as const,
    });
  }

  return {
    ...slide,
    blocks: updatedBlocks,
  };
}

/**
 * Generate images for all eligible slides in a deck
 * Phase 7 Sprint 4: Now uses ContentAnalysis for smarter prompts
 *
 * Rate limit handling:
 * - Max 1 retry per slide (to avoid long delays)
 * - Progressive delay: 8s on retry
 * - 3s base delay between images to prevent rate limiting
 */
export async function generateImagesForDeck(
  deck: Deck,
  deckId: string,
  options: ImageGenerationOptions = {}
): Promise<Deck> {
  const {
    style = "default",
    onProgress,
    skipSlideIndices = [],
    analysis,
    maxRetriesPerSlide = 1, // Reduced from 3 to minimize wait time
    baseDelayMs = 3000, // Increased from 2000 to prevent rate limits proactively
  } = options;

  // Find slides that need images
  const slidesToProcess = deck.slides
    .map((slide, index) => ({ slide, index }))
    .filter(({ slide, index }) => !skipSlideIndices.includes(index) && shouldGenerateImage(slide));

  if (slidesToProcess.length === 0) {
    return deck;
  }

  const totalImages = slidesToProcess.length;
  const updatedSlides = [...deck.slides];
  const results: SlideImageResult[] = [];
  const failedImages: FailedImageInfo[] = [];

  // Track retries per slide
  const retryCount = new Map<number, number>();

  // Process each slide sequentially (to avoid rate limits)
  for (let i = 0; i < slidesToProcess.length; i++) {
    const { slide, index } = slidesToProcess[i];
    const currentRetries = retryCount.get(index) ?? 0;

    onProgress?.({
      slideIndex: index,
      imageIndex: i + 1, // 1-based image counter (not deck position)
      totalImages,
      message:
        currentRetries > 0
          ? `Regenerer bilde ${i + 1}/${totalImages} for slide ${index + 1} (forsøk ${currentRetries + 1})...`
          : `Genererer bilde ${i + 1}/${totalImages} for slide ${index + 1}...`,
    });

    try {
      // Phase 7 Sprint 4: Pass analysis for semantic prompts
      const result = await generateSlideImage(
        slide,
        index,
        deckId,
        deck.deck.title,
        style,
        analysis
      );

      results.push(result);

      // Update the slide with the new image URL
      updatedSlides[index] = updateSlideWithImage(slide, result.imageUrl);

      onProgress?.({
        slideIndex: index,
        imageIndex: i + 1, // 1-based image counter (not deck position)
        totalImages,
        message: `Bilde ${i + 1}/${totalImages} ferdig`,
        imageResult: result,
      });

      // Add base delay between images to prevent rate limiting (skip after last image)
      if (i < slidesToProcess.length - 1 && baseDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs));
      }
    } catch (error) {
      // Log error but continue with other slides
      console.error(`Failed to generate image for slide ${index}:`, error);

      if (error instanceof ImageError) {
        // Content policy violations - cannot retry, skip
        if (error.code === "CONTENT_POLICY") {
          console.warn(`Slide ${index} image blocked by content policy, skipping`);
          failedImages.push({
            slideIndex: index,
            error: "Bildet ble blokkert av innholdspolicy",
            errorCode: error.code,
            retryable: false,
          });
          continue;
        }

        // Rate limit - retry with progressive delay
        if (error.code === "RATE_LIMITED") {
          if (currentRetries < maxRetriesPerSlide) {
            // Progressive delay: 8s, 16s, 32s (more aggressive for Gemini)
            const delayMs = 8000 * Math.pow(2, currentRetries);
            console.warn(
              `Rate limited for slide ${index}, retry ${currentRetries + 1}/${maxRetriesPerSlide} in ${delayMs / 1000}s...`
            );

            onProgress?.({
              slideIndex: index,
              imageIndex: i + 1,
              totalImages,
              message: `Venter ${delayMs / 1000}s før nytt forsøk...`,
            });

            await new Promise((resolve) => setTimeout(resolve, delayMs));
            retryCount.set(index, currentRetries + 1);
            i--; // Retry this slide
            continue;
          } else {
            // Max retries reached
            console.error(`Slide ${index} failed after ${maxRetriesPerSlide} rate-limit retries`);
            failedImages.push({
              slideIndex: index,
              error: `Rate limited - prøvde ${maxRetriesPerSlide} ganger`,
              errorCode: error.code,
              retryable: true, // Can still be retried later
            });
            continue;
          }
        }

        // Other ImageErrors - track as failed (retryable since CONTENT_POLICY already handled)
        failedImages.push({
          slideIndex: index,
          error: error.message,
          errorCode: error.code,
          retryable: true,
        });
        continue;
      }

      // Unknown errors - track as failed
      failedImages.push({
        slideIndex: index,
        error: error instanceof Error ? error.message : "Ukjent feil",
        errorCode: "UNKNOWN",
        retryable: true,
      });
    }
  }

  // Log summary (auto-retry pass removed to minimize generation time)
  const successCount = results.length;
  const failCount = failedImages.length;
  if (failCount > 0) {
    console.warn(
      `Image generation completed: ${successCount}/${totalImages} successful, ${failCount} failed`
    );
    console.warn("Failed slides:", failedImages.map((f) => f.slideIndex).join(", "));
  } else {
    console.log(`Image generation completed: ${successCount}/${totalImages} successful`);
  }

  return {
    ...deck,
    slides: updatedSlides,
  };
}

/**
 * Generate images for all eligible slides in a deck (with detailed result)
 * Use this when you need to know which images failed for potential retry
 */
export async function generateImagesForDeckWithResult(
  deck: Deck,
  deckId: string,
  options: ImageGenerationOptions = {}
): Promise<ImageGenerationResult> {
  const {
    style = "default",
    onProgress,
    skipSlideIndices = [],
    analysis,
    maxRetriesPerSlide = 1, // Reduced from 3 to minimize wait time
    baseDelayMs = 3000, // Increased from 2000 to prevent rate limits proactively
  } = options;

  // Find slides that need images
  const slidesToProcess = deck.slides
    .map((slide, index) => ({ slide, index }))
    .filter(({ slide, index }) => !skipSlideIndices.includes(index) && shouldGenerateImage(slide));

  if (slidesToProcess.length === 0) {
    return {
      deck,
      failedImages: [],
      totalAttempted: 0,
      totalSuccess: 0,
    };
  }

  const totalImages = slidesToProcess.length;
  const updatedSlides = [...deck.slides];
  const results: SlideImageResult[] = [];
  const failedImages: FailedImageInfo[] = [];
  const retryCount = new Map<number, number>();

  for (let i = 0; i < slidesToProcess.length; i++) {
    const { slide, index } = slidesToProcess[i];
    const currentRetries = retryCount.get(index) ?? 0;

    onProgress?.({
      slideIndex: index,
      imageIndex: i + 1,
      totalImages,
      message:
        currentRetries > 0
          ? `Regenerer bilde ${i + 1}/${totalImages} for slide ${index + 1} (forsøk ${currentRetries + 1})...`
          : `Genererer bilde ${i + 1}/${totalImages} for slide ${index + 1}...`,
    });

    try {
      const result = await generateSlideImage(
        slide,
        index,
        deckId,
        deck.deck.title,
        style,
        analysis
      );

      results.push(result);
      updatedSlides[index] = updateSlideWithImage(slide, result.imageUrl);

      onProgress?.({
        slideIndex: index,
        imageIndex: i + 1,
        totalImages,
        message: `Bilde ${i + 1}/${totalImages} ferdig`,
        imageResult: result,
      });

      // Add base delay between images to prevent rate limiting (skip after last image)
      if (i < slidesToProcess.length - 1 && baseDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs));
      }
    } catch (error) {
      console.error(`Failed to generate image for slide ${index}:`, error);

      if (error instanceof ImageError) {
        if (error.code === "CONTENT_POLICY") {
          failedImages.push({
            slideIndex: index,
            error: "Bildet ble blokkert av innholdspolicy",
            errorCode: error.code,
            retryable: false,
          });
          continue;
        }

        if (error.code === "RATE_LIMITED") {
          if (currentRetries < maxRetriesPerSlide) {
            // Progressive delay: 8s, 16s, 32s (more aggressive for Gemini)
            const delayMs = 8000 * Math.pow(2, currentRetries);
            onProgress?.({
              slideIndex: index,
              imageIndex: i + 1,
              totalImages,
              message: `Venter ${delayMs / 1000}s før nytt forsøk...`,
            });
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            retryCount.set(index, currentRetries + 1);
            i--;
            continue;
          } else {
            failedImages.push({
              slideIndex: index,
              error: `Rate limited - prøvde ${maxRetriesPerSlide} ganger`,
              errorCode: error.code,
              retryable: true,
            });
            continue;
          }
        }

        // Other ImageErrors - track as failed (retryable since CONTENT_POLICY already handled)
        failedImages.push({
          slideIndex: index,
          error: error.message,
          errorCode: error.code,
          retryable: true,
        });
        continue;
      }

      // Unknown errors - track as failed
      failedImages.push({
        slideIndex: index,
        error: error instanceof Error ? error.message : "Ukjent feil",
        errorCode: "UNKNOWN",
        retryable: true,
      });
    }
  }

  return {
    deck: {
      ...deck,
      slides: updatedSlides,
    },
    failedImages,
    totalAttempted: totalImages,
    totalSuccess: results.length,
  };
}

/**
 * Check if a generation request should include image generation
 */
export function shouldGenerateImages(request: GenerationRequest): boolean {
  return request.imageMode === "ai";
}

/**
 * Get the image style from a generation request
 */
export function getImageStyle(request: GenerationRequest): ImageStyle {
  return request.imageStyle ?? "default";
}
