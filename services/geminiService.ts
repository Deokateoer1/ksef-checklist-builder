  
import { GoogleGenAI, Type } from "@google/genai";
import { ChecklistTask, UserProfile, BulkChecklistMap, TaskSection } from "../types";

// --- WIEDZA BAZOWA (Context Injection) ---
const KSEF_CONTEXT = `
KONTEKST SYSTEMU:
- Aplikacja: KSeF 2.0 Checklist Builder & Robot Zwiadowca.
- Data obecna: ${new Date().toLocaleDateString('pl-PL')} (Faza dobrowolna / przygotowawcza).
- Kluczowe Terminy: 
  * 30.09.2025 (Start testów API 2.0),
  * 1.02.2026 (Obowiązek dla firm >200mln), 
  * 1.04.2026 (MŚP), 
  * 1.01.2027 (Kary KKS).
- Architektura: Robot Zwiadowca (Localhost:8000) to middleware między ERP a API MF.
`;

// --- 1. PROMPT TECHNICZNY (Internal System / Agent AI) ---
const SYSTEM_PROMPT_TECHNICAL = `
Jesteś GŁÓWNYM ARCHITEKTEM SYSTEMU KSeF (Role: Internal System Agent).
Twoim zadaniem jest wsparcie techniczne integracji Robota Zwiadowcy z API KSeF 2.0.

ZASADY OPERACYJNE:
1. Język: Techniczny, precyzyjny (PL). Używaj pojęć: Endpoint, Token JWT, XML, Schema, Node, Exception.
2. Struktura FA(3): Odnosisz się wyłącznie do schemy FA(3) obowiązującej od 1.02.2026.
   - Kluczowe węzły: <Podmiot3> (nowość), <FaWiersz> (pozycje), <Stopka> (płatności).
3. Obsługa Błędów: Skup się na kodach 21133 (schema), 429 (limit), 21100 (XSD).
4. Tryb Offline24: Procedura generowania QR i dosyłania w 24h.

Twoja odpowiedź musi być krótka, techniczna i zawierać konkretne rozwiązania.
${KSEF_CONTEXT}
`;

// --- 2. PROMPT BIZNESOWY (Regular Chat / Business User) ---
const SYSTEM_PROMPT_BUSINESS = `
Jesteś OPIEKUNEM WDROŻENIA KSeF 2.0 (Role: Business Consultant).
Twoim zadaniem jest uspokojenie użytkownika i wyjaśnienie zawiłości przepisów prostym językiem.

ZASADY KOMUNIKACJI:
1. Styl: Empatyczny, profesjonalny, zrozumiały dla księgowej. Zero żargonu IT.
2. Edukacja: Wyjaśniaj terminy 1.02.2026 i 1.04.2026. 
3. Best Practices: "Lepiej wysłać korektę niż ryzykować spór".

Twoim celem jest budowanie poczucia bezpieczeństwa użytkownika.
${KSEF_CONTEXT}
`;

export async function generatePersonalizedChecklist(profile: UserProfile): Promise<ChecklistTask[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  const prompt = `Działaj jako Senior KSeF Architect. Wygeneruj ekspercką checklistę wdrożeniową dla firmy:
PROFIL: ${profile.companySize}, Branża: ${profile.industry}, ERP: ${profile.erpSystem}.

KRYTYCZNE WYMAGANIE:
Musisz wygenerować przynajmniej 2-3 zadania dla KAŻDEJ z poniższych sekcji. 

SEKCJE DO WYPEŁNIENIA:
${Object.values(TaskSection).join('\n')}

Wymagania techniczne:
- Uwzględnij integrację z Robotem na porcie 8000.
- Konkretne kody błędów (np. 21133) i walidacja matematyczna.

${KSEF_CONTEXT}

Zwróć JSON z tablicą zadań.`;

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

export async function askGeminiKSeF(
  query: string, 
  profile: UserProfile | null, 
  mode: 'technical' | 'business' = 'technical'
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = mode === 'technical' ? SYSTEM_PROMPT_TECHNICAL : SYSTEM_PROMPT_BUSINESS;
  const userContext = profile 
    ? `\nUŻYTKOWNIK: ${profile.companySize}, Branża: ${profile.industry}, ERP: ${profile.erpSystem}`
    : '';

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: query + userContext }] }],
      config: { systemInstruction }
    });
    return response.text || "Brak odpowiedzi od systemu AI.";
  } catch (error) {
    return "Błąd połączenia z modułem Gemini AI.";
  }
}
