/**
 * S3 Storage Client
 *
 * S3-compatible storage client using AWS SDK v3.
 * Supports MinIO for local development.
 */

import {
  S3Client as AwsS3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";

// Configuration from environment (matches .env.example naming)
const S3_ENDPOINT = process.env.S3_ENDPOINT || "http://localhost:9000";
const S3_REGION = process.env.S3_REGION || "us-east-1";
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || "minioadmin";
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || "minioadmin";
const S3_BUCKET = process.env.S3_BUCKET || "gamma-klone";

// Default URL expiry: 1 hour (from EXPORT_URL_EXPIRY env var)
const DEFAULT_EXPIRY_SECONDS = parseInt(process.env.EXPORT_URL_EXPIRY || "3600", 10);

/**
 * Singleton S3 client instance
 */
let s3Client: AwsS3Client | null = null;

/**
 * Get or create S3 client instance
 */
export function getS3Client(): AwsS3Client {
  if (!s3Client) {
    s3Client = new AwsS3Client({
      endpoint: S3_ENDPOINT,
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      },
      forcePathStyle: true, // Required for MinIO compatibility
    });
  }
  return s3Client;
}

/**
 * Get the configured S3 bucket name
 */
export function getBucket(): string {
  return S3_BUCKET;
}

/**
 * Upload a file to S3
 *
 * @param key - The object key (file path in bucket)
 * @param buffer - The file content as a Buffer
 * @param contentType - MIME type of the file
 * @returns The S3 object key
 */
export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const client = getS3Client();

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);
  return key;
}

/**
 * Generate a signed URL for downloading a file
 *
 * @param key - The object key
 * @param expiresInSeconds - URL expiry time (default from env)
 * @returns A pre-signed URL for downloading
 */
export async function generateSignedUrl(
  key: string,
  expiresInSeconds: number = DEFAULT_EXPIRY_SECONDS
): Promise<string> {
  const client = getS3Client();

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(client, command, {
    expiresIn: expiresInSeconds,
  });

  return url;
}

/**
 * Delete a file from S3
 *
 * @param key - The object key to delete
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  await client.send(command);
}

/**
 * Check if a file exists in S3
 *
 * @param key - The object key to check
 * @returns true if the file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  const client = getS3Client();

  try {
    const command = new HeadObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch (error) {
    // NotFound error means file doesn't exist
    if ((error as { name?: string }).name === "NotFound") {
      return false;
    }
    throw error;
  }
}

/**
 * Generate an object key for export files
 *
 * @param generationId - The generation job ID
 * @param format - The export format (pdf or pptx)
 * @returns A unique object key
 */
export function generateExportKey(generationId: string, format: "pdf" | "pptx"): string {
  const extension = format === "pdf" ? "pdf" : "pptx";
  const timestamp = Date.now();
  return `exports/${generationId}/${timestamp}.${extension}`;
}

/**
 * Calculate expiry date from seconds
 *
 * @param expiresInSeconds - Seconds until expiry
 * @returns Date when the URL expires
 */
export function calculateExpiryDate(expiresInSeconds: number = DEFAULT_EXPIRY_SECONDS): Date {
  return new Date(Date.now() + expiresInSeconds * 1000);
}

/**
 * Get default expiry seconds from configuration
 */
export function getDefaultExpirySeconds(): number {
  return DEFAULT_EXPIRY_SECONDS;
}

/**
 * Download a file from S3 as a Buffer
 *
 * @param key - The object key
 * @returns The file content as a Buffer
 */
export async function downloadFile(key: string): Promise<Buffer> {
  const client = getS3Client();

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  const response = await client.send(command);

  if (!response.Body) {
    throw new Error(`No body in S3 response for key: ${key}`);
  }

  // Convert the stream to a buffer
  const stream = response.Body as Readable;
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

/**
 * Generate a presigned URL for uploading a file
 *
 * @param key - The object key where the file will be stored
 * @param contentType - MIME type of the file
 * @param expiresInSeconds - URL expiry time (default: 15 minutes)
 * @returns A pre-signed URL for uploading
 */
export async function generateUploadPresignedUrl(
  key: string,
  contentType: string,
  expiresInSeconds: number = 15 * 60 // 15 minutes default
): Promise<string> {
  const client = getS3Client();

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(client, command, {
    expiresIn: expiresInSeconds,
  });

  return url;
}

/**
 * Generate an object key for uploaded files
 *
 * @param workspaceId - The workspace ID
 * @param uploadId - The upload ID
 * @param filename - The original filename (will be sanitized)
 * @returns A unique object key
 */
export function generateUploadKey(workspaceId: string, uploadId: string, filename: string): string {
  // Sanitize filename: remove special chars, keep extension
  const sanitized = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `uploads/${workspaceId}/${uploadId}/${sanitized}`;
}
