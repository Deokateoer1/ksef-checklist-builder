
import React, { useState, useEffect } from 'react';
import { useChecklist } from '../context/ChecklistContext';

const DETAILED_LOGS = [
  "Sprawdzanie dostępności środowiska Demo API 2.0...",
  "Weryfikacja specyfiki branżowej (PKD/CN)...",
  "Walidacja ról i uprawnień (pieczęć elektroniczna vs podpis)...",
  "Analiza przepustowości łącz i limitów HTTP 429...",
  "Generowanie polityki retencji danych (10 lat)...",
  "Budowanie scenariuszy dla faktur korygujących...",
  "Testowanie integralności struktury FA-3..."
];

const BulkProgressModal: React.FC = () => {
  const { isLoading, bulkProgress } = useChecklist();
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isLoading && bulkProgress) {
      interval = window.setInterval(() => {
        setLogIndex(prev => (prev + 1) % DETAILED_LOGS.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading, bulkProgress]);

  if (!isLoading || !bulkProgress) return null;

  const percentage = Math.round((bulkProgress.current / bulkProgress.total) * 100);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-2xl text-center relative overflow-hidden border border-slate-200">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div 
            className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_20px_rgba(37,99,235,0.6)]" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="mb-8 relative inline-flex">
            <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative p-6 bg-blue-600 text-white rounded-[2rem] shadow-xl shadow-blue-200">
              <svg className="w-12 h-12 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Przetwarzanie Seryjne</h2>
        <div className="flex flex-col items-center space-y-1 mb-10">
            <p className="text-blue-600 font-black text-sm uppercase tracking-widest">{bulkProgress.status}</p>
            <p className="text-slate-400 text-[11px] font-bold italic animate-pulse">
                {DETAILED_LOGS[logIndex]}
            </p>
        </div>

        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Postęp operacji AI</span>
          <span className="text-sm font-black text-slate-900">{bulkProgress.current} / {bulkProgress.total}</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden mb-8 border border-slate-200">
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-in-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              Model <span className="text-slate-900">Gemini 3 Pro</span> generuje unikalne scenariusze podatkowe dla każdej branży z osobna. 
              <br/>Szacowany czas na 1 branżę: ok. 15-20 sek.
            </p>
        </div>
      </div>
    </div>
  );
};

export default BulkProgressModal;
