/**
 * Export Worker Startup Script
 *
 * Entry point for starting the export worker.
 * Run with: pnpm export-worker
 */

import "dotenv/config";
import { createExportWorker, shutdownExportWorker } from "./export-worker";
import { closeRedisConnection } from "./redis";
import { closeExportQueue } from "./export-queue";

console.log("Starting export worker...");
console.log(`Environment: ${process.env.NODE_ENV ?? "development"}`);
console.log(`Concurrency: ${process.env.EXPORT_WORKER_CONCURRENCY ?? "1"}`);

const worker = createExportWorker();

// Graceful shutdown handling
async function shutdown(signal: string): Promise<void> {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);

  try {
    await shutdownExportWorker(worker);
    await closeExportQueue();
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

console.log("Export worker started and waiting for jobs...");
