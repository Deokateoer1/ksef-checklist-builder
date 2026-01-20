import React, { useState, useEffect } from 'react';
import { ChecklistProvider, useChecklist } from './context/ChecklistContext';
import LandingPage from './components/LandingPage';
import OnboardingForm from './components/OnboardingForm';
import BulkGenerationForm from './components/BulkGenerationForm';
import ChecklistDashboard from './components/ChecklistDashboard';
import BulkProgressModal from './components/BulkProgressModal';
import FAQSection from './components/FAQSection';
import AboutPunchline from './components/AboutPunchline';
import { PHASES, EDGE_CASES, KEY_DATES, MASTER_CHECKLIST, getCriticalTasks, getBlockingTasks } from './constants';
import type { PhaseId } from './types';
import { CheckCircle, AlertTriangle, Clock, Shield, AlertOctagon } from 'lucide-react';

const Main: React.FC = () => {
  const { tasks, bulkTasks, isLoading } = useChecklist();
  const [view, setView] = useState<'landing' | 'single' | 'bulk' | 'faq' | 'punchline'>('landing');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('ksef_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [currentPhase, setCurrentPhase] = useState<PhaseId>('preparation');
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const hasContent = tasks.length > 0 || (bulkTasks && Object.keys(bulkTasks).length > 0);
  const criticalTasks = getCriticalTasks();
  const blockingTasks = getBlockingTasks();

  // Oblicz dni do deadline
  const daysToDeadline = Math.ceil(
    (KEY_DATES.KSEF_ALL.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    if (hasContent && view === 'landing') {
      setView('single');
    }
  }, [hasContent]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ksef_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ksef_theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogoClick = () => {
    if (hasContent) {
      setView('single');
    } else {
      setView('landing');
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans flex flex-col selection:bg-blue-100`}>
      <BulkProgressModal />

      <header className={`border-b sticky top-0 z-50 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-black/20' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4 group cursor-pointer" onClick={handleLogoClick}>
            <div className="w-12 h-12 bg-punchline-blue rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 transform group-hover:rotate-6 transition-all duration-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-xl font-black tracking-tighter block leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>PunchlineROI <span className="text-slate-400 font-light">x</span> KSeF 2.0</span>
              </div>
              <span className={`text-[9px] font-bold block uppercase tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-punchline-gray'}`}>Automatyzacja KSeF dla biur rachunkowych | powered by PunchlineROI.com</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!hasContent && view !== 'landing' && view !== 'faq' && view !== 'punchline' && (
              <div className={`p-1 rounded-2xl flex transition-colors ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <button
                  onClick={() => setView('single')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${view === 'single' ? (isDarkMode ? 'bg-slate-700 text-blue-400 shadow-lg' : 'bg-white shadow-sm text-punchline-blue') : 'text-slate-500'}`}
                >
                  POJEDYNCZA
                </button>
                <button
                  onClick={() => setView('bulk')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${view === 'bulk' ? (isDarkMode ? 'bg-slate-700 text-blue-400 shadow-lg' : 'bg-white shadow-sm text-punchline-blue') : 'text-slate-500'}`}
                >
                  BULK
                </button>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className={`p-3 rounded-2xl transition-all border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:border-yellow-400/50' : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300'}`}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>

          <div className="hidden lg:flex items-center space-x-6 text-xs font-black text-slate-400 uppercase tracking-widest">
            <button
              onClick={() => setView('punchline')}
              className={`transition-colors flex items-center space-x-2 ${view === 'punchline' ? 'text-punchline-blue' : 'hover:text-punchline-blue'}`}
            >
              <span>PUNCHLINE</span>
            </button>
            <button
              onClick={() => setView('faq')}
              className={`transition-colors flex items-center space-x-2 ${view === 'faq' ? 'text-punchline-blue' : 'hover:text-punchline-blue'}`}
            >
              <span>FAQ</span>
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
            <span className="text-punchline-blue">v2.9 Standard</span>
          </div>
        </div>
      </header>

      <main className="flex-grow py-12 px-4">
        {view === 'landing' && !hasContent ? (
          <LandingPage onStart={() => setView('single')} />
        ) : view === 'faq' ? (
          <FAQSection />
        ) : view === 'punchline' ? (
          <AboutPunchline />
        ) : !hasContent ? (
          <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
              <button onClick={() => setView('landing')} className="text-xs font-black text-slate-400 hover:text-blue-500 flex items-center gap-2 uppercase tracking-widest transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Wróć do startu
              </button>
            </div>
            {view === 'single' ? <OnboardingForm /> : <BulkGenerationForm />}
          </div>
        ) : (
          <ChecklistDashboard />
        )}

        {/* Phases Navigation */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Fazy Wdrożenia</h2>
          <div className="flex flex-wrap gap-2">
            {PHASES.map((phase) => (
              <button
                key={phase.id}
                onClick={() => setCurrentPhase(phase.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  flex items-center gap-2
                  ${currentPhase === phase.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}
                `}
              >
                <span>{phase.icon}</span>
                <span>{phase.number}. {phase.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Phase Info */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700">
          {(() => {
            const phase = PHASES.find(p => p.id === currentPhase);
            if (!phase) return null;
            return (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{phase.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Faza {phase.number}: {phase.name}
                    </h3>
                    <p className="text-slate-400">{phase.description}</p>
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm text-slate-500 mb-1">Cel biznesowy:</div>
                  <div className="text-white">{phase.businessGoal}</div>
                </div>
              </>
            );
          })()}
        </div>

        {/* 🚨 CRITICAL BLOCKERS - GAP ANALYSIS */}
        <div className="bg-red-900/30 border-2 border-red-600 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertOctagon className="w-8 h-8 text-red-400" />
            <div>
              <h3 className="text-xl font-bold text-red-400">
                🚨 MUSISZ NAPRAWIĆ PRZED WDROŻENIEM
              </h3>
              <p className="text-sm text-red-300">
                GAP ANALYSIS: {criticalTasks.length} krytycznych zadań | Ocena: Technicznie A-, Procesowo C+
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {criticalTasks.map((task) => (
              <div
                key={task.id}
                className={`
                  p-4 rounded-lg border-l-4 transition-all cursor-pointer
                  ${completedTasks.has(task.id)
                    ? 'bg-green-900/30 border-green-500'
                    : 'bg-slate-900/50 border-red-500 hover:bg-slate-800/50'}
                `}
                onClick={() => toggleTask(task.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                    ${completedTasks.has(task.id) ? 'bg-green-500' : 'bg-red-600'}
                  `}>
                    {completedTasks.has(task.id) ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-white text-xs font-bold">!</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${completedTasks.has(task.id) ? 'text-green-400 line-through' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {task.estimatedHours}h | D+{task.deadlineDays}
                        </span>
                        {task.isBlocking && (
                          <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded">
                            BLOCKING
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                    {task.auditorNote && (
                      <p className="text-xs text-orange-400 mt-2 italic">
                        ⚠️ Audytor: {task.auditorNote}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Postęp krytycznych zadań:</span>
              <span className="text-lg font-bold text-white">
                {completedTasks.size} / {criticalTasks.length}
              </span>
            </div>
            <div className="mt-2 h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all"
                style={{ width: `${(completedTasks.size / criticalTasks.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3 BRAKUJĄCE MODUŁY - GAP ANALYSIS */}
        <div className="bg-orange-900/20 border border-orange-700 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-bold text-orange-400">
              📋 3 Brakujące Moduły (Audytor: "Bez nich nie puszczę kontroli")
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-orange-600/30">
              <div className="text-2xl mb-2">📤</div>
              <h4 className="font-semibold text-white">UPO Write-Back</h4>
              <p className="text-sm text-slate-400 mt-1">
                Automatyczny zapis numeru KSeF (35 znaków) do ERP po UPO.
              </p>
              <p className="text-xs text-orange-400 mt-2">
                Bez tego: nie zamkniesz miesiąca VAT
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-orange-600/30">
              <div className="text-2xl mb-2">📥</div>
              <h4 className="font-semibold text-white">Faktury Zakupowe</h4>
              <p className="text-sm text-slate-400 mt-1">
                Pobieranie faktur kosztowych z KSeF + workflow akceptacji.
              </p>
              <p className="text-xs text-orange-400 mt-2">
                Bez tego: obsługujesz tylko 50% procesu!
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-orange-600/30">
              <div className="text-2xl mb-2">🔑</div>
              <h4 className="font-semibold text-white">Walidator ZAW-FA</h4>
              <p className="text-sm text-slate-400 mt-1">
                Weryfikacja uprawnień tokena (least privilege).
              </p>
              <p className="text-xs text-orange-400 mt-2">
                Bez tego: ryzyko nadużycia uprawnień
              </p>
            </div>
          </div>
        </div>

        {/* Edge Cases Alert */}
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-bold text-red-400">
              ⚠️ Przypadki Brzegowe (Stress Test)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EDGE_CASES.slice(0, 4).map((edge) => (
              <div
                key={edge.id}
                className="bg-slate-900/50 rounded-lg p-4 border border-red-800/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{edge.name}</span>
                  <span className={`
                    px-2 py-0.5 rounded text-xs font-bold
                    ${edge.riskLevel >= 8 ? 'bg-red-600 text-white' :
                      edge.riskLevel >= 6 ? 'bg-orange-500 text-white' :
                        'bg-yellow-500 text-black'}
                  `}>
                    Ryzyko: {edge.riskLevel}/10
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-2">{edge.description}</p>
                <div className="text-xs text-green-400">
                  ✓ {edge.solution}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Dates */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Kluczowe Terminy</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">1.11.2025</div>
              <div className="text-xs text-slate-400">Start MCU</div>
            </div>
            <div className="text-center p-4 bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">1.02.2026</div>
              <div className="text-xs text-slate-400">KSeF &gt;200mln</div>
            </div>
            <div className="text-center p-4 bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-red-400">1.04.2026</div>
              <div className="text-xs text-slate-400">KSeF wszyscy</div>
            </div>
            <div className="text-center p-4 bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">1.07.2026</div>
              <div className="text-xs text-slate-400">Start kar</div>
            </div>
          </div>
        </div>
      </main>

      <footer className={`py-12 border-t transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-punchline-blue uppercase tracking-[0.3em]">Linki Systemowe</h4>
              <div className="flex flex-col space-y-2">
                <a href="https://ksef.mf.gov.pl/" target="_blank" className="text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors">Portal Podatnika KSeF</a>
                <a href="https://www.podatki.gov.pl/ksef/" target="_blank" className="text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors">Oficjalny Serwis KSeF</a>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-punchline-blue uppercase tracking-[0.3em]">Wsparcie & Wiedza</h4>
              <div className="flex flex-col space-y-2">
                <button onClick={() => setView('faq')} className="text-left text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors">Baza Wiedzy FAQ</button>
                <a href="https://github.com/PunchlineROI/RobotZwiadowca" target="_blank" className="text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors">Repozytorium Robota</a>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-punchline-blue uppercase tracking-[0.3em]">O PunchlineROI</h4>
              <div className="flex flex-col space-y-2">
                <button onClick={() => setView('punchline')} className="text-left text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors">Nasza Misja</button>
                <a href="https://punchlineroi.com" target="_blank" className="text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors">Strona Główna Agency</a>
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-black text-punchline-blue uppercase tracking-[0.3em] mb-4">
              KSEF 2.0 COMPLIANCE SYSTEM powered by PunchlineROI.com
            </p>
            <p className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              &copy; 2025 PunchlineROI - AI Automation Agency | Oficjalne dane MF 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <ChecklistProvider>
    <Main />
  </ChecklistProvider>
);

export default App;
