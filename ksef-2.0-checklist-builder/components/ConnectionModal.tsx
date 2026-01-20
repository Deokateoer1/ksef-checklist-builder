
import React, { useState, useRef } from 'react';
import { useChecklist } from '../context/ChecklistContext';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({ isOpen, onClose }) => {
  const { getShareableLink, profile, exportToJSON, clients } = useChecklist();
  const [copied, setCopied] = useState(false);
  const [robotUrl, setRobotUrl] = useState('https://localhost:8443'); // Domyślnie Twój nowy port HTTPS
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('loading');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        localStorage.setItem('ksef_state_v3', JSON.stringify(json));
        setImportStatus('success');
        setTimeout(() => { window.location.reload(); }, 1000);
      } catch (err) {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const link = getShareableLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-900 p-8 flex justify-between items-center text-white border-b border-white/5 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-black">Twoja Prywatność & Dane</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dane zapisane wyłącznie lokalnie w Twojej przeglądarce</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-10 space-y-10">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200 leading-relaxed">
                Dane tej aplikacji należą do Ciebie. Nie są wysyłane na nasze serwery. Jeśli chcesz przenieść dane na inny komputer, musisz pobrać plik JSON poniżej i wgrać go w nowym miejscu.
              </p>
            </div>
          </div>
          
          <section className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Transfer Danych (Local Storage Backup)</h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={exportToJSON}
                  className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all group"
                >
                   <svg className="w-8 h-8 mb-2 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   <span className="text-xs font-black">EKSPORTUJ MOJE DANE</span>
                   <span className="text-[9px] text-slate-400 mt-1">Zapisz sesję do pliku JSON</span>
                </button>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer group ${
                    importStatus === 'success' ? 'bg-green-50 border-green-500' :
                    importStatus === 'error' ? 'bg-red-50 border-red-500' :
                    'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-500'
                  }`}
                >
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                   <span className="text-xs font-black">IMPORTUJ MOJE DANE</span>
                   <span className="text-[9px] text-slate-400 mt-1">Wczytaj dane z pliku</span>
                </div>
             </div>
          </section>

          <section>
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Integracja z Robotem (Port 8443)</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Host Robota (HTTPS)</label>
                    <input 
                      type="text" 
                      value={robotUrl} 
                      onChange={(e) => setRobotUrl(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs font-bold outline-none focus:border-blue-600 dark:text-white"
                    />
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl">
                    <span className="text-[10px] font-black text-emerald-600 uppercase block mb-1">Status Portu 8443</span>
                    <span className="text-xs font-black text-emerald-900 dark:text-emerald-400">AKTYWNY / SZYFROWANY</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase mb-3">Instrukcja łączenia</h5>
                  <ol className="text-[11px] text-slate-500 space-y-2 leading-relaxed">
                    <li>1. Upewnij się, że Twój lokalny serwer działa na porcie 8443.</li>
                    <li>2. Wejdź na https://localhost:8443/api/stats i zaakceptuj certyfikat.</li>
                    <li>3. Dashboard połączy się automatycznie z Twoją bazą.</li>
                  </ol>
                </div>
             </div>
          </section>

          <button onClick={onClose} className="w-full py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-sm hover:opacity-90">
            ZACHOWAJ I ZAMKNIJ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionModal;
