
import React from 'react';

const AboutPunchline: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-punchline-gradient p-12 text-white">
          <div className="flex items-center space-x-6 mb-6">
            <div className="p-4 bg-white/20 rounded-[2rem] shadow-xl">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter">Powered by PunchlineROI</h2>
              <p className="text-blue-100 font-bold uppercase tracking-widest text-sm">AI Automation Agency for SME</p>
            </div>
          </div>
        </div>
        
        <div className="p-12 space-y-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">Eksperci od Automatyzacji KSeF</h3>
            <p className="text-slate-600 font-medium leading-relaxed text-lg">
              Specjalizujemy się w dostarczaniu dedykowanych rozwiązań AI oraz automatyzacji procesów biznesowych 
              ze szczególnym uwzględnieniem wdrożeń Krajowego Systemu e-Faktur dla sektora MŚP oraz biur rachunkowych.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="text-punchline-blue text-2xl font-black mb-1">99 PLN</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pakiet Basic</div>
              <p className="text-[11px] text-slate-500 font-medium">Dla mikro przedsiębiorców potrzebujących gotowej ścieżki.</p>
            </div>
            <div className="p-6 bg-punchline-blue text-white rounded-[2rem] shadow-xl shadow-blue-100">
              <div className="text-white text-2xl font-black mb-1">890 PLN</div>
              <div className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-3">Pakiet Pro</div>
              <p className="text-[11px] text-blue-100 font-medium">Pełny audyt i wsparcie techniczne przy integracji ERP.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="text-punchline-green text-2xl font-black mb-1">1990 PLN</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Enterprise</div>
              <p className="text-[11px] text-slate-500 font-medium">Dla biur rachunkowych zarządzających setkami klientów.</p>
            </div>
          </div>

          <div className="flex flex-col items-center pt-6">
            <a 
              href="https://punchlineroi.com" 
              target="_blank" 
              rel="noreferrer"
              className="px-10 py-5 bg-punchline-blue text-white rounded-2xl font-black text-lg hover:bg-slate-900 transition-all shadow-2xl shadow-blue-200 transform hover:scale-105 active:scale-95"
            >
              Zobacz więcej automatyzacji
            </a>
            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target: 85k MRR | AI Powered Excellence</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPunchline;
