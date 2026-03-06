/**
 * faqRiskUtils.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Testy jednostkowe dla utilities oznaczania ryzykownych wpisów FAQ.
 *
 * Uruchomienie:
 *   npm test
 *   npx vitest run scripts/faqRiskUtils.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { describe, it, expect } from 'vitest';
import type { FAQItem } from '../data/faqDatabase';
import {
  normalizeText,
  isStrongLegalClaim,
  hasStrongOfficialSource,
  shouldMarkAsInfoOnly,
  markRiskyFaqItems,
} from './faqRiskUtils';

// ── Helper: buduje minimalny FAQItem do testów ────────────────────────────────

function makeItem(
  id: string,
  question: string,
  answer: string,
  source: string,
  extra: Partial<FAQItem> = {},
): FAQItem {
  return {
    id,
    phase: 0,
    category: 'Test',
    question,
    answer,
    tags: [],
    difficulty: 'beginner',
    audience: 'wszyscy',
    relatedTopics: [],
    source,
    ...extra,
  };
}

// ─── normalizeText ────────────────────────────────────────────────────────────

describe('normalizeText', () => {
  it('zamienia na małe litery i usuwa polskie diakrytyki', () => {
    expect(normalizeText('Grożą Kary KKS')).toBe('groza kary kks');
    expect(normalizeText('Obowiązek wystawienia')).toBe('obowiazek wystawienia');
    expect(normalizeText('Naczelnik Urzędu Skarbowego')).toBe('naczelnik urzedu skarbowego');
  });

  it('obsługuje null i undefined bez błędu', () => {
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(undefined)).toBe('');
  });

  it('sprowadza wielokrotne spacje do jednej', () => {
    expect(normalizeText('a   b   c')).toBe('a b c');
  });
});

// ─── isStrongLegalClaim ───────────────────────────────────────────────────────

describe('isStrongLegalClaim', () => {
  it('wykrywa „grozi kara KKS" w odpowiedzi', () => {
    const item = makeItem(
      'GEN_001',
      'Co grozi za brak wystawienia faktury w KSeF?',
      'Grozi kara KKS do wysokości 100% kwoty podatku VAT.',
      'niezaufany-blog.pl',
    );
    expect(isStrongLegalClaim(item)).toBe(true);
  });

  it('wykrywa „obowiązek" w pytaniu', () => {
    const item = makeItem(
      'GEN_002',
      'Jaki jest obowiązek podatkowy w KSeF?',
      'Podatnik wystawia fakturę przez API.',
      'niezaufany-blog.pl',
    );
    expect(isStrongLegalClaim(item)).toBe(true);
  });

  it('wykrywa „sankcje" w odpowiedzi', () => {
    const item = makeItem(
      'GEN_003',
      'Co się dzieje przy błędzie?',
      'Za błędy grożą sankcje administracyjne i karne.',
      'niezaufany-blog.pl',
    );
    expect(isStrongLegalClaim(item)).toBe(true);
  });

  it('NIE wykrywa roszczenia w neutralnym opisie funkcji', () => {
    const item = makeItem(
      'GEN_004',
      'Co to jest KSeF?',
      'KSeF to Krajowy System e-Faktur udostępniony przez Ministerstwo Finansów.',
      'niezaufany-blog.pl',
    );
    expect(isStrongLegalClaim(item)).toBe(false);
  });
});

// ─── hasStrongOfficialSource ──────────────────────────────────────────────────

describe('hasStrongOfficialSource', () => {
  it('uznaje źródło zawierające domenę gov.pl', () => {
    const item = makeItem('GEN_010', 'Q', 'A', 'Źródło: podatki.gov.pl - dokumentacja KSeF 2026');
    expect(hasStrongOfficialSource(item)).toBe(true);
  });

  it('uznaje źródło zawierające mf.gov.pl', () => {
    const item = makeItem('GEN_011', 'Q', 'A', 'https://www.mf.gov.pl/ksef/faqs');
    expect(hasStrongOfficialSource(item)).toBe(true);
  });

  it('uznaje źródło z numerem aktu prawnego (Dz. U.)', () => {
    const item = makeItem('GEN_012', 'Q', 'A', 'Ustawa z dnia 11.03.2004, Dz. U. 2022 poz. 931');
    expect(hasStrongOfficialSource(item)).toBe(true);
  });

  it('uznaje jawny legalSourceType=ustawa niezależnie od pola source', () => {
    const item = makeItem(
      'FAQ_001',
      'Q',
      'A',
      'niezaufany-blog.pl',
      { legalSourceType: 'ustawa' },
    );
    expect(hasStrongOfficialSource(item)).toBe(true);
  });

  it('uznaje jawny legalSourceType=MF_objaśnienia', () => {
    const item = makeItem(
      'FAQ_002',
      'Q',
      'A',
      'niezaufany-blog.pl',
      { legalSourceType: 'MF_objaśnienia' },
    );
    expect(hasStrongOfficialSource(item)).toBe(true);
  });

  it('NIE uznaje losowego bloga jako silnego źródła', () => {
    const item = makeItem('GEN_013', 'Q', 'A', 'blog-ksiegowego.pl');
    expect(hasStrongOfficialSource(item)).toBe(false);
  });

  it('NIE uznaje legalSourceType=praktyka za silne źródło', () => {
    const item = makeItem(
      'GEN_014',
      'Q',
      'A',
      'niezaufany-blog.pl',
      { legalSourceType: 'praktyka' },
    );
    expect(hasStrongOfficialSource(item)).toBe(false);
  });
});

// ─── shouldMarkAsInfoOnly ─────────────────────────────────────────────────────

describe('shouldMarkAsInfoOnly', () => {
  it('[+] GEN_ + mocne roszczenie + słabe źródło → oznaczyć info_only', () => {
    const item = makeItem(
      'GEN_TEST_001',
      'Co grozi za niewystawienie faktury w KSeF?',
      'Grozi kara KKS w wysokości do 100% kwoty podatku.',
      'niezaufany-blog.pl',
    );
    expect(shouldMarkAsInfoOnly(item)).toBe(true);
  });

  it('[-] GEN_ + mocne roszczenie + gov.pl → NIE oznaczać', () => {
    const item = makeItem(
      'GEN_TEST_002',
      'Co grozi za niewystawienie faktury w KSeF?',
      'Grozi kara KKS w wysokości do 100% kwoty podatku.',
      'Źródło: podatki.gov.pl',
    );
    expect(shouldMarkAsInfoOnly(item)).toBe(false);
  });

  it('[-] FAQ_BR_ (kuratorowany BR) → NIE oznaczać mimo mocnych roszczeń', () => {
    const item = makeItem(
      'FAQ_BR_001',
      'Jakie obowiązki ma biuro rachunkowe?',
      'Biuro musi złożyć ZAW-FA. Grozi kara za brak ZAW-FA.',
      'niezaufany-blog.pl',
    );
    expect(shouldMarkAsInfoOnly(item)).toBe(false);
  });

  it('[-] FAQ_EXT_ (kuratorowany, nie GEN_) → NIE oznaczać', () => {
    const item = makeItem(
      'FAQ_EXT_001',
      'Co grozi za brak faktury?',
      'Grozi kara KKS oraz sankcje administracyjne.',
      'niezaufany-blog.pl',
    );
    expect(shouldMarkAsInfoOnly(item)).toBe(false);
  });

  it('[-] GEN_ bez mocnego roszczenia → NIE oznaczać', () => {
    const item = makeItem(
      'GEN_TEST_003',
      'Co to jest KSeF?',
      'KSeF to Krajowy System e-Faktur umożliwiający wystawianie i odbieranie faktur.',
      'niezaufany-blog.pl',
    );
    expect(shouldMarkAsInfoOnly(item)).toBe(false);
  });
});

// ─── markRiskyFaqItems ────────────────────────────────────────────────────────

describe('markRiskyFaqItems', () => {
  it('oznacza tylko ryzykowny wpis, pozostałe zostawia niezmienione', () => {
    const items: FAQItem[] = [
      makeItem('GEN_R001', 'Kary za brak faktury?', 'Grozi kara KKS.', 'blog.pl'),
      makeItem('GEN_R002', 'Co to KSeF?', 'System e-faktur MF.', 'blog.pl'),
      makeItem('FAQ_EXT_001', 'Kary?', 'Grozi kara KKS.', 'blog.pl'),
    ];

    const result = markRiskyFaqItems(items);

    // GEN_R001: mocne roszczenie + słabe źródło → oznaczony
    expect(result[0].riskLevel).toBe('info_only');
    expect(result[0].verifiedBy).toBe('auto');

    // GEN_R002: brak mocnego roszczenia → niezmieniony
    expect(result[1].riskLevel).toBeUndefined();
    expect(result[1].verifiedBy).toBeUndefined();

    // FAQ_EXT_001: kuratorowany (nie GEN_) → niezmieniony
    expect(result[2].riskLevel).toBeUndefined();
    expect(result[2].verifiedBy).toBeUndefined();
  });

  it('nie mutuje oryginalnej tablicy (immutability)', () => {
    const items: FAQItem[] = [
      makeItem('GEN_IM001', 'Kary?', 'Grozi kara KKS.', 'blog.pl'),
    ];

    markRiskyFaqItems(items);

    // Oryginalna tablica i obiekt niezmienione
    expect(items[0].riskLevel).toBeUndefined();
    expect(items[0].verifiedBy).toBeUndefined();
  });

  it('nie nadpisuje istniejących wartości riskLevel/verifiedBy (operator ??)', () => {
    const items: FAQItem[] = [
      makeItem(
        'GEN_OV001',
        'Kary?',
        'Grozi kara KKS.',
        'blog.pl',
        {
          riskLevel: 'legal_mandatory',
          verifiedBy: 'human',
        },
      ),
    ];

    const result = markRiskyFaqItems(items);

    // shouldMarkAsInfoOnly = true, ale istniejące wartości zachowane przez ??
    expect(result[0].riskLevel).toBe('legal_mandatory');
    expect(result[0].verifiedBy).toBe('human');
  });

  it('zwraca nową tablicę o tej samej długości co wejście', () => {
    const items: FAQItem[] = [
      makeItem('GEN_L001', 'Kary?', 'Grozi kara KKS.', 'blog.pl'),
      makeItem('GEN_L002', 'Co to KSeF?', 'System MF.', 'blog.pl'),
    ];

    const result = markRiskyFaqItems(items);

    expect(result).toHaveLength(items.length);
    expect(result).not.toBe(items); // nowa tablica, nie ta sama referencja
  });
});
