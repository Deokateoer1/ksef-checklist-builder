/**
 * faqSearch.ts — Zaawansowany moduł wyszukiwania FAQ KSeF
 *
 * Implementuje:
 * - Scoring BM25-like z wagami per-pole (tags > question > answer)
 * - Exact-match boost dla kodów technicznych (P_16, GTU_07, FA(2), błędy 440 itd.)
 * - Polskie stopwords + lekki stemming (ucinanie końcówek fleksyjnych)
 * - Top-K wyników z dynamicznym progiem odcięcia
 * - Levenshtein distance do obsługi literówek w słowach kluczowych
 *
 * @module faqSearch
 */

import { FAQ_DATABASE, FAQItem } from '../data/faqDatabase';

// ═══════════════════════════════════════════════════════════
// Interfejsy
// ═══════════════════════════════════════════════════════════

export interface SearchResult {
  item: FAQItem;
  score: number;
  matchedOn: ('exact_code' | 'tag' | 'question' | 'answer' | 'id' | 'category')[];
}

interface TokenizedQuery {
  raw: string;
  tokens: string[];
  technicalCodes: string[];
  errorCodes: string[];
}

// ═══════════════════════════════════════════════════════════
// Konfiguracja
// ═══════════════════════════════════════════════════════════

const CONFIG = {
  /** Maksymalna liczba zwracanych wyników */
  TOP_K: 3,
  /** Minimalny score żeby wynik się zakwalifikował */
  MIN_SCORE_THRESHOLD: 20,
  /** Minimalny stosunek score do najlepszego wyniku (0-1) */
  RELATIVE_THRESHOLD: 0.25,

  /** Wagi scoringu */
  WEIGHTS: {
    EXACT_CODE_IN_ID:       120,
    EXACT_CODE_IN_TAGS:     100,
    EXACT_CODE_IN_QUESTION:  80,
    EXACT_CODE_IN_ANSWER:    40,
    TAG_EXACT:               35,
    TAG_PARTIAL:             18,
    QUESTION_PHRASE:          50,
    QUESTION_TOKEN:          12,
    ANSWER_TOKEN:             3,
    CATEGORY_MATCH:          10,
    LEVENSHTEIN_TAG:         12,
    LEVENSHTEIN_QUESTION:     6,
  },

  /** BM25 parametry */
  BM25_K1: 1.5,
  BM25_B:  0.75,

  /** Maksymalny dystans Levenshteina (dla słów ≥5 znaków) */
  MAX_LEVENSHTEIN: 2,
} as const;

// ═══════════════════════════════════════════════════════════
// Polskie Stopwords
// ═══════════════════════════════════════════════════════════

const POLISH_STOPWORDS = new Set([
  'ja', 'ty', 'on', 'ona', 'ono', 'my', 'wy', 'oni', 'one',
  'mi', 'mnie', 'się', 'ich', 'jej', 'mu', 'nas', 'was', 'go',
  'mój', 'twój', 'swój', 'nasz', 'wasz', 'ten', 'ta', 'to', 'te',
  'tym', 'tego', 'tej', 'tych', 'tę', 'ci', 'tam',
  'w', 'na', 'z', 'ze', 'do', 'od', 'za', 'o', 'po', 'przy',
  'dla', 'przez', 'nad', 'pod', 'przed', 'między', 'bez', 'ku',
  'i', 'a', 'ale', 'lub', 'albo', 'bądź', 'czy', 'że', 'żeby',
  'aby', 'bo', 'gdyż', 'ponieważ', 'więc', 'zatem', 'dlatego',
  'jednak', 'natomiast', 'czyli', 'oraz',
  'nie', 'tak', 'też', 'już', 'jeszcze', 'tylko', 'bardzo', 'może',
  'chyba', 'właśnie', 'przecież', 'tutaj', 'tam',
  'jest', 'są', 'być', 'był', 'była', 'było', 'byli', 'były',
  'będzie', 'będą', 'ma', 'mają', 'mam', 'miał', 'miała',
  'można', 'trzeba', 'powinno', 'powinny', 'powinien',
  'jak', 'co', 'kto', 'gdzie', 'kiedy', 'dlaczego', 'ile',
  'jaki', 'jaka', 'jakie', 'jakim', 'jakiej',
  'który', 'która', 'które', 'którzy', 'których', 'którym',
  'np', 'itp', 'itd', 'etc', 'tj', 'tzn', 'wg',
]);

// ═══════════════════════════════════════════════════════════
// Regex: Kody techniczne KSeF
// ═══════════════════════════════════════════════════════════

const TECHNICAL_CODE_REGEX = /\b(P_\w+|GTU_\d{1,2}|FA\s*\(\s*\d\s*\)|TP|SW|EE|MPP|JPK_V7M?|KSeF_?\w*|XML|XSD|UPO|NIP24)\b/gi;
const ERROR_CODE_REGEX = /\b(\d{3,5})\b/g;

// ═══════════════════════════════════════════════════════════
// Polski lekki stemmer
// ═══════════════════════════════════════════════════════════

const POLISH_SUFFIXES = [
  'owski', 'owska', 'owskie', 'ności', 'eniem', 'aniem',
  'owej', 'owym', 'nych', 'nego', 'eniu', 'aniu',
  'ości', 'owie', 'kami', 'ista',
  'ach', 'ami', 'owi', 'ową', 'owy', 'owa', 'owe',
  'iem', 'ych', 'ymi', 'emu', 'nej', 'nym',
  'om', 'ek', 'ie', 'ze', 'ię', 'ią', 'ą', 'ę', 'ów', 'em',
] as const;

/**
 * Lekki stemmer polskiego tekstu.
 * Ucina najczęstsze końcówki fleksyjne, zachowuje rdzeń ≥3 znaków.
 */
export function stemPolish(word: string): string {
  if (word.length < 4) return word;
  for (const suffix of POLISH_SUFFIXES) {
    if (word.endsWith(suffix) && (word.length - suffix.length) >= 3) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

// ═══════════════════════════════════════════════════════════
// Levenshtein Distance
// ═══════════════════════════════════════════════════════════

/**
 * Oblicza dystans Levenshteina z early exit.
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  if (Math.abs(a.length - b.length) > CONFIG.MAX_LEVENSHTEIN) return CONFIG.MAX_LEVENSHTEIN + 1;

  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) matrix[i] = [i];
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
      rowMin = Math.min(rowMin, matrix[i][j]);
    }
    if (rowMin > CONFIG.MAX_LEVENSHTEIN) return CONFIG.MAX_LEVENSHTEIN + 1;
  }
  return matrix[a.length][b.length];
}

// ═══════════════════════════════════════════════════════════
// Tokenizacja zapytania
// ═══════════════════════════════════════════════════════════

/**
 * Tokenizuje zapytanie:
 * 1. Wyciąga kody techniczne i błędów (Regex, osobna ścieżka scoringu)
 * 2. Normalizuje, usuwa stopwords, stemmuje
 */
export function tokenizeQuery(query: string): TokenizedQuery {
  const raw = query.trim();

  const technicalCodes = (raw.match(TECHNICAL_CODE_REGEX) || [])
    .map(c => c.replace(/\s+/g, '').toUpperCase());

  const errorCodes = (raw.match(ERROR_CODE_REGEX) || []);

  const normalized = raw
    .toLowerCase()
    .replace(/[(){}[\]"'`.,;:!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = normalized
    .split(/[\s,]+/)
    .filter(w => w.length >= 2)
    .filter(w => !POLISH_STOPWORDS.has(w))
    .map(stemPolish)
    .filter(w => w.length >= 2);

  return {
    raw,
    tokens: [...new Set(tokens)],
    technicalCodes: [...new Set(technicalCodes)],
    errorCodes: [...new Set(errorCodes)],
  };
}

// ═══════════════════════════════════════════════════════════
// Scoring Engine
// ═══════════════════════════════════════════════════════════

function bm25tf(termFreq: number, docLength: number, avgDocLength: number): number {
  const { BM25_K1: k1, BM25_B: b } = CONFIG;
  return (termFreq * (k1 + 1)) / (termFreq + k1 * (1 - b + b * (docLength / avgDocLength)));
}

let _avgDocLength: number | null = null;
function getAvgDocLength(): number {
  if (_avgDocLength !== null) return _avgDocLength;
  const total = FAQ_DATABASE.reduce(
    (sum, item) => sum + item.question.length + item.answer.length, 0
  );
  _avgDocLength = total / Math.max(FAQ_DATABASE.length, 1);
  return _avgDocLength;
}

/**
 * Oblicza score danego wpisu FAQ względem zapytania.
 */
export function calculateScore(query: TokenizedQuery, item: FAQItem): SearchResult {
  let score = 0;
  const matchedOn: SearchResult['matchedOn'] = [];

  const idLower = item.id.toLowerCase();
  const tagsLower = item.tags.map(t => t.toLowerCase());
  const tagsStemmed = item.tags.map(t => stemPolish(t.toLowerCase()));
  const questionLower = item.question.toLowerCase();
  const answerLower = item.answer.toLowerCase();
  const categoryLower = item.category.toLowerCase();
  const docLength = item.question.length + item.answer.length;
  const avgDl = getAvgDocLength();

  // ── FAZA 1: Exact Match — Kody techniczne KSeF ──
  for (const code of query.technicalCodes) {
    const codeLower = code.toLowerCase();
    const codeNorm = codeLower.replace(/[()]/g, '');

    if (idLower.includes(codeNorm)) {
      score += CONFIG.WEIGHTS.EXACT_CODE_IN_ID;
      if (!matchedOn.includes('id')) matchedOn.push('id');
    }
    if (tagsLower.some(t => t === codeLower || t.includes(codeNorm) || t.replace(/[()]/g, '') === codeNorm)) {
      score += CONFIG.WEIGHTS.EXACT_CODE_IN_TAGS;
      if (!matchedOn.includes('tag')) matchedOn.push('tag');
    }
    if (questionLower.includes(codeLower) || questionLower.includes(codeNorm)) {
      score += CONFIG.WEIGHTS.EXACT_CODE_IN_QUESTION;
      if (!matchedOn.includes('question')) matchedOn.push('question');
    }
    if (answerLower.includes(codeLower) || answerLower.includes(codeNorm)) {
      score += CONFIG.WEIGHTS.EXACT_CODE_IN_ANSWER;
      if (!matchedOn.includes('answer')) matchedOn.push('answer');
    }
  }

  // ── FAZA 2: Kody błędów (numeryczne) ──
  for (const errCode of query.errorCodes) {
    if (tagsLower.some(t => t === errCode || t.includes(errCode))) {
      score += CONFIG.WEIGHTS.EXACT_CODE_IN_TAGS;
      if (!matchedOn.includes('tag')) matchedOn.push('tag');
    }
    if (idLower.includes(errCode)) {
      score += CONFIG.WEIGHTS.EXACT_CODE_IN_ID;
      if (!matchedOn.includes('id')) matchedOn.push('id');
    }
    if (questionLower.includes(errCode)) {
      score += CONFIG.WEIGHTS.EXACT_CODE_IN_QUESTION;
      if (!matchedOn.includes('question')) matchedOn.push('question');
    }
    if (answerLower.includes(errCode)) {
      score += CONFIG.WEIGHTS.EXACT_CODE_IN_ANSWER * 0.5;
      if (!matchedOn.includes('answer')) matchedOn.push('answer');
    }
  }

  // ── FAZA 3: Exact Phrase Match w pytaniu ──
  const queryNorm = query.raw.toLowerCase().replace(/[(){}[\]"'`.,;:!?]/g, ' ').trim();
  if (queryNorm.length > 5 && questionLower.includes(queryNorm)) {
    score += CONFIG.WEIGHTS.QUESTION_PHRASE;
    if (!matchedOn.includes('question')) matchedOn.push('question');
  }

  // ── FAZA 4: Token-by-token BM25-like scoring ──
  for (const token of query.tokens) {
    // Tagi — exact
    if (tagsLower.some(t => t === token)) {
      score += CONFIG.WEIGHTS.TAG_EXACT;
      if (!matchedOn.includes('tag')) matchedOn.push('tag');
    }
    // Tagi — partial/stemmed
    else if (tagsStemmed.some(t => t === token) || tagsLower.some(t => t.includes(token) || token.includes(t))) {
      score += CONFIG.WEIGHTS.TAG_PARTIAL;
      if (!matchedOn.includes('tag')) matchedOn.push('tag');
    }
    // Tagi — fuzzy (Levenshtein)
    else if (token.length >= 5) {
      const fuzzy = tagsLower.some(t => t.length >= 4 && levenshtein(token, t) <= CONFIG.MAX_LEVENSHTEIN);
      if (fuzzy) {
        score += CONFIG.WEIGHTS.LEVENSHTEIN_TAG;
        if (!matchedOn.includes('tag')) matchedOn.push('tag');
      }
    }

    // Pytanie — BM25
    const qCount = questionLower.split(token).length - 1;
    if (qCount > 0) {
      score += CONFIG.WEIGHTS.QUESTION_TOKEN * bm25tf(qCount, docLength, avgDl);
      if (!matchedOn.includes('question')) matchedOn.push('question');
    } else if (token.length >= 5) {
      const qWords = questionLower.split(/\s+/);
      const fuzzyQ = qWords.some(w => w.length >= 4 && levenshtein(token, stemPolish(w)) <= CONFIG.MAX_LEVENSHTEIN);
      if (fuzzyQ) {
        score += CONFIG.WEIGHTS.LEVENSHTEIN_QUESTION;
        if (!matchedOn.includes('question')) matchedOn.push('question');
      }
    }

    // Odpowiedź — BM25
    const aCount = answerLower.split(token).length - 1;
    if (aCount > 0) {
      score += CONFIG.WEIGHTS.ANSWER_TOKEN * bm25tf(aCount, docLength, avgDl);
      if (!matchedOn.includes('answer')) matchedOn.push('answer');
    }

    // Kategoria
    if (categoryLower.includes(token)) {
      score += CONFIG.WEIGHTS.CATEGORY_MATCH;
      if (!matchedOn.includes('category')) matchedOn.push('category');
    }
  }

  // ── FAZA 5: Boost za coverage (trafienie w wiele pól) ──
  if (matchedOn.length >= 3) score *= 1.15;
  else if (matchedOn.length >= 2) score *= 1.05;

  return { item, score: Math.round(score * 100) / 100, matchedOn };
}

// ═══════════════════════════════════════════════════════════
// Główna funkcja wyszukiwania (Top-K)
// ═══════════════════════════════════════════════════════════

/**
 * Zwraca Top-K wyników powyżej progu.
 */
export function searchFAQAdvanced(query: string): SearchResult[] {
  const tokenized = tokenizeQuery(query);

  if (tokenized.tokens.length === 0 && tokenized.technicalCodes.length === 0 && tokenized.errorCodes.length === 0) {
    return [];
  }

  const scored = FAQ_DATABASE
    .map(item => calculateScore(tokenized, item))
    .filter(r => r.score >= CONFIG.MIN_SCORE_THRESHOLD);

  scored.sort((a, b) => b.score - a.score);
  if (scored.length === 0) return [];

  const topScore = scored[0].score;
  return scored
    .filter(r => r.score >= topScore * CONFIG.RELATIVE_THRESHOLD)
    .slice(0, CONFIG.TOP_K);
}

// ═══════════════════════════════════════════════════════════
// Backward-compatible wrapper (string) dla FAQChatbot.tsx
// ═══════════════════════════════════════════════════════════

export function searchFAQ(query: string): string {
  const trimmed = query.trim();
  if (trimmed.length < 2) return 'Wpisz co najmniej 2 znaki, aby przeszukać bazę wiedzy KSeF.';

  const results = searchFAQAdvanced(trimmed);

  if (results.length === 0) {
    return "Niestety, nie znalazłem w bazie offline precyzyjnej odpowiedzi na to pytanie.\n\nZalecam włączenie trybu 'Analityka Gemini 3.0' (przełącznik u góry), aby zapytać o ten specyficzny problem techniczny.";
  }

  // Dominujący wynik → pokaż tylko jego
  if (results.length === 1 || results[0].score > results[1].score * 2.5) {
    return formatSingle(results[0]);
  }

  return formatMultiple(results);
}

// ═══════════════════════════════════════════════════════════
// Formatowanie odpowiedzi
// ═══════════════════════════════════════════════════════════

function formatSingle(r: SearchResult): string {
  return [
    `\ud83d\udccc ${r.item.question}`,
    '',
    r.item.answer,
    '',
    `\ud83c\udff7\ufe0f ${r.item.tags.slice(0, 4).join(' \u00b7 ')}  |  \ud83d\udcc2 ${r.item.category}`,
  ].join('\n');
}

function formatMultiple(results: SearchResult[]): string {
  const icons = ['\ud83e\udd47', '\ud83e\udd48', '\ud83e\udd49'];
  const blocks: string[] = [`\ud83d\udd0d Znalaz\u0142em ${results.length} pasuj\u0105ce odpowiedzi:\n`];

  results.forEach((r, i) => {
    blocks.push(`${icons[i] || '\u25cf'}  ${r.item.question}`);
    blocks.push(r.item.answer);
    blocks.push(`\ud83c\udff7\ufe0f ${r.item.tags.slice(0, 3).join(' \u00b7 ')}  |  \ud83d\udcc2 ${r.item.category}`);
    if (i < results.length - 1) blocks.push('\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n');
  });

  return blocks.join('\n');
}
