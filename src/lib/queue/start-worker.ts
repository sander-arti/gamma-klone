/**
 * Worker Startup Script
 *
 * Entry point for starting the generation worker.
 * Run with: pnpm worker
 */

import "dotenv/config";
import { createGenerationWorker, shutdownWorker } from "./generation-worker";
import { closeRedisConnection } from "./redis";
import { closeGenerationQueue } from "./generation-queue";

console.log("Starting generation worker...");
console.log(`Environment: ${process.env.NODE_ENV ?? "development"}`);
console.log(`Concurrency: ${process.env.WORKER_CONCURRENCY ?? "2"}`);

const worker = createGenerationWorker();

// Graceful shutdown handling
async function shutdown(signal: string): Promise<void> {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);

  try {
    await shutdownWorker(worker);
    await closeGenerationQueue();
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

console.log("Worker started and waiting for jobs...");
