
import React from 'react';
import { useChecklist } from '../context/ChecklistContext';
import { TaskSection } from '../types';
import { MASTER_CHECKLIST } from '../data/staticChecklist';

const ReferenceDocument: React.FC = () => {
  const { tasks, profile, activeClientId, clients } = useChecklist();
  
  const activeClient = activeClientId ? clients[activeClientId] : null;
  const industryName = activeClient?.profile.industry || profile?.industry || 'Standard Rynkowy';
  const companyInfo = activeClient ? `${activeClient.name} (NIP: ${activeClient.nip})` : 'Dokumentacja Wzorcowa';
  
  // Jeśli brak dynamicznych zadań, używamy bazy MASTER_CHECKLIST jako wzorca
  const displayTasks = tasks.length > 0 ? tasks : [];
  const sections = Object.values(TaskSection);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 md:px-0">
      {/* Przycisk Drukowania - Ukryty w druku */}
      <div className="mb-10 flex justify-between items-center print:hidden">
        <div>
           <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">System Documentation Viewer</h2>
           <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">KSeF 2.0 Compliance Engine v2.9</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-slate-900 transition-all shadow-xl shadow-blue-200 transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          DRUKUJ DOKUMENTACJĘ (PDF)
        </button>
      </div>

      {/* GŁÓWNY DOKUMENT RAPORTU */}
      <div id="printable-report" className="bg-white text-slate-900 shadow-2xl p-[20mm] md:p-[25mm] border border-slate-100 rounded-sm font-serif relative overflow-hidden leading-relaxed">
        
        {/* Znak wodny / Akcent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-900"></div>
        <div className="absolute top-20 right-[-100px] text-[150px] font-black text-slate-50 opacity-[0.03] rotate-90 select-none">
          COMPLIANCE
        </div>

        {/* Strona Tytułowa / Nagłówek */}
        <header className="border-b-8 border-slate-900 pb-12 mb-16 flex justify-between items-end">
          <div className="max-w-2xl">
            <div className="text-[10px] font-sans font-black text-blue-600 uppercase tracking-[0.5em] mb-4">Implementation & Technical Documentation | Internal Use Only</div>
            <h1 className="text-5xl md:text-6xl font-black font-sans leading-[0.9] tracking-tighter text-slate-900 uppercase mb-6">
              Strategia <br/>Wdrożenia KSeF 2.0
            </h1>
            <div className="font-sans space-y-1">
               <div className="text-xl font-bold text-slate-800">{industryName}</div>
               <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{companyInfo}</div>
            </div>
          </div>
          <div className="text-right font-sans">
             <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Kod Dokumentu</div>
             <div className="text-lg font-black tracking-widest border-b border-slate-200 pb-1">KSEF-STRAT-2026</div>
             <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">Wydanie: {new Date().toLocaleDateString()}</div>
          </div>
        </header>

        {/* Sekcja 1: Wstęp Merytoryczny */}
        <section className="mb-20 break-inside-avoid">
          <h2 className="text-xs font-sans font-black uppercase tracking-[0.4em] text-slate-300 mb-8 flex items-center gap-4">
            <span className="w-8 h-px bg-slate-200"></span>
            01. Cel i Zakres Dokumentacji
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-12">
            <p className="text-xl text-slate-700 italic font-serif leading-relaxed first-letter:text-6xl first-letter:font-black first-letter:text-slate-900 first-letter:mr-3 first-letter:float-left">
              Niniejsze opracowanie stanowi kompletny podręcznik transformacji procesów fakturowych w organizacji. Dokumentacja łączy wymogi struktury logicznej FA(3) z operacyjną automatyzacją poprzez system "Robot Zwiadowca". Celem jest zapewnienie 100% ciągłości operacyjnej i eliminacja ryzyk karno-skarbowych wynikających z nowelizacji przepisów z dnia 24.12.2025 r.
            </p>
          </div>
        </section>

        {/* Sekcja 2: Architektura Techniczna */}
        <section className="mb-20 break-inside-avoid">
          <h2 className="text-xs font-sans font-black uppercase tracking-[0.4em] text-slate-300 mb-8 flex items-center gap-4">
             <span className="w-8 h-px bg-slate-200"></span>
             02. Specyfikacja Architektury (Robot Zwiadowca)
          </h2>
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 font-sans mb-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-[10px] font-black text-blue-600 uppercase mb-4 tracking-widest">Interface Gateway</h4>
                <ul className="text-xs font-bold text-slate-700 space-y-3">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Silnik: FastAPI / Python 3.12 (Port 8000)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Protokół: HTTP / REST + WS
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Storage: PostgreSQL (XML Archive)
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-blue-600 uppercase mb-4 tracking-widest">Mechanizmy Ochronne</h4>
                <ul className="text-xs font-bold text-slate-700 space-y-3">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    Math-Guard Validation System
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    Auto-Rotation Token JWT 2.0
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    Offline24 Recovery Protocol
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500 italic font-serif">
            Architektura została zoptymalizowana pod kątem eliminacji błędu HTTP 429 (Rate Limit) poprzez zastosowanie kolejkowania asynchronicznego Redis.
          </p>
        </section>

        {/* Sekcja 3: Strategiczna Checklista (APPENDIX A) */}
        <section className="mb-20">
          <h2 className="text-xs font-sans font-black uppercase tracking-[0.4em] text-slate-300 mb-12 flex items-center gap-4">
             <span className="w-8 h-px bg-slate-200"></span>
             03. Appendix A: Spersonalizowana Ścieżka Krytyczna
          </h2>

          {displayTasks.length > 0 ? (
            <div className="space-y-16">
              {sections.map(section => {
                const sectionTasks = displayTasks.filter(t => t.section === section);
                if (sectionTasks.length === 0) return null;

                return (
                  <div key={section} className="break-inside-avoid">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="bg-slate-900 text-white font-sans font-black px-3 py-1.5 text-[10px] tracking-widest">
                         FAZA: {section.split('. ')[0]}
                       </div>
                       <h3 className="text-2xl font-sans font-black uppercase tracking-tight text-slate-900 border-b-2 border-slate-100 pb-1">
                         {section.split('. ')[1]}
                       </h3>
                    </div>
                    
                    <div className="space-y-10 pl-4 md:pl-10 border-l-4 border-slate-50 ml-4">
                      {sectionTasks.map((task, idx) => (
                        <div key={task.id} className="relative">
                          <div className={`absolute -left-[2.15rem] top-1.5 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center text-[8px] font-black shadow-sm ${
                            task.completed ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {task.completed ? '✓' : idx + 1}
                          </div>
                          <div className="flex justify-between items-start mb-2 gap-6">
                            <h4 className="text-xl font-sans font-bold text-slate-900 leading-tight">{task.title}</h4>
                            <span className={`font-sans text-[8px] font-black uppercase px-2 py-1 rounded border ${
                              task.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-base text-slate-600 leading-relaxed font-serif mb-4">
                            {task.description}
                          </p>
                          {task.notes && (
                             <div className="p-4 bg-amber-50 border-l-4 border-amber-200 font-sans italic text-xs text-slate-700 mb-4">
                               <strong className="text-amber-800 uppercase tracking-widest block mb-1 text-[9px]">Uwaga audytorska:</strong>
                               {task.notes}
                             </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 text-center border-4 border-dashed border-slate-100 rounded-[3rem] font-sans">
               <div className="text-5xl mb-6">📄</div>
               <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">Dokumentacja In Blanco</h3>
               <p className="text-slate-500 max-w-sm mx-auto mt-4 font-medium italic leading-relaxed">
                 Wygeneruj checklistę w dashboardzie, aby ten raport został uzupełniony o Twoją spersonalizowaną ścieżkę krytyczną.
               </p>
               <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                  {MASTER_CHECKLIST.slice(0, 4).map(t => (
                    <div key={t.id} className="p-3 bg-slate-50 rounded-xl text-left opacity-40">
                       <div className="text-[9px] font-black text-slate-400 uppercase">{t.id}</div>
                       <div className="text-[10px] font-bold text-slate-600 truncate">{t.title}</div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </section>

        {/* Sekcja 4: Compliance i Ryzyko */}
        <section className="mt-32 pt-20 border-t-2 border-slate-100 break-inside-avoid">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 font-sans">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Podsumowanie Zgodności</h3>
                <div className="space-y-6">
                   <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-500">Struktura Logiczna</span>
                      <span className="text-xs font-black">FA(3) Standard</span>
                   </div>
                   <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-500">Bezpieczeństwo KKS</span>
                      <span className="text-xs font-black text-green-600">Pełna ochrona</span>
                   </div>
                   <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-500">Metodologia AI</span>
                      <span className="text-xs font-black">Gemini 3.0 Reasoning</span>
                   </div>
                </div>
              </div>
              <div className="p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col justify-center text-center">
                 <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">Audit Status</div>
                 <div className="text-4xl font-black mb-4">CERTIFIED</div>
                 <p className="text-[10px] opacity-60 leading-relaxed font-bold uppercase">Dokumentacja wygenerowana przez PunchlineROI Compliance Engine</p>
              </div>
           </div>
        </section>

        {/* Podpisy i Stopka */}
        <footer className="mt-32 pt-16 font-sans border-t-8 border-slate-900">
          <div className="grid grid-cols-2 gap-20">
            <div className="space-y-16">
              <div>
                <div className="text-[9px] font-black text-slate-400 uppercase mb-4 tracking-widest">Akceptacja Strategii (Zarząd)</div>
                <div className="h-24 border-b border-slate-200 flex items-end pb-3">
                   <span className="text-[10px] text-slate-300 italic">Podpis i pieczęć osobowa</span>
                </div>
              </div>
            </div>
            <div className="space-y-16">
              <div>
                <div className="text-[9px] font-black text-slate-400 uppercase mb-4 tracking-widest">Zatwierdzenie Techniczne (KSeF Architect)</div>
                <div className="h-24 border-b border-slate-200 flex items-center justify-center">
                    <div className="border-4 border-blue-600/20 px-4 py-2 rounded-2xl rotate-[-5deg]">
                       <div className="text-blue-600/30 font-black text-xl">PUNCHLINE COMPLIANCE</div>
                    </div>
                </div>
              </div>
              <div className="text-[8px] font-bold text-slate-400 uppercase text-right tracking-[0.4em]">
                 Data raportu: {new Date().toLocaleDateString()} | v2.9 Standard
              </div>
            </div>
          </div>
          
          <div className="mt-28 text-center">
             <div className="inline-block px-10 py-3 border border-slate-100 rounded-full">
               <p className="text-[9px] font-sans font-black text-slate-300 uppercase tracking-[0.8em]">
                 This document is strictly confidential and belongs to the Client and PunchlineROI.com
               </p>
             </div>
          </div>
        </footer>

        {/* Numery stron (pseudo) */}
        <div className="absolute bottom-10 right-12 font-sans text-[10px] font-black text-slate-300 uppercase tracking-widest">
           Section: Roadmap / Implementation / Arch v2.9
        </div>
      </div>
    </div>
  );
};

export default ReferenceDocument;
