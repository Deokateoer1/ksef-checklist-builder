
import React, { useState } from 'react';
import { useChecklist } from '../context/ChecklistContext';

interface ExportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportSettingsModal: React.FC<ExportSettingsModalProps> = ({ isOpen, onClose }) => {
  const { exportToPDF, tasks } = useChecklist();
  const [options, setOptions] = useState({
    onlyCritical: false,
    grayscale: false,
    includeRobotDetails: true
  });

  if (!isOpen) return null;

  const criticalCount = tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length;

  const handleExport = () => {
    exportToPDF(options);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Ustawienia Wydruku
          </h3>
          <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest">Przygotuj dokumentację do druku</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 dark:text-white">Tylko najważniejsze (Critical/High)</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Wyfiltruj {criticalCount} kluczowych zadań</span>
              </div>
              <input 
                type="checkbox" 
                checked={options.onlyCritical}
                onChange={e => setOptions({...options, onlyCritical: e.target.checked})}
                className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500" 
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 dark:text-white">Tryb Czarno-Biały</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Oszczędność tonera, wysoki kontrast</span>
              </div>
              <input 
                type="checkbox" 
                checked={options.grayscale}
                onChange={e => setOptions({...options, grayscale: e.target.checked})}
                className="w-6 h-6 rounded-lg text-slate-900 focus:ring-slate-500" 
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 dark:text-white">Uwzględnij detale automatyzacji</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Dopiski o funkcjach Robota Zwiadowcy</span>
              </div>
              <input 
                type="checkbox" 
                checked={options.includeRobotDetails}
                onChange={e => setOptions({...options, includeRobotDetails: e.target.checked})}
                className="w-6 h-6 rounded-lg text-green-600 focus:ring-green-500" 
              />
            </label>
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              onClick={handleExport}
              className={`flex-grow py-4 rounded-2xl font-black text-sm text-white shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 ${options.grayscale ? 'bg-slate-900' : 'bg-blue-600 shadow-blue-200'}`}
            >
              GENERUJ PDF
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              ANULUJ
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rekomendacja: Drukuj dwustronnie dla redukcji śladu węglowego.</p>
        </div>
      </div>
    </div>
  );
};

export default ExportSettingsModal;
