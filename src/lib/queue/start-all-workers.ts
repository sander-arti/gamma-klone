/**
 * All Workers Startup Script
 *
 * Entry point for starting all workers in a single process.
 * Run with: pnpm workers
 */

import "dotenv/config";
import { createGenerationWorker, shutdownWorker } from "./generation-worker";
import { createExportWorker, shutdownExportWorker } from "./export-worker";
import { createExtractionWorker, shutdownExtractionWorker } from "./extraction-worker";
import { closeRedisConnection } from "./redis";
import { closeGenerationQueue } from "./generation-queue";
import { closeExportQueue } from "./export-queue";
import { closeExtractionQueue } from "./extraction-queue";

console.log("Starting all workers...");
console.log(`Environment: ${process.env.NODE_ENV ?? "development"}`);

// Start all workers
const generationWorker = createGenerationWorker();
console.log("[Generation] Worker started");

const exportWorker = createExportWorker();
console.log("[Export] Worker started");

const extractionWorker = createExtractionWorker();
console.log("[Extraction] Worker started");

// Graceful shutdown handling
async function shutdown(signal: string): Promise<void> {
  console.log(`\nReceived ${signal}, shutting down all workers gracefully...`);

  try {
    await Promise.all([
      shutdownWorker(generationWorker),
      shutdownExportWorker(exportWorker),
      shutdownExtractionWorker(extractionWorker),
    ]);

    await Promise.all([closeGenerationQueue(), closeExportQueue(), closeExtractionQueue()]);

    await closeRedisConnection();
    console.log("All workers shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  shutdown("uncaughtException").catch(() => process.exit(1));
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

console.log("All workers started and waiting for jobs (generation, export, extraction)...");
