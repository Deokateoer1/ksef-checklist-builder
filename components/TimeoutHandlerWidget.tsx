import React, { useState, useEffect } from 'react';

const TimeoutHandlerWidget: React.FC = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'timeout' | 'offline' | 'recovering' | 'ratelimited'>('idle');
  const [backlogCount, setBacklogCount] = useState(0);
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  
  // Rate Limit simulation states
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [backoffTime, setBackoffTime] = useState(0);

  const MAX_SECONDS = 300;
  const WARNING_THRESHOLD = 240;

  // Główny licznik czasu (dla trybu processing)
  useEffect(() => {
    let interval: number;
    if (isActive && seconds < MAX_SECONDS && status === 'processing') {
      interval = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 100); // Przyspieszone na potrzeby demo
    } else if (seconds >= MAX_SECONDS && status === 'processing') {
      setIsActive(false);
      setStatus('timeout');
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, status]);

  // Symulacja procesu dosyłania (Recovery)
  useEffect(() => {
    let interval: number;
    if (status === 'recovering') {
      interval = window.setInterval(() => {
        setRecoveryProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setStatus('idle');
              setRecoveryProgress(0);
              setBacklogCount(0);
            }, 1500);
            return 100;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Symulacja Rate Limitingu (Backoff)
  useEffect(() => {
    let interval: number;
    if (status === 'ratelimited' && backoffTime > 0) {
      interval = window.setInterval(() => {
        setBackoffTime(prev => {
          if (prev <= 1) {
            // Koniec odliczania backoffu -> próba ponowienia
            if (retryAttempt < 3) {
              setRetryAttempt(r => r + 1);
              // Kolejny backoff (symulacja sukcesu za 3 razem)
              return 0; // Trigger effect update
            } else {
              // Sukces po retry
              setStatus('processing');
              setSeconds(50); // Wracamy do przetwarzania
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (status === 'ratelimited' && backoffTime === 0 && retryAttempt < 3) {
      // Ustawienie nowego czasu (wykładniczo: 2s -> 4s -> 8s)
      const nextBackoff = Math.pow(2, retryAttempt + 1);
      setBackoffTime(nextBackoff);
    }
    return () => clearInterval(interval);
  }, [status, backoffTime, retryAttempt]);

  const startSimulation = () => {
    setSeconds(0);
    setIsActive(true);
    setStatus('processing');
  };

  const startRateLimitSim = () => {
    setIsActive(false);
    setStatus('ratelimited');
    setRetryAttempt(0);
    setBackoffTime(2); // Start od 2s
  };

  const handleRetry = () => {
    startSimulation();
  };

  const handleOfflineFallback = () => {
    setIsActive(false);
    setStatus('offline');
    setBacklogCount(Math.floor(Math.random() * 50) + 10); // Losowa liczba faktur w buforze
  };

  const startRecovery = () => {
    setStatus('recovering');
    setRecoveryProgress(0);
  };

  const percentage = (seconds / MAX_SECONDS) * 100;
  const isWarning = seconds >= WARNING_THRESHOLD;

  return (
    <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 shadow-xl mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-2xl transition-colors ${
            status === 'recovering' ? 'bg-green-100 text-green-600' : 
            status === 'ratelimited' ? 'bg-purple-100 text-purple-600' :
            'bg-amber-100 text-amber-600'
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900">
              {status === 'recovering' ? 'Synchronizacja Offline24' : 
               status === 'ratelimited' ? 'Rate Limiting (429)' :
               'Symulator Pollingu KSeF (Kod 150)'}
            </h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {status === 'recovering' ? 'Dosyłanie faktur po awarii' : 
               status === 'ratelimited' ? 'Strategia Exponential Backoff' :
               'Procedura timeoutu v2.0'}
            </p>
          </div>
        </div>

        {(status === 'processing' || status === 'recovering' || status === 'ratelimited') && (
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border animate-pulse ${
            status === 'recovering' ? 'bg-green-50 border-green-100' : 
            status === 'ratelimited' ? 'bg-purple-50 border-purple-100' :
            'bg-amber-50 border-amber-100'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              status === 'recovering' ? 'bg-green-500' : 
              status === 'ratelimited' ? 'bg-purple-500' :
              'bg-amber-500'
            }`}></div>
            <span className={`text-[10px] font-black ${
              status === 'recovering' ? 'text-green-700' : 
              status === 'ratelimited' ? 'text-purple-700' :
              'text-amber-700'
            }`}>
              {status === 'recovering' ? 'DOSYŁANIE...' : 
               status === 'ratelimited' ? `ODCZEKIWANIE ${backoffTime}s` :
               'PRZETWARZANIE...'}
            </span>
          </div>
        )}
      </div>

      <div className="mb-8">
        {status === 'recovering' ? (
          <>
            <div className="flex justify-between items-end mb-2">
              <div className="text-xs font-bold text-slate-600">
                Wysyłanie bufora: <span className="text-green-600 font-black">{Math.floor((recoveryProgress/100) * backlogCount)} / {backlogCount} faktur</span>
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Status: {recoveryProgress}%</div>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-green-500 transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                style={{ width: `${recoveryProgress}%` }}
              />
            </div>
          </>
        ) : status === 'ratelimited' ? (
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-center">
            <h5 className="text-purple-900 font-black text-sm mb-2">Wykryto limit zapytań API (429)</h5>
            <div className="flex justify-center space-x-2 mb-4">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full transition-all duration-500 ${i < retryAttempt ? 'bg-purple-600' : 'bg-purple-200'}`}></div>
              ))}
            </div>
            <p className="text-xs text-purple-700 font-medium">
              Ponowna próba za: <span className="text-xl font-black">{backoffTime}s</span> (Próba {retryAttempt + 1}/3)
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-end mb-2">
              <div className="text-xs font-bold text-slate-600">
                Postęp sesji pollingowej: <span className="text-slate-900">{seconds}s / {MAX_SECONDS}s</span>
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase">Polling co 10s</div>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className={`h-full transition-all duration-300 rounded-full ${isWarning ? 'bg-red-500' : 'bg-amber-500'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </>
        )}

        {isWarning && status === 'processing' && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 animate-bounce">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-[10px] font-black text-red-700 leading-tight">
              KRYTYCZNE: KSeF przetwarza dokument zbyt długo (>4 min). Przygotuj się do przełączenia w tryb offline.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {status === 'idle' && (
          <>
            <button 
              onClick={startSimulation}
              className="col-span-1 md:col-span-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>SYMULACJA API 150</span>
            </button>
            <button 
              onClick={startRateLimitSim}
              className="col-span-1 md:col-span-2 py-4 bg-purple-50 text-purple-700 border border-purple-200 rounded-2xl font-black text-sm hover:bg-purple-100 transition-all flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>TEST BŁĘDU 429</span>
            </button>
          </>
        )}

        {status === 'timeout' && (
          <div className="col-span-1 md:col-span-4 p-6 bg-red-50 rounded-2xl border-2 border-red-200 text-center space-y-4">
            <p className="text-sm font-black text-red-900">KSeF nie odpowiedział w ciągu 5 minut. Co chcesz zrobić?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={handleRetry}
                className="px-8 py-3 bg-red-600 text-white rounded-xl font-black text-xs hover:bg-red-700 transition-all"
              >
                PONÓW PRÓBĘ (EXP BACKOFF)
              </button>
              <button 
                onClick={handleOfflineFallback}
                className="px-8 py-3 bg-white border-2 border-red-600 text-red-600 rounded-xl font-black text-xs hover:bg-red-50 transition-all"
              >
                PRZEŁĄCZ NA OFFLINE
              </button>
            </div>
          </div>
        )}

        {status === 'offline' && (
          <div className="col-span-1 md:col-span-4 p-6 bg-slate-900 rounded-3xl text-center space-y-4">
            <div>
              <p className="text-sm font-black text-white mb-2">TRYB OFFLINE AKTYWNY</p>
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 px-4 py-2 rounded-xl border border-blue-500/30">
                <span className="text-[10px] font-black text-blue-300">BUFOR: {backlogCount} FAKTUR</span>
              </div>
            </div>
            <button 
              onClick={startRecovery}
              className="w-full sm:w-auto px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
            >
              PRZYWRÓĆ ONLINE & DOŚLIJ FAKTURY
            </button>
          </div>
        )}

        {status === 'recovering' && (
          <div className="col-span-1 md:col-span-4 p-6 bg-green-50 rounded-3xl border-2 border-green-200 text-center">
            {recoveryProgress < 100 ? (
              <p className="text-xs font-black text-green-800 animate-pulse">Trwa synchronizacja z API Ministerstwa Finansów...</p>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-xs font-black text-green-900">Synchronizacja zakończona! Wszystkie faktury otrzymały numer KSeF.</p>
              </div>
            )}
          </div>
        )}

        {status === 'processing' && (
          <div className="col-span-1 md:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Status API</div>
               <div className="text-xs font-bold text-slate-900">Success Rate: 94.2%</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Avg Response</div>
               <div className="text-xs font-bold text-slate-900">32.5 sekundy</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap gap-6 justify-center">
        <div className="flex flex-col items-center">
          <span className="text-xl font-black text-slate-900">30</span>
          <span className="text-[8px] font-black text-slate-400 uppercase">Max Retries</span>
        </div>
        <div className="w-px h-8 bg-slate-100"></div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-black text-slate-900">10s</span>
          <span className="text-[8px] font-black text-slate-400 uppercase">Interval</span>
        </div>
        <div className="w-px h-8 bg-slate-100"></div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-black text-slate-900">Exp</span>
          <span className="text-[8px] font-black text-slate-400 uppercase">Backoff</span>
        </div>
      </div>
    </div>
  );
};

export default TimeoutHandlerWidget;