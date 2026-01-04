# Kontekst — Fase 2: AI Pipeline

> Logg for arbeid utført i Fase 2.

---

## 2025-12-15 - Fase 2 Komplett

**What:** Fullførte Fase 2: AI Pipeline - LLM-integrasjon, prompts, pipeline-orkestrering og tester

**Why:** Etablere kjerne AI-funksjonalitet for outline-first generering med constraint-validering

**How:**

### LLM-klient (T2.1)
- Implementerte `LLMClient` interface i `src/lib/ai/llm-client.ts`
- OpenAI SDK integrasjon med retry-logikk og feilhåndtering
- `MockLLMClient` for deterministisk testing (`FAKE_LLM=true`)
- Feiltyper: `MODEL_ERROR`, `INVALID_RESPONSE`, `RATE_LIMITED`, `PARSE_ERROR`

### Prompts (T2.2)
- `src/lib/ai/prompts/outline.ts`: Outline-generering med slide-type forslag
- `src/lib/ai/prompts/content.ts`: Content-generering per slide med constraints
- `src/lib/ai/prompts/repair.ts`: Repair (shorten) og split prompts

### Pipeline (T2.3)
- `src/lib/ai/pipeline.ts`: Hovedorkestrering
  - `generateOutline(request)` → Outline
  - `generateDeck(outline, request)` → Deck
  - `generate(request)` → { outline, deck }
- Validation wrapper i `src/lib/ai/validation.ts`
- Layout assignment i `src/lib/ai/layout.ts`
- Repair-loop med maks 3 forsøk

### Testing (T2.4)
- Golden testdata i `testdata/`
- 78 unit/integrasjonstester:
  - `llm-client.test.ts`: 12 tester
  - `outline.test.ts`: 16 tester
  - `content.test.ts`: 18 tester
  - `repair.test.ts`: 15 tester
  - `pipeline.test.ts`: 17 tester
- Vitest konfigurert med path alias support

**Check:**
- `pnpm test` kjører 78 tester grønt
- `pnpm build` kompilerer uten feil
- Pipeline genererer gyldig DeckSchema fra mock-data

**Filstruktur:**
```
src/lib/ai/
├── llm-client.ts          # OpenAI SDK wrapper + interface
├── mock-llm.ts            # FAKE_LLM fixtures for testing
├── pipeline.ts            # Orkestrering: outline → content → validate → repair
├── validation.ts          # Deck/slide validation wrapper
├── layout.ts              # Layout variant assignment
├── prompts/
│   ├── outline.ts         # Outline generation prompt
│   ├── content.ts         # Slide content prompt
│   └── repair.ts          # Constraint repair/split prompts
└── __tests__/
    ├── llm-client.test.ts
    ├── outline.test.ts
    ├── content.test.ts
    ├── repair.test.ts
    └── pipeline.test.ts

testdata/
├── prompts/
│   ├── short-prompt.txt
│   ├── meeting-notes.txt
│   └── action-items.txt
└── fixtures/
    ├── outline-example.json
    └── deck-example.json
```

**Risks:**
- MockLLMClient returnerer fixture-data, ekte LLM-output kan variere
- Repair-loop har maks 3 forsøk, edge cases kan fortsatt feile

**Neste:** Fase 3 - Jobbkø og API (BullMQ, POST/GET generations endpoints)
