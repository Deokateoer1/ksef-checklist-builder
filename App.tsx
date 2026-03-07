import React, { useState, useEffect } from 'react';
import { generateChecklistAI } from "./services/aiService";
import { ChecklistProvider, useChecklist } from './context/ChecklistContext';
import LandingPage from './components/LandingPage';
import OnboardingForm from './components/OnboardingForm';
import BulkGenerationForm from './components/BulkGenerationForm';
import ChecklistDashboard from './components/ChecklistDashboard';
import BulkProgressModal from './components/BulkProgressModal';
import FAQSection from './components/FAQSection';
import AboutPunchline from './components/AboutPunchline';
import ReferenceDocument from './components/ReferenceDocument';

const Main: React.FC = () => {
  const { tasks, bulkTasks, isLoading } = useChecklist();
  const [view, setView] = useState<'landing' | 'single' | 'bulk' | 'faq' | 'punchline' | 'reference'>('single');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('ksef_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const hasContent = tasks.length > 0 || (bulkTasks && Object.keys(bulkTasks).length > 0);

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
    window.location.href = window.location.origin + window.location.pathname;
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Przykład użycia AI do generowania checklisty (do wstawienia w odpowiednim miejscu, np. po kliknięciu przycisku)
  // async function handleGenerateChecklist(userPrompt) {
  //   const aiResult = await generateChecklistAI(userPrompt);
  //   setChecklist(aiResult);
  // }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans flex flex-col selection:bg-blue-100`}>
      <BulkProgressModal />

      <header className={`border-b sticky top-0 z-50 transition-colors duration-300 print:hidden ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-black/20' : 'bg-white border-slate-200'}`}>
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
            {!hasContent && view !== 'landing' && view !== 'faq' && view !== 'punchline' && view !== 'reference' && (
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
              onClick={() => setView('reference')}
              className={`transition-colors flex items-center space-x-2 ${view === 'reference' ? 'text-punchline-blue' : 'hover:text-punchline-blue'}`}
            >
              <span>DOKUMENTACJA</span>
            </button>
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

      <main className="flex-grow py-12 px-4 print:py-0 print:px-0">
        {view === 'faq' ? (
          <FAQSection />
        ) : view === 'punchline' ? (
          <AboutPunchline />
        ) : view === 'reference' ? (
          <ReferenceDocument />
        ) : view === 'bulk' && !hasContent ? (
          <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
              <button onClick={() => setView('single')} className="text-xs font-black text-slate-400 hover:text-blue-500 flex items-center gap-2 uppercase tracking-widest transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Wróć
              </button>
            </div>
            <BulkGenerationForm />
          </div>
        ) : (
          <ChecklistDashboard />
        )}
      </main>

      <footer className={`py-12 border-t transition-colors duration-300 print:hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
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
                <button onClick={() => setView('reference')} className="text-left text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors">Wzorcowy Dokument</button>
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
              &copy; {new Date().getFullYear()} PunchlineROI - AI Automation Agency | Oficjalne dane MF {new Date().getFullYear()}
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