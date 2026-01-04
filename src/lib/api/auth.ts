/**
 * API Key Authentication
 *
 * Validates API keys from request headers and returns workspace context.
 */

import { createHash } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { ApiError } from "./errors";

/**
 * Authentication result containing workspace and API key info
 */
export interface AuthResult {
  workspaceId: string;
  apiKeyId: string;
}

/**
 * Hash an API key using SHA-256
 */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Extract API key from request headers
 * Supports both "Authorization: Bearer <key>" and "X-Api-Key: <key>"
 */
export function extractApiKey(request: Request): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Fall back to X-Api-Key header
  const apiKeyHeader = request.headers.get("X-Api-Key");
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  return null;
}

/**
 * Validate API key and return workspace context
 * Throws ApiError if validation fails
 */
export async function validateApiKey(request: Request): Promise<AuthResult> {
  const key = extractApiKey(request);

  if (!key) {
    throw new ApiError("UNAUTHORIZED", "Missing API key");
  }

  const keyHash = hashApiKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: {
      id: true,
      workspaceId: true,
      expiresAt: true,
      revokedAt: true,
    },
  });

  if (!apiKey) {
    throw new ApiError("UNAUTHORIZED", "Invalid API key");
  }

  // Check if key is revoked
  if (apiKey.revokedAt) {
    throw new ApiError("UNAUTHORIZED", "API key has been revoked");
  }

  // Check if key is expired
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    throw new ApiError("UNAUTHORIZED", "API key has expired");
  }

  // Update last used timestamp (fire-and-forget)
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {
      // Ignore errors in updating last used
    });

  return {
    workspaceId: apiKey.workspaceId,
    apiKeyId: apiKey.id,
  };
}

/**
 * Generate a new API key (for admin/user creation)
 * Returns the raw key (to be shown to user once) and the hash (to be stored)
 */
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  // Generate 32 random bytes and convert to base64url
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const key = "ak_" + Buffer.from(randomBytes).toString("base64url").slice(0, 40);

  return {
    key,
    hash: hashApiKey(key),
    prefix: key.slice(0, 11), // "ak_" + first 8 chars
  };
}
