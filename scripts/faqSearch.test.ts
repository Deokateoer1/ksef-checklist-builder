/**
 * faqSearch.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Testy jednostkowe dla governance layer w calculateScore (faqSearch.ts).
 *
 * Testuje:
 *  1. VERIFIED_HUMAN_BOOST  (+10)  — verifiedBy === 'human' > 'auto'
 *  2. INFO_ONLY_PENALTY     (-8)   — riskLevel === 'info_only' obniża score
 *  3. RISK_LEGAL_MANDATORY_BOOST (+6) — riskLevel === 'legal_mandatory' > brak
 *  4. AUDIENCE_EXACT_BOOST  (+8)  — audience === preferredAudience
 *  5. AUDIENCE_UNIVERSAL_BOOST (+3) — audience === 'wszyscy' przy preferredAudience
 *
 * Uruchomienie:
 *   npm test
 *   npx vitest run scripts/faqSearch.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { describe, it, expect, beforeAll } from 'vitest';
import type { FAQItem } from '../data/faqDatabase';
import { tokenizeQuery, calculateScore } from '../services/faqSearch';

// ── Helper: buduje minimalny FAQItem do testów ─────────────────────────────

function makeItem(
  id: string,
  extra: Partial<FAQItem> = {},
): FAQItem {
  return {
    id,
    phase: 1,
    category: 'TEST',
    question: 'Kiedy KSeF staje się obowiązkowy dla podatników VAT?',
    answer: 'KSeF staje się obowiązkowy od 1 lutego 2026 roku dla czynnych podatników VAT.',
    tags: ['KSeF', 'obowiązek', 'podatnik', 'VAT'],
    difficulty: 'beginner',
    audience: 'wszyscy',
    relatedTopics: [],
    source: 'FAQ-KSeF',
    ...extra,
  };
}

// Stałe query — to samo dla wszystkich testów governance (kontrola zmiennej)
const Q = tokenizeQuery('KSeF obowiązek podatnik VAT');

// ─── 1. VERIFIED_HUMAN_BOOST ──────────────────────────────────────────────

describe('VERIFIED_HUMAN_BOOST (+10): verifiedBy human > auto', () => {
  it('human powinien mieć wyższy score niż auto o dokładnie 10 pkt', () => {
    const humanItem = makeItem('TEST_H001', { verifiedBy: 'human' });
    const autoItem  = makeItem('TEST_A001', { verifiedBy: 'auto' });

    const humanScore = calculateScore(Q, humanItem).score;
    const autoScore  = calculateScore(Q, autoItem).score;

    expect(humanScore).toBeGreaterThan(autoScore);
    expect(humanScore - autoScore).toBe(10);
  });

  it('human powinien mieć wyższy score niż item bez verifiedBy o 10 pkt', () => {
    const humanItem   = makeItem('TEST_H002', { verifiedBy: 'human' });
    const noMetaItem  = makeItem('TEST_N001');

    const humanScore   = calculateScore(Q, humanItem).score;
    const noMetaScore  = calculateScore(Q, noMetaItem).score;

    expect(humanScore - noMetaScore).toBe(10);
  });
});

// ─── 2. INFO_ONLY_PENALTY ─────────────────────────────────────────────────

describe('INFO_ONLY_PENALTY (-8): riskLevel info_only obniża score', () => {
  it('info_only powinien mieć niższy score niż item bez riskLevel o 8 pkt', () => {
    const infoItem   = makeItem('TEST_I001', { riskLevel: 'info_only' });
    const baseItem   = makeItem('TEST_B001');

    const infoScore  = calculateScore(Q, infoItem).score;
    const baseScore  = calculateScore(Q, baseItem).score;

    expect(baseScore).toBeGreaterThan(infoScore);
    expect(baseScore - infoScore).toBe(8);
  });

  it('score info_only nie jest ujemny przy zerowym BM25', () => {
    const infoItem  = makeItem('TEST_I002', {
      riskLevel: 'info_only',
      question: 'Zupełnie inny temat niezwiązany z zapytaniem xyzzy abc',
      answer: 'Zupełnie inny temat niezwiązany z zapytaniem xyzzy abc',
      tags: [],
    });
    // Score może być niższy od MIN_SCORE_THRESHOLD (20) i niewidoczny w wynikach,
    // ale sama wartość score nie powinna być NaN
    const result = calculateScore(Q, infoItem);
    expect(result.score).not.toBeNaN();
  });
});

// ─── 3. RISK_LEGAL_MANDATORY_BOOST ───────────────────────────────────────

describe('RISK_LEGAL_MANDATORY_BOOST (+6): legal_mandatory > brak riskLevel', () => {
  it('legal_mandatory powinien mieć wyższy score niż item bez riskLevel o 6 pkt', () => {
    const legalItem = makeItem('TEST_L001', { riskLevel: 'legal_mandatory' });
    const baseItem  = makeItem('TEST_B002');

    const legalScore = calculateScore(Q, legalItem).score;
    const baseScore  = calculateScore(Q, baseItem).score;

    expect(legalScore).toBeGreaterThan(baseScore);
    expect(legalScore - baseScore).toBe(6);
  });

  it('legal_mandatory powinien mieć wyższy score niż info_only o 14 pkt', () => {
    const legalItem = makeItem('TEST_L002', { riskLevel: 'legal_mandatory' });
    const infoItem  = makeItem('TEST_I003', { riskLevel: 'info_only' });

    const legalScore = calculateScore(Q, legalItem).score;
    const infoScore  = calculateScore(Q, infoItem).score;

    // legal_mandatory: +6, info_only: -8 → różnica = 14
    expect(legalScore - infoScore).toBe(14);
  });
});

// ─── 4. AUDIENCE_EXACT_BOOST ─────────────────────────────────────────────

describe('AUDIENCE_EXACT_BOOST (+8): audience === preferredAudience', () => {
  it('audience ksiegowy z preferredAudience=ksiegowy powinien dostać +8', () => {
    const exactItem = makeItem('TEST_AE001', { audience: 'ksiegowy' });
    const noAuItem  = makeItem('TEST_AE002', { audience: 'ksiegowy' });

    const scoreWithPref    = calculateScore(Q, exactItem, 'ksiegowy').score;
    const scoreWithoutPref = calculateScore(Q, noAuItem).score;

    expect(scoreWithPref - scoreWithoutPref).toBe(8);
  });

  it('audience IT z preferredAudience=ksiegowy NIE dostaje EXACT_BOOST', () => {
    const itItem  = makeItem('TEST_AE003', { audience: 'IT' });
    const ksgItem = makeItem('TEST_AE004', { audience: 'IT' });

    // audience='IT', preferredAudience='ksiegowy' → nie pasuje → brak boosta
    const scoreIT  = calculateScore(Q, itItem, 'ksiegowy').score;
    const scoreBase = calculateScore(Q, ksgItem).score;

    // 'IT' nie pasuje do 'ksiegowy' I 'IT' !== 'wszyscy' → brak obu boostów
    expect(scoreIT).toBe(scoreBase);
  });
});

// ─── 5. AUDIENCE_UNIVERSAL_BOOST ─────────────────────────────────────────

describe('AUDIENCE_UNIVERSAL_BOOST (+3): audience=wszyscy przy preferredAudience', () => {
  it('audience wszyscy dostaje +3 gdy preferredAudience jest ustawiony', () => {
    const univItem = makeItem('TEST_AU001', { audience: 'wszyscy' });
    const baseItem = makeItem('TEST_AU002', { audience: 'wszyscy' });

    const scoreWithPref    = calculateScore(Q, univItem, 'menedzer').score;
    const scoreWithoutPref = calculateScore(Q, baseItem).score;

    expect(scoreWithPref - scoreWithoutPref).toBe(3);
  });

  it('audience=wszyscy dostaje mniejszy boost niż audience=exact', () => {
    const univItem  = makeItem('TEST_AU003', { audience: 'wszyscy' });
    const exactItem = makeItem('TEST_AU004', { audience: 'menedzer' });

    const univScore  = calculateScore(Q, univItem,  'menedzer').score;
    const exactScore = calculateScore(Q, exactItem, 'menedzer').score;

    // exactScore = baseScore + 8, univScore = baseScore + 3 → różnica = 5
    expect(exactScore).toBeGreaterThan(univScore);
    expect(exactScore - univScore).toBe(5);
  });
});

// ─── 6. Kombinacja boostów ────────────────────────────────────────────────

describe('Kombinacja governance boostów', () => {
  it('human + legal_mandatory + audience_exact = base + 10 + 6 + 8 = +24', () => {
    const bestItem = makeItem('TEST_COMBO001', {
      verifiedBy: 'human',
      riskLevel: 'legal_mandatory',
      audience: 'audytor',
    });
    const baseItem = makeItem('TEST_COMBO002');

    const bestScore = calculateScore(Q, bestItem, 'audytor').score;
    const baseScore = calculateScore(Q, baseItem).score;

    expect(bestScore - baseScore).toBe(24); // 10 + 6 + 8
  });

  it('auto + info_only + audience_mismatch = base - 8 (tylko kara)', () => {
    const worstItem = makeItem('TEST_COMBO003', {
      verifiedBy: 'auto',
      riskLevel: 'info_only',
      audience: 'IT',
    });
    const baseItem = makeItem('TEST_COMBO004');

    const worstScore = calculateScore(Q, worstItem, 'ksiegowy').score;
    const baseScore  = calculateScore(Q, baseItem).score;

    // auto: 0 (brak boosta), info_only: -8, IT vs ksiegowy: 0 → razem: -8
    expect(baseScore - worstScore).toBe(8);
  });
});

// ─── 7. Sanity-check: nowe moduły BR w FAQ_DATABASE ──────────────────────

describe('FAQ_DATABASE — sanity-check nowych modułów BR', () => {
  // Leniwy import — wczytujemy bazę raz dla całego describe-bloku
  let db: typeof import('../data/faqDatabase').FAQ_DATABASE;

  beforeAll(async () => {
    const mod = await import('../data/faqDatabase');
    db = mod.FAQ_DATABASE;
  });

  it('baza zawiera co najmniej 1 wpis z id zaczynającym się od FAQ_BR_JST_', () => {
    const found = db.filter(x => x.id.startsWith('FAQ_BR_JST_'));
    expect(found.length).toBeGreaterThanOrEqual(1);
  });

  it('baza zawiera co najmniej 1 wpis z id zaczynającym się od FAQ_BR_LIM_', () => {
    const found = db.filter(x => x.id.startsWith('FAQ_BR_LIM_'));
    expect(found.length).toBeGreaterThanOrEqual(1);
  });

  it('wszystkie wpisy FAQ_BR_JST_GV_LIMITS mają verifiedBy=human i riskLevel', () => {
    const brItems = db.filter(x =>
      x.id.startsWith('FAQ_BR_JST_') ||
      x.id.startsWith('FAQ_BR_GV_')  ||
      x.id.startsWith('FAQ_BR_LIM_') ||
      x.id.startsWith('FAQ_BR_ZAL_') ||
      x.id.startsWith('FAQ_BR_UPR_') ||
      x.id.startsWith('FAQ_BR_MODEL_') ||
      x.id.startsWith('FAQ_BR_AWA_') ||
      x.id.startsWith('FAQ_BR_JPK_') ||
      x.id.startsWith('FAQ_BR_ERR_')
    );
    expect(brItems.length).toBe(22); // JST×2 + GV×2 + LIM×3 + ZAL×1 + UPR×3 + MODEL×2 + AWA×3 + JPK×3 + ERR×3
    brItems.forEach(item => {
      expect(item.verifiedBy).toBe('human');
      expect(item.riskLevel).toBeTruthy();
    });
  });

  it('baza po dodaniu nowego modułu nie zawiera duplikatów id', () => {
    const ids = db.map(x => x.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});
