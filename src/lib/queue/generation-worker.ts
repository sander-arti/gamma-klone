/**
 * Generation Worker
 *
 * BullMQ worker that processes generation jobs.
 * Publishes real-time events via Redis Pub/Sub for streaming.
 */

import { Worker, Job } from "bullmq";
import { randomUUID } from "crypto";
import { createWorkerConnection } from "./redis";
import { GENERATION_QUEUE_NAME, type GenerationJobData } from "./generation-queue";
import {
  updateJobStatus,
  updateJobProgress,
  setJobResult,
  markJobFailed,
  setJobDeckId,
} from "@/lib/db/generation-job";
import { prisma } from "@/lib/db/prisma";
import { createPipeline, type PipelineProgress, PipelineError } from "@/lib/ai/pipeline";
import { mapPipelineErrorToApiCode } from "@/lib/api/errors";
import { addExportJob } from "./export-queue";
import { createExportJob } from "@/lib/db/export-job";
import type { ThemeId } from "@/lib/themes";
import { createPublisher, publishEvent, closeConnection } from "@/lib/streaming/redis-pubsub";
import { createStreamEvent, type StreamEventType } from "@/lib/streaming/types";

/**
 * Map pipeline stage to progress percentage
 */
function stageToProgress(
  stage: PipelineProgress["stage"],
  slideIndex?: number,
  totalSlides?: number
): number {
  switch (stage) {
    case "outline":
      return 10;
    case "content":
      // Scale from 10% to 70% based on slide progress
      if (slideIndex !== undefined && totalSlides) {
        const slideProgress = (slideIndex + 1) / totalSlides;
        return 10 + Math.round(slideProgress * 60);
      }
      return 50;
    case "validation":
      return 75;
    case "repair":
      return 80;
    case "images":
      // Scale from 80% to 95% based on image progress
      if (slideIndex !== undefined && totalSlides) {
        const imageProgress = (slideIndex + 1) / totalSlides;
        return 80 + Math.round(imageProgress * 15);
      }
      return 90;
    default:
      return 0;
  }
}

/**
 * Map pipeline progress to stream event type
 */
function mapToStreamEventType(progress: PipelineProgress): StreamEventType {
  // Check if this is a completion event (has data)
  if (progress.outline) {
    return "outline_complete";
  }
  if (progress.slide) {
    return "slide_content";
  }

  // Character-level streaming events
  if (progress.delta !== undefined) {
    // New block started if message indicates start
    if (progress.message?.toLowerCase().includes("started")) {
      return "block_started";
    }
    return "block_delta";
  }

  // Otherwise map by stage
  switch (progress.stage) {
    case "validation":
      return "slide_validated";
    case "images":
      // Image generation phase - don't confuse with slide events
      return "image_progress";
    case "outline":
      return "slide_started"; // Outline phase, no specific event yet
    case "content":
      return "slide_started";
    default:
      return "slide_started";
  }
}

/**
 * Debounced progress update (max 1 update per second)
 */
function createProgressUpdater(generationId: string) {
  let lastUpdate = 0;
  let pendingProgress: number | null = null;
  let timeout: NodeJS.Timeout | null = null;

  return async (progress: number) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdate;

    if (timeSinceLastUpdate >= 1000) {
      // Update immediately
      lastUpdate = now;
      await updateJobProgress(generationId, progress);
    } else {
      // Debounce
      pendingProgress = progress;
      if (!timeout) {
        timeout = setTimeout(async () => {
          if (pendingProgress !== null) {
            lastUpdate = Date.now();
            await updateJobProgress(generationId, pendingProgress);
            pendingProgress = null;
          }
          timeout = null;
        }, 1000 - timeSinceLastUpdate);
      }
    }
  };
}

/**
 * Process a single generation job
 */
async function processGenerationJob(job: Job<GenerationJobData>): Promise<void> {
  const { generationId, workspaceId, request } = job.data;

  console.log(`Processing generation job ${generationId}`);

  // Create Redis publisher for streaming
  const publisher = createPublisher();
  let publisherConnected = false;

  try {
    // Connect publisher
    await publisher.connect();
    publisherConnected = true;
  } catch (err) {
    console.warn(`Failed to connect streaming publisher for ${generationId}:`, err);
    // Continue without streaming - polling will still work
  }

  // Helper to safely publish events
  const publish = async (type: StreamEventType, data?: Parameters<typeof createStreamEvent>[2]) => {
    if (!publisherConnected) {
      console.log(`[${generationId}] Skipping publish ${type} - publisher not connected`);
      return;
    }
    try {
      await publishEvent(publisher, generationId, createStreamEvent(type, generationId, data));
      console.log(`[${generationId}] Published ${type} event`);
    } catch (err) {
      console.warn(`Failed to publish ${type} event for ${generationId}:`, err);
    }
  };

  // Update status to running
  await updateJobStatus(generationId, {
    status: "running",
    progress: 0,
  });

  // Small delay to allow SSE subscribers to connect
  // This is necessary because Redis Pub/Sub doesn't queue messages
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Track slide counts for consistent frontend display
  // requestedSlides = what user asked for (single source of truth)
  // actualSlides = what AI actually generates (set when outline completes)
  const requestedSlides = request.numSlides ?? 0;
  let actualSlides = 0; // Will be set when outline completes

  // Publish generation started with requested slide count
  await publish("generation_started", {
    progress: 0,
    requestedSlides,
  });

  const updateProgress = createProgressUpdater(generationId);

  // Pre-generate deck ID for image storage
  // This allows us to store images in S3 under the deck's folder before DB creation
  const preDeckId = randomUUID();
  let deckCreated = false;
  let slidePosition = 0;

  // Get user ID early (needed for deck creation)
  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { workspaceId },
    select: { userId: true },
  });

  if (!workspaceMember) {
    throw new Error("No workspace members found");
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  // Create deck IMMEDIATELY so user can be redirected to editor right away
  // Title is placeholder - will be updated when outline completes
  const placeholderTitle = "Genererer presentasjon...";
  console.log(`[${generationId}] Creating deck immediately for instant redirect...`);
  await prisma.deck.create({
    data: {
      id: preDeckId,
      workspaceId,
      userId: workspaceMember.userId,
      title: placeholderTitle,
      language: request.language ?? "nb",
      themeId: request.themeId ?? "nordic_light",
      // outline omitted - will be set when outline completes
    },
  });
  deckCreated = true;

  // Store deckId on generation job immediately
  // This allows frontend to find deck even if SSE event is missed
  await setJobDeckId(generationId, preDeckId);
  console.log(`[${generationId}] Deck created and deckId stored on job`);

  // Publish deck_created immediately so frontend redirects to editor
  await publish("deck_created", {
    deckId: preDeckId,
    viewUrl: `${baseUrl}/deck/${preDeckId}`,
  });
  console.log(`[${generationId}] Sent deck_created event - user should redirect now`);

  try {
    // Create pipeline with progress callback and pre-generated deckId
    const pipeline = createPipeline({
      deckId: preDeckId, // For image generation storage path
      onProgress: async (progress: PipelineProgress) => {
        const progressPercent = stageToProgress(
          progress.stage,
          progress.slideIndex,
          progress.totalSlides
        );
        await updateProgress(progressPercent);
        await job.updateProgress(progressPercent);
        console.log(`[${generationId}] ${progress.stage}: ${progress.message}`);

        // When outline is complete, update deck with outline
        if (progress.outline) {
          // Set actualSlides from what AI generated
          actualSlides = progress.outline.slides.length;

          // Log if there's a mismatch between requested and actual
          if (requestedSlides > 0 && actualSlides !== requestedSlides) {
            console.warn(
              `[${generationId}] Slide count mismatch: requested=${requestedSlides}, actual=${actualSlides}`
            );
          }

          console.log(
            `[${generationId}] Outline complete (${actualSlides} slides), updating deck...`
          );
          await prisma.deck.update({
            where: { id: preDeckId },
            data: {
              title: progress.outline.title,
              outline: progress.outline,
            },
          });
        }

        // When a slide is complete, add it to the database immediately
        if (progress.slide && deckCreated) {
          const slideData = progress.slide;
          console.log(`[${generationId}] Adding slide ${slidePosition + 1} to database...`);

          await prisma.$transaction(async (tx) => {
            const slide = await tx.slide.create({
              data: {
                deckId: preDeckId,
                position: slidePosition,
                type: slideData.type,
                layoutVariant: slideData.layoutVariant,
              },
            });

            // Create blocks
            for (let j = 0; j < slideData.blocks.length; j++) {
              const block = slideData.blocks[j];
              await tx.block.create({
                data: {
                  slideId: slide.id,
                  position: j,
                  kind: block.kind,
                  content: JSON.parse(JSON.stringify(block)),
                },
              });
            }
          });

          slidePosition++;
        }

        // Publish stream event with slide count tracking
        // Include deckId in EVERY event so frontend can redirect even if deck_created was missed
        const eventType = mapToStreamEventType(progress);
        await publish(eventType, {
          stage: progress.stage,
          progress: progressPercent,
          slideIndex: progress.slideIndex,
          // Use actualSlides once we have it (after outline), fallback to totalSlides from progress
          totalSlides: actualSlides > 0 ? actualSlides : progress.totalSlides,
          // Include both requested and actual for frontend to handle consistently
          requestedSlides,
          actualSlides: actualSlides > 0 ? actualSlides : undefined,
          slide: progress.slide,
          outline: progress.outline,
          // Character-level streaming fields
          delta: progress.delta,
          blockIndex: progress.blockIndex,
          blockKind: progress.blockKind,
          // Image generation fields
          totalImages: progress.totalImages,
          imageIndex: progress.imageIndex,
          imageUrl: progress.imageUrl,
          // Include deckId in every event for redirect reliability
          deckId: deckCreated ? preDeckId : undefined,
        });
      },
    });

    // Run generation (includes image generation if imageMode='ai')
    const result = await pipeline.generate(request);

    // If deck wasn't created during streaming (e.g., no outline event), create now
    if (!deckCreated) {
      console.log(`[${generationId}] Creating deck at end (fallback)...`);
      await prisma.$transaction(async (tx) => {
        await tx.deck.create({
          data: {
            id: preDeckId,
            workspaceId,
            userId: workspaceMember.userId,
            title: result.deck.deck.title,
            language: result.deck.deck.language,
            themeId: result.deck.deck.themeId,
            outline: result.outline,
          },
        });

        // Create slides and blocks
        for (let i = 0; i < result.deck.slides.length; i++) {
          const slideData = result.deck.slides[i];
          const slide = await tx.slide.create({
            data: {
              deckId: preDeckId,
              position: i,
              type: slideData.type,
              layoutVariant: slideData.layoutVariant,
            },
          });

          for (let j = 0; j < slideData.blocks.length; j++) {
            const block = slideData.blocks[j];
            await tx.block.create({
              data: {
                slideId: slide.id,
                position: j,
                kind: block.kind,
                content: JSON.parse(JSON.stringify(block)),
              },
            });
          }
        }
      });
      deckCreated = true;
    }

    // Update deck with final metadata (title, theme from result may differ)
    await prisma.deck.update({
      where: { id: preDeckId },
      data: {
        title: result.deck.deck.title,
        themeId: result.deck.deck.themeId,
      },
    });

    // Update slides/blocks with final result (including image URLs from generation)
    // This is necessary because slides are created during streaming before image generation
    if (request.imageMode === "ai") {
      console.log(`[${generationId}] Updating slides with generated image URLs...`);

      // Get existing slides to update
      const existingSlides = await prisma.slide.findMany({
        where: { deckId: preDeckId },
        orderBy: { position: "asc" },
        include: { blocks: { orderBy: { position: "asc" } } },
      });

      // Update each slide's blocks with final content (including image URLs)
      for (let i = 0; i < Math.min(existingSlides.length, result.deck.slides.length); i++) {
        const existingSlide = existingSlides[i];
        const finalSlideData = result.deck.slides[i];

        // Update each block's content
        for (
          let j = 0;
          j < Math.min(existingSlide.blocks.length, finalSlideData.blocks.length);
          j++
        ) {
          const existingBlock = existingSlide.blocks[j];
          const finalBlock = finalSlideData.blocks[j];

          // Only update if block kinds match and content differs
          if (existingBlock.kind === finalBlock.kind) {
            await prisma.block.update({
              where: { id: existingBlock.id },
              data: {
                content: JSON.parse(JSON.stringify(finalBlock)),
              },
            });
          }
        }

        // If final slide has more blocks (e.g., image block added), create them
        if (finalSlideData.blocks.length > existingSlide.blocks.length) {
          for (let j = existingSlide.blocks.length; j < finalSlideData.blocks.length; j++) {
            const newBlock = finalSlideData.blocks[j];
            await prisma.block.create({
              data: {
                slideId: existingSlide.id,
                position: j,
                kind: newBlock.kind,
                content: JSON.parse(JSON.stringify(newBlock)),
              },
            });
          }
        }
      }

      console.log(`[${generationId}] Slides updated with image URLs`);
    }

    const deck = { id: preDeckId };

    // Generate view URL (baseUrl already defined at top)
    const viewUrl = `${baseUrl}/view/${deck.id}`;

    // Mark job as completed
    await setJobResult(generationId, {
      deckId: deck.id,
      viewUrl,
    });

    // Trigger export jobs if requested
    if (request.exportAs && request.exportAs.length > 0) {
      console.log(
        `Triggering exports for generation ${generationId}: ${request.exportAs.join(", ")}`
      );

      for (const format of request.exportAs) {
        if (format === "pdf" || format === "pptx") {
          // Create export job in database
          const exportJob = await createExportJob({
            deckId: deck.id,
            format,
          });

          // Update export job with generationJobId
          await prisma.exportJob.update({
            where: { id: exportJob.id },
            data: { generationJobId: generationId },
          });

          // Add to export queue
          await addExportJob({
            exportJobId: exportJob.id,
            generationJobId: generationId,
            deckId: deck.id,
            format,
            themeId: (result.deck.deck.themeId ?? "nordic_light") as ThemeId,
            brandKit: result.deck.deck.brandKit,
          });

          console.log(
            `Export job ${exportJob.id} (${format}) created for generation ${generationId}`
          );
        }
      }
    }

    // Publish generation complete with deckId and viewUrl for redirect
    await publish("generation_complete", {
      progress: 100,
      deck: result.deck,
      deckId: deck.id,
      viewUrl,
      // Include slide counts for final state
      requestedSlides,
      actualSlides: result.deck.slides.length,
      totalSlides: result.deck.slides.length,
    });

    console.log(`Generation job ${generationId} completed successfully`);
  } catch (error) {
    console.error(`Generation job ${generationId} failed:`, error);

    let errorCode = "INTERNAL_ERROR";
    let errorMessage = "An unexpected error occurred";

    if (error instanceof PipelineError) {
      errorCode = mapPipelineErrorToApiCode(error);
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    await markJobFailed(generationId, errorCode, errorMessage);

    // Publish generation failed
    await publish("generation_failed", {
      error: { code: errorCode, message: errorMessage },
    });

    // Re-throw to let BullMQ handle retry logic
    throw error;
  } finally {
    // Clean up publisher connection
    if (publisherConnected) {
      await closeConnection(publisher);
    }
  }
}

/**
 * Create and start the generation worker
 */
export function createGenerationWorker(): Worker<GenerationJobData> {
  const connection = createWorkerConnection();

  const worker = new Worker<GenerationJobData>(GENERATION_QUEUE_NAME, processGenerationJob, {
    connection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY ?? "2", 10),
    // Lock settings for long-running jobs (image generation can take 60+ seconds)
    lockDuration: 300000, // 5 minutes - how long before job is considered stalled
    lockRenewTime: 60000, // 1 minute - how often to renew the lock
    stalledInterval: 120000, // 2 minutes - how often to check for stalled jobs
  });

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("Worker error:", err);
  });

  return worker;
}

/**
 * Graceful shutdown
 */
export async function shutdownWorker(worker: Worker): Promise<void> {
  console.log("Shutting down worker...");
  await worker.close();
  console.log("Worker shutdown complete");
}
