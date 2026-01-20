
import { FAQ_DATABASE, FAQItem } from '../data/faqDatabase';

export function searchFAQ(query: string): string {
  const normalizedQuery = query.toLowerCase().trim();
  if (normalizedQuery.length < 3) return "Proszę wpisz dłuższe pytanie (min. 3 znaki).";

  // Obsługa synonimów dla Robota
  const robotSynonyms = ['robot', 'zwiadowca', 'automatyzacja', 'robotem', 'podłączyć', 'łączenie', 'docker', 'api'];
  const isRobotQuery = robotSynonyms.some(s => normalizedQuery.includes(s));

  const words = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
  
  let bestMatch: FAQItem | null = null;
  let highestScore = 0;

  for (const item of FAQ_DATABASE) {
    let score = 0;
    
    // Bonus za zgodność kategorii Robotowej
    if (isRobotQuery && item.category === 'ROBOT') {
      score += 15;
    }

    for (const word of words) {
      // Szukanie w słowach kluczowych (najwyższa waga)
      if (item.keywords.some(k => k.toLowerCase() === word)) {
        score += 25;
      } else if (item.keywords.some(k => k.toLowerCase().includes(word))) {
        score += 10;
      }

      // Szukanie w pytaniu
      if (item.question.toLowerCase().includes(word)) {
        score += 15;
      }

      // Szukanie w odpowiedzi (minimalna waga, by unikać fałszywych trafień)
      if (item.answer.toLowerCase().includes(word)) {
        score += 2;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Wymagamy solidnego dopasowania (min. 20 pkt)
  if (bestMatch && highestScore >= 20) {
    return bestMatch.answer;
  }

  // Jeśli nic nie pasuje precyzyjnie, nie zmyślamy
  return "Przepraszam, nie znalazłem w bazie offline precyzyjnej odpowiedzi na to pytanie.\n\nMOŻLIWE ROZWIĄZANIA:\n1. Jeśli pytasz o techniczne aspekty 'Robota Zwiadowcy' - WŁĄCZ ANALIZĘ GEMINI (suwak u góry).\n2. Skróć pytanie do słów kluczowych (np. 'korekta nip' zamiast całego zdania).\n3. Sprawdź, czy nie masz literówki.";
}
