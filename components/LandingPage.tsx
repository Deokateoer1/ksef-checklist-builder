
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-24 py-12 animate-in fade-in duration-1000">
      {/* Hero Section */}
      <section className="text-center space-y-8 px-4">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800 animate-bounce">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Wersja 2.9 Standard - Gotowa na 2026</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
          Twój system KSeF 2.0 <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">zasilany przez AI</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          Nie trać czasu na czytanie setek stron rozporządzeń. <br className="hidden md:block"/> 
          Wygeneruj spersonalizowaną ścieżkę wdrożenia i steruj swoim Robotem Zwiadowcą bezpośrednio z jednego dashboardu.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={onStart}
            className="w-full sm:w-auto px-10 py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3"
          >
            <span>Zbuduj darmowy plan</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
          <button 
            onClick={scrollToFeatures}
            className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[2rem] font-black text-lg border-2 border-slate-100 dark:border-slate-700 hover:bg-slate-50 transition-all"
          >
            Zobacz jak to działa
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="scroll-mt-32 px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Dlaczego PunchlineROI?</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Analiza 92 kodów błędów",
              desc: "Nasze AI Gemini 3 mapuje strukturę XML FA(3) i przewiduje potencjalne odrzuty faktur przed ich wysłaniem.",
              icon: "🔧",
              color: "blue"
            },
            {
              title: "Integracja z Twoim API",
              desc: "Pełne wsparcie dla lokalnego FastAPI na porcie 8000. Monitoruj Redis i PostgreSQL w czasie rzeczywistym.",
              icon: "🤖",
              color: "emerald"
            },
            {
              title: "Compliance 10 lat",
              desc: "Automatyczne procedury retencji i Disaster Recovery zgodne z wytycznymi Ministerstwa Finansów na 2026 rok.",
              icon: "⚖️",
              color: "amber"
            }
          ].map((f, i) => (
            <div key={i} className="group p-10 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-50 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900 transition-all shadow-xl shadow-slate-100/50 dark:shadow-none">
              <div className="text-4xl mb-6">{f.icon}</div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-slate-900 dark:bg-blue-600/10 rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Gotowy na rewolucję w fakturowaniu?
          </h2>
          <p className="text-blue-100/60 max-w-xl mx-auto font-bold uppercase tracking-widest text-xs">
            Dołącz do 200+ firm, które automatyzują KSeF z PunchlineROI
          </p>
          <button 
            onClick={onStart}
            className="px-12 py-6 bg-white text-slate-900 rounded-[2.5rem] font-black text-xl hover:scale-105 transition-all shadow-2xl"
          >
            Zacznij teraz
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
