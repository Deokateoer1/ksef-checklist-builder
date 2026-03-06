/**
 * applyFaqRiskMarking.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Skrypt do jednorazowego uruchomienia: analizuje FAQ_GENERATED_KSEF i wypluwa
 * zaktualizowaną tablicę JSON gotową do wklejenia do faqGeneratedKSeF.ts.
 *
 * Uruchomienie (wymaga tsx lub ts-node):
 *   npx tsx scripts/applyFaqRiskMarking.ts > /tmp/FAQ_GENERATED_KSEF_patched.json
 *
 * Lub z ts-node (ESM):
 *   node --loader ts-node/esm scripts/applyFaqRiskMarking.ts > /tmp/patched.json
 *
 * Po uruchomieniu: zamień tablicę w faqGeneratedKSeF.ts na wynik z JSON.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { FAQItem } from '../data/faqDatabase';
import { markRiskyFaqItems } from './faqRiskUtils';
import { FAQ_GENERATED_KSEF } from '../data/faqGeneratedKSeF';

function main(): void {
  const beforeCount = FAQ_GENERATED_KSEF.length;

  // Rzutowanie – generowane wpisy nie mają typów opcjonalnych, ale są kompatybilne
  const updated = markRiskyFaqItems(FAQ_GENERATED_KSEF as unknown as FAQItem[]);

  const markedCount = updated.filter(
    (item) => item.riskLevel === 'info_only' && item.verifiedBy === 'auto',
  ).length;

  // Log do stderr (nie trafi do pliku wyjściowego)
  process.stderr.write(`[FAQ RISK] Łącznie wpisów: ${beforeCount}\n`);
  process.stderr.write(`[FAQ RISK] Oznaczono jako info_only/auto: ${markedCount}\n`);
  process.stderr.write(`[FAQ RISK] Bez zmian: ${beforeCount - markedCount}\n`);

  // Wynik do stdout (przechwytywany przez > /tmp/patched.json)
  process.stdout.write(JSON.stringify(updated, null, 2));
  process.stdout.write('\n');
}

main();
