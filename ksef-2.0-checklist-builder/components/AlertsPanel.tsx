
import React, { useState, useEffect } from 'react';

interface Alert {
  id: string;
  text: string;
  type: 'WARNING' | 'CRITICAL' | 'INFO';
  color: string;
  icon: React.ReactNode;
}

const ALERTS: Alert[] = [
  {
    id: 'ksef-doc-unstable',
    text: 'Dokumentacja KSeF 2.0 jest niestabilna - sprawdzaj ksef.podatki.gov.pl co 2 tygodnie',
    type: 'WARNING',
    color: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: (
      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  },
  {
    id: 'ksef-tokens-invalid',
    text: 'Tokeny z KSeF 1.0 NIE DZIAŁAJĄ w 2.0 - wygeneruj nowe od 10.12.2025',
    type: 'CRITICAL',
    color: 'bg-red-50 border-red-200 text-red-800 ring-2 ring-red-500 ring-opacity-20',
    icon: (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'ksef-buffer-test',
    text: 'Planuj 2 tygodnie buforu na testowanie - środowiska demo są wyłączane bez ostrzeżenia',
    type: 'WARNING',
    color: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: (
      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'ksef-test-offline',
    text: 'Środowisko TEST wyłączone 30.09-30.10.2025 - użyj DEMO',
    type: 'INFO',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

const AlertsPanel: React.FC = () => {
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ksef_dismissed_alerts');
    if (saved) {
      setDismissed(JSON.parse(saved));
    }
  }, []);

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    localStorage.setItem('ksef_dismissed_alerts', JSON.stringify(newDismissed));
  };

  const visibleAlerts = ALERTS.filter(alert => !dismissed.includes(alert.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="w-full space-y-3 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alerty Systemowe i Ryzyka</span>
        <div className="flex-grow h-px bg-slate-100"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visibleAlerts.map((alert) => (
          <div 
            key={alert.id}
            className={`relative flex items-center p-4 rounded-2xl border ${alert.color} transition-all duration-300 hover:shadow-md`}
          >
            <div className="flex-shrink-0 mr-4">
              {alert.icon}
            </div>
            <div className="flex-grow">
              <p className="text-xs font-black leading-tight pr-8">
                {alert.text}
              </p>
            </div>
            <button 
              onClick={() => handleDismiss(alert.id)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
