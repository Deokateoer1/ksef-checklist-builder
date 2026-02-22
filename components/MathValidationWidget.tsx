
import React, { useState } from 'react';

const MathValidationWidget: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [netto, setNetto] = useState<string>('100');
  const [vatRate, setVatRate] = useState<string>('23');
  const [brutto, setBrutto] = useState<string>('124');
  const [checklist, setChecklist] = useState({
    math: false,
    vatCalc: false,
    rounding: false,
    totalItems: false
  });

  const parsedNetto = parseFloat(netto) || 0;
  const parsedVatRate = parseFloat(vatRate) || 0;
  const parsedBrutto = parseFloat(brutto) || 0;

  const expectedVat = Math.round(parsedNetto * (parsedVatRate / 100) * 100) / 100;
  const expectedBrutto = Math.round((parsedNetto + expectedVat) * 100) / 100;
  const isValid = Math.abs(expectedBrutto - parsedBrutto) < 0.01;

  return (
    <div className="bg-white border-2 border-red-500 rounded-3xl shadow-xl overflow-hidden animate-pulse-slow mb-6 ring-4 ring-red-500/10">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-red-600 p-5 cursor-pointer hover:bg-red-700 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center space-x-3 text-white">
          <div className="p-2 bg-white/20 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest leading-tight">KRYTYCZNE: KSeF NIE waliduje matematyki kwot!</h4>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-tight">Faktura z błędną sumą ZOSTANIE PRZYJĘTA!</p>
          </div>
        </div>
        <svg className={`w-5 h-5 text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
          {/* Ostrzeżenie */}
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3">
             <div className="text-red-600 mt-0.5">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
             <p className="text-xs font-bold text-red-800 leading-relaxed">
               Ministerstwo Finansów potwierdziło: system KSeF nie weryfikuje poprawności rachunkowej faktury. 
               Jeśli wyślesz 100 + 23 = 124, system nada fakturze numer KSeF i wprowadzi ją do obiegu!
             </p>
          </div>

          {/* Kalkulator */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Interaktywny tester walidacji</h5>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Netto (zł)</label>
                <input 
                  type="number" 
                  value={netto}
                  onChange={(e) => setNetto(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-black outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">VAT (%)</label>
                <input 
                  type="number" 
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-black outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Brutto (zł)</label>
                <input 
                  type="number" 
                  value={brutto}
                  onChange={(e) => setBrutto(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-black outline-none focus:border-blue-500" 
                />
              </div>
            </div>

            <div className={`p-3 rounded-xl flex items-center justify-between ${isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="flex items-center space-x-2">
                {isValid ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
                <span className="text-[10px] font-black uppercase tracking-widest">{isValid ? 'PRAWIDŁOWE' : 'BŁĘDNE'}</span>
              </div>
              {!isValid && (
                <div className="text-[9px] font-bold">Oczekiwane brutto: {expectedBrutto} zł</div>
              )}
            </div>
            <p className="mt-2 text-[9px] text-slate-400 font-medium italic text-center">Użyj tej logiki w swoim systemie ERP przed wysłaniem XML.</p>
          </div>

          {/* Case Study */}
          <div className="p-4 bg-slate-900 rounded-2xl text-white">
            <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Rzeczywisty przypadek testowy</h5>
            <p className="text-[11px] leading-relaxed opacity-90 mb-2">
              Podczas testów KSeF 2.0 wystawiono fakturę: Netto 100 zł + VAT 23 zł = <span className="text-red-400 font-black underline">Brutto 124 zł</span>.
              System KSeF <span className="font-black text-green-400">PRZYJĄŁ</span> dokument, nadał mu numer i UPO.
            </p>
            <div className="text-[9px] font-bold text-slate-500 uppercase">Źródło: Adrian Lapierre, 27.10.2025</div>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
             <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest">Checklist Kontroli Matematycznej:</h5>
             {[
               { key: 'math', label: 'Suma netto + VAT = brutto' },
               { key: 'vatCalc', label: 'VAT obliczony prawidłowo (Netto * Stawka)' },
               { key: 'rounding', label: 'Zaokrąglenia zgodne z ustawą (0.01 zł)' },
               { key: 'totalItems', label: 'Suma pozycji = wartość całkowita faktury' }
             ].map((item) => (
               <label key={item.key} className="flex items-center space-x-3 cursor-pointer group">
                 <input 
                   type="checkbox" 
                   checked={checklist[item.key as keyof typeof checklist]}
                   onChange={() => setChecklist({...checklist, [item.key]: !checklist[item.key as keyof typeof checklist]})}
                   className="w-4 h-4 rounded text-red-600 focus:ring-red-500" 
                 />
                 <span className="text-xs font-bold text-slate-700 group-hover:text-red-600 transition-colors">{item.label}</span>
               </label>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MathValidationWidget;
