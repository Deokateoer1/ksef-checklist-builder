import { ChecklistTask, UserProfile, BulkChecklistMap, TaskSection } from "../types";
import { searchFAQAdvanced } from "./faqSearch";

// ─────────────────────────────────────────────────────────────
// Model
// ─────────────────────────────────────────────────────────────
const MODEL_CHECKLIST = 'gemini-3-pro-preview';  // Gemini 3.0 Pro Preview — generowanie checklisty
const MODEL_CHAT = 'gemini-3-flash-preview';     // Gemini 3.0 Flash Preview — czat (szybszy)

// ─────────────────────────────────────────────────────────────
// Proxy → backend (klucz API bezpieczny po stronie serwera)
// ─────────────────────────────────────────────────────────────

// Użycie VITE_GEMINI_API_KEY zamiast GEMINI_API_KEY
// (jeśli gdziekolwiek byłoby użycie GEMINI_API_KEY, zamień na VITE_GEMINI_API_KEY)
const BACKEND_URL = import.meta.env.VITE_ROBOT_API_URL || 'http://localhost:8000';

async function callGeminiProxy(
  prompt: string,
  model: string,
  config?: { responseMimeType?: string; temperature?: number; topP?: number; systemInstruction?: string }
): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/api/gemini`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model, config }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    // Mapowanie błędów na czytelne komunikaty (zachowanie jak wcześniej)
    if (res.status === 401 || res.status === 403) {
      throw new Error('Błąd klucza API. Sprawdź zmienną API_KEY.');
    }
    if (res.status === 404) {
      throw new Error('Model AI niedostępny. Sprawdź nazwę modelu w konfiguracji.');
    }
    throw new Error(`Błąd backendu ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.result as string;
}

// ─────────────────────────────────────────────────────────────
// Kontekst bazowy KSeF (daty, architektura)
// ─────────────────────────────────────────────────────────────
const KSEF_CONTEXT = `
KONTEKST SYSTEMU:
- Aplikacja: KSeF 2.0 Checklist Builder & Robot Zwiadowca.
- Data obecna: ${new Date().toLocaleDateString('pl-PL')}.
- Kluczowe Terminy:
  * 1.02.2026 — obowiązek KSeF dla firm z obrotem >200 mln zł VAT w 2024 r.
  * 1.04.2026 — obowiązek dla pozostałych podatników VAT (MŚP)
  * 1.01.2027 — aktywacja kar KKS (do 100% kwoty VAT z faktury)
  * Do końca 2026 r. — okres przejściowy BEZ kar za błędy techniczne
- Architektura: Robot Zwiadowca (localhost:8000) = middleware między ERP a API MF.
- Schemat faktury: FA(3) obowiązkowy od 1.02.2026.
  * Nowe węzły: <Podmiot3> (faktor/odbiorca płatności), <FaWiersz>, <Stopka>/<Platnosci>
- Kody błędów KSeF:
  * 21133 = NIEZGODNOŚĆ ZE SCHEMĄ FA(3) — błąd walidacji semantycznej XML (NIE błąd NIP!)
  * 21132 = BRAK UPRAWNIEŃ — token/certyfikat bez prawa do danego NIP
  * 429   = RATE LIMIT — za dużo żądań, zastosuj Exponential Backoff
  * 400/422 = ODRZUCENIE — błędny NIP lub format danych
- Tryb Offline24: faktura wystawiona lokalnie z kodem QR (SHA-256 z XML + ID certyfikatu),
  dosyłana do KSeF w ciągu 24h od ustania awarii.
`;

// ─────────────────────────────────────────────────────────────
// RAG — budowanie bazy wiedzy z faqSearch per sekcja
// ─────────────────────────────────────────────────────────────

/** Mapowanie sekcji checklisty → zapytania do faqSearch */
const SECTION_QUERIES: Record<string, string[]> = {
  [TaskSection.PREPARATORY]: ['od czego zacząć wdrożenie KSeF', 'zespół wdrożeniowy KSeF inwentaryzacja'],
  [TaskSection.COMPLIANCE]: ['przechowywanie faktur 10 lat archiwizacja', 'RODO faktury KSeF', 'ZAW-FA biuro rachunkowe'],
  [TaskSection.ANALYSIS]: ['walidacja NIP biała lista', 'audyt systemu fakturowania ERP'],
  [TaskSection.TECHNICAL]: ['token API autoryzacja KSeF', 'MCU uprawnienia certyfikat', 'różnica token pieczęć'],
  [TaskSection.ERROR_HANDLING]: ['błąd 21133 schemat walidacja', 'błąd 429 rate limit backoff', 'błąd 21132 uprawnienia'],
  [TaskSection.TESTS]: ['środowisko demo test KSeF', 'testy integracyjne FA3'],
  [TaskSection.EMERGENCY]: ['tryb awaryjny Offline24', 'kod QR SHA-256 offline', 'procedura awaryjna 24h'],
  [TaskSection.DEPLOYMENT]: ['UPO write-back ERP numer KSeF', 'JPK_VAT numer KSeF obowiązek'],
  [TaskSection.MONITORING]: ['JPK nowe oznaczenia 2026 OFF BFK', 'monitorowanie zmian API'],
  [TaskSection.COST_CALCULATION]: ['koszty KSeF certyfikat pieczęć', 'czy KSeF jest płatny'],
  [TaskSection.RISK_ASSESSMENT]: ['kara 100% VAT niewystawienie faktury', 'okres przejściowy bez kar 2026', 'odpowiedzialność zarząd IT'],
};

/**
 * Buduje blok BAZA_WIEDZY na podstawie faqSearch.
 * Dla każdej sekcji pobiera top-3 FAQ i formatuje jako P/A pairs.
 * Łączny rozmiar: ~4-6k znaków — bezpieczny dla kontekstu Gemini 3 Pro.
 */
function buildKnowledgeBase(): string {
  const blocks: string[] = ['=== BAZA WIEDZY KSEF (źródło: oficjalna dokumentacja MF) ===\n'];

  for (const [section, queries] of Object.entries(SECTION_QUERIES)) {
    const seen = new Set<string>();
    const pairs: string[] = [];

    for (const query of queries) {
      const results = searchFAQAdvanced(query);
      for (const r of results.slice(0, 2)) {
        if (!seen.has(r.item.id) && pairs.length < 4) {
          seen.add(r.item.id);
          const ans = r.item.answer.length > 200
            ? r.item.answer.slice(0, 197) + '...'
            : r.item.answer;
          pairs.push(`P: ${r.item.question}\nA: ${ans}`);
        }
      }
    }

    if (pairs.length > 0) {
      blocks.push(`## ${section}\n${pairs.join('\n\n')}`);
    }
  }

  return blocks.join('\n\n');
}

// ─────────────────────────────────────────────────────────────
// Prompty systemowe (chat)
// ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT_TECHNICAL = `
Jesteś GŁÓWNYM ARCHITEKTEM SYSTEMU KSeF (Role: Internal System Agent).
Twoim zadaniem jest wsparcie techniczne integracji Robota Zwiadowcy z API KSeF 2.0.

ZASADY OPERACYJNE:
1. Język: Techniczny, precyzyjny (PL). Używaj pojęć: Endpoint, Token JWT, XML, Schema, Node, Exception.
2. Struktura FA(3): Odnosisz się wyłącznie do schemy FA(3) obowiązującej od 1.02.2026.
   - Kluczowe węzły: <Podmiot3> (nowość), <FaWiersz> (pozycje), <Stopka> (płatności).
3. Obsługa Błędów:
   - 21133 = Niezgodność ze schemą FA(3) — walidacja semantyczna XML (NIE błąd NIP!)
   - 429 = Rate Limit — Exponential Backoff (1s→2s→4s→8s)
   - 21132 = Brak uprawnień tokena/certyfikatu
4. Tryb Offline24: QR z hash SHA-256 z XML + ID certyfikatu, dosyłka w 24h.

Twoja odpowiedź musi być krótka, techniczna i zawierać konkretne rozwiązania.
${KSEF_CONTEXT}
`;

const SYSTEM_PROMPT_BUSINESS = `
Jesteś OPIEKUNEM WDROŻENIA KSeF 2.0 (Role: Business Consultant).
Twoim zadaniem jest uspokojenie użytkownika i wyjaśnienie zawiłości przepisów prostym językiem.

ZASADY KOMUNIKACJI:
1. Styl: Empatyczny, profesjonalny, zrozumiały dla księgowej. Zero żargonu IT.
2. Edukacja: Wyjaśniaj terminy 1.02.2026 i 1.04.2026.
3. Przypominaj o okresie przejściowym — do końca 2026 r. NIE MA KAR za błędy techniczne.
4. Best Practices: "Lepiej wysłać korektę niż ryzykować spór".

Twoim celem jest budowanie poczucia bezpieczeństwa użytkownika.
${KSEF_CONTEXT}
`;

// ─────────────────────────────────────────────────────────────
// Retry + helpers
// ─────────────────────────────────────────────────────────────

const MAX_RETRIES = 3;
const VALID_PRIORITIES = ['critical', 'high', 'medium', 'low'];
const VALID_SECTIONS = Object.values(TaskSection);

/** Usuwa ewentualne znaczniki markdown (```json ... ```) z odpowiedzi */
function sanitizeJSON(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

/** Parsuje i waliduje tablicę zadań z odpowiedzi Gemini */
function parseAndValidateTasks(raw: string | null | undefined): ChecklistTask[] {
  if (!raw) throw new Error("Pusta odpowiedź od modelu AI.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(sanitizeJSON(raw));
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("Odpowiedź nie zawiera poprawnego JSON.");
    parsed = JSON.parse(match[0]);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Model zwrócił pustą lub niepoprawną tablicę zadań.");
  }

  const tasks: ChecklistTask[] = parsed.map((item: Record<string, unknown>, idx: number) => {
    const priority = VALID_PRIORITIES.includes(item.priority as string)
      ? (item.priority as ChecklistTask['priority'])
      : 'medium';

    const section = VALID_SECTIONS.includes(item.section as TaskSection)
      ? (item.section as TaskSection)
      : TaskSection.PREPARATORY;

    return {
      id: String(item.id ?? `task_${idx + 1}`),
      title: String(item.title ?? 'Zadanie bez tytułu'),
      description: String(item.description ?? ''),
      priority,
      section,
      deadlineDays: Number(item.deadlineDays) || 30,
      estimatedHours: Number(item.estimatedHours) || 2,
      dependencies: Array.isArray(item.dependencies) ? item.dependencies.map(String) : [],
      completed: Boolean(item.completed ?? false),
      automatable: Boolean(item.automatable ?? false),
      robotFunction: item.robotFunction ? String(item.robotFunction) : undefined,
      notes: item.notes ? String(item.notes) : undefined,
    };
  });

  console.log(`[Gemini] Wygenerowano ${tasks.length} zadań (oczekiwano 33).`);
  return tasks;
}

/** Wywołuje funkcję z retry (domyślnie 3x) i exponential backoff dla błędów sieciowych */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  label = 'API call',
): Promise<T> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const msg = lastError.message.toLowerCase();

      if (msg.includes('api_key') || msg.includes('api key') || msg.includes('401') || msg.includes('403')) {
        console.error(`[${label}] Błąd autoryzacji API — brak retry:`, lastError.message);
        throw new Error('Błąd klucza API. Sprawdź zmienną API_KEY.');
      }
      if (msg.includes('404') || msg.includes('not found') || msg.includes('model')) {
        console.error(`[${label}] Model niedostępny — brak retry:`, lastError.message);
        throw new Error('Model AI niedostępny. Sprawdź nazwę modelu w konfiguracji.');
      }

      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[${label}] Próba ${attempt}/${retries} nieudana, retry za ${delay}ms:`, lastError.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ─────────────────────────────────────────────────────────────
// Główna funkcja generowania checklisty
// ─────────────────────────────────────────────────────────────

export async function generatePersonalizedChecklist(profile: UserProfile): Promise<ChecklistTask[]> {
  const knowledgeBase = buildKnowledgeBase();

  const prompt = `Działaj jako Senior KSeF Architect. Wygeneruj ekspercką checklistę wdrożeniową KSeF 2.0 dla:
PROFIL FIRMY: ${profile.companySize} | Branża: ${profile.industry} | ERP: ${profile.erpSystem} | Faktury/mies.: ${profile.monthlyInvoices}

${knowledgeBase}

${KSEF_CONTEXT}

═══ WYMAGANIA DOTYCZĄCE ZADAŃ ═══

1. SEKCJE — wygeneruj dokładnie 3 zadania dla KAŻDEJ z poniższych sekcji (łącznie 33):
${Object.values(TaskSection).map((s, i) => `   ${i + 1}. ${s}`).join('\n')}

2. PRIORYTETY — każda sekcja MUSI zawierać przynajmniej 1 zadanie z priorytetem "critical":
   - critical = blokuje wdrożenie lub grozi karą KKS od 1.01.2027
   - high     = wymagane przed datą obowiązku (1.02 lub 1.04.2026)
   - medium   = zalecane w pierwszym kwartale po wdrożeniu
   - low      = optymalizacje i usprawnienia

3. SPECYFIKA BRANŻY — minimum 3 zadania muszą być specyficzne dla branży "${profile.industry}"

4. TECHNICZNE WYMAGANIA — zadania techniczne MUSZĄ zawierać:
   - Obsługę błędu 21133 (Niezgodność ze schemą FA(3) — NIE błąd NIP!)
   - Obsługę błędu 429 (Rate Limit z Exponential Backoff)
   - Integrację z Robotem Zwiadowcą na porcie 8000
   - Procedurę Offline24 z kodem QR (SHA-256 z XML + ID certyfikatu)
   - Węzeł <Podmiot3> i schemat FA(3)

5. DEADLINES — termin (deadlineDays) musi być realny:
   - Zadania critical: max 30 dni
   - Zadania high: max 60 dni
   - Zadania medium: max 120 dni

Zwróć JSON z tablicą 33 zadań. Każde zadanie musi mieć pola: id, title, description, priority, section, deadlineDays, estimatedHours, dependencies, completed, automatable.`;

  return await withRetry(async () => {
    const raw = await callGeminiProxy(prompt, MODEL_CHECKLIST, {
      responseMimeType: 'application/json',
    });
    return parseAndValidateTasks(raw);
  }, MAX_RETRIES, 'generatePersonalizedChecklist');
}

// ─────────────────────────────────────────────────────────────
// Bulk generation
// ─────────────────────────────────────────────────────────────

export async function generateBulkChecklists(
  industries: string[],
  baseProfile: Omit<UserProfile, 'industry'>,
  onProgress: (current: number, total: number, status: string) => void
): Promise<BulkChecklistMap> {
  const results: BulkChecklistMap = {};
  for (let i = 0; i < industries.length; i++) {
    const industry = industries[i];
    onProgress(i + 1, industries.length, `Analiza ekspercka: ${industry}...`);
    try {
      results[industry] = await generatePersonalizedChecklist({ ...baseProfile, industry } as UserProfile);
    } catch (e) { console.warn(e); }
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  return results;
}

// ─────────────────────────────────────────────────────────────
// Chat z Gemini (FAQ Chatbot — tryb online)
// ─────────────────────────────────────────────────────────────

export async function askGeminiKSeF(
  query: string,
  profile: UserProfile | null,
  mode: 'technical' | 'business' = 'technical'
): Promise<string> {
  const systemInstruction = mode === 'technical' ? SYSTEM_PROMPT_TECHNICAL : SYSTEM_PROMPT_BUSINESS;
  const userContext = profile
    ? `\nUŻYTKOWNIK: ${profile.companySize}, Branża: ${profile.industry}, ERP: ${profile.erpSystem}`
    : '';

  const result = await callGeminiProxy(
    query + userContext,
    MODEL_CHAT,
    { systemInstruction }
  );
  return result || "Brak odpowiedzi od systemu AI.";
}
