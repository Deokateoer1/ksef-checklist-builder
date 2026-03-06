/**
 * faqRiskUtils.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Narzędzia do automatycznego oznaczania ryzykownych wpisów FAQ_GENERATED_KSEF.
 *
 * Logika: wpis generowany (GEN_*) z mocnym językiem prawnym, ale bez silnego
 * oficjalnego źródła, otrzymuje riskLevel='info_only' i verifiedBy='auto'.
 *
 * Wpisy kuratorowane (FAQ_*, FAQ_EXT_*, FAQ_BR_PROC_*) są ZAWSZE pomijane.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { FAQItem } from '../data/faqDatabase';

// ── 1. Normalizacja tekstu ───────────────────────────────────────────────────

/**
 * Normalizuje tekst do porównań: małe litery, usuwanie znaków diakrytycznych,
 * sprowadzenie wielokrotnych spacji do jednej.
 */
export function normalizeText(raw: string | undefined | null): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // usuń znaki diakrytyczne
    .replace(/\s+/g, ' ')
    .trim();
}

// ── 2. Słowa kluczowe wskazujące twarde roszczenia prawne ───────────────────

const STRONG_LEGAL_KEYWORDS: string[] = [
  'obowiazek',
  'obowiazki',
  'obowiazkowo',
  'musi ',
  'musza ',
  'nakazuje',
  'grozi kara',
  'groza kary',
  'kara ',
  'kary ',
  'sankcje',
  'sankcja',
  'grzywna',
  'kks',
  'kodeks karny skarbowy',
  'odpowiedzialnosc karno',
  'utrata prawa do odliczenia',
  'brak prawa do odliczenia',
  'brak prawa do',
  'nie mozna odliczyc',
  'odmowa odliczenia',
  'wykluczone z odliczenia',
  'podlega karze',
  'naklada kare',
  'naklada sie kare',
  'decyzja urzedu',
  'naczelnik urzedu skarbowego',
  'organ podatkowy naklada',
  'zakazane',
  'zakaz ',
  'zabronione',
];

/**
 * Sprawdza, czy pytanie lub odpowiedź zawierają mocne roszczenie prawne
 * (sankcje, obowiązki bezwzględne, grożące kary).
 */
export function isStrongLegalClaim(item: FAQItem): boolean {
  const combined = normalizeText(item.question) + ' ' + normalizeText(item.answer);
  return STRONG_LEGAL_KEYWORDS.some(kw => combined.includes(kw));
}

// ── 3. Ocena jakości źródła ──────────────────────────────────────────────────

/** Zaufane domeny rządowe i branżowe */
const TRUSTED_DOMAINS: string[] = [
  'gov.pl',
  'mf.gov.pl',
  'podatki.gov.pl',
  'ksef.podatki.gov.pl',
  'sejm.gov.pl',
  'isap.sejm.gov.pl',
];

/** Zaufane portale i wydawnictwa branżowe */
const TRUSTED_PORTALS: string[] = [
  'symfonia',
  'infor',
  'poradnikprzedsiebiorcy',
  'kik',
  'fillup',
  'comarch',
  'enova',
  'soneta',
  'sage',
  'ministerstwo finansow',
  'ministerstwo_finansow',
  'ministerstwo',
];

/** Typy źródeł uznane za silne oficjalne */
const STRONG_LEGAL_SOURCE_TYPES: Array<FAQItem['legalSourceType']> = [
  'ustawa',
  'rozporządzenie',
  'MF_objaśnienia',
];

/**
 * Sprawdza, czy wpis posiada silne oficjalne źródło.
 * Dla wpisów generated (GEN_*) sprawdza pole source pod kątem wiarygodności.
 * Dla wpisów kuratorowanych sprawdza legalSourceType.
 */
export function hasStrongOfficialSource(item: FAQItem): boolean {
  // Jawny typ źródła = silne
  if (item.legalSourceType && STRONG_LEGAL_SOURCE_TYPES.includes(item.legalSourceType)) {
    return true;
  }

  const src = normalizeText(item.source);

  // Zawiera domenę .gov.pl lub zaufaną domenę
  if (TRUSTED_DOMAINS.some(domain => src.includes(normalizeText(domain)))) {
    return true;
  }

  // Zawiera zaufany portal branżowy
  if (TRUSTED_PORTALS.some(portal => src.includes(normalizeText(portal)))) {
    return true;
  }

  // Zawiera wprost numer aktu prawnego (Dz. U., art., ustawa z dnia)
  if (/dz\.\s*u\.|art\.\s*\d|ustawa z dnia|rozporzadzenie ministra/i.test(src)) {
    return true;
  }

  return false;
}

// ── 4. Identyfikacja typów wpisów ────────────────────────────────────────────

/**
 * True jeśli wpis pochodzi z FAQ_GENERATED_KSEF (id zaczyna się od "GEN_").
 */
export function isGeneratedEntry(item: FAQItem): boolean {
  return item.id.startsWith('GEN_');
}

/**
 * True jeśli wpis jest kuratorowanym wpisem biurowym (FAQ_BR_ lub FAQ_BR_PROC_).
 */
export function isCuratedBrEntry(item: FAQItem): boolean {
  return item.id.startsWith('FAQ_BR_');
}

// ── 5. Główna decyzja: czy oznaczyć jako info_only ───────────────────────────

/**
 * Decyduje, czy dany wpis powinien być oznaczony jako info_only / auto.
 *
 * Warunki (wszystkie muszą być spełnione):
 * 1. NIE jest kuratorowanym wpisem BR
 * 2. JEST wpisem generowanym (GEN_*)
 * 3. Zawiera mocne roszczenie prawne (isStrongLegalClaim)
 * 4. NIE ma silnego oficjalnego źródła (hasStrongOfficialSource)
 */
export function shouldMarkAsInfoOnly(item: FAQItem): boolean {
  if (isCuratedBrEntry(item)) return false;
  if (!isGeneratedEntry(item)) return false;
  if (!isStrongLegalClaim(item)) return false;
  if (hasStrongOfficialSource(item)) return false;
  return true;
}

// ── 6. Masowa modyfikacja tablicy ────────────────────────────────────────────

/**
 * Przetwarza tablicę FAQItem i oznacza ryzykowne wpisy jako info_only/auto.
 * Nie usuwa ani nie zmienia innych pól.
 * Zwraca nową tablicę (oryginal jest niezmieniony).
 */
export function markRiskyFaqItems(items: FAQItem[]): FAQItem[] {
  const updated: FAQItem[] = [];
  const markedIds: string[] = [];

  for (const item of items) {
    if (shouldMarkAsInfoOnly(item)) {
      updated.push({
        ...item,
        riskLevel: item.riskLevel ?? 'info_only',
        verifiedBy: item.verifiedBy ?? 'auto',
      });
      markedIds.push(item.id);
    } else {
      updated.push(item);
    }
  }

  console.log(
    `[FAQ RISK] Oznaczono ${markedIds.length} z ${items.length} wpisów jako info_only/auto:`,
    markedIds.slice(0, 50),
  );

  return updated;
}
