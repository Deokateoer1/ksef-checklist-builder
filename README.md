# KSeF 2.0 Checklist Builder · by PunchlineROI

AI-powered generator spersonalizowanych checklisty wdrożenia KSeF dla biur rachunkowych i działów finansowych.

**Stack:** React 19 | TypeScript | Vite | Tailwind CSS | Gemini AI (@google/genai) | jsPDF | docx

**Wersja produkcyjna:** `http://78.47.99.111:3000`

---

## Co robi aplikacja

Użytkownik wypełnia formularz profilowy (typ firmy, liczba faktur, obecny ERP, poziom zaawansowania), a aplikacja generuje przez Gemini AI **spersonalizowaną checklistę wdrożeniową KSeF** — z zadaniami dostosowanymi do konkretnej organizacji.

### Tryby pracy

| Tryb | Opis |
|------|------|
| **Single** | Generowanie checklisty dla jednej firmy / jednego biura rachunkowego |
| **Bulk** | Generowanie checklisty dla wielu klientów naraz (BulkGenerationForm + BulkProgressModal) |
| **FAQ** | Chatbot wiedzy KSeF — hybrydowy: offline baza + Gemini fallback |
| **Reference** | Dokumentacja referencyjna KSeF w aplikacji (ReferenceDocument) |
| **About Punchline** | Strona o produktach PunchlineROI (AboutPunchline) |

---

## Kluczowe komponenty

### Generowanie i zarządzanie checklistą
| Komponent | Opis |
|-----------|------|
| `OnboardingForm` | Formularz profilowy (krok 1) — zbiera dane do personalizacji |
| `ChecklistDashboard` | Główny widok checklisty z listą zadań, filtrami, postępem |
| `TaskItem` | Karta zadania: priorytet (critical/important/medium), opis (chevron ▼), szacowany czas, badge |
| `ProgressBar` | Wizualny % ukończenia checklisty |
| `BulkGenerationForm` | Formularz do generowania dla wielu klientów jednocześnie |
| `BulkProgressModal` | Modal ze statusem generowania bulk (per klient) |
| `ClientManager` | Zarządzanie listą klientów w trybie bulk |

### Eksport
| Komponent | Opis |
|-----------|------|
| `ChecklistExport` | Eksport checklisty do **PDF** (jsPDF + html2canvas) i **DOCX** (docx.js) |
| `ExportSettingsModal` | Ustawienia eksportu (co uwzględnić, format, logo) |
| `CertificateDownloader` | Pobieranie certyfikatu ukończenia checklisty |

### Widgety analityczne
| Komponent | Opis |
|-----------|------|
| `ComplianceRadar` | Wykres radar (pająk) wskaźników compliance KSeF |
| `RiskEstimatorWidget` | Estymacja poziomu ryzyka wdrożenia |
| `CostCalculatorWidget` | Kalkulator kosztów i ROI automatyzacji KSeF |
| `TaskSummaryWidget` | Podsumowanie zadań (ile critical, ile done, szac. czas) |
| `AlertsPanel` | Panel smart alertów (terminy, ryzyka) |
| `MonitoringPanel` | Status bramki KSeF live |

### Narzędzia KSeF
| Komponent | Opis |
|-----------|------|
| `FA3StructureVisualizer` | Wizualizacja struktury XML FA(3) — pola obowiązkowe vs opcjonalne |
| `NipCorrectionWidget` | Walidacja i korekcja NIP |
| `QRCodeGenerator` | Generator kodów QR dla faktur offline |
| `MathValidationWidget` | Weryfikacja poprawności obliczeń matematycznych w fakturze |
| `OfflineModePanel` | Informacje o trybie Offline24 |
| `TimeoutHandlerWidget` | Obsługa timeoutów KSeF API |
| `AutomationDetailsModal` | Szczegóły automatyzacji danego zadania przez Robot-KSeF |
| `ConnectionModal` | Modal połączenia z Robot-KSeF backend (robotApi.ts) |
| `RobotIntelligenceCenter` | Hub integracji z Robot-KSeF |
| `RobotBadge` | Badge "Automatyzowane przez Robot-KSeF" na zadaniach |

### FAQ i wiedza
| Komponent | Opis |
|-----------|------|
| `FAQChatbot` | Chatbot hybrydowy: offline faqSearch → Gemini fallback — **27/27 testów zaliczonych** |
| `FAQSection` | Przeglądarka bazy FAQ z wyszukiwarką |
| `LandingPage` | Landing view (widok startowy alternatywny) |

---

## Baza wiedzy FAQ

| Plik | Zawartość |
|------|-----------|
| `data/faqDatabase.ts` | Główna baza FAQ — podstawy KSeF |
| `data/faqGeneratedKSeF.ts` | Generowane wpisy FAQ (łącznie ~2596 wpisów) |
| `data/faq_bezpieczenstwo_rodo.ts` | FAQ: bezpieczeństwo i RODO |
| `data/faq_certyfikaty.ts` | FAQ: certyfikaty i tokeny KSeF |
| `data/faq_nowe_zmiany_2026.ts` | FAQ: nowe przepisy i zmiany 2026 |
| `data/staticChecklist.ts` | Statyczna lista zadań (fallback gdy Gemini niedostępny) |

### Silnik wyszukiwania (`services/faqSearch.ts`)
- BM25-like scoring z ważonymi polami (tytuł 2×, tagi 1.5×, treść 1×)
- Damping dla terminów generycznych: KSeF/XML/XSD → 0.15
- Lata (1900–2099) i kwoty (100, 450) odfiltrowywane ze ścieżki kodu błędu
- `questionSimilarity()` — Jaccard overlap boost dla podobnych pytań
- `CURATED_BOOST 1.12×` — ręcznie opisane FAQ wyżej w rankingu
- Fuzzy matching na stemowanych tagach

---

## Serwisy

| Plik | Opis |
|------|------|
| `services/geminiService.ts` | Klient Gemini AI — generowanie checklisty (Pro) + chat (Flash) + RAG z faqSearch |
| `services/faqSearch.ts` | Silnik wyszukiwania offline FAQ |
| `services/robotApi.ts` | Klient HTTP do Robot-KSeF backend (`localhost:8000`) — opcjonalny |

### Modele Gemini
- **Generowanie checklisty**: `gemini-3-pro-preview` (jakość i głębokość personalizacji)
- **Chatbot FAQ**: `gemini-3-flash-preview` (szybkość odpowiedzi)
- **RAG**: dla każdej z 11 sekcji top-2 FAQ z faqSearch wstrzykiwane do promptu

---

## Uruchamianie

```bash
# Dev
npm install
# Ustaw GEMINI_API_KEY w .env.local
npm run dev        # http://localhost:5173

# Build
npm run build      # → dist/

# Produkcja (Docker)
docker build -t ksef-checklist-builder .
docker run -p 3000:80 -e GEMINI_API_KEY=twoj_klucz ksef-checklist-builder
```

### Zmienne środowiskowe

```env
GEMINI_API_KEY=twój_klucz_gemini      # wymagany — AI generowanie + chatbot
VITE_ROBOT_API_URL=http://78.47.99.111:8000  # opcjonalny — integracja z Robot-KSeF
```

---

## Integracja z Robot-KSeF

Aplikacja może łączyć się z backendem Robot-KSeF przez `services/robotApi.ts`:
- `ConnectionModal` — UI do podania URL backendu
- `RobotIntelligenceCenter` — widok danych z backendu
- `AutomationDetailsModal` — które zadania z checklisty Robot może zautomatyzować

W produkcji: backend dostępny pod `http://78.47.99.111:8000`

---

## Deploy (produkcja — Hetzner VPS)

Aplikacja uruchamiana przez `docker-compose.yml` w repozytorium `Robot-KSeF`:

```yaml
checklist:
  profiles: ["full"]
  build:
    context: ../ksef-checklist-builder
    args:
      VITE_ROBOT_API_URL: http://78.47.99.111:8000
      GEMINI_API_KEY: ${GEMINI_API_KEY}
  ports:
    - "3000:80"
```

Dostępna pod: **http://78.47.99.111:3000**

---

## Lead Magnet na punchlineroi.com

Planowane integracje z landing page (`PUNCHLINE-SKLEP/index.html`):

- **Opcja A**: iframe do Checklist Buildera (port 3000)
- **Opcja B** *(rekomendowana)*: email gate przed checklistą — formularz zbiera email, po zapisie dostęp do pełnej checklisty
- **Opcja C**: statyczna wersja HTML `checklist.html` na Netlify (bez AI, bez personalizacji)

---

## Co zostało zrobione (ostatnia sesja)

- `faqSearch.ts` — pełny rewrite silnika; **27/27 testów zaliczonych**
- `geminiService.ts` — upgrade modeli + RAG injection (top-2 FAQ per sekcja)
- `TaskItem.tsx` — uproszczony layout, opis domyślnie ukryty, łagodniejsze kolory
- `FAQChatbot.tsx` — suggested questions chips, ESC zamyka, bold `**tekst**`

---

## Zmiany v2.9 Standard (sesja QA-Engineering)

### Poprawki UX i bugfixy

#### `PUNCHLINE-SKLEP/index.html`
- Przycisk nawigacyjny zmieniony z `"OTRZYMAJ DEMO"` (modal) na `"PANEL KLIENTA"` (link `https://app.punchlineroi.com`, target `_blank`)

#### `components/BulkGenerationForm.tsx`
- Zastąpiono `window.alert()` inline komunikatem błędu walidacji (`validationError` state)
- Dodano wyświetlanie błędów API z kontekstu (`error` z `useChecklist`)
- Przycisk submit: loader + tekst `"GENERUJĘ..."` podczas `isLoading`
- Czerwony ring na siatce branż gdy błąd walidacji (visual feedback)
- Pełne wsparcie dark mode

#### `components/ChecklistDashboard.tsx`
- **Ghost state fix**: dodano `useEffect` synchronizujący `activeIndustry` z `bulkTasks` — po zakończeniu generowania bulk zakładki branż teraz pojawiają się automatycznie
- **768px responsywność**: główny grid uzyskał `md:grid-cols-12`; kolumny mają teraz klasy `md:col-span-*` (2-kolumnowy layout na tablecie, 3-kolumnowy na desktopie 1024px+)
- **Overflow fix**: `overflow-x-hidden` na głównym kontenerze
- **Przyciski wolumenu faktur**: `grid-cols-4` → `grid-cols-2 sm:grid-cols-4` (brak overflow na małych ekranach)

#### `components/ChecklistExport.tsx`
- Dodano `exportingFormat: 'pdf' | 'docx' | null` — przyciski PDF/DOCX pokazują spinner podczas generowania
- Dodano `exportError` state — inline czerwony baner zamiast `window.alert()`
- `showError(msg)` z auto-zniknięciem po 5 sekundach
- `finally` bloki gwarantują reset stanu loadera nawet przy błędzie

#### `components/FAQChatbot.tsx`
- **localStorage**: tryb AI (`isDeepSearch`) persystowany jako `ksef_chat_aiMode`; sub-tryb (`aiMode`) jako `ksef_chat_subMode` — zachowane po odświeżeniu strony
- **Przycisk minimize** (−/⤡) w headerze — zwinięty widok pokazuje tylko header z nazwą i statusem
- **Error handling AI**: błędy kategoryzowane na: brak klucza API (401/403), limit zapytań (429), brak sieci (fallback do offline); przy błędzie sieci `isDeepSearch` jest automatycznie wyłączane bez utraty historii czatu
- `void sendMessage(question)` przy kliknięciu chipa — brak Unhandled Promise Rejection

#### `services/geminiService.ts`
- Modele zaktualizowane: `gemini-3-pro-preview` (generowanie) + `gemini-3-flash-preview` (chat)
- `askGeminiKSeF` teraz rzuca oryginalny błąd zamiast zwracać string — umożliwia poprawną kategoryzację błędów w `FAQChatbot.tsx`

## Co można jeszcze zrobić

| Priorytet | Zadanie |
|-----------|---------|
| ⚡ Wysoki | Email gate przed checklistą (lead magnet) |
| 🟡 Średni | Progress ring (graficzny, nie tylko tekst) |
| 🟡 Średni | Filtry w checkliście (sekcja, priorytet, automatable) |
| 🟢 Niski | Search po tytułach/opisach zadań |
| 🟢 Niski | Testy E2E (Playwright/Cypress) dla kluczowych ścieżek |

---

## Kontakt

**PunchlineROI** | impact@punchlineroi.com
