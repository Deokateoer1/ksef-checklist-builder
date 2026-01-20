
import React, { useState } from 'react';
import CertificateDownloader from './CertificateDownloader';
import QRCodeGenerator from './QRCodeGenerator';

const OfflineModePanel: React.FC = () => {
  const [bipStatus, setBipStatus] = useState<'OK' | 'AWARYJNY' | 'PRZERWA'>('OK');

  const cleanText = (text: string): string => {
    const map: Record<string, string> = {
      'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
      'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
    };
    return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, match => map[match]);
  };

  const handleDownloadSzkolenie = () => {
    const content = `
INSTRUKCJA PROCEDUR AWARYJNYCH KSEF 2.0 (Dla Twojego Robota)
Data: ${new Date().toLocaleDateString()}
-----------------------------------------
1. OFFLINE24 (Brak internetu):
   Faktury wystawiaj lokalnie w systemie ERP.
   Generuj kod QR i wyslij do KSeF w 24h.

2. AWARIA BIP (Awaria Ministerstwa):
   Czekaj na komunikat na gov.pl.
   Masz 7 dni roboczych na doslanie faktur.

3. KONSOLA ROBOTA:
   Upewnij sie, ze FastAPI na porcie 8000 dziala.
   Sprawdz status Redis i PostgreSQL przed startem masowej wysylki.

4. DANE TECHNICZNE:
   - Porty: 8000 (API), 6379 (Redis), 5432 (DB).
-----------------------------------------
Wszystkie kroki zostaly zmapowane w Twoim planie.
    `;
    
    const blob = new Blob([cleanText(content)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Instrukcja_Awaryjna_KSeF.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl mb-8 border-4 border-slate-700">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 shadow-lg">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <span>Protocol Offline 2.0</span>
            </div>
            <h3 className="text-3xl font-black tracking-tight">Tryb Awaryjny & Offline</h3>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status BIP MF</div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border-2 ${
              bipStatus === 'OK' ? 'border-green-500/30 text-green-400' : 'border-red-500 animate-pulse text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${bipStatus === 'OK' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs font-black">{bipStatus === 'OK' ? 'SYSTEM DOSTĘPNY' : 'WYKRYTO AWARIĘ'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 bg-slate-700/50 rounded-3xl border border-slate-600">
              <h4 className="text-sm font-black text-amber-400 uppercase tracking-widest mb-4">Procedury Dosyłania</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-[10px] font-black">24H</div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Offline24</p>
                    <p className="text-[10px] text-slate-400 font-medium">Dosyłanie w ciągu 1 dnia roboczego.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl text-slate-900 border border-slate-100 shadow-xl">
              <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">Szkolenie Zespołu</h4>
              <p className="text-xs text-slate-500 mb-6 font-medium">Kliknij poniżej, aby pobrać instrukcję procedur awaryjnych dla Twojej firmy.</p>
              <button 
                onClick={handleDownloadSzkolenie}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95"
              >
                POBIERZ INSTRUKCJĘ (.TXT)
              </button>
            </div>
          </div>

          <div className="space-y-6 text-slate-900">
             <QRCodeGenerator />
             <CertificateDownloader />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineModePanel;
