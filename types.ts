
export enum CompanySize {
  SMALL = 'MŚP / Mikro / JDG',
  MEDIUM = 'Średnia firma',
  LARGE = 'Duża firma (>200 mln VAT)',
  ACCOUNTING = 'Biuro Rachunkowe',
  ERP_VENDOR = 'Dostawca/Integrator ERP'
}

export enum ERPType {
  NONE = 'Brak / Excel / Arkusze',
  POPULAR = 'Popularny (Insert, Comarch, Optima)',
  SAP = 'SAP / Oracle / Microsoft Dynamics',
  CUSTOM = 'Dedykowane rozwiązanie (Custom)',
  API_ONLY = 'Tylko Integracja API'
}

export enum CollaborationModel {
  EMPLOYEE = 'Klient → pracownik biura',
  OWNER = 'Klient → właściciel (PESEL)',
  OPERATOR = 'Klient → biuro (operator)',
  SPLIT = 'Podział (S: klient, Z: biuro)'
}

export interface UserProfile {
  companySize: CompanySize;
  industry: string;
  erpSystem: ERPType;
  monthlyInvoices: string;
  collaborationModel?: CollaborationModel;
}

export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum TaskSection {
  PREPARATORY = '0. FAZA PRZYGOTOWAWCZA',
  COMPLIANCE = '1. COMPLIANCE & PRAWNE',
  ANALYSIS = '2. ANALIZA & AUDYT',
  TECHNICAL = '3. PRZYGOTOWANIE TECHNICZNE',
  ERROR_HANDLING = '4. OBSŁUGA BŁĘDÓW & API',
  TESTS = '5. TESTY & LOAD TESTS',
  EMERGENCY = '6. TRYB AWARYJNY & OFFLINE',
  DEPLOYMENT = '7. WDROŻENIE & MONITORING',
  MONITORING = '8. MONITOROWANIE ZMIAN',
  COST_CALCULATION = '9. KALKULATOR KOSZTÓW',
  RISK_ASSESSMENT = '10. ANALIZA RYZYKA KKS'
}

export interface ChecklistTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  section: TaskSection;
  deadlineDays: number;
  estimatedHours: number;
  dependencies: string[];
  completed: boolean;
  automatable: boolean;
  robotFunction?: string;
  notes?: string; // User notes
}

export interface Client {
  id: string;
  name: string;
  nip: string;
  profile: UserProfile;
  tasks: ChecklistTask[];
  createdAt: number;
}

export type BulkChecklistMap = Record<string, ChecklistTask[]>;

export interface ChecklistState {
  tasks: ChecklistTask[];
  bulkTasks: BulkChecklistMap | null;
  profile: UserProfile | null;
  clients: Record<string, Client>; // Multi-tenant storage
  activeClientId: string | null;
  isLoading: boolean;
  bulkProgress: { current: number; total: number; status: string } | null;
  error: string | null;
  mode: 'single' | 'bulk';
}

export type ChecklistAction =
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'GENERATE_START' }
  | { type: 'GENERATE_SUCCESS'; payload: { tasks: ChecklistTask[]; mode: 'single' | 'bulk'; bulkTasks?: BulkChecklistMap } }
  | { type: 'GENERATE_ERROR'; payload: string }
  | { type: 'BULK_PROGRESS'; payload: { current: number; total: number; status: string } }
  | { type: 'TOGGLE_TASK'; payload: { id: string; industry?: string } }
  | { type: 'UPDATE_TASK_NOTE'; payload: { id: string; note: string; industry?: string } }
  | { type: 'RESET' }
  | { type: 'LOAD_PERSISTED_STATE'; payload: Partial<ChecklistState> }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'SWITCH_CLIENT'; payload: string }
  | { type: 'REMOVE_CLIENT'; payload: string }
  | { type: 'UPDATE_ACTIVE_CLIENT_DATA' }; // Syncs current tasks to client record

export const INDUSTRIES = [
  "Handel", "Logistyka", "Produkcja", "Usługi", 
  "Finanse", "IT", "Budownictwo", "Zdrowotnictwo", "Transport", "E-commerce", "Gastronomia"
];
