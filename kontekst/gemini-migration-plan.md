# Migrasjonsplan: DALL-E 3 → Gemini 3 Pro Image (Nano Banana Pro)

## Sammendrag

Migrere bildegenerering fra OpenAI DALL-E 3 til Google Gemini 3 Pro Image Preview ("Nano Banana Pro") for bedre kvalitet og mer fleksibel kontroll.

## Research-funn

### Modellnavn og API
- **Produksjonsmodell:** `gemini-3-pro-image-preview`
- **Alternativ (lavere kostnad):** `gemini-2.5-flash-image` (Nano Banana)
- **SDK:** `@google/genai` (npmjs.com/package/@google/genai)
- **API Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`

### Nøkkelforskjeller: DALL-E vs Gemini

| Aspekt | DALL-E 3 | Gemini 3 Pro Image |
|--------|----------|-------------------|
| **Response** | URL (midlertidig) | Base64 inline data |
| **Størrelsesformat** | "1024x1024", "1792x1024", "1024x1792" | "1K", "2K", "4K" |
| **Aspect Ratio** | Implisitt i størrelse | Eksplisitt parameter |
| **SDK** | `openai` | `@google/genai` |
| **Metode** | `client.images.generate()` | `ai.models.generateContent()` |
| **Pris (ca.)** | $0.04-0.08/bilde | $0.024 (4K), $0.013 (1K/2K) |
| **Download nødvendig** | Ja (URL → Buffer) | Nei (base64 direkte) |

### Gemini API Konfigurasjonsparametere

```typescript
const config = {
  imageConfig: {
    aspectRatio: "16:9",  // "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"
    imageSize: "2K",      // "1K", "2K", "4K"
    outputMimeType: "image/png",  // eller "image/jpeg"
    outputCompressionQuality: 90, // 0-100 for JPEG
  },
  responseModalities: ['TEXT', 'IMAGE'],  // Viktig!
};
```

### Responsstruktur fra Gemini

```typescript
// Gemini returnerer base64 data direkte
const response = await ai.models.generateContent({...});

for (const part of response.candidates[0].content.parts) {
  if (part.inlineData) {
    const base64ImageBytes = part.inlineData.data;
    const mimeType = part.inlineData.mimeType; // "image/png"
    const buffer = Buffer.from(base64ImageBytes, 'base64');
  }
}
```

## Eksisterende Arkitektur

### Filer som påvirkes

1. **`src/lib/ai/image-client.ts`** - Hovedendringer
   - Legge til `GeminiImageClient` klasse
   - Oppdatere `getImageClient()` for å støtte begge

2. **`src/lib/ai/image-generation.ts`** - Mindre endringer
   - Mulig refaktorering av `generateSlideImage()` for å håndtere direkte Buffer

3. **`.env` / `.env.example`** - Nye miljøvariabler
   - `GEMINI_API_KEY`
   - `IMAGE_PROVIDER` (valgfri - for switching)

### Nåværende Interface (beholdes)

```typescript
export interface ImageClient {
  generateImage(prompt: string, style?: ImageStyle): Promise<ImageResult>;
}

export interface ImageResult {
  url: string;
  revisedPrompt?: string;
}
```

## Implementasjonsstrategi

### Valg: Hybrid tilnærming med backward compatibility

Vi beholder `ImageResult` interface uendret og lar `GeminiImageClient` håndtere base64 → S3 URL konvertering internt. Dette gir:

1. **Ingen endringer** i `image-generation.ts`
2. **Enkel switching** mellom providers via env var
3. **Fallback** til DALL-E hvis Gemini feiler

### Arkitektur etter migrering

```
GenerationRequest
       ↓
image-generation.ts (uendret interface)
       ↓
getImageClient() → GeminiImageClient (ny) eller OpenAIImageClient (eksisterende)
       ↓
ImageResult { url: string }  ← GeminiImageClient: base64 → S3 → signed URL
```

## Implementasjonsplan

### Steg 1: Installer SDK
```bash
pnpm add @google/genai
```

### Steg 2: Oppdater miljøvariabler

**`.env.example`:**
```env
# Image Generation Provider
# Options: "gemini" (default) | "openai"
IMAGE_PROVIDER="gemini"

# Gemini AI (for image generation)
GEMINI_API_KEY="AIza..."

# OpenAI (fallback/alternative)
OPENAI_API_KEY="sk-..."
```

### Steg 3: Opprett `GeminiImageClient`

**Ny klasse i `src/lib/ai/image-client.ts`:**

```typescript
import { GoogleGenAI } from "@google/genai";

export interface GeminiImageClientConfig {
  apiKey: string;
  model?: string;  // default: "gemini-3-pro-image-preview"
  aspectRatio?: string;  // default: "16:9"
  imageSize?: string;  // default: "2K"
  maxRetries?: number;
}

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
        const response = await this.ai.models.generateContent({
          model: this.model,
          contents: fullPrompt,
          config: {
            imageConfig: {
              aspectRatio: this.aspectRatio,
              imageSize: this.imageSize,
            },
            responseModalities: ['IMAGE'],
          },
        });

        // Extract base64 image from response
        const parts = response.candidates?.[0]?.content?.parts ?? [];
        const imagePart = parts.find(p => p.inlineData);

        if (!imagePart?.inlineData?.data) {
          throw new ImageError("No image data in response", "MODEL_ERROR");
        }

        // Convert base64 to Buffer
        const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
        const mimeType = imagePart.inlineData.mimeType ?? 'image/png';

        // Upload to S3 and get signed URL
        const s3Key = `images/generated/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
        await uploadFile(s3Key, imageBuffer, mimeType);
        const signedUrl = await generateSignedUrl(s3Key, 86400 * 7);

        return {
          url: signedUrl,
          revisedPrompt: fullPrompt, // Gemini doesn't revise prompts like DALL-E
        };
      } catch (error) {
        lastError = error;
        // Handle specific Gemini errors...
        if (attempt < this.maxRetries) {
          await this.sleep(2000 * attempt);
          continue;
        }
      }
    }

    throw new ImageError(
      "Gemini image generation failed",
      "MODEL_ERROR",
      lastError
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

### Steg 4: Oppdater `getImageClient()`

```typescript
export function getImageClient(): ImageClient {
  if (process.env.FAKE_LLM === "true") {
    return new MockImageClient();
  }

  const provider = process.env.IMAGE_PROVIDER ?? "gemini";

  if (provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not set, falling back to OpenAI");
      return getOpenAIImageClient();
    }

    return new GeminiImageClient({
      apiKey,
      model: process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image-preview",
      aspectRatio: process.env.GEMINI_ASPECT_RATIO ?? "16:9",
      imageSize: process.env.GEMINI_IMAGE_SIZE ?? "2K",
    });
  }

  return getOpenAIImageClient();
}

function getOpenAIImageClient(): ImageClient {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("No image generation API key configured");
  }

  return new OpenAIImageClient({
    apiKey,
    model: process.env.OPENAI_IMAGE_MODEL ?? "dall-e-3",
    size: (process.env.OPENAI_IMAGE_SIZE as "1024x1024" | "1792x1024") ?? "1792x1024",
    quality: (process.env.OPENAI_IMAGE_QUALITY as "standard" | "hd") ?? "standard",
  });
}
```

### Steg 5: Oppdater `image-generation.ts`

Minimal endring - fjern download-steg når vi allerede har signert URL:

```typescript
// I generateSlideImage():
// Sjekk om result.url allerede er en S3 signed URL (fra Gemini)
// eller om vi må downloade og re-uploade (fra DALL-E)
const isAlreadyPersisted = result.url.includes(process.env.S3_BUCKET ?? 'gamma-klone');

if (isAlreadyPersisted) {
  return {
    slideIndex,
    imageUrl: result.url,
    prompt,
    revisedPrompt: result.revisedPrompt,
  };
}

// DALL-E path: download and upload
const imageBuffer = await downloadImage(result.url);
const s3Key = generateImageKey(deckId, slideIndex);
await uploadFile(s3Key, imageBuffer, "image/png");
const persistedUrl = await generateSignedUrl(s3Key, 86400 * 7);
// ...
```

## Testing

### Unit Tests
1. `GeminiImageClient` konstruksjon med config
2. Base64 → Buffer konvertering
3. Error handling for ulike feiltyper
4. Style modifiers anvendes korrekt

### Integration Tests
1. Generer faktisk bilde med test-prompt
2. Verifiser S3 upload fungerer
3. Verifiser signert URL er tilgjengelig
4. Test fallback til OpenAI

### Smoke Tests
1. Full deck-generering med `imageMode: "ai"`
2. Verifiser alle eligible slides får bilder
3. Verifiser bildene vises korrekt i UI

## Miljøvariabler - Komplett liste

```env
# Primary image provider
IMAGE_PROVIDER="gemini"  # "gemini" | "openai"

# Gemini Configuration
GEMINI_API_KEY="AIzaSy..."
GEMINI_IMAGE_MODEL="gemini-3-pro-image-preview"
GEMINI_ASPECT_RATIO="16:9"
GEMINI_IMAGE_SIZE="2K"

# OpenAI Configuration (fallback)
OPENAI_API_KEY="sk-..."
OPENAI_IMAGE_MODEL="dall-e-3"
OPENAI_IMAGE_SIZE="1792x1024"
OPENAI_IMAGE_QUALITY="standard"
```

## Risiko og mitigering

| Risiko | Mitigering |
|--------|------------|
| Gemini API ustabil | Fallback til OpenAI |
| Base64 decode feil | Validering av response format |
| Høyere latency | Parallel generering der mulig |
| Content policy blocks | Graceful skip som nå |
| Rate limiting | Exponential backoff med retry |

## Estimert arbeidsmengde

| Oppgave | Estimat |
|---------|---------|
| SDK installasjon | 5 min |
| GeminiImageClient | 30 min |
| getImageClient oppdatering | 15 min |
| image-generation.ts oppdatering | 15 min |
| Miljøvariabler | 10 min |
| Testing | 30 min |
| **Total** | **~2 timer** |

## Neste steg

1. Godkjenn denne planen
2. Installer `@google/genai` SDK
3. Implementer `GeminiImageClient`
4. Test med oppgitt API-nøkkel
5. Verifiser full deck-generering fungerer
