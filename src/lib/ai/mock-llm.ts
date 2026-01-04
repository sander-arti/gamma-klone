import { z, ZodSchema } from "zod";
import type { LLMClient, StreamingCallback } from "./llm-client";
import { OutlineSchema, type Outline } from "@/lib/schemas/slide";
import { DeckSchema, type Deck } from "@/lib/schemas/deck";
import { SlideSchema, type Slide } from "@/lib/schemas/slide";

/**
 * Mock LLM Client for deterministic testing
 *
 * Returns fixture data based on prompt content detection.
 * Used when FAKE_LLM=true environment variable is set.
 */
export class MockLLMClient implements LLMClient {
  async generateJSON<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: ZodSchema<T>
  ): Promise<T> {
    // Simulate network delay
    await this.sleep(100);

    // Detect what type of generation is requested based on system prompt
    const systemLower = systemPrompt.toLowerCase();
    // Combine prompts for better type detection
    const combinedPrompt = `${systemPrompt}\n${userPrompt}`.toLowerCase();

    let mockData: unknown;

    if (systemLower.includes("outline")) {
      mockData = this.getMockOutline(userPrompt);
    } else if (systemLower.includes("split")) {
      mockData = this.getMockSplitSlides();
    } else if (systemLower.includes("repair") || systemLower.includes("fix")) {
      mockData = this.getMockRepairedSlide(userPrompt);
    } else if (systemLower.includes("slide") || systemLower.includes("content")) {
      // Pass combined prompt so we can detect slide type from system prompt
      mockData = this.getMockSlide(combinedPrompt);
    } else {
      // Default to outline
      mockData = this.getMockOutline(userPrompt);
    }

    // Validate against provided schema
    const result = schema.safeParse(mockData);
    if (!result.success) {
      throw new Error(`Mock data validation failed: ${result.error.message}`);
    }

    return result.data;
  }

  /**
   * Mock streaming implementation for testing character-level streaming
   * Simulates streaming by emitting JSON tokens at intervals
   */
  async generateJSONStreaming<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: ZodSchema<T>,
    callbacks: StreamingCallback
  ): Promise<T> {
    // Get the mock result first
    const result = await this.generateJSON(systemPrompt, userPrompt, schema);
    const jsonString = JSON.stringify(result, null, 2);

    // Simulate streaming by emitting characters in chunks
    const chunkSize = 3; // Characters per chunk
    const delayMs = 10; // Milliseconds between chunks

    for (let i = 0; i < jsonString.length; i += chunkSize) {
      await this.sleep(delayMs);
      const chunk = jsonString.slice(i, i + chunkSize);
      callbacks.onToken?.(chunk);

      // Try to parse partial JSON every few chunks
      if (i % 30 === 0) {
        try {
          // Attempt to close the JSON for partial parsing
          const partialString = jsonString.slice(0, i + chunkSize);
          callbacks.onPartialJSON?.(JSON.parse(this.closeJSON(partialString)));
        } catch {
          // Partial parse failed, which is expected
        }
      }
    }

    callbacks.onComplete?.(result);
    return result;
  }

  /**
   * Attempt to close incomplete JSON for partial parsing
   */
  private closeJSON(partial: string): string {
    // Count open brackets and braces
    let braces = 0;
    let brackets = 0;
    let inString = false;
    let escaped = false;

    for (const char of partial) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;

      if (char === "{") braces++;
      if (char === "}") braces--;
      if (char === "[") brackets++;
      if (char === "]") brackets--;
    }

    // Close strings if open
    if (inString) {
      partial += '"';
    }

    // Close brackets and braces
    return partial + "]".repeat(Math.max(0, brackets)) + "}".repeat(Math.max(0, braces));
  }

  private getMockOutline(userPrompt: string): Outline {
    // Detect content type from prompt
    const promptLower = userPrompt.toLowerCase();

    if (promptLower.includes("møte") || promptLower.includes("meeting")) {
      return {
        title: "Møtereferat",
        slides: [
          { title: "Møteoversikt", suggestedType: "cover", hints: ["Dato", "Deltakere"] },
          { title: "Agenda", suggestedType: "agenda", hints: ["Punkter til diskusjon"] },
          {
            title: "Beslutninger",
            suggestedType: "decisions_list",
            hints: ["Viktige avgjørelser"],
          },
          {
            title: "Oppgaver",
            suggestedType: "action_items_table",
            hints: ["Hvem gjør hva"],
          },
          { title: "Neste steg", suggestedType: "summary_next_steps", hints: ["Oppfølging"] },
        ],
      };
    }

    if (promptLower.includes("produkt") || promptLower.includes("lansering")) {
      return {
        title: "Produktpresentasjon",
        slides: [
          { title: "Velkommen", suggestedType: "cover", hints: ["Produktnavn"] },
          { title: "Problemet vi løser", suggestedType: "bullets", hints: ["Smertepunkter"] },
          { title: "Vår løsning", suggestedType: "text_plus_image", hints: ["Hovedfunksjoner"] },
          { title: "Hvordan det fungerer", suggestedType: "two_column_text", hints: ["Før/etter"] },
          { title: "Priser og pakker", suggestedType: "bullets", hints: ["Alternativer"] },
          { title: "Kom i gang", suggestedType: "summary_next_steps", hints: ["Neste steg"] },
        ],
      };
    }

    // Default generic outline
    return {
      title: "Presentasjon",
      slides: [
        { title: "Introduksjon", suggestedType: "cover", hints: ["Tittel og kontekst"] },
        { title: "Oversikt", suggestedType: "agenda", hints: ["Hovedpunkter"] },
        { title: "Hovedinnhold", suggestedType: "bullets", hints: ["Nøkkelpunkter"] },
        { title: "Detaljer", suggestedType: "two_column_text", hints: ["Mer informasjon"] },
        { title: "Oppsummering", suggestedType: "summary_next_steps", hints: ["Konklusjon"] },
      ],
    };
  }

  private getMockSlide(promptText: string): Slide {
    const promptLower = promptText.toLowerCase();

    // Try to detect slide type from prompt (checks both system and user prompt)
    // Check for explicit type: declarations first (from content system prompt)
    if (promptLower.includes("type: cover") || promptLower.includes("type:cover")) {
      return {
        type: "cover",
        layoutVariant: "default",
        blocks: [
          { kind: "title", text: "Presentasjonstittel" },
          { kind: "text", text: "Undertittel eller dato" },
        ],
      };
    }

    if (
      promptLower.includes("type: section_header") ||
      promptLower.includes("type:section_header")
    ) {
      return {
        type: "section_header",
        layoutVariant: "default",
        blocks: [
          { kind: "title", text: "Seksjonstittel" },
          { kind: "text", text: "Beskrivelse av seksjonen" },
        ],
      };
    }

    if (
      promptLower.includes("type: text_plus_image") ||
      promptLower.includes("type:text_plus_image")
    ) {
      return {
        type: "text_plus_image",
        layoutVariant: "default",
        blocks: [
          { kind: "title", text: "Tekst med bilde" },
          { kind: "text", text: "Hovedtekst som beskriver innholdet på denne sliden." },
          { kind: "image", url: "", alt: "Beskrivende bildetekst for AI-generering" },
        ],
      };
    }

    if (promptLower.includes("type: quote_callout") || promptLower.includes("type:quote_callout")) {
      return {
        type: "quote_callout",
        layoutVariant: "default",
        blocks: [
          { kind: "callout", text: "Et viktig sitat eller budskap", style: "quote" },
          { kind: "text", text: "- Kilde eller attribusjon" },
        ],
      };
    }

    if (promptLower.includes("type: agenda") || promptLower.includes("type:agenda")) {
      return {
        type: "agenda",
        layoutVariant: "default",
        blocks: [
          { kind: "title", text: "Agenda" },
          {
            kind: "bullets",
            items: [
              "Introduksjon og bakgrunn",
              "Hovedtema 1",
              "Hovedtema 2",
              "Diskusjon",
              "Oppsummering",
            ],
          },
        ],
      };
    }

    if (promptLower.includes("type: bullets") || promptLower.includes("type:bullets")) {
      return {
        type: "bullets",
        layoutVariant: "default",
        blocks: [
          { kind: "title", text: "Hovedpunkter" },
          {
            kind: "bullets",
            items: ["Første viktige punkt", "Andre viktige punkt", "Tredje punkt", "Fjerde punkt"],
          },
        ],
      };
    }

    if (
      promptLower.includes("type: two_column_text") ||
      promptLower.includes("type:two_column_text")
    ) {
      return {
        type: "two_column_text",
        layoutVariant: "default",
        blocks: [
          { kind: "title", text: "Sammenligning" },
          { kind: "text", text: "Venstre kolonne: Fordeler og styrker ved løsning A." },
          { kind: "text", text: "Høyre kolonne: Fordeler og styrker ved løsning B." },
        ],
      };
    }

    if (
      promptLower.includes("type: decisions_list") ||
      promptLower.includes("type:decisions_list")
    ) {
      return {
        type: "decisions_list",
        layoutVariant: "default",
        blocks: [
          { kind: "title", text: "Beslutninger" },
          {
            kind: "bullets",
            items: [
              "Beslutning 1: Godkjent budsjett for Q1",
              "Beslutning 2: Ny leverandør valgt",
              "Beslutning 3: Prosjektplan godkjent",
            ],
          },
        ],
      };
    }

    if (
      promptLower.includes("type: action_items_table") ||
      promptLower.includes("type:action_items_table")
    ) {
      return {
        type: "action_items_table",
        layoutVariant: "default",
        blocks: [
          { kind: "title", text: "Oppgaver" },
          {
            kind: "table",
            columns: ["Oppgave", "Ansvarlig", "Frist"],
            rows: [
              ["Ferdigstille rapport", "Anna", "15. jan"],
              ["Gjennomgå kontrakt", "Per", "20. jan"],
              ["Planlegge møte", "Kari", "10. jan"],
            ],
          },
        ],
      };
    }

    if (
      promptLower.includes("type: summary_next_steps") ||
      promptLower.includes("type:summary_next_steps")
    ) {
      return {
        type: "summary_next_steps",
        layoutVariant: "default",
        blocks: [
          { kind: "title", text: "Neste steg" },
          {
            kind: "bullets",
            items: [
              "Følge opp med kunden innen fredag",
              "Ferdigstille dokumentasjon",
              "Planlegge neste møte",
            ],
          },
        ],
      };
    }

    // Fallback to keyword detection
    if (promptLower.includes("cover") || promptLower.includes("tittel")) {
      return {
        type: "cover",
        layoutVariant: "default",
        blocks: [
          { kind: "title", text: "Presentasjonstittel" },
          { kind: "text", text: "Undertittel eller dato" },
        ],
      };
    }

    if (promptLower.includes("agenda")) {
      return {
        type: "agenda",
        layoutVariant: "default",
        blocks: [
          { kind: "title", text: "Agenda" },
          {
            kind: "bullets",
            items: [
              "Introduksjon og bakgrunn",
              "Hovedtema 1",
              "Hovedtema 2",
              "Diskusjon",
              "Oppsummering",
            ],
          },
        ],
      };
    }

    if (promptLower.includes("decision") || promptLower.includes("beslutning")) {
      return {
        type: "decisions_list",
        layoutVariant: "default",
        blocks: [
          { kind: "title", text: "Beslutninger" },
          {
            kind: "bullets",
            items: [
              "Beslutning 1: Godkjent budsjett for Q1",
              "Beslutning 2: Ny leverandør valgt",
              "Beslutning 3: Prosjektplan godkjent",
              "Beslutning 4: Ressursallokering bekreftet",
            ],
          },
        ],
      };
    }

    if (promptLower.includes("action") || promptLower.includes("oppgave")) {
      return {
        type: "action_items_table",
        layoutVariant: "default",
        blocks: [
          { kind: "title", text: "Oppgaver" },
          {
            kind: "table",
            columns: ["Oppgave", "Ansvarlig", "Frist"],
            rows: [
              ["Ferdigstille rapport", "Anna", "15. jan"],
              ["Gjennomgå kontrakt", "Per", "20. jan"],
              ["Planlegge møte", "Kari", "10. jan"],
            ],
          },
        ],
      };
    }

    if (promptLower.includes("two_column") || promptLower.includes("to kolonner")) {
      return {
        type: "two_column_text",
        layoutVariant: "default",
        blocks: [
          { kind: "title", text: "Sammenligning" },
          {
            kind: "text",
            text: "Venstre kolonne: Fordeler med løsning A inkluderer bedre ytelse og lavere kostnad.",
          },
          {
            kind: "text",
            text: "Høyre kolonne: Fordeler med løsning B inkluderer enklere implementering og bedre support.",
          },
        ],
      };
    }

    if (
      promptLower.includes("summary") ||
      promptLower.includes("oppsummering") ||
      promptLower.includes("neste")
    ) {
      return {
        type: "summary_next_steps",
        layoutVariant: "default",
        blocks: [
          { kind: "title", text: "Neste steg" },
          {
            kind: "bullets",
            items: [
              "Følge opp med kunden innen fredag",
              "Ferdigstille dokumentasjon",
              "Planlegge neste møte",
              "Sende statusrapport",
            ],
          },
        ],
      };
    }

    // Default to bullets slide
    return {
      type: "bullets",
      layoutVariant: "default",
      blocks: [
        { kind: "title", text: "Hovedpunkter" },
        {
          kind: "bullets",
          items: [
            "Første viktige punkt med relevant informasjon",
            "Andre viktige punkt som utdyper temaet",
            "Tredje punkt med konkret eksempel",
            "Fjerde punkt som oppsummerer",
          ],
        },
      ],
    };
  }

  private getMockRepairedSlide(userPrompt: string): Slide {
    // Return a slide with shortened content
    return {
      type: "bullets",
      layoutVariant: "default",
      blocks: [
        { kind: "title", text: "Reparert innhold" },
        {
          kind: "bullets",
          items: ["Forkortet punkt 1", "Forkortet punkt 2", "Forkortet punkt 3"],
        },
      ],
    };
  }

  private getMockSplitSlides(): { slides: Slide[] } {
    // Return split slides for content that was too long
    return {
      slides: [
        {
          type: "bullets",
          layoutVariant: "default",
          blocks: [
            { kind: "title", text: "Hovedpunkter (del 1)" },
            {
              kind: "bullets",
              items: ["Første punkt", "Andre punkt", "Tredje punkt"],
            },
          ],
        },
        {
          type: "bullets",
          layoutVariant: "default",
          blocks: [
            { kind: "title", text: "Hovedpunkter (del 2)" },
            {
              kind: "bullets",
              items: ["Fjerde punkt", "Femte punkt", "Sjette punkt"],
            },
          ],
        },
      ],
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Fixture data for specific test scenarios
 */
export const MOCK_FIXTURES = {
  outline: {
    standard: {
      title: "Test Presentasjon",
      slides: [
        { title: "Intro", suggestedType: "cover" as const },
        { title: "Innhold", suggestedType: "bullets" as const },
        { title: "Avslutning", suggestedType: "summary_next_steps" as const },
      ],
    },
  },

  deck: {
    standard: {
      deck: {
        title: "Test Presentasjon",
        language: "no",
        themeId: "nordic_light" as const,
      },
      slides: [
        {
          type: "cover" as const,
          layoutVariant: "default",
          blocks: [{ kind: "title" as const, text: "Test" }],
        },
      ],
    },
  },
};
