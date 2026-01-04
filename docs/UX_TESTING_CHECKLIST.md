# UX Testing Checklist - Fase 1: Brukervennlige Feilmeldinger

**Dato:** 2026-01-04
**Scope:** Testing av UX-forbedringer implementert i Fase 1
**Status:** Klar for manuell testing

## Oversikt

Denne sjekklisten dekker testing av:
1. Brukervennlige feilmeldinger (norske, handlingsrettede)
2. Success feedback (toasts for kritiske handlinger)
3. Loading states (beskrivende norske labels)
4. Context-aware help (tooltips og expandable help for violations)

---

## 1. Brukervennlige Feilmeldinger

### Test 1.1: Generering med ugyldig API key
**Formål:** Verifiser at brukere ser norsk feilmelding, ikke teknisk error code.

**Steg:**
1. Fjern/invalider OpenAI API key i `.env`
2. Gå til `/new`
3. Skriv inn et prompt og prøv å generere presentasjon
4. **Forventet resultat:**
   - ✅ Ser norsk feilmelding: "AI-tjenesten er midlertidig utilgjengelig"
   - ✅ Ser recovery actions: "Prøv igjen om noen sekunder", "Kontakt support..."
   - ✅ Knapper: "Prøv igjen" og "Gå tilbake"
   - ❌ IKKE teknisk: "MODEL_ERROR" eller "500"

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

### Test 1.2: Rate limiting (429 error)
**Formål:** Verifiser at rate limit errors vises brukervennlig.

**Steg:**
1. Trigger rate limit (send mange requests raskt)
2. **Forventet resultat:**
   - ✅ Ser: "For mange forespørsler"
   - ✅ Recovery: "Vent 1-2 minutter før du prøver igjen"
   - ✅ Feiltype: Midlertidig (isTemporary: true)

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

### Test 1.3: Generering med tomt prompt
**Formål:** Verifiser validering av input.

**Steg:**
1. Gå til `/new`
2. La prompt-feltet være tomt eller kun whitespace
3. Klikk "Generer"
4. **Forventet resultat:**
   - ✅ Ser: "Ugyldig forespørsel"
   - ✅ Recovery: "Sjekk at alle felt er fylt ut korrekt"

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

## 2. Success Feedback (Toasts)

### Test 2.1: Auto-save success
**Formål:** Verifiser at brukere får bekreftelse når deck lagres.

**Steg:**
1. Åpne en presentasjon i editor (`/deck/[id]`)
2. Gjør en endring (f.eks. rediger tittel)
3. Vent 3 sekunder (auto-save delay)
4. **Forventet resultat:**
   - ✅ Ser grønn toast: "Lagret" (2s duration)
   - ✅ Toast forsvinner automatisk etter 2 sekunder

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

### Test 2.2: AI action success - Kort ned
**Formål:** Verifiser toast ved vellykket AI-shortening.

**Steg:**
1. Opprett slide med for lang tekst (trigger constraint violation)
2. Klikk AI-knappen (lightbulb icon)
3. Velg "Kort ned"
4. **Forventet resultat:**
   - ✅ Ser grønn toast: "Slide kortet ned" (2s duration)
   - ✅ Teksten er faktisk forkortet

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

### Test 2.3: AI action success - Del i to
**Formål:** Verifiser toast ved vellykket slide splitting.

**Steg:**
1. Opprett slide med mye innhold
2. Klikk AI-knappen
3. Velg "Del i to"
4. **Forventet resultat:**
   - ✅ Ser grønn toast: "Slide delt i to" (2s duration)
   - ✅ En ny slide er opprettet

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

### Test 2.4: Share success
**Formål:** Verifiser toast ved deling.

**Steg:**
1. Åpne editor
2. Klikk "Del" knappen
3. Klikk "Kopier lenke"
4. **Forventet resultat:**
   - ✅ Ser toast: "Delingslenke kopiert"
   - ✅ Lenke er i clipboard

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

### Test 2.5: Export success
**Formål:** Verifiser toast ved eksport.

**Steg:**
1. Åpne editor
2. Klikk "Eksporter"
3. Velg format (PDF eller PPTX)
4. Klikk "Eksporter"
5. **Forventet resultat:**
   - ✅ Ser toast: "Eksport startet"
   - ✅ Toast med link når klar: "Eksport klar - Last ned"

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

## 3. Loading States (Accessibility)

### Test 3.1: Outline generation loading
**Formål:** Verifiser beskrivende loading label for screen readers.

**Steg:**
1. Gå til `/new`
2. Skriv prompt
3. Klikk "Neste"
4. **Forventet resultat:**
   - ✅ Ser LoadingSpinner
   - ✅ Tekst: "Genererer outline..."
   - ✅ Screen reader leser: "Genererer outline" (aria-label)

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

### Test 3.2: Deck loading
**Formål:** Verifiser loading state når deck lastes.

**Steg:**
1. Naviger til `/deck/[id]`
2. Observér loading state
3. **Forventet resultat:**
   - ✅ Ser LoadingSpinner
   - ✅ Tekst: "Laster presentasjon..."
   - ✅ Screen reader leser: "Laster presentasjon" (aria-label)

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

### Test 3.3: AI actions loading
**Formål:** Verifiser loading state under AI-actions.

**Steg:**
1. Klikk AI-knappen (lightbulb)
2. Velg "Kort ned"
3. Observér loading state
4. **Forventet resultat:**
   - ✅ Knapp viser spinner + "Forkorter..."
   - ✅ Screen reader leser: "Forkorter" (aria-label)

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

### Test 3.4: Save loading
**Formål:** Verifiser loading state ved lagring.

**Steg:**
1. Gjør en endring i editor
2. Vent på auto-save (3s)
3. Observér SaveStatus komponent
4. **Forventet resultat:**
   - ✅ Ser "Lagrer..." med spinner
   - ✅ Screen reader leser: "Lagrer" (aria-label)

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

## 4. Context-Aware Help (Constraint Violations)

### Test 4.1: Tooltip på hover
**Formål:** Verifiser at tooltip vises ved hover over info-ikon.

**Steg:**
1. Opprett slide med for lang tittel (>120 tegn)
2. Observér rød warning: "Innhold overskrider grensene"
3. Hover over info-ikon (ⓘ)
4. **Forventet resultat:**
   - ✅ Tooltip vises etter 500ms
   - ✅ Tooltip tekst: "Teksten er for lang til å vises pent på slide"
   - ✅ Tooltip forsvinner ved mouse-leave

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

### Test 4.2: Expandable help - max_chars
**Formål:** Verifiser full help-seksjon for max_chars violation.

**Steg:**
1. Opprett slide med for lang tittel
2. Klikk på info-ikon (ⓘ)
3. **Forventet resultat:**
   - ✅ Help-seksjon ekspanderer (bg-red-100)
   - ✅ Seksjon "Hvorfor er dette begrenset?": "Lange tekster blir vanskelig å lese..."
   - ✅ Seksjon "Hva kan du gjøre?":
     - "Bruk AI-knappen for å automatisk korte ned teksten"
     - "Flytt noe innhold til en ny slide (del i to)"
     - "Fjern mindre viktige detaljer manuelt"

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

### Test 4.3: Expandable help - max_items
**Formål:** Verifiser help for bullet overflow.

**Steg:**
1. Opprett slide med >8 bullets
2. Klikk info-ikon
3. **Forventet resultat:**
   - ✅ "Hvorfor er dette begrenset?": "Slides med mange punkter blir rotete..."
   - ✅ Suggestions:
     - "Del punktene over flere slides"
     - "Slå sammen relaterte punkter"
     - "Flytt mindre viktige punkter til notater"

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

### Test 4.4: Expandable help - max_rows
**Formål:** Verifiser help for table overflow.

**Steg:**
1. Opprett slide med tabell >10 rader
2. Klikk info-ikon
3. **Forventet resultat:**
   - ✅ "Hvorfor er dette begrenset?": "Tabeller med mange rader må krympes..."
   - ✅ Suggestions:
     - "Del tabellen over flere slides"
     - "Vis kun de viktigste radene"
     - "Bruk et visuelt chart i stedet"

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

### Test 4.5: Toggle help visibility
**Formål:** Verifiser at help kan toggles av/på.

**Steg:**
1. Opprett constraint violation
2. Klikk info-ikon → help ekspanderer
3. Klikk info-ikon igjen
4. **Forventet resultat:**
   - ✅ Help-seksjon kollapser (forsvinner)
   - ✅ Kan re-expandere ved nytt klikk

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

## 5. Cross-Browser Testing

### Test 5.1: Chrome
**Steg:** Kjør alle tester over i Chrome
**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

### Test 5.2: Firefox
**Steg:** Kjør alle tester over i Firefox
**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

### Test 5.3: Safari
**Steg:** Kjør alle tester over i Safari
**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

## 6. Screen Reader Testing (Accessibility)

### Test 6.1: VoiceOver (macOS)
**Formål:** Verifiser at screen reader kan navigere og forstå UI.

**Steg:**
1. Aktiver VoiceOver (Cmd+F5)
2. Naviger gjennom editor
3. Trigger error → verifiser at error melding leses opp
4. Trigger loading → verifiser at loading label leses opp
5. **Forventet resultat:**
   - ✅ Error messages er lesbare
   - ✅ Loading spinners har korrekt aria-label
   - ✅ Buttons har beskrivende labels
   - ✅ Tooltips er tilgjengelige

**Status:** [ ] Ikke testet | [ ] Passed | [ ] Failed

---

## Oppsummering

**Total tester:** 21
**Passed:** _____
**Failed:** _____
**Ikke testet:** _____

**Kritiske issues funnet:**
- (Liste opp her)

**Nice-to-have forbedringer:**
- (Liste opp her)

---

## Neste Steg

Etter at alle tester er fullført:
1. Dokumenter alle issues funnet i GitHub Issues
2. Prioriter kritiske fixes
3. Planlegg Fase 2: Progress Indicators & Cancel Functionality
