# Notatki Claude — Stan projektu i co dalej z checklistą

*Ostatnia aktualizacja: 2026-02-24*

---

## ✅ Co zostało zrobione (ostatnia sesja)

### 1. `services/faqSearch.ts` — pełny rewrite silnika wyszukiwania
- **Problem**: 20/28 pytań offline chatu dawało złe wyniki
- **Fix**:
  - Lata (1900–2099) nie są już traktowane jako kody błędów
  - "100", "450" (procenty/kwoty) odfiltrowane
  - "KSeF", "XML", "XSD" → damping 0.15 (nie dominują wyników)
  - `questionSimilarity()` — Jaccard overlap boost dla podobnych pytań
  - `CURATED_BOOST 1.12x` — ręcznie opisane FAQ > GEN_ entries
  - Fuzzy matching na stemowanych tagach
- **Wynik**: **27/27 testów zaliczonych**

### 2. `services/geminiService.ts` — upgrade + RAG injection
- Zmiana modelu: `gemini-3-pro-preview` (checklista) + `gemini-3-flash-preview` (chat)
- RAG: `buildKnowledgeBase()` — dla każdej z 11 sekcji pobiera top-2 FAQ z faqSearch
- Naprawiony `KSEF_CONTEXT`:
  - 21133 = NIEZGODNOŚĆ ZE SCHEMĄ FA(3) (NIE błąd NIP!)
  - 21132 = brak uprawnień tokena
  - 429 = Rate Limit → Exponential Backoff
- Prompt wymaga: min. 1 zadanie critical na sekcję, FA(3)/QR/Offline24/Podmiot3

### 3. `components/TaskItem.tsx` — uproszczenie do "prawdziwej checklisty"
- Usunięto: watermark (numer 8rem w tle), dependencies, scale/ring/pulse efekty
- Opis zadania: domyślnie ukryty, otwierany chevronem ▼
- Lewy niebieski pasek = "następne zadanie" (zamiast całego podświetlenia)
- Badge priorytetu: łagodniejsze kolory (bg-red-100, bg-orange-100, itd.)
- Layout: `☐ 01 [Tytuł..................] [CRITICAL] 🤖 2h D+14 ✏️ ▼`

### 4. `components/FAQChatbot.tsx` — drobne UX
- Suggested questions chips przy starcie (6 gotowych pytań)
- ESC zamyka chatbot
- Pogrubienie `**tekstu**` w odpowiedziach bota

---

## 🔧 Co jeszcze można zrobić w checkliście

### Priorytet WYSOKI
1. **Export do PDF** — brakuje możliwości pobrania/wydrukowania checklisty
   - Biblioteka: `jsPDF` + `html2canvas` lub CSS `@media print`
   - Przydatne dla klientów biur rachunkowych

2. **Lead magnet na punchlineroi.com**
   - W repo `deokateoer1/PUNCHLINE-SKLEP` jest placeholder `checklist.html`
   - Opcja A: iframe do checklist buildra
   - Opcja B: statyczna wersja HTML z formularzem zbierającym email przed dostępem
   - Opcja C: `<script>` ładujący widget z CDN (brak hostingu = brak opcji)
   - **Rekomendacja**: Opcja B — email gate przed checklista

3. **UserProfileForm** — ekran wejściowy wygląda jak formularz, a nie landing
   - Dodać nagłówek sprzedażowy / wartości
   - Progress steps (Krok 1/3: profil → 2/3: analiza → 3/3: checklista)

### Priorytet ŚREDNI
4. **Filtry w checkliście** — filtrowanie po sekcji, priorytecie, "tylko automatable"
5. **Progress ring / pasek postępu** — wizualny procent ukończenia (jest tekst, brak grafikę)
6. **Mobile RWD** — sprawdzić czy layout działa na telefonie (TaskItem jest ciasny)
7. **"Ulubione" / Gwiazdka** — oznaczanie zadań do szybkiego przeglądu
8. **Tryb Bulk → porównanie branż** — tabela side-by-side dla biur rachunkowych (jest generowanie, brakuje porównania)

### Priorytet NISKI
9. **Drag & drop reordering** — ręczne przestawianie kolejności zadań
10. **Dark mode toggle** — (jest wsparcie klas dark:, brak przełącznika w UI)
11. **Onboarding tooltip** — pierwszy raz? Mini-tour po funkcjach
12. **Search w checkliście** — fulltext search po tytułach/opisach zadań

---

## 🏗️ Architektura — rzeczy techniczne do przemyślenia

- **Stan aplikacji** (`useChecklist` context) — działa, ale duże re-rendery
- **localStorage persistence** — jest, ale brak wersjonowania (jeśli typy się zmienią → crash)
- **Gemini API key** — `process.env.API_KEY` hardcoded, brak UI do wpisania klucza
- **Robot Zwiadowca (localhost:8000)** — integracja jest tylko "na papierze" w UI, brak prawdziwego fetchowania z portu 8000

---

## 💡 Refleksje

Baza wiedzy (faqSearch + faqDatabase) jest **najmocniejszą częścią projektu** — 2596 wpisów, dobra jakość, działający BM25-like scoring. To solidna podstawa do AI-powered FAQ.

Checklista sama w sobie jest dobrym narzędziem, ale UI/UX potrzebuje jednej sesji "polish sprint" zanim trafi do klientów.

**Następny naturalny krok** (poza robotem): email gate przed checklistą + deploy na punchlineroi.com jako lead magnet.

---

*Notatki generowane przez Claude Sonnet podczas sesji pracy nad projektem.*
