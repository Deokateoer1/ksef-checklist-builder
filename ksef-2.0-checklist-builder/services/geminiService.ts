
import { GoogleGenAI, Type } from "@google/genai";
import { TaskPriority, TaskSection, ChecklistTask, UserProfile, BulkChecklistMap, CompanySize } from "../types";

const KSEF_KNOWLEDGE_BASE = `
EKSPERCKA BAZA WIEDZY KSeF 2.0 (FA-3) - DEEP DIVE:
- Struktura Logicza: FA-3 zastępuje FA-2. Kluczowe zmiany w węzłach Podmiot3 i stopkach.
- Walidacja Matematyczna: KSeF MF sprawdza TYLKO schemę XSD. Nie sprawdza czy: Netto + VAT = Brutto. Jeśli ERP wyśle błąd (np. 100+23=124), KSeF to przyjmie i nada numer, co jest błędem prawnym.
- Kody Błędów Krytycznych:
  * 21100: Błąd ogólny struktury (brak obowiązkowych pól).
  * 21133: Błąd merytoryczny w polu P_7 (Opis towaru/usługi) - np. zakazane znaki.
  * 21157: Przekroczenie limitu wielkości XML (1MB w sesji interaktywnej).
  * 25611: Brak uprawnień do danego NIP.
  * 429: Rate Limit (MF nakłada restrykcje przy masowej wysyłce bez Robota/Kolejkowania).
- Specyfika Pola P_7: Limit 256 znaków. Brak obsługi emoji i niektórych znaków specjalnych (wymagany sanitizer przed wysyłką).
- Daty Obowiązku: 1.02.2026 (>200 mln VAT), 1.04.2026 (pozostali), 1.01.2027 (kary KKS).
- JPK_V7 a KSeF: Numer KSeF musi być raportowany w JPK_V7 (nowe pola KSeFReferenceNumber). Brak numeru = błąd raportowania.
- Kursy Walut: Obowiązkowy przelicznik VAT na PLN w polach P_14_x (nawet jeśli faktura jest w EUR/USD).
- Korekty: Wyłącznie Faktura Korygująca. Brak not korygujących. Zmiana NIP nabywcy = Korekta do ZERA + Nowa Faktura.
- Tryb Offline (Offline24): Generowanie podpisu/digest SHA-256 lokalnie, kod QR obowiązkowy na wydruku. 24h na dosłanie faktury.
`;

const ROBOT_CAPABILITIES = `
ROBOT ZWIADOWCA (Architektura FastAPI - Port 8443):
- Endpointy: https://localhost:8443/api/stats (monitoring), /api/logs (terminal), /api/sync (wyzwalacz).
- Walidacja XSD 2.0: Lokalna weryfikacja przed wysyłką do MF (oszczędność czasu i unikanie blokad).
- Math-Guard: Automatyczne sprawdzanie sum kontrolnych (Netto/VAT/Brutto) - blokuje wysyłkę błędnych obliczeń ERP.
- Token Manager: Obsługa rotacji tokenów JWT 2.0 (Tokeny z KSeF 1.0 wygasają!).
- Bulk Processing: Obsługa asynchroniczna przez Redis, unikanie błędu 429 (Exponential Backoff).
- Archiver: Lokalne składowanie XML z nadanym numerem KSeF w PostgreSQL dla szybkich zapytań biura.
- Multi-client: Izolacja danych dla wielu klientów biura rachunkowego.
`;

export async function generatePersonalizedChecklist(profile: UserProfile): Promise<ChecklistTask[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-flash-latest'; // Zgodnie z prośbą o Gemini 2.5 Flash

  const prompt = `Działaj jako Senior KSeF Architect. Wygeneruj ekspercką checklistę wdrożeniową.
  
PROFIL: ${profile.companySize}, Branża: ${profile.industry}, ERP: ${profile.erpSystem}.

WYMAGANIA:
- Uwzględnij integrację z Robotem na porcie 8443.
- Skoncentruj się na bezpieczeństwie danych i walidacji matematycznej.
- Zadania muszą zawierać konkretne kody błędów (np. 21133) i procedury ich unikania.
- Uwzględnij specyfikę branży ${profile.industry} (np. GTU, procedury specjalne).

Baza Wiedzy: ${KSEF_KNOWLEDGE_BASE}
Robot: ${ROBOT_CAPABILITIES}

Zwróć JSON z tablicą zadań (id, title, description, priority, section, deadlineDays, estimatedHours, dependencies, completed, automatable, robotFunction).`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['critical', 'high', 'medium', 'low'] },
              section: { type: Type.STRING, enum: Object.values(TaskSection) },
              deadlineDays: { type: Type.INTEGER },
              estimatedHours: { type: Type.INTEGER },
              dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
              completed: { type: Type.BOOLEAN },
              automatable: { type: Type.BOOLEAN },
              robotFunction: { type: Type.STRING },
            },
            required: ["id", "title", "description", "priority", "section", "deadlineDays", "estimatedHours", "dependencies", "completed", "automatable"],
          },
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Błąd generowania. Sprawdź połączenie.");
  }
}

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

export async function askGeminiKSeF(query: string, profile: UserProfile | null): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-flash-latest';
  
  const systemInstruction = `Jesteś Senior KSeF Architectem. Odpowiadasz na pytania o wdrożenie KSeF 2.0 i Robota Zwiadowcę (port 8443).
  Używaj technicznego języka: XSD, XML, REST API, SHA-256, kody błędów MF.
  Wiedza: ${KSEF_KNOWLEDGE_BASE}
  Możliwości Robota: ${ROBOT_CAPABILITIES}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: query }] }],
      config: { systemInstruction }
    });
    return response.text || "Brak danych.";
  } catch (error) {
    return "Błąd API Gemini.";
  }
}
