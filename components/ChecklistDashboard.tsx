
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TaskSection, CompanySize, ERPType, UserProfile } from '../types';
import TaskItem from './TaskItem';
import ProgressBar from './ProgressBar';
import AlertsPanel from './AlertsPanel';
import ComplianceRadar from './ComplianceRadar';
import FAQChatbot from './FAQChatbot';
import RobotIntelligenceCenter from './RobotIntelligenceCenter';
import ExportSettingsModal from './ExportSettingsModal';
import ConnectionModal from './ConnectionModal';
import TaskSummaryWidget from './TaskSummaryWidget';
import ChecklistExport from './ChecklistExport';
import ClientManager from './ClientManager';
import Tooltip from './Tooltip';
import { SECTION_ICONS } from '../constants';
import { useChecklist } from '../context/ChecklistContext';

const LOADING_STEPS = [
  "Inicjalizacja silnika wnioskowania Gemini 3 Pro...",
  "Analiza struktury logicznej FA-3 (Ministerstwo Finansów)...",
  "Mapowanie 92 kodów błędów dla Twojego sektora...",
  "Symulacja scenariuszy trybu offline i awaryjnego...",
  "Weryfikacja zgodności z rozporządzeniem z dnia 24.12.2025...",
  "Optymalizacja ścieżki krytycznej wdrożenia...",
  "Generowanie dokumentacji technicznej XML/XSD...",
  "Finalizacja strategii 10/10 Standard...",
];

const ResourceCenter: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
      <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
      Oficjalne Zasoby MF
    </h4>
    <div className="space-y-2">
      {[
        { label: 'Portal Podatnika KSeF', url: 'https://ksef.mf.gov.pl/' },
        { label: 'Dokumentacja API (Swagger)', url: 'https://ksef.mf.gov.pl/api/online/index.html' },
        { label: 'Struktury FA-3 (XSD)', url: 'https://www.gov.pl/web/kas/krajowy-system-e-faktur-struktury-logiczn' },
        { label: 'Aplikacja Mobilna (Test)', url: 'https://ksef-test.mf.gov.pl/web/' }
      ].map((link, i) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
        >
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-600">{link.label}</span>
          <svg className="w-3 h-3 text-slate-300 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      ))}
    </div>
  </div>
);

const KSeFTimeline: React.FC = () => {
  const events = useMemo(() => [
    { date: new Date('2025-01-01'), label: "START ANALIZY", type: 'past' },
    { date: new Date('2025-09-30'), label: "API 2.0 TEST", type: 'future' },
    { date: new Date('2025-12-10'), label: "JWT 2.0 / TOKENY", type: 'future' },
    { date: new Date('2026-02-01'), label: "OBOWIĄZEK (>200M)", type: 'mandatory' },
    { date: new Date('2026-04-01'), label: "OBOWIĄZEK (MŚP)", type: 'mandatory' },
    { date: new Date('2027-01-01'), label: "AKTYWACJA KAR", type: 'fines' },
  ], []);

  const today = new Date();

  const getPosition = (date: Date) => {
    const start = events[0].date.getTime();
    const end = events[events.length - 1].date.getTime();
    const pos = ((date.getTime() - start) / (end - start)) * 100;
    return Math.min(Math.max(pos, 0), 100);
  };

  const todayPos = getPosition(today);

  return (
    <div className="bg-slate-900 dark:bg-slate-900/80 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden border border-slate-800 transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-200 mb-8 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
        KSeF Harmonogram Prawny
      </h3>

      <div className="relative h-[350px] ml-4">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-800 rounded-full"></div>
        <div className="absolute left-0 top-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.5)]" style={{ height: `${todayPos}%` }}></div>
        <div className="absolute left-[-6px] transition-all duration-1000 z-20 group" style={{ top: `${todayPos}%` }}>
          <div className="w-4 h-4 bg-white rounded-full border-4 border-blue-600 shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse"></div>
          <div className="absolute left-8 bottom-full mb-1 bg-blue-600 px-3 py-1 rounded-lg shadow-xl whitespace-nowrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">TU JESTEŚ</span>
          </div>
        </div>

        {events.map((event, idx) => {
          const pos = getPosition(event.date);
          const isPassed = today > event.date;
          return (
            <div key={idx} className="absolute left-[-4px] w-full" style={{ top: `${pos}%` }}>
              <div className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${isPassed ? 'bg-blue-500 border-blue-400' : 'bg-slate-900 border-slate-700'} ${event.type === 'mandatory' ? 'scale-125 border-red-500' : ''}`}></div>
              <div className={`absolute left-8 top-1/2 -translate-y-1/2 transition-opacity duration-500 ${isPassed ? 'opacity-40' : 'opacity-100'}`}>
                <div className={`text-[10px] font-black leading-none mb-1 ${event.type === 'mandatory' ? 'text-red-400' : 'text-slate-400 dark:text-slate-300'}`}>{event.date.toLocaleDateString('pl-PL')}</div>
                <div className={`text-xs font-bold leading-tight uppercase tracking-tight ${event.type === 'mandatory' ? 'text-white' : 'text-slate-300 dark:text-slate-200'}`}>{event.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Inline Generation Form ──────────────────────────────────────────────────

interface InlineFormProps {
  onGenerate: (profile: UserProfile) => void;
  isLoading: boolean;
  error: string | null;
  stepIndex: number;
}

const InlineGenerationForm: React.FC<InlineFormProps> = ({ onGenerate, isLoading, error, stepIndex }) => {
  const [profile, setProfile] = useState<UserProfile>({
    companySize: CompanySize.SMALL,
    industry: '',
    erpSystem: ERPType.POPULAR,
    monthlyInvoices: '1-100',
  });
  const [touched, setTouched] = useState(false);

  const industryError = touched && profile.industry.trim().length < 2;
  const isFormValid = profile.industry.trim().length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (isFormValid) {
      onGenerate(profile);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-16 h-16 rounded-full bg-punchline-blue/10 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div className="text-center space-y-2">
          <p className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Deep Reasoning w toku...</p>
          <p className="text-[11px] font-medium text-slate-400 animate-pulse max-w-xs text-center">{LOADING_STEPS[stepIndex]}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-2">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Wygeneruj Plan KSeF 2.0</h2>
        <p className="text-xs text-slate-400 mt-1">AI dobierze zadania wdrożeniowe dla Twojego profilu</p>
      </div>

      {(error || industryError) && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium">
          {error || "Wpisz nazwę branży (min. 2 znaki)."}
        </div>
      )}

      {/* Branża */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${industryError ? 'text-red-500' : 'text-slate-400'}`}>
            Sektor / Branża *
          </label>
          <Tooltip content="Wpisz branżę np. IT, Handel, Transport. Gemini AI dobierze kody GTU i procedury weryfikacyjne.">
            <svg className="w-4 h-4 text-slate-300 hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </Tooltip>
        </div>
        <input
          type="text"
          required
          placeholder="Np. IT, Produkcja mebli, Handel online"
          value={profile.industry}
          onBlur={() => setTouched(true)}
          onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
          className={`w-full px-4 py-3 rounded-2xl border-2 focus:ring-0 outline-none transition-all bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm ${
            industryError
              ? 'border-red-400 focus:border-red-500'
              : 'border-slate-200 dark:border-slate-700 focus:border-punchline-blue'
          }`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Typ organizacji */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Typ organizacji</label>
            <Tooltip content="Wielkość firmy determinuje datę obowiązkowego wdrożenia KSeF (01.02.2026 vs 01.04.2026).">
              <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z" /></svg>
            </Tooltip>
          </div>
          <select
            value={profile.companySize}
            onChange={(e) => setProfile({ ...profile, companySize: e.target.value as CompanySize })}
            className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-punchline-blue focus:ring-0 outline-none transition-all bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm"
          >
            {Object.values(CompanySize).map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* ERP */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Środowisko ERP</label>
            <Tooltip content="SAP/Dynamics wymagają certyfikowanych modułów MCU. Popularne systemy (Optima/Subiekt) mają gotowe konektory API.">
              <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z" /></svg>
            </Tooltip>
          </div>
          <select
            value={profile.erpSystem}
            onChange={(e) => setProfile({ ...profile, erpSystem: e.target.value as ERPType })}
            className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-punchline-blue focus:ring-0 outline-none transition-all bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm"
          >
            {Object.values(ERPType).map(erp => (
              <option key={erp} value={erp}>{erp}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Wolumen faktur */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Wolumen faktur / mies.</label>
          <Tooltip content="Powyżej 1000 faktur/mies. Gemini zasugeruje Batch Processing i procedury obsługi limitu 10k (Kod 429).">
            <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z" /></svg>
          </Tooltip>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['1-100', '101-1000', '1001-10000', '10000+'].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setProfile({ ...profile, monthlyInvoices: val })}
              className={`py-2.5 px-2 rounded-xl text-[10px] font-black transition-all border-2 ${
                profile.monthlyInvoices === val
                  ? 'bg-punchline-blue border-punchline-blue text-white shadow-lg shadow-blue-100'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-punchline-blue'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-4 px-6 rounded-2xl font-black text-white bg-gradient-to-br from-punchline-blue to-slate-900 hover:opacity-90 shadow-2xl shadow-blue-200 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-3"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="uppercase tracking-wider">Zbuduj Plan KSeF 2.0</span>
      </button>
    </form>
  );
};

// ─── Smart Urgency Ribbon ─────────────────────────────────────────────────────

interface UrgencyRibbonProps {
  tasks: Array<{ priority: string; completed: boolean; deadlineDays: number }>;
  onFilter: (type: 'critical' | 'urgent') => void;
  isCollapsed: boolean;
  onCollapse: () => void;
}

const SmartUrgencyRibbon: React.FC<UrgencyRibbonProps> = ({ tasks, onFilter, isCollapsed, onCollapse }) => {
  const criticalOpen = tasks.filter(t => t.priority === 'critical' && !t.completed).length;
  const urgentOpen   = tasks.filter(t => t.priority === 'high' && !t.completed && t.deadlineDays <= 30).length;

  if (criticalOpen === 0 && urgentOpen === 0) return null;

  // Zwinięty widok — mała pigułka, klikalny by rozwinąć
  if (isCollapsed) {
    return (
      <button
        onClick={onCollapse}
        title="Pokaż alerty krytyczne"
        className="flex items-center gap-1.5 self-start px-3 py-1.5 rounded-xl text-[10px] font-black bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors animate-in fade-in"
      >
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        {criticalOpen + urgentOpen} alert{criticalOpen + urgentOpen !== 1 ? 'y' : ''} ▼
      </button>
    );
  }

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold animate-in slide-in-from-top-2 ${
      criticalOpen > 0
        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
    }`}>
      <div className="flex items-center gap-3 flex-wrap">
        {criticalOpen > 0 && (
          <button
            onClick={() => onFilter('critical')}
            className="flex items-center gap-1.5 text-red-600 dark:text-red-400 hover:underline"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
            {criticalOpen} {criticalOpen === 1 ? 'zadanie KRYTYCZNE' : 'zadania KRYTYCZNE'}
          </button>
        )}
        {urgentOpen > 0 && (
          <button
            onClick={() => onFilter('urgent')}
            className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:underline"
          >
            <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
            {urgentOpen} {urgentOpen === 1 ? 'zadanie PILNE' : 'zadania PILNE'} (≤30 dni)
          </button>
        )}
        <span className="text-slate-400 text-[10px]">— kliknij aby przefiltrować</span>
      </div>
      {/* X zwija ribbon do pigułki zamiast całkowicie usuwać */}
      <button
        onClick={onCollapse}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0 p-1 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
        title="Zwiń alerty"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const ChecklistDashboard: React.FC = () => {
  const {
    tasks, bulkTasks, clients, toggleTask, updateTaskNote, reset,
    profile, mode, generateChecklist, isLoading, error,
  } = useChecklist();

  const [activeSection, setActiveSection] = useState<TaskSection>(TaskSection.PREPARATORY);
  const [activeIndustry, setActiveIndustry] = useState<string | null>(bulkTasks ? Object.keys(bulkTasks)[0] : null);

  // Sync activeIndustry gdy bulkTasks się zmienia (po zakończeniu bulk generation)
  useEffect(() => {
    if (bulkTasks && Object.keys(bulkTasks).length > 0) {
      setActiveIndustry(prev =>
        prev && bulkTasks[prev] ? prev : Object.keys(bulkTasks)[0]
      );
    } else if (!bulkTasks) {
      setActiveIndustry(null);
    }
  }, [bulkTasks]);
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [ribbonCollapsed, setRibbonCollapsed] = useState(false);
  const [urgencyFilter, setUrgencyFilter] = useState<'critical' | 'urgent' | null>(null);

  const tasksRef = useRef<HTMLDivElement>(null);

  const hasTasks = tasks.length > 0 || (bulkTasks && Object.values(bulkTasks).some(t => t.length > 0));

  // Loading animation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setStepIndex(prev => (prev + 1) % LOADING_STEPS.length);
      }, 3500);
    } else {
      setStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const currentTasks = useMemo(() => {
    const rawTasks = mode === 'bulk' && activeIndustry && bulkTasks ? bulkTasks[activeIndustry] : tasks;
    return rawTasks;
  }, [mode, activeIndustry, bulkTasks, tasks]);

  const completedCount = currentTasks.filter(t => t.completed).length;
  const sections = Object.values(TaskSection);

  const firstUncompletedId = useMemo(() => {
    return currentTasks.find(t => !t.completed)?.id;
  }, [currentTasks]);

  const filteredTasksWithIndex = useMemo(() => {
    let base = currentTasks.map((t, idx) => ({ ...t, globalIndex: idx }));

    // Filtr urgency (ribbon)
    if (urgencyFilter === 'critical') {
      base = base.filter(t => t.priority === 'critical' && !t.completed);
    } else if (urgencyFilter === 'urgent') {
      base = base.filter(t => t.priority === 'high' && !t.completed && t.deadlineDays <= 30);
    } else {
      base = base.filter(t => t.section === activeSection);
    }

    return base;
  }, [currentTasks, activeSection, urgencyFilter]);

  const handleUrgencyFilter = (type: 'critical' | 'urgent') => {
    setUrgencyFilter(prev => prev === type ? null : type);
  };

  const showClientManager = profile?.companySize === CompanySize.ACCOUNTING || Object.keys(clients).length > 0;

  useEffect(() => {
    tasksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeSection]);

  const handleGenerate = (p: UserProfile) => {
    generateChecklist(p)
      .then(() => console.log("[ChecklistDashboard] Generowanie zakończone."))
      .catch(err => console.error("[ChecklistDashboard] Błąd generowania:", err));
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-8 px-4 py-4 w-full items-start overflow-x-hidden">

      {/* ── LEWA KOLUMNA ─────────────────────────────────────────────── */}
      <div className="md:col-span-3 lg:col-span-3 space-y-6 md:sticky md:top-24 lg:sticky lg:top-24">
        {hasTasks && showClientManager && <ClientManager />}

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
          {hasTasks ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black dark:text-white">Strategia</h2>
                <div className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded-md">
                  FAZA {sections.indexOf(activeSection)}
                </div>
              </div>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const count = currentTasks.filter(t => t.section === section).length;
                  const done = currentTasks.filter(t => t.section === section && t.completed).length;
                  const isActive = activeSection === section;
                  const hasNextAction = currentTasks.some(t => t.section === section && t.id === firstUncompletedId);
                  return (
                    <button
                      key={section}
                      onClick={() => setActiveSection(section as TaskSection)}
                      className={`w-full group relative flex flex-col p-3.5 rounded-2xl transition-all border-2 ${isActive ? 'bg-slate-900 border-slate-900 dark:border-blue-600 dark:bg-slate-800 text-white shadow-xl' : 'bg-white dark:bg-slate-900 border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}
                    >
                      <div className="w-full flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <span className={`${isActive ? 'text-blue-400' : 'text-slate-400'}`}>{SECTION_ICONS[section]}</span>
                          <span className="font-bold text-[11px] truncate">{section.split('. ')[1]}</span>
                        </div>
                        <div className="text-[10px] font-black">{done}/{count}</div>
                      </div>
                      {hasNextAction && !isActive && (
                        <div className="absolute right-2 top-2 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </>
          ) : (
            /* Pusty stan lewej kolumny */
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan KSeF</p>
              <p className="text-[10px] text-slate-300 dark:text-slate-500">Wypełnij formularz →<br />sekcje pojawią się tutaj</p>
            </div>
          )}
        </div>

        {hasTasks && <ProgressBar current={completedCount} total={currentTasks.length} />}
        {hasTasks && <ComplianceRadar tasks={currentTasks} />}
      </div>

      {/* ── ŚRODKOWA KOLUMNA ──────────────────────────────────────────── */}
      <div ref={tasksRef} className="md:col-span-9 lg:col-span-6 space-y-6">
        {!hasTasks ? (
          /* Inline formularz generowania */
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <InlineGenerationForm
              onGenerate={handleGenerate}
              isLoading={isLoading}
              error={error}
              stepIndex={stepIndex}
            />
          </div>
        ) : (
          <>
            {/* Smart Urgency Ribbon — X zwija do pigułki, nie usuwa */}
            <SmartUrgencyRibbon
              tasks={currentTasks}
              onFilter={handleUrgencyFilter}
              isCollapsed={ribbonCollapsed}
              onCollapse={() => { setRibbonCollapsed(prev => !prev); if (!ribbonCollapsed) setUrgencyFilter(null); }}
            />

            {/* Nagłówek z przyciskiem zmiany profilu */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <button
                onClick={reset}
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Zmień Profil</span>
              </button>

              {urgencyFilter ? (
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${urgencyFilter === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    🔍 Filtr: {urgencyFilter === 'critical' ? 'KRYTYCZNE' : 'PILNE ≤30dni'}
                  </span>
                  <button
                    onClick={() => setUrgencyFilter(null)}
                    className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                  >
                    ✕ Wyczyść
                  </button>
                </div>
              ) : (
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  {activeSection}
                </h2>
              )}
            </div>

            {/* Lista zadań */}
            <div className="grid grid-cols-1 gap-4">
              {filteredTasksWithIndex.map(({ globalIndex, ...task }) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={globalIndex}
                  isNext={task.id === firstUncompletedId}
                  onToggle={(id) => toggleTask(id, activeIndustry || undefined)}
                  onUpdateNote={(id, note) => updateTaskNote(id, note, activeIndustry || undefined)}
                />
              ))}
              {filteredTasksWithIndex.length === 0 && (
                <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <div className="text-4xl mb-4">📂</div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Brak zadań w tej sekcji</p>
                  <button
                    onClick={() => setActiveSection(TaskSection.PREPARATORY)}
                    className="mt-4 text-blue-600 font-black text-[10px] uppercase"
                  >
                    Wróć do Fazy 0
                  </button>
                </div>
              )}
            </div>

            <AlertsPanel />
            <ChecklistExport onOpenSettings={() => setShowExportSettings(true)} />
          </>
        )}
      </div>

      {/* ── PRAWA KOLUMNA ─────────────────────────────────────────────── */}
      <div className="md:col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-24">
        <RobotIntelligenceCenter />
        {hasTasks && <TaskSummaryWidget tasks={currentTasks} />}

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 space-y-3">
          <button
            onClick={() => setShowConnectionModal(true)}
            className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-blue-600 text-white font-black text-xs hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-xl shadow-blue-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>SYNC / SHARE</span>
          </button>
          <button
            onClick={() => setShowChat(true)}
            className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            AI CHAT
          </button>
        </div>

        <KSeFTimeline />
        <ResourceCenter />
      </div>

      {showChat && <FAQChatbot onClose={() => setShowChat(false)} />}
      {showConnectionModal && <ConnectionModal isOpen={showConnectionModal} onClose={() => setShowConnectionModal(false)} />}
      <ExportSettingsModal isOpen={showExportSettings} onClose={() => setShowExportSettings(false)} />
    </div>
  );
};

export default ChecklistDashboard;
