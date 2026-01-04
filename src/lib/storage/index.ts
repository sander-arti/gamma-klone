/**
 * Storage Module
 *
 * S3-compatible storage utilities for file uploads and signed URLs.
 */

export {
  getS3Client,
  getBucket,
  uploadFile,
  generateSignedUrl,
  deleteFile,
  fileExists,
  generateExportKey,
  calculateExpiryDate,
  getDefaultExpirySeconds,
} from "./s3-client";
