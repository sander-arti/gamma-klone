# UI-UX.md — ARTI Decks (MVP)
**Versjon:** 1.0  
**Dato:** 2025-12-15  
**Mål:** Dette dokumentet er “kilde-sannhet” for visuell retning, UX-prinsipper og branding for **ARTI Decks**.  
**Designambisjon:** Elegant, “fancy”, litt Apple-lignende — men ekstremt enkelt å bruke.

---

## 1. Nordstjerne (North Star)
ARTI Decks skal føles som et **premium produkt**: rolig, presist og selvsikkert. Brukeren skal oppleve at:
- **Alt er enkelt** (minst mulig å tenke på)
- **Alt er konsekvent** (ingen “random” UI)
- **Alt ser proft ut** (som om en designer har vært involvert i hver detalj)
- **Alt går fort** (UI skal føles lett og responsiv)

> **Kvalitetsregel:** Hvis en skjerm eller komponent føles “litt rotete” — fjern eller forenkle.

---

## 2. Brand DNA (ARTI Decks)

### 2.1 Navn og tagline (forslag)
- **ARTI Decks**
- Tagline-varianter:
  - “Presentasjoner som ser proffe ut – automatisk.”
  - “Fra notater til slides med klasse.”
  - “Slides på norsk. Design som sitter.”

### 2.2 Personlighet
- **Profesjonell** (ikke leken)
- **Rolig** (ingen stress, ingen støy)
- **Presis** (klare valg, ingen overforklaring)
- **Nordisk** (minimal, ren, kvalitetsfølelse)

### 2.3 Tone of voice (tekst i appen)
- Kort, aktivt, konkret.
- Unngå hype-ord (“magisk”, “revolusjonerende”).
- Bruk ord som: “Lag”, “Generer”, “Forhåndsvis”, “Last ned”, “Del”.

**Eksempler (mikrotekst):**
- “Lim inn notatene dine, så lager vi en presentasjon som ser bra ut.”
- “Vil du ha kortere slides? Velg *Kortfattet*.”
- “Dette ble for mye tekst. Skal vi dele sliden i to?”

---

## 3. UX-prinsipper (Apple-ish, men ARTI)

### P1: Klarhet foran alt
- Bruker skal alltid forstå:
  1) Hvor er jeg?
  2) Hva kan jeg gjøre her?
  3) Hva skjer hvis jeg klikker?

**Konsekvens:** Bruk tydelige knapper og etiketter. Unngå “kreative” navn.

### P2: Diskresjon (UI skal ikke konkurrere med innholdet)
- UI skal være rolig; presentasjonen er helten.
- Ikke overdrevne skygger, sterke farger eller unødvendige effekter.

### P3: Dybde (subtil, men nyttig)
- Bruk dybde for hierarki (kort, modaler, sidepanel).
- Dybde skal hjelpe orientering, ikke være pynt.

### P4: Progressive disclosure
- Vis det viktigste først.
- Avanserte valg skal være tilgjengelige, men ikke i veien.

**MVP-regel:** Standardvisning = 1–2 valg. Resten bak “Avansert”.

### P5: “Default til riktig”
- Brukeren skal få et godt resultat uten å endre noe.
- Standarder skal være optimalisert for norsk: kortere tekst, ryddig struktur.

### P6: Ett hovedmål per skjerm
- Hver skjerm har én primærhandling (Primary CTA).
- Sekundærhandlinger skal ikke stjele fokus.

---

## 4. Informasjonsarkitektur (MVP)
MVP skal føles “lett” og fokusert.

### 4.1 Navigasjon
- **Venstremeny (minimalt):**
  - Mine presentasjoner
  - Ny presentasjon
  - (Valgfritt) Maler
  - (Valgfritt) Brand kit
  - (Valgfritt) API

**MVP-anbefaling:** Start med kun **Mine** + **Ny**. Alt annet kan ligge som lenker i profilmeny.

### 4.2 Opprettelsesflyt (Create flow)
**3-stegs wizard** (alt på én side, men med tydelige steg):
1) **Input**
2) **Outline**
3) **Design & Generer**

> Viktig: Brukeren skal aldri føle at de “forlater” flyten.

---

## 5. Skjermspesifikke UX-regler

### 5.1 Start / Ny presentasjon
**Mål:** Mest mulig fokus på input-feltet.

**UI:**
- Stor, enkel prompt/tekst-boks (hero).
- Under: 3–5 “quick chips” (f.eks. “Møtereferat”, “Pitch”, “Statusrapport”).
- En tydelig Primary CTA: **“Lag outline”**.

**Avansert (collapsible):**
- Språk (default norsk)
- Lengde (Kortfattet / Standard / Utfyllende)
- Bilder (Av / På)
- Mal (dropdown)
- Antall slides (valgfritt)

**Tomtilstandstekst (eksempel):**
- “Lim inn notater eller skriv hva du vil lage. Vi ordner resten.”

### 5.2 Outline-skjerm
**Mål:** Bruker får kontroll på struktur før generering.

**UI:**
- Liste med slides (tittel + 1–2 stikkord).
- Drag-and-drop rekkefølge.
- Hurtigknapper: “+ Ny slide”, “Slett”, “Dupliser”.
- Primary CTA: **“Generer presentasjon”**.

**Guardrails i UI:**
- Hvis outline blir for lang: foreslå “Slå sammen” eller “Kort ned”.

### 5.3 Genereringsstatus (loading)
**Mål:** Opplevd fart og trygghet.

**Må-ha:**
- Tydelig status (“Lager outline…”, “Designer slides…”, “Eksporterer…”).
- Progress bar eller stegindikator (ikke stå og spinne uten forklaring).
- Vis “tips” i små setninger, ikke lange avsnitt.

**Ikke gjør:**
- Ikke lås UI helt uten forklaring.
- Ikke vis tekniske feilmeldinger.

### 5.4 Viewer/Editor (etter generering)
**Mål:** Brukeren skal kunne “polere” raskt uten å ødelegge design.

**Layout (MVP):**
- Venstre: slide-liste (mini thumbnails eller titler)
- Midten: slide canvas
- Høyre: inspector (kontekstbasert)

**Toppbar:**
- “Del”
- “Last ned”
- “Tema”
- “AI” (agent-handlinger)

**AI-handlinger (MVP):**
- Per slide: “Kortere”, “Mer profesjonell”, “Gjør om til bullets”, “Regenerer bilde”
- Hele deck: “Kort ned deck”, “Legg til slide…”

**Overflyt-håndtering:**
- Hvis teksten blir for lang: vis en rolig advarsel:
  - “Dette ble litt mye tekst. Vil du korte ned eller dele sliden i to?”
- Tilby 2 knapper: “Kort ned” (primary) / “Del i to” (secondary)

### 5.5 Deling
**Mål:** Deling uten stress.

**UI:**
- Ett valg: “Alle med lenken kan se”
- “Kopier lenke” med tydelig bekreftelse (“Kopiert”)

### 5.6 Eksport (PDF/PPTX)
**Mål:** Gjør eksport til en trygg og premium opplevelse.

**UI:**
- To store valg: “PowerPoint (.pptx)” og “PDF”
- Vis “forventning” i én setning:
  - PPTX: “Redigerbar i PowerPoint”
  - PDF: “Perfekt til deling og utskrift”

---

## 6. Visuell retning (design system)

### 6.1 Typografi
**Mål:** Moderne, lesbar, profesjonell.

**Anbefaling (web):**
- Bruk systemfont-stack eller Inter:
  - `font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Inter, Roboto, Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";`
- Unngå å “etterligne” Apple ved å bruke SF Pro direkte (lisens/tilgjengelighet).

**Størrelseshierarki (forslag):**
- Display: 32–40
- H1: 24–28
- H2: 18–20
- Body: 15–16
- Small: 13–14

**Regel:** Maks 2 font-vekter per skjerm (f.eks. Regular + Semibold).

### 6.2 Farger
**Mål:** Nøytralt og premium; aksentfarge brukes sparsomt.

**Base:**
- Bakgrunn: lys, nesten hvit
- Overflater: hvit / litt grå
- Tekst: dyp grå/svart

**Aksent:**
- En tydelig aksentfarge (f.eks. kald blå) til primary CTA og fokus.

**Regler:**
- Ikke bruk mer enn 1 aksentfarge i samme view.
- Bruk farge til status (success/warn/error) kun når nødvendig.

### 6.3 Spacing og grid
- 8px grid.
- Standard spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48.
- Store flater og luft er en del av “fancy”.

### 6.4 Radius, skygger, glass
- Border radius: 10–14 (premium “card” feel)
- Skygger: svært subtile (ikke “material heavy”)
- Glassmorphism: kun hvis det er ekstremt subtilt (helst ikke i MVP)

### 6.5 Ikoner og illustrasjoner
- Ikoner: tynne line-icons (konsistent stroke)
- Illustrasjoner: abstrakte gradienter eller enkle former (ikke cartoon)
- Bilder i slides: enten AI-bilder med definert stil eller stock. UI skal ikke være billedtung.

### 6.6 Dark mode
- MVP kan lanseres i light mode først, men design tokens skal støtte dark mode senere.
- Ikke bygg “hardcoded” farger.

---

## 7. Komponentstandarder (UI patterns)

### 7.1 Knapper
- **Primary:** solid, aksentfarge, høy kontrast
- **Secondary:** outline eller lett grå surface
- **Ghost:** tekstknapp med hover
- **Destructive:** rød, men kun der det er reelt farlig (slette deck)

**Regel:** Én Primary CTA per skjerm.

### 7.2 Inputfelt
- Store, komfortable input (spesielt prompt/notater).
- Placeholder skal være nyttig (eksempeltekst).
- Fokus-state tydelig (aksent outline).

### 7.3 Chips / presets
- Bruk chips til “Møtereferat”, “Pitch”, “Status” osv.
- Chips skal være optional, ikke kreves.

### 7.4 Toasts / feedback
- Bruk toasts for:
  - “Lenke kopiert”
  - “Eksport startet”
  - “Eksport klar”
- Varighet 3–5 sek. Ingen aggressive animasjoner.

### 7.5 Modaler
- Bruk modaler for:
  - Deling
  - Eksport
  - Bekreft sletting
- Modaler skal være små og konkrete.

---

## 8. Mikrointeraksjoner og “delight”
Eleganse kommer av subtilitet:
- Hover states som føles myke (200–250ms)
- Fine focus rings
- Skeleton loading i stedet for blank side
- Små “success” states (✅) uten konfetti

**Ikke gjør:**
- Konfetti, store feiringer, lyder, flashy overganger i MVP.

---

## 9. Innhold/Copy (norsk-first)

### 9.1 Språk
- Bokmål i MVP.
- Bruk konsekvent terminologi:
  - “Presentasjon” (ikke “deck” i UI)
  - “Slide” kan brukes, men “lysbilde” er mer norsk (velg én og hold deg til den)
  - “Mal” (template)
  - “Tema” (theme)

**Anbefaling:** Bruk “Slide” i UI (folk flest kjenner det), men bruk “Presentasjon” for helheten.

### 9.2 Copy-regler
- Kortere setninger.
- Ikke mer enn 1–2 setninger i hjelpetekst.
- Error-meldinger: “Hva skjedde?” + “Hva kan jeg gjøre?”

**Eksempel error:**
- “Vi klarte ikke å generere presentasjonen. Prøv igjen, eller velg *Kortfattet*.”

---

## 10. Tilgjengelighet (A11y)
- Alle interaktive elementer skal kunne brukes med tastatur.
- Synlig fokus (ikke fjern outline uten erstatning).
- Kontrast: sørg for lesbarhet på knapper og tekst.
- Klikkområder: minst 44px høyde på viktige touch targets.

---

## 11. “Premium bar” — UI review checklist
Bruk denne sjekklisten før dere anser en UI-endring som ferdig:

1) Er det **én tydelig primærhandling**?
2) Er språket **kort, norsk og tydelig**?
3) Er spacing og alignment **perfekt** (ingen “nesten”)?
4) Føles komponentene **konsistente** med resten?
5) Er loading states og errors **trygge og rolige**?
6) Føles det “Apple-ish” (= diskret, presist, rolig) — uten å kopiere?
7) Er det **mindre enn før**? (forenkling over tid)

---

## 12. Implementeringshint (for utviklere/Claude Code)
- Bruk design tokens (CSS variables) fra dag 1.
- Unngå hardkodede farger; alt går via tokens.
- Bygg UI med “progressive disclosure”: standard + avansert.
- Prioritér det som føles premium:
  - typografi
  - spacing
  - states (hover/focus/loading)
  - microcopy

**Hvis dere må velge:**  
✅ Kvalitet i layout og tekst > flere funksjoner.

---
