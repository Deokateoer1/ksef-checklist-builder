/**
 * KSeF 2.0 Checklist Builder - Constants
 * 11 Filarów Wdrożeniowych + GAP ANALYSIS FIX
 */

import type { Phase, EdgeCase, PhaseId } from './types';

// ═══════════════════════════════════════════════════════════════
// 11 FILARÓW WDROŻENIOWYCH
// ═══════════════════════════════════════════════════════════════

export const PHASES: Phase[] = [
  {
    id: 'preparation',
    number: 0,
    name: 'Przygotowanie',
    icon: '📋',
    description: 'Rozpoczęcie projektu wdrożeniowego',
    businessGoal: 'Audyt NIP, powołanie zespołu, inwentaryzacja punktów styku'
  },
  {
    id: 'compliance',
    number: 1,
    name: 'Zgodność',
    icon: '⚖️',
    description: 'Dostosowanie prawne',
    businessGoal: 'Aneksowanie umów z biurem rachunkowym, RODO, retencja danych 10 lat'
  },
  {
    id: 'analysis',
    number: 2,
    name: 'Analiza',
    icon: '🔍',
    description: 'Audyt danych',
    businessGoal: 'Czyszczenie bazy kontrahentów, weryfikacja Białej Listy'
  },
  {
    id: 'technical',
    number: 3,
    name: 'Techniczne',
    icon: '🔧',
    description: 'Konfiguracja systemów',
    businessGoal: 'Wybór metody autoryzacji (Token/Pieczęć), setup portu 8443'
  },
  {
    id: 'error-handling',
    number: 4,
    name: 'Obsługa Błędów',
    icon: '⚠️',
    description: 'API i przypadki brzegowe',
    businessGoal: 'Mapowanie kodów błędów KSeF (21133, 429) na procedury'
  },
  {
    id: 'testing',
    number: 5,
    name: 'Testowanie',
    icon: '🧪',
    description: 'Walidacja w środowisku Demo',
    businessGoal: 'Scenariusze testowe, testy obciążeniowe'
  },
  {
    id: 'emergency',
    number: 6,
    name: 'Tryb Awaryjny',
    icon: '🚨',
    description: 'BCP - Ciągłość działania',
    businessGoal: 'Procedura Offline24, generowanie kodów QR'
  },
  {
    id: 'deployment',
    number: 7,
    name: 'Wdrożenie',
    icon: '🚀',
    description: 'Uruchomienie produkcyjne',
    businessGoal: 'Przełączenie na produkcję, monitoring pierwszych 100 faktur'
  },
  {
    id: 'monitoring',
    number: 8,
    name: 'Monitorowanie',
    icon: '📡',
    description: 'Utrzymanie i aktualizacje',
    businessGoal: 'Śledzenie zmian w XSD (FA-3), komunikaty MF'
  },
  {
    id: 'costs',
    number: 9,
    name: 'Koszty',
    icon: '💰',
    description: 'Budżet i ROI',
    businessGoal: 'Kalkulacja ROI, koszty licencji, archiwizacji'
  },
  {
    id: 'kks-risk',
    number: 10,
    name: 'Ryzyko KKS',
    icon: '🛡️',
    description: 'Odpowiedzialność karno-skarbowa',
    businessGoal: 'Matryca odpowiedzialności zarządu'
  }
];

// ═══════════════════════════════════════════════════════════════
// EDGE CASES (Przypadki brzegowe - Stress Test)
// ═══════════════════════════════════════════════════════════════

export const EDGE_CASES: EdgeCase[] = [
  {
    id: 'b2c-invoices',
    name: 'Faktury B2C (Konsumenckie)',
    description: 'Faktury dla osób prywatnych NIE idą do KSeF obowiązkowo',
    category: 'b2c',
    riskLevel: 7,
    solution: 'Osobna ścieżka w systemie - PDF/papier z opcjonalnym KSeF',
    relatedTasks: ['task-b2c-routing', 'task-qr-visualization']
  },
  {
    id: 'vat-rr',
    name: 'Faktury VAT RR (Rolnicy)',
    description: 'Faktury VAT RR mają specjalną strukturę - ryczałt rolny',
    category: 'vat_rr',
    riskLevel: 6,
    solution: 'Dedykowany szablon XML dla VAT RR w FA(3)',
    relatedTasks: ['task-vat-rr-template']
  },
  {
    id: 'currency-invoices',
    name: 'Faktury Walutowe',
    description: 'Problem z kursem: data wystawienia vs data potwierdzenia KSeF',
    category: 'currency',
    riskLevel: 8,
    solution: 'Kurs z dnia poprzedzającego datę wystawienia (nie datę KSeF)',
    relatedTasks: ['task-currency-handling', 'task-nbp-api']
  },
  {
    id: 'internet-vs-ksef-failure',
    name: 'Awaria Internetu vs Awaria KSeF',
    description: 'Dwie RÓŻNE procedury: Offline24 (Twój internet) vs Tryb Awaryjny (MF)',
    category: 'offline',
    riskLevel: 9,
    solution: 'Dwa tryby: offline24 (24h na dosłanie) + awaryjny (7 dni po BIP)',
    relatedTasks: ['task-offline24-procedure', 'task-emergency-mode', 'task-qr-certificates']
  },
  {
    id: 'correction-flow',
    name: 'Obieg Korekt',
    description: 'KSeF NIE MA opcji "Usuń" - tylko korekta do zera + nowa faktura',
    category: 'correction',
    riskLevel: 8,
    solution: 'Procedura: Korekta zerująca → Nowa faktura z poprawnym NIP',
    relatedTasks: ['task-correction-procedure', 'task-pincer-correction']
  },
  {
    id: 'api-rate-limit',
    name: 'Limity API (Błąd 429)',
    description: 'Przekroczenie limitów = blokada. Brak kolejkowania = chaos',
    category: 'api_limit',
    riskLevel: 9,
    solution: 'Redis queue + exponential backoff + monitoring rate limits',
    relatedTasks: ['task-redis-queue', 'task-rate-limit-monitor']
  },
  {
    id: 'xsd-schema-change',
    name: 'Zmiana schematu XSD',
    description: 'MF może zaktualizować FA(3) - brak monitoringu = błędy walidacji',
    category: 'api_limit',
    riskLevel: 7,
    solution: 'Webhook/RSS na zmiany w dokumentacji MF + wersjonowanie schematów',
    relatedTasks: ['task-schema-monitoring']
  },
  {
    id: 'token-rotation',
    name: 'Rotacja Tokenów',
    description: 'Tokeny wygasają, pracownicy odchodzą - brak procedury = blokada',
    category: 'api_limit',
    riskLevel: 8,
    solution: 'Procedura offboardingu + kalendarz rotacji tokenów',
    relatedTasks: ['task-token-rotation', 'task-employee-offboarding']
  },
  {
    id: 'qr-visualization',
    name: 'Wizualizacja QR',
    description: 'Wydruk faktury MUSI zawierać kod QR - brak = niezgodność',
    category: 'b2c',
    riskLevel: 6,
    solution: 'Generator PDF z QR 2cm x 2cm + weryfikacja kontrastu',
    relatedTasks: ['task-pdf-generator', 'task-qr-validation']
  },
  {
    id: 'math-validation',
    name: 'Walidacja Matematyczna',
    description: 'KSeF przyjmie fakturę 100+23=124! Musisz walidować sam',
    category: 'api_limit',
    riskLevel: 7,
    solution: 'Pre-walidacja: suma pozycji = suma nagłówka ± 0.01 PLN',
    relatedTasks: ['task-math-validator']
  },

  // ─────────────────────────────────────────────────────────────
  // NOWE Z GAP ANALYSIS (KRYTYCZNE!)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'b2c-firewall',
    name: '🚨 Separator B2C (RODO Firewall)',
    description: 'Brak blokady dla NIP "0000000000" lub pustego. Wysłanie faktury B2C do KSeF = naruszenie RODO!',
    category: 'b2c',
    riskLevel: 10,
    solution: 'Firewall logiczny: blokada bramki KSeF dla NIP pustych/zerowych. Routing B2C → PDF/papier.',
    relatedTasks: ['task-b2c-firewall', 'task-nip-validator']
  },
  {
    id: 'date-of-receipt',
    name: '🚨 Data Wpływu vs Data Wystawienia',
    description: 'KSeF nadaje datę wpływu = moment nadania numeru. ERP księguje wg daty wystawienia. Rozbieżność = błędne odliczenie VAT!',
    category: 'api_limit',
    riskLevel: 9,
    solution: 'Mapowanie ERP: pole "DataNadaniaKSeF" → data wpływu VAT (nie data systemowa ERP).',
    relatedTasks: ['task-erp-date-mapping', 'task-vat-reconciliation']
  },
  {
    id: 'currency-offline',
    name: 'Kurs Walutowy w Trybie Offline',
    description: 'Faktura offline (dzień X), wysłana dzień Y. Jaki kurs? NBP z dnia X, ale KSeF ma datę Y.',
    category: 'currency',
    riskLevel: 8,
    solution: 'Procedura: kurs NBP z dnia poprzedzającego datę wystawienia (P_1), NIE datę KSeF.',
    relatedTasks: ['task-currency-offline-procedure']
  },
  {
    id: 'token-kill-switch',
    name: '🚨 Kill-Switch dla Tokenów (HR Incident)',
    description: 'Pracownik zwolniony dyscyplinarnie w piątek 16:00. Token na pendrive. Brak procedury = dostęp do KSeF!',
    category: 'api_limit',
    riskLevel: 9,
    solution: 'Procedura Kill-Switch: natychmiastowe unieważnienie tokena + offboarding checklist HR.',
    relatedTasks: ['task-token-kill-switch', 'task-hr-offboarding']
  },
  {
    id: 'batch-payment-id',
    name: 'Identyfikator Zbiorczy (Split Payment)',
    description: 'Płatność za 100 faktur jednym przelewem MPP wymaga ID zbiorczego z KSeF. Bez tego bank odrzuci!',
    category: 'api_limit',
    riskLevel: 7,
    solution: 'Pobranie identyfikatora zbiorczego z KSeF przed przelewem. Test z bankowością.',
    relatedTasks: ['task-batch-payment-test']
  },
  {
    id: 'double-booking-offline',
    name: 'Podwójny Obieg (Dubel Kosztów)',
    description: 'Offline: nabywca księguje papier/PDF, potem pobiera XML. Ma dubel kosztów w ERP!',
    category: 'offline',
    riskLevel: 8,
    solution: 'Flaga ERP: faktura jako "oczekująca na parowanie z KSeF". Blokada duplikatów.',
    relatedTasks: ['task-anti-double-booking']
  },
  {
    id: 'jpk-reconciliation',
    name: '🚨 Rekoncyliacja JPK_V7 (Brak numeru KSeF)',
    description: 'ERP wysłał fakturę, ale nie pobrał numeru KSeF (błąd sieci). JPK_V7 będzie błędny!',
    category: 'api_limit',
    riskLevel: 10,
    solution: 'Raport różnicowy: faktury w ERP bez numeru KSeF vs faktury potwierdzone w KSeF.',
    relatedTasks: ['task-jpk-reconciliation', 'task-upo-writeback']
  }
];

// ═══════════════════════════════════════════════════════════════
// MASTER CHECKLIST - KRYTYCZNE ZADANIA Z GAP ANALYSIS
// ═══════════════════════════════════════════════════════════════

export interface MasterTask {
  id: string;
  phase: PhaseId;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedHours: number;
  deadlineDays: number; // D+X od Day Zero
  isBlocking: boolean;
  source: 'gap-analysis' | 'faq' | 'technical';
  auditorNote?: string;
}

export const MASTER_CHECKLIST: MasterTask[] = [
  // ─────────────────────────────────────────────────────────────
  // FAZA 2: ANALIZA
  // ─────────────────────────────────────────────────────────────
  {
    id: 'task-b2c-firewall',
    phase: 'analysis',
    title: '🚨 Wdrożenie Firewalla B2C (blokada NIP 0000000000)',
    description: 'Implementacja logicznej blokady wysyłki do KSeF dla faktur bez NIP lub z NIP "0000000000". Routing B2C → PDF/papier.',
    priority: 'critical',
    estimatedHours: 8,
    deadlineDays: 14,
    isBlocking: true,
    source: 'gap-analysis',
    auditorNote: 'RYZYKO RODO! Bez tego ujawnienie danych konsumentów w chmurze publicznej.'
  },
  {
    id: 'task-nip-validator',
    phase: 'analysis',
    title: 'Walidator NIP przed bramką KSeF',
    description: 'Sprawdzenie formatu NIP (10 cyfr, suma kontrolna) PRZED wysyłką. Odrzucenie nieprawidłowych.',
    priority: 'high',
    estimatedHours: 4,
    deadlineDays: 14,
    isBlocking: false,
    source: 'gap-analysis'
  },

  // ─────────────────────────────────────────────────────────────
  // FAZA 3: TECHNICZNE
  // ─────────────────────────────────────────────────────────────
  {
    id: 'task-erp-date-mapping',
    phase: 'technical',
    title: '🚨 Konfiguracja ERP: Mapowanie DataNadaniaKSeF',
    description: 'Mapowanie pola "DataNadaniaKSeF" na datę wpływu VAT w systemie ERP. NIE data systemowa!',
    priority: 'critical',
    estimatedHours: 16,
    deadlineDays: 21,
    isBlocking: true,
    source: 'gap-analysis',
    auditorNote: 'Bez tego błędne odliczenie VAT w następnym miesiącu.'
  },
  {
    id: 'task-upo-writeback',
    phase: 'technical',
    title: '🚨 Mechanizm UPO Write-Back (Synchronizacja Zwrotna)',
    description: 'Automatyczne zapisanie numeru KSeF (35 znaków) do rekordu faktury w ERP po otrzymaniu UPO.',
    priority: 'critical',
    estimatedHours: 24,
    deadlineDays: 28,
    isBlocking: true,
    source: 'gap-analysis',
    auditorNote: 'KLUCZOWE! Bez tego nie można zamknąć miesiąca VAT.'
  },
  {
    id: 'task-currency-offline-procedure',
    phase: 'technical',
    title: 'Procedura kursów walutowych w trybie Offline',
    description: 'Dokumentacja i implementacja: kurs NBP z dnia poprzedzającego P_1 (data wystawienia), nie datę KSeF.',
    priority: 'high',
    estimatedHours: 8,
    deadlineDays: 21,
    isBlocking: false,
    source: 'gap-analysis'
  },
  {
    id: 'task-purchase-invoices',
    phase: 'technical',
    title: '🚨 Moduł Faktur Zakupowych (Pobieranie z KSeF)',
    description: 'Implementacja pobierania faktur kosztowych z KSeF, wizualizacji i workflow akceptacji.',
    priority: 'critical',
    estimatedHours: 40,
    deadlineDays: 35,
    isBlocking: true,
    source: 'gap-analysis',
    auditorNote: 'Obecna aplikacja obsługuje tylko SPRZEDAŻ. To 50% procesu!'
  },

  // ─────────────────────────────────────────────────────────────
  // FAZA 4: OBSŁUGA BŁĘDÓW
  // ─────────────────────────────────────────────────────────────
  {
    id: 'task-token-kill-switch',
    phase: 'error-handling',
    title: '🚨 Procedura Kill-Switch dla Tokenów',
    description: 'Natychmiastowe unieważnienie tokena w przypadku incydentu HR (zwolnienie, kradzież).',
    priority: 'critical',
    estimatedHours: 8,
    deadlineDays: 14,
    isBlocking: true,
    source: 'gap-analysis',
    auditorNote: 'Pracownik zwolniony w piątek 16:00 z tokenem na pendrive = katastrofa.'
  },
  {
    id: 'task-hr-offboarding',
    phase: 'error-handling',
    title: 'Checklist Offboardingu HR (uprawnienia KSeF)',
    description: 'Procedura odbierania uprawnień KSeF przy offboardingu pracownika. Integracja z HR.',
    priority: 'high',
    estimatedHours: 4,
    deadlineDays: 21,
    isBlocking: false,
    source: 'gap-analysis'
  },
  {
    id: 'task-zaw-fa-validation',
    phase: 'error-handling',
    title: 'Walidator Uprawnień ZAW-FA vs Token',
    description: 'Weryfikacja czy token ma TYLKO uprawnienia do fakturowania (zasada least privilege). Nie do podglądu danych wrażliwych.',
    priority: 'high',
    estimatedHours: 8,
    deadlineDays: 21,
    isBlocking: false,
    source: 'gap-analysis'
  },

  // ─────────────────────────────────────────────────────────────
  // FAZA 5: TESTOWANIE
  // ─────────────────────────────────────────────────────────────
  {
    id: 'task-batch-payment-test',
    phase: 'testing',
    title: 'Test płatności zbiorczych (Identyfikator Zbiorczy)',
    description: 'Test pobrania identyfikatora zbiorczego z KSeF dla paczki faktur. Walidacja z bankowością MPP.',
    priority: 'high',
    estimatedHours: 8,
    deadlineDays: 28,
    isBlocking: false,
    source: 'gap-analysis'
  },

  // ─────────────────────────────────────────────────────────────
  // FAZA 6: TRYB AWARYJNY
  // ─────────────────────────────────────────────────────────────
  {
    id: 'task-anti-double-booking',
    phase: 'emergency',
    title: 'Procedura Anty-Dublowa (Offline → ERP)',
    description: 'Flaga ERP: faktura offline jako "oczekująca na parowanie z KSeF". Blokada duplikatów kosztów.',
    priority: 'high',
    estimatedHours: 12,
    deadlineDays: 28,
    isBlocking: false,
    source: 'gap-analysis'
  },

  // ─────────────────────────────────────────────────────────────
  // FAZA 8: MONITOROWANIE
  // ─────────────────────────────────────────────────────────────
  {
    id: 'task-jpk-reconciliation',
    phase: 'monitoring',
    title: '🚨 Raport Różnicowy JPK_V7 (ERP vs KSeF)',
    description: 'Raport: faktury w ERP bez nadanego numeru KSeF vs faktury potwierdzone. Uruchamiany przed JPK.',
    priority: 'critical',
    estimatedHours: 16,
    deadlineDays: 35,
    isBlocking: true,
    source: 'gap-analysis',
    auditorNote: 'Bez tego JPK_V7 będzie zawierał błędne dane. Kary od US!'
  },
  {
    id: 'task-vat-reconciliation',
    phase: 'monitoring',
    title: 'Rekoncyliacja VAT (Data wpływu vs Data wystawienia)',
    description: 'Miesięczny raport: faktury gdzie data wpływu KSeF ≠ data wystawienia. Weryfikacja poprawności okresu VAT.',
    priority: 'high',
    estimatedHours: 8,
    deadlineDays: 35,
    isBlocking: false,
    source: 'gap-analysis'
  }
];

// ═══════════════════════════════════════════════════════════════
// FUNKCJE POMOCNICZE
// ═══════════════════════════════════════════════════════════════

export const getCriticalTasks = (): MasterTask[] =>
  MASTER_CHECKLIST.filter(t => t.priority === 'critical');

export const getTasksByPhase = (phase: PhaseId): MasterTask[] =>
  MASTER_CHECKLIST.filter(t => t.phase === phase);

export const getBlockingTasks = (): MasterTask[] =>
  MASTER_CHECKLIST.filter(t => t.isBlocking);

export const getGapAnalysisTasks = (): MasterTask[] =>
  MASTER_CHECKLIST.filter(t => t.source === 'gap-analysis');

// ═══════════════════════════════════════════════════════════════
// KODY BŁĘDÓW KSeF → PROCEDURY
// ═══════════════════════════════════════════════════════════════

export const ERROR_CODE_PROCEDURES: Record<string, {
  code: string;
  description: string;
  procedure: string;
  phase: PhaseId;
}> = {
  '21116': {
    code: '21116',
    description: 'Nieprawidłowy token',
    procedure: 'Regeneracja tokena w MCU → Aktualizacja w systemie',
    phase: 'error-handling'
  },
  '21170': {
    code: '21170',
    description: 'Sesja wygasła (24h)',
    procedure: 'Auto-refresh tokena przed 23h → Retry',
    phase: 'error-handling'
  },
  '21405': {
    code: '21405',
    description: 'Błąd walidacji XML',
    procedure: 'Sprawdź schemat FA(3) → Popraw dane → Retry',
    phase: 'error-handling'
  },
  '429': {
    code: '429',
    description: 'Rate limit exceeded',
    procedure: 'Dodaj do kolejki Redis → Exponential backoff → Retry',
    phase: 'error-handling'
  },
  '150': {
    code: '150',
    description: 'Processing (>5 min)',
    procedure: 'Timeout handler → Sprawdź status co 30s → Max 10 min',
    phase: 'error-handling'
  }
};

// ═══════════════════════════════════════════════════════════════
// TERMINY KLUCZOWE
// ═══════════════════════════════════════════════════════════════

export const KEY_DATES = {
  MCU_START: new Date('2025-11-01'),        // Moduł Certyfikatów i Uprawnień
  ATTACHMENT_REGISTRATION: new Date('2026-01-01'), // Rejestracja załączników
  KSEF_LARGE: new Date('2026-02-01'),       // Duże firmy (>200mln)
  KSEF_ALL: new Date('2026-04-01'),         // Wszyscy
  PENALTIES_START: new Date('2026-07-01'),  // Start kar
  PAYMENT_ID: new Date('2027-01-01'),       // Numer KSeF w przelewie
  TOKEN_DEADLINE: new Date('2026-12-31'),   // Koniec tokenów (tylko certyfikaty)
};

// ═══════════════════════════════════════════════════════════════
// PRIORYTETY KOLORÓW
// ═══════════════════════════════════════════════════════════════

export const PRIORITY_COLORS = {
  critical: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-500' },
  high: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-400' },
  medium: { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-400' },
  low: { bg: 'bg-green-500', text: 'text-white', border: 'border-green-400' }
};

export const PHASE_BY_ID = (id: PhaseId): Phase | undefined =>
  PHASES.find(p => p.id === id);
