/**
 * Extraction Worker Startup Script
 *
 * Entry point for starting the extraction worker.
 * Run with: pnpm extraction-worker
 */

import "dotenv/config";
import {
  createExtractionWorker,
  shutdownExtractionWorker,
} from "./extraction-worker";
import { closeRedisConnection } from "./redis";
import { closeExtractionQueue } from "./extraction-queue";

console.log("Starting extraction worker...");
console.log(`Environment: ${process.env.NODE_ENV ?? "development"}`);
console.log(`Concurrency: ${process.env.EXTRACTION_WORKER_CONCURRENCY ?? "2"}`);

const worker = createExtractionWorker();

// Graceful shutdown handling
async function shutdown(signal: string): Promise<void> {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);

  try {
    await shutdownExtractionWorker(worker);
    await closeExtractionQueue();
    await closeRedisConnection();
    console.log("Shutdown complete");
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

console.log("Extraction worker started and waiting for jobs...");
