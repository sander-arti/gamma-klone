/**
 * Export Worker
 *
 * BullMQ worker that processes PDF and PPTX export jobs.
 * Separate from generation worker for independent scaling.
 */

import { Worker, Job } from "bullmq";
import { createWorkerConnection } from "./redis";
import { EXPORT_QUEUE_NAME, type ExportJobData } from "./export-queue";
import {
  updateExportJobStatus,
  setExportJobResult,
  markExportJobFailed,
} from "@/lib/db/export-job";
import { prisma } from "@/lib/db/prisma";
import {
  uploadFile,
  generateSignedUrl,
  generateExportKey,
  calculateExpiryDate,
  getDefaultExpirySeconds,
} from "@/lib/storage";
import { getTheme } from "@/lib/themes";
import { renderSlidesToPdf, renderSlidesToPptx } from "@/lib/export";
import type { Deck } from "@/lib/schemas/deck";
import type { Slide } from "@/lib/schemas/slide";

/**
 * Export error codes
 */
export const ExportErrorCodes = {
  DECK_NOT_FOUND: "DECK_NOT_FOUND",
  RENDER_ERROR_PDF: "RENDER_ERROR_PDF",
  RENDER_ERROR_PPTX: "RENDER_ERROR_PPTX",
  UPLOAD_ERROR: "UPLOAD_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

/**
 * Fetch deck data from database and convert to Deck schema format
 */
async function fetchDeckData(deckId: string): Promise<{
  deck: Deck;
  themeId: string;
} | null> {
  const deckRecord = await prisma.deck.findUnique({
    where: { id: deckId },
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

  if (!deckRecord) {
    return null;
  }

  // Convert database records to Deck schema format
  const slides: Slide[] = deckRecord.slides.map((slide) => ({
    type: slide.type as Slide["type"],
    layoutVariant: slide.layoutVariant,
    blocks: slide.blocks.map((block) => block.content as Slide["blocks"][0]),
  }));

  const deck: Deck = {
    deck: {
      title: deckRecord.title,
      language: deckRecord.language,
      themeId: deckRecord.themeId as Deck["deck"]["themeId"],
      brandKit: deckRecord.primaryColor || deckRecord.secondaryColor
        ? {
            primaryColor: deckRecord.primaryColor ?? undefined,
            secondaryColor: deckRecord.secondaryColor ?? undefined,
            logoUrl: deckRecord.logoUrl ?? undefined,
          }
        : undefined,
    },
    slides,
  };

  return { deck, themeId: deckRecord.themeId };
}

/**
 * Render deck to PDF using Playwright
 */
async function renderPdf(
  deck: Deck,
  themeId: string,
  brandKit?: Deck["deck"]["brandKit"]
): Promise<Buffer> {
  console.log(`Rendering PDF for deck: ${deck.deck.title}`);
  return renderSlidesToPdf(
    deck.slides,
    themeId as Parameters<typeof renderSlidesToPdf>[1],
    brandKit
  );
}

/**
 * Render deck to PPTX using PptxGenJS
 */
async function renderPptx(
  deck: Deck,
  themeId: string,
  brandKit?: Deck["deck"]["brandKit"]
): Promise<Buffer> {
  console.log(`Rendering PPTX for deck: ${deck.deck.title}`);
  return renderSlidesToPptx(
    deck.slides,
    themeId as Parameters<typeof renderSlidesToPptx>[1],
    brandKit,
    deck.deck.title
  );
}

/**
 * Process a single export job
 */
async function processExportJob(job: Job<ExportJobData>): Promise<void> {
  const { exportJobId, deckId, format, themeId, brandKit } = job.data;

  console.log(`Processing export job ${exportJobId} (format: ${format})`);

  // Update status to running
  await updateExportJobStatus(exportJobId, { status: "running" });

  try {
    // Fetch deck data
    const deckData = await fetchDeckData(deckId);

    if (!deckData) {
      throw new ExportError(
        ExportErrorCodes.DECK_NOT_FOUND,
        `Deck ${deckId} not found`
      );
    }

    const { deck } = deckData;

    // Use provided theme or deck's theme
    const resolvedThemeId = themeId ?? deckData.themeId;

    // Verify theme exists
    const theme = getTheme(resolvedThemeId as Parameters<typeof getTheme>[0]);
    if (!theme) {
      throw new ExportError(
        ExportErrorCodes.INTERNAL_ERROR,
        `Theme ${resolvedThemeId} not found`
      );
    }

    // Render based on format
    let buffer: Buffer;
    let contentType: string;

    if (format === "pdf") {
      buffer = await renderPdf(deck, resolvedThemeId, brandKit);
      contentType = "application/pdf";
    } else {
      buffer = await renderPptx(deck, resolvedThemeId, brandKit);
      contentType =
        "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    }

    // Generate S3 key
    const key = generateExportKey(deckId, format);

    // Upload to S3
    console.log(`Uploading ${format} to S3: ${key}`);
    await uploadFile(key, buffer, contentType);

    // Generate signed URL
    const expirySeconds = getDefaultExpirySeconds();
    const fileUrl = await generateSignedUrl(key, expirySeconds);
    const expiresAt = calculateExpiryDate(expirySeconds);

    // Update export job with result
    await setExportJobResult(exportJobId, { fileUrl, expiresAt });

    // Also update GenerationJob if linked (for API response)
    if (job.data.generationJobId) {
      const updateField = format === "pdf" ? "pdfUrl" : "pptxUrl";
      await prisma.generationJob.update({
        where: { id: job.data.generationJobId },
        data: {
          [updateField]: fileUrl,
          exportExpiresAt: expiresAt,
        },
      });
      console.log(
        `Updated generation job ${job.data.generationJobId} with ${format} URL`
      );
    }

    console.log(`Export job ${exportJobId} completed successfully`);
  } catch (error) {
    console.error(`Export job ${exportJobId} failed:`, error);

    let errorCode: (typeof ExportErrorCodes)[keyof typeof ExportErrorCodes] =
      ExportErrorCodes.INTERNAL_ERROR;
    let errorMessage = "An unexpected error occurred during export";

    if (error instanceof ExportError) {
      errorCode = error.code;
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;

      // Categorize error
      if (error.message.includes("PDF")) {
        errorCode = ExportErrorCodes.RENDER_ERROR_PDF;
      } else if (error.message.includes("PPTX")) {
        errorCode = ExportErrorCodes.RENDER_ERROR_PPTX;
      } else if (
        error.message.includes("S3") ||
        error.message.includes("upload")
      ) {
        errorCode = ExportErrorCodes.UPLOAD_ERROR;
      }
    }

    await markExportJobFailed(exportJobId, errorCode, errorMessage);

    // Re-throw to let BullMQ handle retry logic
    throw error;
  }
}

/**
 * Custom error class for export errors
 */
class ExportError extends Error {
  constructor(
    public code: (typeof ExportErrorCodes)[keyof typeof ExportErrorCodes],
    message: string
  ) {
    super(message);
    this.name = "ExportError";
  }
}

/**
 * Create and start the export worker
 */
export function createExportWorker(): Worker<ExportJobData> {
  const connection = createWorkerConnection();

  const worker = new Worker<ExportJobData>(
    EXPORT_QUEUE_NAME,
    processExportJob,
    {
      connection,
      // Lower concurrency for resource-intensive export operations
      concurrency: parseInt(process.env.EXPORT_WORKER_CONCURRENCY ?? "1", 10),
      // Lock settings for long-running jobs (PDF/PPTX rendering can take a while)
      lockDuration: 300000,    // 5 minutes
      lockRenewTime: 60000,    // 1 minute
      stalledInterval: 120000, // 2 minutes
    }
  );

  worker.on("completed", (job) => {
    console.log(`Export job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Export job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("Export worker error:", err);
  });

  return worker;
}

/**
 * Graceful shutdown
 */
export async function shutdownExportWorker(worker: Worker): Promise<void> {
  console.log("Shutting down export worker...");
  await worker.close();
  console.log("Export worker shutdown complete");
}
