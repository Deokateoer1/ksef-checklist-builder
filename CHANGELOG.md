# CHANGELOG — KSeF 2.0 Checklist Builder

---

## v2.9 Standard (2026-02-26) — QA Engineering Session

### 🐛 Bugfixy

#### `PUNCHLINE-SKLEP/index.html`
- **PROBLEM**: Przycisk „OTRZYMAJ DEMO" w navbarze otwierał modal zamiast panelu klienta.
- **FIX**: Zmieniony na `<a href="https://app.punchlineroi.com" target="_blank">🔐 Panel Klienta</a>`.
- **TEST**: Kliknięcie przycisku otwiera nową zakładkę z panelem.

#### `components/ChecklistDashboard.tsx` — ghost state (bulk generation)
- **PROBLEM**: Po zakończeniu generowania bulk, `activeIndustry` state pozostawał `null` mimo że `bulkTasks` zawierał dane — zakładki branż nie były widoczne.
- **FIX**: Dodano `useEffect` synchronizujący `activeIndustry` z `bulkTasks`: `setActiveIndustry(prev => prev && bulkTasks[prev] ? prev : Object.keys(bulkTasks)[0])`.
- **TEST**: Po wygenerowaniu bulk dla 2 branż — zakładki pojawiają się automatycznie bez odświeżania.

#### `components/ChecklistDashboard.tsx` — responsywność 768px
- **PROBLEM**: Główny grid używał `grid-cols-1` na mobile i `lg:grid-cols-12` na desktopie — brak breakpointu `md:`. Na tablecie (768px) kolumny stackowały się nieczytelnie.
- **FIX**: Dodano `md:grid-cols-12` do głównego kontenera; kolumny mają teraz `md:col-span-3/9/12`. Dodano `overflow-x-hidden` do kontenera.
- **TEST**: Na 768px — lewa kolumna zajmuje ~25%, główna kolumna ~75%, prawa kolumna na pełnej szerokości poniżej.

#### `components/ChecklistDashboard.tsx` — przyciski wolumenu faktur
- **PROBLEM**: `grid-cols-4` bez breakpointów — na małych ekranach (<640px) 4 przyciski były ciasne.
- **FIX**: Zmieniono na `grid-cols-2 sm:grid-cols-4`.
- **TEST**: Na 375px — 2 przyciski w wierszu, na 640px+ — 4 przyciski w wierszu.

#### `components/BulkGenerationForm.tsx`
- **PROBLEM**: Walidacja używała `window.alert()` — blokujące, nienowocześnie, bez stylu; brak informacji o błędach API.
- **FIX**: Dodano `validationError` state + czerwony inline baner. Wyświetlane są też błędy z `useChecklist().error`. Submit button pokazuje spinner + `"GENERUJĘ..."` podczas `isLoading`.
- **TEST**: Kliknięcie bez wybrania branż → czerwony komunikat pod headerem, nie alert przeglądarki.

#### `components/ChecklistExport.tsx` — stany loadera i błędów
- **PROBLEM**: Przyciski PDF/DOCX nie dawały żadnego feedbacku podczas generowania; błędy pokazywały się przez `window.alert()`.
- **FIX**: Dodano `exportingFormat: 'pdf' | 'docx' | null` — przyciski pokazują spinner podczas aktywnego eksportu. Dodano `exportError` state z red banerem (auto-ukrycie po 5s). Bloki `finally` gwarantują reset stanu.
- **TEST**: Kliknięcie PDF → przycisk pokazuje spinner i jest wyłączony; po zakończeniu → normalna ikona. Błąd → czerwony baner poniżej.

#### `components/FAQChatbot.tsx` — localStorage + minimize + error handling
- **PROBLEM 1**: Po odświeżeniu strony tryb AI (on/off) i sub-tryb (techniczny/biznesowy) był resetowany.
- **FIX**: `isDeepSearch` inicjalizowany z `localStorage.getItem('ksef_chat_aiMode')`, persystowany przez `useEffect`. `aiMode` analogicznie przez `ksef_chat_subMode`.
- **TEST**: Włącz tryb AI → odśwież → tryb nadal włączony.

- **PROBLEM 2**: Brak możliwości minimalizacji okienka czatu.
- **FIX**: Dodano `isMinimized` state + przycisk (−/⤡) w headerze. Gdy zminimalizowany: widoczny tylko header, body ukryte; `h-auto overflow-visible` zamiast `h-[750px]`.
- **TEST**: Kliknięcie (−) → tylko header widoczny. Kliknięcie (⤡) → pełny czat.

- **PROBLEM 3**: Błędy AI były generyczne (`"Wystąpił błąd komunikacji"`); brak rozróżnienia typów błędów; unhandled rejection przy kliknięciu chipa.
- **FIX**: Catch analizuje `err.message`: 401/403/`API key` → brak konfiguracji API; 429/`quota` → limit wyczerpany; `NetworkError`/`Failed to fetch` → fallback do offline (auto-wyłącza `isDeepSearch`). `void sendMessage(question)` na chip click.
- **TEST**: Błędny klucz API → komunikat „❌ AI nieaktywne — brak lub błędna konfiguracja klucza API".

#### `services/geminiService.ts` — modele i error propagation
- **PROBLEM**: `askGeminiKSeF` łapał błędy wewnętrznie i zwracał string błędu — FAQChatbot nie mógł skategoryzować błędu.
- **FIX**: `catch(error) { throw error; }` — oryginalny błąd propagowany do callera.
- **MODELE**: Zaktualizowane na `gemini-3-pro-preview` (generowanie checklisty) + `gemini-3-flash-preview` (chatbot FAQ).
- **TEST**: Błędny klucz API → FAQChatbot pokazuje kategoryzowany komunikat (nie generyczny string).

---

## Regresje — lista testów (smoke test v2.9)

Po każdej zmianie kodu sprawdź:

| # | Test | Jak testować | Oczekiwany wynik |
|---|------|-------------|-----------------|
| R1 | Landing page — przycisk Panel Klienta | Kliknij `🔐 Panel Klienta` w nav | Otwiera `https://app.punchlineroi.com` w nowej zakładce |
| R2 | Single generation działa | Wybierz profil → Generuj | Lista zadań pojawia się w ciągu 60s |
| R3 | Bulk generation — zakładki | Generuj 2 branże → po zakończeniu | Obie zakładki branż widoczne od razu |
| R4 | Export PDF | Po generowaniu → kliknij PDF | Spinner na przycisku → plik .pdf pobierany |
| R5 | Export JSON | Kliknij JSON | Plik .json pobierany, parsuje się |
| R6 | Chatbot offline | Otwórz chat, pytanie: „kary 2027" | Odpowiedź z bazy wiedzy |
| R7 | Chatbot minimize | Kliknij (−) | Tylko header widoczny |
| R8 | Chatbot localStorage | Włącz AI, odśwież stronę | Tryb AI nadal włączony |
| R9 | 768px layout | DevTools → 768px | Lewy + środkowy panel side-by-side |
| R10 | Walidacja bulk | Generuj bez branż | Czerwony komunikat inline (nie alert()) |
| R11 | Dark mode persist | Włącz dark mode, odśwież | Dark mode nadal aktywny |
| R12 | Postęp checklisty | Zaznacz 3 zadania | Pasek postępu rośnie |
| R13 | FAQ wyszukiwanie | Wpisz „21133" | Min. 1 wynik |
| R14 | Tytuł zakładki | Sprawdź tytuł przeglądarki | Nie „Vite App" — własna nazwa |
| R15 | Konsola JS | Otwórz DevTools Console | Zero błędów „Unhandled Promise Rejection" |
