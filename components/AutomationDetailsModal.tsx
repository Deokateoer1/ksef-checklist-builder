
import React from 'react';

interface AutomationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  robotFunction: string;
}

const AutomationDetailsModal: React.FC<AutomationDetailsModalProps> = ({ isOpen, onClose, title, robotFunction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-green-600 p-8 flex justify-between items-center text-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl animate-bounce">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-xl leading-tight">Szczegóły Automatyzacji</h3>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Robot Zwiadowca v2.0 Ready</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-black/10 p-2 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-10 space-y-8">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Zadanie</h4>
            <p className="text-lg font-black text-slate-900">{title}</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
            <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Funkcja Robota</h4>
            <p className="text-sm font-bold text-slate-800">{robotFunction}</p>
            <p className="mt-4 text-[11px] text-slate-500 font-medium leading-relaxed italic">
              "Twój Robot Zwiadowca może wykonać to zadanie automatycznie, bez ingerencji człowieka, zapewniając 100% poprawności strukturalnej XML."
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Oszczędność czasu</span>
               <span className="text-sm font-black text-slate-900">~2h dziennie</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Bezpieczeństwo</span>
               <span className="text-sm font-black text-slate-900">Szyfrowanie AES</span>
            </div>
          </div>

          <div className="space-y-3">
            <a 
              href="https://github.com/PunchlineROI/RobotZwiadowca" 
              target="_blank" 
              rel="noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
            >
              <span>ZOBACZ ROBOTA W AKCJI (DEMO)</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
            <button onClick={onClose} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest">Zamknij</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationDetailsModal;
