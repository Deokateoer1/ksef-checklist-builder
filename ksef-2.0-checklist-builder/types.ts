/**
 * KSeF 2.0 Checklist Builder - Types
 * 11 Filarów Wdrożeniowych
 */

// ═══════════════════════════════════════════════════════════════
// FAZY WDROŻENIA (11 Filarów)
// ═══════════════════════════════════════════════════════════════

export type PhaseId =
  | 'preparation'    // 0. Przygotowanie
  | 'compliance'     // 1. Zgodność
  | 'analysis'       // 2. Analiza
  | 'technical'      // 3. Techniczne
  | 'error-handling' // 4. Obsługa Błędów
  | 'testing'        // 5. Testowanie
  | 'emergency'      // 6. Tryb Awaryjny
  | 'deployment'     // 7. Wdrożenie
  | 'monitoring'     // 8. Monitorowanie
  | 'costs'          // 9. Koszty
  | 'kks-risk';      // 10. Ryzyko KKS

export interface Phase {
  id: PhaseId;
  number: number;
  name: string;
  icon: string;
  description: string;
  businessGoal: string;
}

// ═══════════════════════════════════════════════════════════════
// SMART TASK (Inteligentne Zadanie)
// ═══════════════════════════════════════════════════════════════

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface SmartTask {
  id: string;
  phaseId: PhaseId;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;

  // Metryki
  estimatedHours: number;
  deadlineDays: number; // D+X od Day Zero

  // Flagi
  isRobotTask: boolean;      // 🤖 Automatyzacja możliwa
  isBlocking: boolean;       // Blokuje inne zadania
  requiresToken: boolean;    // Wymaga tokena KSeF

  // Zależności
  dependencies: string[];    // ID zadań wymaganych

  // Źródło
  source: 'ai' | 'legal' | 'technical';
  legalBasis?: string;       // np. "Art. 106na ust. 3 ustawy o VAT"
}

// ═══════════════════════════════════════════════════════════════
// MASTER TASK (z GAP ANALYSIS)
// ═══════════════════════════════════════════════════════════════

export interface MasterTask {
  id: string;
  phase: PhaseId;
  title: string;
  description: string;
  priority: TaskPriority;
  estimatedHours: number;
  deadlineDays: number;
  isBlocking: boolean;
  source: 'gap-analysis' | 'faq' | 'technical' | 'legal';
  auditorNote?: string;
  status?: TaskStatus;
  completedAt?: Date;
}

// ═══════════════════════════════════════════════════════════════
// AUDYT / RAPORT
// ═══════════════════════════════════════════════════════════════

export interface AuditFinding {
  phase: PhaseId;
  issue: string;
  riskLevel: number;
  suggestedTask: string;
  isCritical: boolean;
}

export interface GapAnalysisFinding {
  phase: PhaseId;
  issue: string;
  riskLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  suggestedTask: string;
  isCritical: boolean;
  auditorVerdict?: string;
}

export interface AuditReport {
  technicalGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
  processGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
  findings: GapAnalysisFinding[];
  criticalBlockers: string[];
  mustFixBeforeGoLive: string[];
  generatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// FIRMA / KONTEKST
// ═══════════════════════════════════════════════════════════════

export type CompanySize = 'micro' | 'small' | 'medium' | 'large';
export type CompanyType = 'jdg' | 'spolka' | 'biuro_rachunkowe' | 'korporacja';

export interface CompanyProfile {
  name: string;
  nip: string;
  size: CompanySize;
  type: CompanyType;
  annualRevenue: number;      // w PLN
  monthlyInvoices: number;
  hasAccountingOffice: boolean;
  currentSystem: string;      // np. "Comarch Optima"

  // Daty
  ksefDeadline: Date;         // 1.02 lub 1.04.2026
  dayZero: Date;              // Data startu projektu
}

// ═══════════════════════════════════════════════════════════════
// CHECKLISTA
// ═══════════════════════════════════════════════════════════════

export interface Checklist {
  id: string;
  company: CompanyProfile;
  tasks: SmartTask[];
  createdAt: Date;
  updatedAt: Date;

  // Postęp
  completedTasks: number;
  totalTasks: number;
  currentPhase: PhaseId;

  // Raport
  complianceScore: number;    // 0-100%
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// ═══════════════════════════════════════════════════════════════
// EDGE CASES (Przypadki brzegowe)
// ═══════════════════════════════════════════════════════════════

export interface EdgeCase {
  id: string;
  name: string;
  description: string;
  category: 'b2c' | 'vat_rr' | 'currency' | 'offline' | 'correction' | 'api_limit';
  riskLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  solution: string;
  relatedTasks: string[];
}
