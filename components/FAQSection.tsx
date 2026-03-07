
import React, { useState, useMemo } from 'react';
import { FAQ_DATABASE, FAQAudience } from '../data/faqDatabase';

const PHASES = [
  { id: -1, label: 'Wszystkie', icon: '🌟' },
  { id: 0, label: '0. Przygotowanie', icon: '📋' },
  { id: 1, label: '1. Compliance', icon: '⚖️' },
  { id: 2, label: '2. Analiza', icon: '🔍' },
  { id: 3, label: '3. Techniczne', icon: '🔧' },
  { id: 4, label: '4. Błędy API', icon: '⚠️' },
  { id: 5, label: '5. Testy', icon: '🧪' },
  { id: 6, label: '6. Offline24', icon: '🚨' },
  { id: 7, label: '7. Wdrożenie', icon: '🚀' },
  { id: 8, label: '8. Monitoring', icon: '📡' },
  { id: 9, label: '9. Koszty', icon: '💰' },
  { id: 10, label: '10. Kary KKS', icon: '🛡️' }
];

const ROLES: {id: FAQAudience | 'wszyscy', label: string}[] = [
    { id: 'wszyscy', label: 'Wszyscy' },
    { id: 'ksiegowy', label: 'Księgowość' },
    { id: 'IT', label: 'IT / Tech' },
    { id: 'menedzer', label: 'Zarząd' },
    { id: 'audytor', label: 'Audyt' }
];

// ─── Normalizacja polskich znaków ─────────────────────────────────────────────
// Konwertuje "ą→a, ę→e, ó→o, ś→s, ź→z, ż→z, ć→c, ń→n, ł→l" + lowercase

function normalizePolish(text: string): string {
  return text
    .toLowerCase()
    .replace(/ł/g, 'l')           // ł nie rozkłada się przez NFD — ręczna zamiana
    .normalize('NFD')              // rozkłada ą→a+ogonek, ś→s+acute itp.
    .replace(/[\u0300-\u036f]/g, '') // usuwa combining diacritical marks
    .trim();
}

// Polskie stopwordy — ignorowane przy filtrze wielowyrazowym
const SEARCH_STOPWORDS = new Set([
  'za', 'w', 'na', 'i', 'z', 'ze', 'do', 'od', 'po', 'co', 'jak',
  'czy', 'sie', 'jest', 'sa', 'to', 'a', 'o', 'u', 'ku', 'bo',
  'lub', 'albo', 'ni', 'te', 'tu', 'ta', 'ten', 'ta', 'to',
]);

/** Dzieli zapytanie na tokeny: normalizuje, usuwa stopwordy i krótkie słowa */
function tokenizeSearch(query: string): string[] {
  return normalizePolish(query)
    .split(/\s+/)
    .filter(w => w.length >= 3 && !SEARCH_STOPWORDS.has(w));
}

/** Liczy ile tokenów pasuje do znormalizowanego tekstu */
function countHits(tokens: string[], normalizedText: string): number {
  return tokens.filter(t => normalizedText.includes(t)).length;
}

// ─── Governance badge helpers ─────────────────────────────────────────────────

type RiskLevel = 'legal_mandatory' | 'recommended' | 'info_only';
type LegalSourceType = 'ustawa' | 'rozporządzenie' | 'MF_objaśnienia' | 'interpretacja' | 'praktyka';

function riskLevelLabel(rl: RiskLevel): string {
  if (rl === 'legal_mandatory') return '⚖️ Wymóg prawny';
  if (rl === 'recommended')     return '✅ Rekomendacja';
  return 'ℹ️ Informacja poglądowa';
}

function riskLevelClass(rl: RiskLevel): string {
  if (rl === 'legal_mandatory')
    return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
  if (rl === 'recommended')
    return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
  return 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';
}

function legalSourceLabel(lst: LegalSourceType): string {
  if (lst === 'ustawa')          return '📜 Ustawa';
  if (lst === 'rozporządzenie')  return '📋 Rozporządzenie MF';
  if (lst === 'MF_objaśnienia')  return '📖 Objaśnienia MF';
  if (lst === 'interpretacja')   return '💬 Interpretacja';
  return '🔧 Praktyka';
}

// ─── Komponent ─────────────────────────────────────────────────────────────────

const FAQSection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activePhase, setActivePhase] = useState<number>(-1);
  const [activeRole, setActiveRole] = useState<FAQAudience | 'wszyscy'>('wszyscy');
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const filteredFAQ = useMemo(() => {
    const trimmed = search.trim();
    const tokens = tokenizeSearch(trimmed);
    const normalized = normalizePolish(trimmed);

    const filtered = FAQ_DATABASE.filter(item => {
      // ── Filtry fazy i roli ──────────────────────────────────────────────────
      const matchesPhase = activePhase === -1 || item.phase === activePhase;
      const matchesRole = activeRole === 'wszyscy' || item.audience === activeRole || item.audience === 'wszyscy';
      if (!matchesPhase || !matchesRole) return false;

      // ── Filtr wyszukiwania ─────────────────────────────────────────────────
      if (!trimmed) return true;

      const qNorm  = normalizePolish(item.question);
      const aNorm  = normalizePolish(item.answer);
      const tagsNorm = item.tags.map(t => normalizePolish(t));
      const tagsStr  = tagsNorm.join(' ');
      const allText  = `${qNorm} ${aNorm} ${tagsStr}`;

      if (tokens.length <= 1) {
        // Pojedynczy token (lub samo zapytanie bez spacji) — dopasowanie podciągu
        const q = tokens[0] ?? normalized;
        return qNorm.includes(q) || aNorm.includes(q) || tagsNorm.some(t => t.includes(q));
      }

      // Wielowyrazowe: wymaga trafienia ≥ 50% tokenów gdziekolwiek w rekordzie
      const hits     = countHits(tokens, allText);
      const required = Math.ceil(tokens.length * 0.5);
      return hits >= required;
    });

    // ── Sortowanie po trafności ────────────────────────────────────────────────
    if (!trimmed) return filtered;

    return [...filtered].sort((a, b) => {
      const scoreOf = (item: typeof FAQ_DATABASE[0]) => {
        const all = `${normalizePolish(item.question)} ${normalizePolish(item.answer)} ${item.tags.map(t => normalizePolish(t)).join(' ')}`;
        // Więcej trafień = wyżej; kuratowane FAQ (nie GEN_) dostają +0.5 bonusu
        const hitScore  = tokens.length > 0 ? countHits(tokens, all) : 0;
        const isCurated = item.id.startsWith('GEN_') ? 0 : 0.5;
        return hitScore + isCurated;
      };
      return scoreOf(b) - scoreOf(a);
    });

  }, [search, activePhase, activeRole]);

  return (
    <div className="max-w-5xl mx-auto w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Baza Wiedzy KSeF 2.0</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">
            Oficjalne wytyczne MF, specyfikacja FA(3) i procedury awaryjne.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Szukaj kodu błędu (np. 21133), procedury offline, lub tematu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all font-bold text-slate-800 dark:text-white placeholder-slate-400"
          />
        </div>

        {/* Filters Container */}
        <div className="flex flex-col gap-6 mb-10">
            {/* Phase Tabs */}
            <div className="flex flex-wrap gap-2 justify-center">
            {PHASES.map(phase => (
                <button
                key={phase.id}
                onClick={() => { setActivePhase(phase.id); setOpenIndex(null); }}
                className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all border-2 flex items-center space-x-2 ${
                    activePhase === phase.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-400'
                }`}
                >
                <span>{phase.icon}</span>
                <span className="uppercase tracking-wide">{phase.label}</span>
                </button>
            ))}
            </div>

            {/* Role Filter */}
            <div className="flex justify-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-6">
                <span className="text-[10px] font-black text-slate-400 uppercase self-center mr-2 tracking-widest">Dla kogo:</span>
                {ROLES.map(role => (
                    <button
                        key={role.id}
                        onClick={() => setActiveRole(role.id)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            activeRole === role.id
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                        {role.label}
                    </button>
                ))}
            </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === item.id ? null : item.id)}
                  className="w-full px-8 py-6 flex items-start justify-between text-left"
                >
                  <div className="flex-grow pr-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-[9px] font-black px-2 py-0.5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 text-blue-500 uppercase tracking-wider">
                        {item.category}
                        </span>
                        {item.difficulty === 'advanced' && (
                            <span className="text-[9px] font-black px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800 uppercase tracking-wider">
                                Advanced
                            </span>
                        )}
                         <span className="text-[9px] font-bold text-slate-400 px-1 py-0.5">#{item.id}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white leading-snug block">
                      {item.question}
                    </span>
                  </div>
                  <div className={`p-2 rounded-full bg-white dark:bg-slate-900 transition-transform duration-300 ${openIndex === item.id ? 'rotate-180 bg-blue-100 dark:bg-slate-700' : ''}`}>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {openIndex === item.id && (
                  <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                    <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-4">
                        {item.answer}
                      </p>

                      {/* Metadata Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 bg-white/50 dark:bg-black/20 rounded-xl p-3">
                          <div className="flex flex-wrap gap-2">
                              {item.tags.map(tag => (
                                  <span key={tag} className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">
                                      #{tag}
                                  </span>
                              ))}
                          </div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <span>Źródło: {item.source}</span>
                              {item.source === 'mf.gov.pl' && <span className="w-2 h-2 bg-blue-500 rounded-full" title="Oficjalne"></span>}
                          </div>
                      </div>

                      {/* Governance badges — riskLevel / legalSourceType / verifiedBy */}
                      {(item.riskLevel || item.legalSourceType || item.verifiedBy) && (
                        <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                          {item.riskLevel && (
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${riskLevelClass(item.riskLevel as RiskLevel)}`}>
                              {riskLevelLabel(item.riskLevel as RiskLevel)}
                            </span>
                          )}
                          {item.legalSourceType && (
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md">
                              {legalSourceLabel(item.legalSourceType as LegalSourceType)}
                            </span>
                          )}
                          {item.verifiedBy === 'human' && (
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md">
                              ✓ Zweryfikowano
                            </span>
                          )}
                          {item.verifiedBy === 'auto' && (
                            <span
                              title="Wygenerowano automatycznie na podstawie dokumentów MF – nie zastępuje porady doradcy podatkowego"
                              className="text-[9px] font-bold px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-md cursor-help"
                            >
                              ⚡ Automatyczne
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Brak wyników dla Twoich filtrów.</p>
              <button onClick={() => {setSearch(''); setActivePhase(-1); setActiveRole('wszyscy');}} className="mt-4 text-blue-600 font-black text-[10px] uppercase hover:underline">Wyczyść filtry</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
