
import React, { useState, useEffect } from 'react';

interface ChangelogItem {
  date: string;
  text: string;
}

const CHANGELOG: ChangelogItem[] = [
  { date: '10.12.2025', text: 'Generowanie tokenów JWT 2.0 (oficjalne wsparcie)' },
  { date: '15.11.2025', text: 'Nowa wersja Aplikacji Podatnika KSeF 2.0 (v1.2)' },
  { date: '01.11.2025', text: 'Moduł MCU - specyfikacja certyfikatów i uprawnień' },
  { date: '30.09.2025', text: 'Start testów API 2.0 (środowisko DEMO)' }
];

const CRITICAL_DATES = [
  { date: '2025-12-10', label: 'Start generowania tokenów 2.0' },
  { date: '2026-02-01', label: 'KSeF obowiązkowy (>200 mln)' },
  { date: '2026-04-01', label: 'KSeF obowiązkowy (Pozostali)' }
];

const MonitoringPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [countdowns, setCountdowns] = useState<Record<string, number>>({});

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const newCountdowns: Record<string, number> = {};
      CRITICAL_DATES.forEach(d => {
        const diff = new Date(d.date).getTime() - now;
        newCountdowns[d.label] = Math.ceil(diff / (1000 * 60 * 60 * 24));
      });
      setCountdowns(newCountdowns);
    };
    update();
    const interval = setInterval(update, 1000 * 60 * 60); // Update once per hour
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border-2 border-blue-100 rounded-[2rem] shadow-xl mb-8 overflow-hidden transition-all duration-500">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-blue-50 hover:bg-blue-100/50 transition-colors"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="text-left">
            <h4 className="text-lg font-black text-blue-900 leading-tight">Monitorowanie Zmian & Dokumentacji</h4>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">v2.9 Standard 10/10</p>
          </div>
        </div>
        <svg className={`w-6 h-6 text-blue-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Changelog */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Ostatnie zmiany w doksach</h5>
                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">NEW</span>
              </div>
              <div className="space-y-4">
                {CHANGELOG.map((item, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-slate-100 pb-2">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="text-[10px] font-black text-slate-400">{item.date}</div>
                    <p className="text-xs font-bold text-slate-700 leading-tight">{item.text}</p>
                  </div>
                ))}
              </div>
              <a 
                href="https://ksef.podatki.gov.pl/informacje-ogolne-ksef-2-0" 
                target="_blank" 
                rel="noreferrer"
                className="block mt-6 text-center py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ZOBACZ PEŁNĄ HISTORIĘ ZMIAN
              </a>
            </div>

            {/* Critical Dates & Notifications */}
            <div className="space-y-6">
              <div>
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Critical Dates Tracker</h5>
                <div className="space-y-3">
                  {CRITICAL_DATES.map((d, idx) => {
                    const days = countdowns[d.label] || 0;
                    const isUrgent = days < 30;
                    return (
                      <div key={idx} className={`p-4 rounded-2xl border ${isUrgent ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-700">{d.label}</span>
                          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${isUrgent ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
                            {days > 0 ? `ZA ${days} DNI` : 'DEADLINE!'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
                <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                  Komunikaty MF (Real-time)
                </h5>
                <p className="text-xs font-bold mb-4 opacity-80 leading-relaxed">
                  Monitorujemy RSS MF 24/7. Otrzymuj digest najważniejszych zmian co tydzień.
                </p>
                <a 
                  href="https://www.gov.pl/web/kas/komunikaty" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full block text-center py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] hover:bg-blue-400 hover:text-white transition-all"
                >
                  OTWÓRZ CENTRUM KOMUNIKATÓW
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringPanel;
