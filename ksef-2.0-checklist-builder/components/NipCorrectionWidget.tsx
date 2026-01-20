
import React, { useState } from 'react';

const NipCorrectionWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [steps, setSteps] = useState({ 1: false, 2: false, 3: false });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [verification, setVerification] = useState({ ceidg: false, białaLista: false, adres: false, nazwa: false });

  const getDaysToJPK = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 25);
    const diff = nextMonth.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const completedSteps = Object.values(steps).filter(Boolean).length;

  return (
    <div className="bg-white border-2 border-red-100 rounded-[2rem] shadow-xl mb-8 overflow-hidden transition-all duration-500">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-red-50 hover:bg-red-100/50 transition-colors"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-left">
            <h4 className="text-lg font-black text-red-900 leading-tight">Procedura naprawcza błędnego NIP</h4>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Postęp naprawy: {completedSteps}/3</p>
          </div>
        </div>
        <svg className={`w-6 h-6 text-red-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
          {/* Alerty */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-4 bg-red-600 text-white rounded-2xl">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p className="text-xs font-black">Ta procedura wymaga wygenerowania 3 oddzielnych dokumentów XML w KSeF!</p>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl">
              <svg className="w-5 h-5 flex-shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-xs font-bold">UWAGA: Rozliczanie błędnego NIP może opóźnić płatność od kontrahenta o kilka dni roboczych.</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl text-white">
              <span className="text-[10px] font-black uppercase tracking-widest ml-2">Czas na korektę przed JPK_VAT</span>
              <span className="text-lg font-black text-blue-400 mr-2">{getDaysToJPK()} dni</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="space-y-6">
            <div className={`flex items-start space-x-4 p-5 rounded-3xl border-2 transition-all ${steps[1] ? 'bg-green-50 border-green-200 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex-shrink-0">
                <input type="checkbox" checked={steps[1]} onChange={() => setSteps({...steps, 1: !steps[1]})} className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-slate-300" />
              </div>
              <div className="flex-grow">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Krok 1: Korekta do zera</span>
                <p className="text-sm font-black text-slate-900 mb-2">Wystaw korektę do zera z BŁĘDNYM numerem NIP</p>
                <div className="text-[10px] bg-slate-100 p-2 rounded-lg font-mono text-slate-600 italic">
                  Faktura 001/2026 (NIP: 123... - błędny) → Korekta 001/K/2026 do 0.00 zł
                </div>
              </div>
            </div>

            <div className={`flex items-start space-x-4 p-5 rounded-3xl border-2 transition-all ${steps[2] ? 'bg-green-50 border-green-200 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex-shrink-0">
                <input type="checkbox" checked={steps[2]} onChange={() => setSteps({...steps, 2: !steps[2]})} className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-slate-300" />
              </div>
              <div className="flex-grow">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Krok 2: Nowa faktura pierwotna</span>
                <p className="text-sm font-black text-slate-900 mb-2">Wystaw NOWĄ fakturę pierwotną z PRAWIDŁOWYM numerem NIP</p>
                <div className="text-[10px] bg-slate-100 p-2 rounded-lg font-mono text-slate-600 italic">
                  Faktura 002/2026 (NIP: 098... - poprawny) - pełna kwota należności
                </div>
              </div>
            </div>

            <div className={`flex items-start space-x-4 p-5 rounded-3xl border-2 transition-all ${steps[3] ? 'bg-green-50 border-green-200 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex-shrink-0">
                <input type="checkbox" checked={steps[3]} onChange={() => setSteps({...steps, 3: !steps[3]})} className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-slate-300" />
              </div>
              <div className="flex-grow">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Krok 3: Komunikacja</span>
                <p className="text-sm font-black text-slate-900 mb-3">Powiadom kontrahenta o zamianie numerów faktur i korekcie</p>
                <button 
                  onClick={() => setShowEmailModal(true)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-blue-600 transition-all shadow-md"
                >
                  WYGENERUJ EMAIL DO KONTRAHENTA
                </button>
              </div>
            </div>
          </div>

          {/* Checklist weryfikacji */}
          <div className="pt-6 border-t border-slate-100">
             <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Przed ponowną wysyłką sprawdź:</h5>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'ceidg', label: 'NIP istnieje w CEIDG/KRS' },
                  { key: 'białaLista', label: 'NIP aktywny (Biała Lista)' },
                  { key: 'adres', label: 'Adres zgodny z rejestrem' },
                  { key: 'nazwa', label: 'Nazwa firmy poprawna' }
                ].map((item) => (
                  <label key={item.key} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={verification[item.key as keyof typeof verification]} 
                      onChange={() => setVerification({...verification, [item.key]: !verification[item.key as keyof typeof verification]})}
                      className="w-4 h-4 rounded text-blue-600" 
                    />
                    <span className="text-[11px] font-bold text-slate-700">{item.label}</span>
                  </label>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <h3 className="text-white font-black text-lg">Szablon powiadomienia o korekcie</h3>
              <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-mono text-[11px] leading-relaxed text-slate-700 h-96 overflow-y-auto mb-6">
                <p className="font-bold mb-4 text-slate-900">Temat: Korekta faktury - zmiana numeru NIP</p>
                <p>Szanowni Państwo,</p><br/>
                <p>Uprzejmie informujemy, że w fakturze [NUMER] wystąpił błąd w numerze NIP nabywcy.</p><br/>
                <p className="font-bold text-red-600">Faktura BŁĘDNA:</p>
                <p>- Numer: [STARY_NUMER]</p>
                <p>- NIP: [BŁĘDNY_NIP]</p>
                <p>- Status: SKORYGOWANA DO ZERA (XML przesłany do KSeF)</p><br/>
                <p className="font-bold text-green-600">Faktura PRAWIDŁOWA:</p>
                <p>- Numer: [NOWY_NUMER]</p>
                <p>- NIP: [PRAWIDŁOWY_NIP]</p>
                <p>- Data wystawienia: [DZISIEJSZA_DATA]</p><br/>
                <p>Prosimy o księgowanie wyłącznie faktury o numerze <span className="font-bold">[NOWY_NUMER]</span>.</p>
                <p>Przepraszamy za niedogodności związane z błędem technicznym.</p><br/>
                <p>Z poważaniem,</p>
                <p>[Twoja Firma / Dział Rozliczeń]</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`Temat: Korekta faktury - zmiana numeru NIP...`);
                    alert('Skopiowano do schowka!');
                  }}
                  className="flex-grow py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                >
                  SKOPIUJ TREŚĆ EMAIL
                </button>
                <button onClick={() => setShowEmailModal(false)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">
                  ZAMKNIJ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NipCorrectionWidget;
