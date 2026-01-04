/**
 * Sample deck content for new user onboarding
 *
 * This content is created automatically when a user signs up to demonstrate
 * the platform's capabilities. All content is in Norwegian.
 */

export const SAMPLE_DECK_CONTENT = {
  title: "Velkommen til ARTI Slides",
  theme_id: "nordic_light",
  language: "no" as const,
  slides: [
    // Slide 1: Title slide
    {
      type: "title" as const,
      blocks: [
        {
          type: "title" as const,
          content: "Velkommen til ARTI Slides",
        },
        {
          type: "subtitle" as const,
          content: "Din AI-drevne presentasjonsassistent",
        },
      ],
    },

    // Slide 2: How it works
    {
      type: "content" as const,
      blocks: [
        {
          type: "title" as const,
          content: "Slik fungerer det",
        },
        {
          type: "bullets" as const,
          items: [
            "Skriv inn tekst eller last opp møtenotater",
            "AI genererer strukturert outline",
            "Godkjenn eller rediger outline",
            "Få ferdig presentasjon på sekunder",
          ],
        },
      ],
    },

    // Slide 3: Powerful features
    {
      type: "content" as const,
      blocks: [
        {
          type: "title" as const,
          content: "Kraftige funksjoner",
        },
        {
          type: "bullets" as const,
          items: [
            "Inline redigering - klikk og endre tekst direkte",
            "Automatisk design - 10 slide-typer med premium layout",
            "PDF og PPTX eksport - last ned og del",
            "API tilgang - integrer i dine verktøy",
          ],
        },
      ],
    },

    // Slide 4: Get started
    {
      type: "content" as const,
      blocks: [
        {
          type: "title" as const,
          content: "Kom i gang",
        },
        {
          type: "bullets" as const,
          items: [
            'Trykk "Lag presentasjon" for å starte',
            "Prøv å redigere denne presentasjonen",
            'Trykk "?" for å se tastatursnarveger',
            "Sjekk innstillinger for API-nøkler og team",
          ],
        },
      ],
    },
  ],
} as const;

export type SampleDeckContent = typeof SAMPLE_DECK_CONTENT;
