
import { FAQ_DATABASE, FAQItem } from '../data/faqDatabase';

export function searchFAQ(query: string): string {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Krótkie zapytania - walidacja
  if (normalizedQuery.length < 2) return "Wpisz co najmniej 2 znaki, aby przeszukać bazę wiedzy KSeF.";

  // Obsługa synonimów dla Robota i technikalii
  const robotSynonyms = ['robot', 'zwiadowca', 'automatyzacja', 'api', 'port', '8000', 'integracja'];
  const isRobotQuery = robotSynonyms.some(s => normalizedQuery.includes(s));

  // Rozbicie zapytania na słowa kluczowe
  const words = normalizedQuery.split(/[\s,]+/).filter(w => w.length > 1);

  let bestMatch: FAQItem | null = null;
  let highestScore = 0;

  for (const item of FAQ_DATABASE) {
    let score = 0;

    // 1. Wyszukiwanie w TAGACH (Najwyższa waga)
    const tagsMatch = item.tags.filter(tag => 
      words.some(word => tag.toLowerCase().includes(word) || word.includes(tag.toLowerCase()))
    ).length;
    score += tagsMatch * 30;

    // 2. Wyszukiwanie w ID (np. zapytanie o kod błędu "21133")
    if (words.some(word => item.id.toLowerCase().includes(word) || (item.tags.includes(word)))) {
        score += 50; // Bardzo wysoki priorytet dla kodów
    }

    // 3. Wyszukiwanie w PYTANIU
    if (item.question.toLowerCase().includes(normalizedQuery)) {
      score += 40; // Dokładne dopasowanie frazy
    } else {
      const questionWordsMatch = words.filter(word => item.question.toLowerCase().includes(word)).length;
      score += questionWordsMatch * 10;
    }

    // 4. Wyszukiwanie w ODPOWIEDZI (Niższa waga)
    const answerWordsMatch = words.filter(word => item.answer.toLowerCase().includes(word)).length;
    score += answerWordsMatch * 2;

    // Bonus za kategorię
    if (isRobotQuery && (item.category === 'Techniczne' || item.category === 'Obsługa Błędów')) {
      score += 15;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Próg akceptacji wyniku
  if (bestMatch && highestScore >= 15) {
    return bestMatch.answer;
  }

  // Fallback AI suggestion
  return "Nie znalazłem precyzyjnej odpowiedzi w bazie offline (Top 60). \n\nZalecam włączenie trybu 'Analityka Gemini 3.0' (przełącznik u góry), aby zapytać o ten specyficzny problem techniczny.";
}
