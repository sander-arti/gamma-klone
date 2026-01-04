import OpenAI from "openai";
import { z, ZodSchema } from "zod";
import { parse as parsePartialJSON } from "partial-json";
import { MockLLMClient } from "./mock-llm";

/**
 * LLM Error types
 */
export class LLMError extends Error {
  constructor(
    message: string,
    public code: "MODEL_ERROR" | "INVALID_RESPONSE" | "RATE_LIMITED" | "PARSE_ERROR",
    public cause?: unknown
  ) {
    super(message);
    this.name = "LLMError";
  }
}

/**
 * Streaming callback interface for character-level streaming
 */
export interface StreamingCallback {
  /** Called for each token received from the LLM */
  onToken?: (token: string) => void;
  /** Called when partial JSON can be parsed (best-effort) */
  onPartialJSON?: (partial: unknown) => void;
  /** Called when generation completes successfully */
  onComplete?: (result: unknown) => void;
  /** Called on streaming error (will fall back to non-streaming) */
  onError?: (error: Error) => void;
}

/**
 * LLM Client interface - abstraction for AI providers
 */
export interface LLMClient {
  /**
   * Generate structured JSON output from LLM
   * @param systemPrompt - System instructions
   * @param userPrompt - User input/request
   * @param schema - Zod schema to validate response
   * @returns Parsed and validated response
   */
  generateJSON<T>(systemPrompt: string, userPrompt: string, schema: ZodSchema<T>): Promise<T>;

  /**
   * Generate structured JSON with streaming support (Gamma-style typing effect)
   * Calls onToken/onPartialJSON as tokens arrive, falls back to generateJSON on error.
   */
  generateJSONStreaming<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: ZodSchema<T>,
    callbacks: StreamingCallback
  ): Promise<T>;
}

/**
 * Configuration for OpenAI client
 */
export interface OpenAIClientConfig {
  apiKey: string;
  model?: string;
  maxRetries?: number;
  temperature?: number;
}

/**
 * OpenAI LLM Client implementation
 */
export class OpenAIClient implements LLMClient {
  private client: OpenAI;
  private model: string;
  private maxRetries: number;
  private temperature: number;

  constructor(config: OpenAIClientConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
    this.model = config.model ?? "gpt-4o";
    this.maxRetries = config.maxRetries ?? 3;
    this.temperature = config.temperature ?? 0.7;
  }

  async generateJSON<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: ZodSchema<T>
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: this.temperature,
          response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content;

        if (!content) {
          throw new LLMError("Empty response from model", "MODEL_ERROR");
        }

        // Parse JSON
        let parsed: unknown;
        try {
          parsed = JSON.parse(content);
        } catch (parseError) {
          throw new LLMError(
            `Failed to parse JSON response: ${content.slice(0, 200)}...`,
            "PARSE_ERROR",
            parseError
          );
        }

        // Validate against schema
        const result = schema.safeParse(parsed);

        if (!result.success) {
          throw new LLMError(
            `Response validation failed: ${result.error.message}`,
            "INVALID_RESPONSE",
            result.error
          );
        }

        return result.data;
      } catch (error) {
        lastError = error;

        // Don't retry on validation errors - they won't self-heal
        if (error instanceof LLMError && error.code === "INVALID_RESPONSE") {
          throw error;
        }

        // Handle rate limiting
        if (error instanceof OpenAI.RateLimitError) {
          if (attempt < this.maxRetries) {
            // Exponential backoff
            await this.sleep(Math.pow(2, attempt) * 1000);
            continue;
          }
          throw new LLMError("Rate limited by OpenAI API", "RATE_LIMITED", error);
        }

        // Handle API errors
        if (error instanceof OpenAI.APIError) {
          if (attempt < this.maxRetries) {
            await this.sleep(1000 * attempt);
            continue;
          }
          throw new LLMError(`OpenAI API error: ${error.message}`, "MODEL_ERROR", error);
        }

        // Re-throw LLM errors
        if (error instanceof LLMError) {
          throw error;
        }

        // Wrap unknown errors
        if (attempt >= this.maxRetries) {
          throw new LLMError(
            `LLM call failed after ${this.maxRetries} attempts`,
            "MODEL_ERROR",
            error
          );
        }
      }
    }

    // Should never reach here, but TypeScript needs it
    throw new LLMError("Unexpected error in LLM client", "MODEL_ERROR", lastError);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate JSON with streaming support for character-level updates
   * Falls back to non-streaming generateJSON on error.
   */
  async generateJSONStreaming<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: ZodSchema<T>,
    callbacks: StreamingCallback
  ): Promise<T> {
    let accumulated = "";

    try {
      // Create streaming request
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: this.temperature,
        response_format: { type: "json_object" },
        stream: true,
      });

      // Process streaming chunks
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          accumulated += delta;
          callbacks.onToken?.(delta);

          // Try to parse partial JSON and notify callback
          try {
            const partial = parsePartialJSON(accumulated);
            callbacks.onPartialJSON?.(partial);
          } catch {
            // Partial parsing failed, continue accumulating
          }
        }
      }

      // Parse final JSON
      if (!accumulated) {
        throw new LLMError("Empty response from streaming", "MODEL_ERROR");
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(accumulated);
      } catch (parseError) {
        throw new LLMError(
          `Failed to parse JSON response: ${accumulated.slice(0, 200)}...`,
          "PARSE_ERROR",
          parseError
        );
      }

      // Validate against schema
      const result = schema.safeParse(parsed);
      if (!result.success) {
        throw new LLMError(
          `Response validation failed: ${result.error.message}`,
          "INVALID_RESPONSE",
          result.error
        );
      }

      callbacks.onComplete?.(result.data);
      return result.data;
    } catch (error) {
      // Notify about streaming error
      callbacks.onError?.(error as Error);

      // Fall back to non-streaming method
      console.warn(
        "Streaming failed, falling back to non-streaming:",
        error instanceof Error ? error.message : error
      );
      return this.generateJSON(systemPrompt, userPrompt, schema);
    }
  }
}

/**
 * Get default LLM client based on environment
 * Uses FAKE_LLM=true for testing, otherwise OpenAI
 */
export function getLLMClient(): LLMClient {
  if (process.env.FAKE_LLM === "true") {
    return new MockLLMClient();
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }

  return new OpenAIClient({
    apiKey,
    model: process.env.OPENAI_MODEL ?? "gpt-4o",
  });
}
