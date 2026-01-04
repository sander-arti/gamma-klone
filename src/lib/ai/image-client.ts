import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { uploadFile, generateSignedUrl } from "@/lib/storage/s3-client";

/**
 * Image generation error types
 */
export class ImageError extends Error {
  constructor(
    message: string,
    public code:
      | "MODEL_ERROR"
      | "RATE_LIMITED"
      | "CONTENT_POLICY"
      | "INVALID_REQUEST"
      | "NETWORK_ERROR",
    public cause?: unknown
  ) {
    super(message);
    this.name = "ImageError";
  }
}

/**
 * Image style presets (PRD §5.4)
 */
export type ImageStyle =
  | "photorealistic"
  | "illustration"
  | "minimalist"
  | "isometric"
  | "editorial"
  | "default";

/**
 * Image generation result
 */
export interface ImageResult {
  url: string;
  revisedPrompt?: string;
}

/**
 * Image Client interface - abstraction for image generation providers
 */
export interface ImageClient {
  /**
   * Generate an image from a prompt
   * @param prompt - Description of the image to generate
   * @param style - Visual style preset
   * @returns Generated image URL and revised prompt
   */
  generateImage(prompt: string, style?: ImageStyle): Promise<ImageResult>;
}

/**
 * Configuration for OpenAI image client
 */
export interface OpenAIImageClientConfig {
  apiKey: string;
  model?: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  maxRetries?: number;
}

/**
 * Style-specific prompt modifiers
 */
const STYLE_MODIFIERS: Record<ImageStyle, string> = {
  photorealistic:
    "Ultra-realistic photograph, high resolution, professional lighting, sharp focus",
  illustration:
    "Digital illustration, clean lines, modern flat design, professional corporate style",
  minimalist:
    "Minimalist design, simple shapes, limited color palette, clean and elegant",
  isometric:
    "Isometric 3D illustration, clean geometric shapes, modern tech aesthetic",
  editorial:
    "Editorial photography style, dramatic lighting, professional composition",
  default:
    "Professional business image, clean and modern, suitable for corporate presentations",
};

/**
 * OpenAI DALL-E 3 Image Client implementation
 */
export class OpenAIImageClient implements ImageClient {
  private client: OpenAI;
  private model: string;
  private size: "1024x1024" | "1792x1024" | "1024x1792";
  private quality: "standard" | "hd";
  private maxRetries: number;

  constructor(config: OpenAIImageClientConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
    this.model = config.model ?? "dall-e-3";
    this.size = config.size ?? "1792x1024"; // 16:9-ish for presentations
    this.quality = config.quality ?? "standard";
    this.maxRetries = config.maxRetries ?? 2;
  }

  async generateImage(
    prompt: string,
    style: ImageStyle = "default"
  ): Promise<ImageResult> {
    const styleModifier = STYLE_MODIFIERS[style];
    const fullPrompt = `${prompt}. ${styleModifier}. No text or watermarks.`;

    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.images.generate({
          model: this.model,
          prompt: fullPrompt,
          n: 1,
          size: this.size,
          quality: this.quality,
        });

        const imageData = response.data?.[0];

        if (!imageData?.url) {
          throw new ImageError("No image URL in response", "MODEL_ERROR");
        }

        return {
          url: imageData.url,
          revisedPrompt: imageData.revised_prompt,
        };
      } catch (error) {
        lastError = error;

        // Handle content policy violations - don't retry
        if (
          error instanceof OpenAI.BadRequestError &&
          error.message.includes("content_policy")
        ) {
          throw new ImageError(
            "Image generation blocked by content policy",
            "CONTENT_POLICY",
            error
          );
        }

        // Handle rate limiting
        if (error instanceof OpenAI.RateLimitError) {
          if (attempt < this.maxRetries) {
            // Exponential backoff
            await this.sleep(Math.pow(2, attempt) * 2000);
            continue;
          }
          throw new ImageError(
            "Rate limited by OpenAI API",
            "RATE_LIMITED",
            error
          );
        }

        // Handle API errors
        if (error instanceof OpenAI.APIError) {
          if (attempt < this.maxRetries) {
            await this.sleep(2000 * attempt);
            continue;
          }
          throw new ImageError(
            `OpenAI API error: ${error.message}`,
            "MODEL_ERROR",
            error
          );
        }

        // Re-throw ImageErrors
        if (error instanceof ImageError) {
          throw error;
        }

        // Wrap unknown errors
        if (attempt >= this.maxRetries) {
          throw new ImageError(
            `Image generation failed after ${this.maxRetries} attempts`,
            "MODEL_ERROR",
            error
          );
        }
      }
    }

    throw new ImageError(
      "Unexpected error in image client",
      "MODEL_ERROR",
      lastError
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Gemini Image Client (Nano Banana Pro)
// ============================================================================

/**
 * Configuration for Gemini image client
 */
export interface GeminiImageClientConfig {
  apiKey: string;
  model?: string;
  aspectRatio?: string;
  imageSize?: string;
  maxRetries?: number;
}

/**
 * Google Gemini 3 Pro Image Client implementation
 * Uses "Nano Banana Pro" model for high-quality image generation
 */
export class GeminiImageClient implements ImageClient {
  private ai: GoogleGenAI;
  private model: string;
  private aspectRatio: string;
  private imageSize: string;
  private maxRetries: number;

  constructor(config: GeminiImageClientConfig) {
    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
    this.model = config.model ?? "gemini-3-pro-image-preview";
    this.aspectRatio = config.aspectRatio ?? "16:9";
    this.imageSize = config.imageSize ?? "2K";
    this.maxRetries = config.maxRetries ?? 2;
    console.log(`[GeminiImageClient] Initialized with model: ${this.model}`);
  }

  async generateImage(
    prompt: string,
    style: ImageStyle = "default"
  ): Promise<ImageResult> {
    console.log(`[GeminiImageClient] 🎨 Generating image with Nano Banana Pro`);
    console.log(`[GeminiImageClient] Model: ${this.model}, AspectRatio: ${this.aspectRatio}, Size: ${this.imageSize}`);

    const styleModifier = STYLE_MODIFIERS[style];
    const fullPrompt = `${prompt}. ${styleModifier}. No text or watermarks.`;

    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.ai.models.generateContent({
          model: this.model,
          contents: fullPrompt,
          config: {
            responseModalities: ["IMAGE"],
            imageConfig: {
              aspectRatio: this.aspectRatio,
              imageSize: this.imageSize,
            },
          },
        });

        // Extract base64 image from response
        const parts = response.candidates?.[0]?.content?.parts ?? [];
        const imagePart = parts.find((p) => p.inlineData);

        if (!imagePart?.inlineData?.data) {
          throw new ImageError("No image data in Gemini response", "MODEL_ERROR");
        }

        // Convert base64 to Buffer
        const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
        const mimeType = imagePart.inlineData.mimeType ?? "image/png";

        // Generate unique S3 key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).slice(2, 10);
        const extension = mimeType === "image/jpeg" ? "jpg" : "png";
        const s3Key = `images/generated/${timestamp}-${randomSuffix}.${extension}`;

        // Upload to S3 and get signed URL
        await uploadFile(s3Key, imageBuffer, mimeType);
        const signedUrl = await generateSignedUrl(s3Key, 86400 * 7); // 7 days

        return {
          url: signedUrl,
          revisedPrompt: fullPrompt, // Gemini doesn't revise prompts like DALL-E
        };
      } catch (error) {
        lastError = error;

        // Handle Gemini-specific errors
        if (error instanceof Error) {
          const message = error.message.toLowerCase();

          // Content policy violation - don't retry
          if (
            message.includes("safety") ||
            message.includes("blocked") ||
            message.includes("policy")
          ) {
            throw new ImageError(
              "Image generation blocked by content policy",
              "CONTENT_POLICY",
              error
            );
          }

          // Rate limiting
          if (
            message.includes("rate") ||
            message.includes("quota") ||
            message.includes("429")
          ) {
            if (attempt < this.maxRetries) {
              await this.sleep(Math.pow(2, attempt) * 2000);
              continue;
            }
            throw new ImageError(
              "Rate limited by Gemini API",
              "RATE_LIMITED",
              error
            );
          }

          // Invalid request
          if (
            message.includes("invalid") ||
            message.includes("400")
          ) {
            throw new ImageError(
              `Invalid request to Gemini: ${error.message}`,
              "INVALID_REQUEST",
              error
            );
          }
        }

        // Re-throw ImageErrors
        if (error instanceof ImageError) {
          throw error;
        }

        // Retry for other errors
        if (attempt < this.maxRetries) {
          await this.sleep(2000 * attempt);
          continue;
        }
      }
    }

    throw new ImageError(
      `Gemini image generation failed after ${this.maxRetries} attempts`,
      "MODEL_ERROR",
      lastError
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Mock Image Client
// ============================================================================

/**
 * Mock image client for testing
 */
export class MockImageClient implements ImageClient {
  async generateImage(
    prompt: string,
    style: ImageStyle = "default"
  ): Promise<ImageResult> {
    // Return placeholder image URL for testing
    const encodedPrompt = encodeURIComponent(prompt.slice(0, 50));
    return {
      url: `https://placehold.co/1792x1024/e2e8f0/475569?text=${encodedPrompt}`,
      revisedPrompt: `[MOCK] ${prompt}`,
    };
  }
}

// ============================================================================
// Client Factory
// ============================================================================

/**
 * Get OpenAI image client
 * Internal helper for fallback scenarios
 */
function getOpenAIImageClient(): ImageClient {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("No image generation API key configured (OPENAI_API_KEY required for fallback)");
  }

  return new OpenAIImageClient({
    apiKey,
    model: process.env.OPENAI_IMAGE_MODEL ?? "dall-e-3",
    size:
      (process.env.OPENAI_IMAGE_SIZE as "1024x1024" | "1792x1024") ??
      "1792x1024",
    quality:
      (process.env.OPENAI_IMAGE_QUALITY as "standard" | "hd") ?? "standard",
  });
}

/**
 * Get default image client based on environment
 *
 * Provider selection:
 * - FAKE_LLM=true → MockImageClient (testing)
 * - IMAGE_PROVIDER=gemini → GeminiImageClient (default)
 * - IMAGE_PROVIDER=openai → OpenAIImageClient
 *
 * Falls back to OpenAI if Gemini API key is not configured.
 */
export function getImageClient(): ImageClient {
  // Testing mode
  if (process.env.FAKE_LLM === "true") {
    return new MockImageClient();
  }

  const provider = process.env.IMAGE_PROVIDER ?? "gemini";

  // Gemini (default)
  if (provider === "gemini") {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      console.warn(
        "[image-client] GEMINI_API_KEY not set, falling back to OpenAI"
      );
      return getOpenAIImageClient();
    }

    return new GeminiImageClient({
      apiKey: geminiApiKey,
      model: process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image-preview",
      aspectRatio: process.env.GEMINI_ASPECT_RATIO ?? "16:9",
      imageSize: process.env.GEMINI_IMAGE_SIZE ?? "2K",
    });
  }

  // OpenAI
  return getOpenAIImageClient();
}
