
import React, { useState, useMemo } from 'react';

const CostCalculatorWidget: React.FC = () => {
  const [size, setSize] = useState('Micro');
  const [volume, setVolume] = useState('1-100');
  const [integration, setIntegration] = useState('Standard ERP');
  const [consultancy, setConsultancy] = useState(false);

  const calculation = useMemo(() => {
    let minLicenses = 0;
    let maxLicenses = 0;
    let minTraining = 2000;
    let maxTraining = 5000;
    let hours = 40;
    let minConsulting = 0;
    let maxConsulting = 0;

    // Licenses based on integration type
    if (integration === 'Standard ERP') {
      minLicenses = 500;
      maxLicenses = 5000;
    } else if (integration === 'Enterprise ERP') {
      minLicenses = 10000;
      maxLicenses = 50000;
    } else if (integration === 'Custom API') {
      minLicenses = 15000;
      maxLicenses = 80000;
    }

    // Training based on size
    if (size === 'Small') {
      minTraining = 3000;
      maxTraining = 7000;
      hours = 60;
    } else if (size === 'Medium') {
      minTraining = 6000;
      maxTraining = 15000;
      hours = 120;
    } else if (size === 'Large') {
      minTraining = 15000;
      maxTraining = 40000;
      hours = 300;
    }

    // Consulting
    if (consultancy) {
      minConsulting = 5000;
      maxConsulting = 25000;
    }

    const minTotal = minLicenses + minTraining + (hours * 100) + minConsulting;
    const maxTotal = maxLicenses + maxTraining + (hours * 300) + maxConsulting;
    const avgTotal = (minTotal + maxTotal) / 2;

    // ROI estimation (simplistic)
    const invoiceSavingsPerUnit = 2; // PLN saved per invoice by automation
    const volumeValue = volume === '1-100' ? 50 : volume === '101-1000' ? 500 : volume === '1001-10000' ? 5000 : 20000;
    const annualSavings = volumeValue * invoiceSavingsPerUnit * 12;
    const roiMonths = Math.ceil((avgTotal / annualSavings) * 12);

    return {
      minLicenses, maxLicenses,
      minTraining, maxTraining,
      hours,
      minTimeCost: hours * 100,
      maxTimeCost: hours * 300,
      minConsulting, maxConsulting,
      minTotal, maxTotal, avgTotal,
      annualSavings,
      roiMonths: isFinite(roiMonths) ? roiMonths : 0
    };
  }, [size, volume, integration, consultancy]);

  const handleDownloadPDF = () => {
    const report = `
RAPORT KOSZTÓW WDROŻENIA KSeF 2.0
Data: ${new Date().toLocaleDateString()}
------------------------------------------
PARAMETRY:
- Wielkość firmy: ${size}
- Wolumen faktur: ${volume}
- Integracja: ${integration}
- Konsultacje: ${consultancy ? 'Tak' : 'Nie'}

SZACOWANE KOSZTY (PLN):
- Licencje/Integracja: ${calculation.minLicenses} - ${calculation.maxLicenses}
- Szkolenia: ${calculation.minTraining} - ${calculation.maxTraining}
- Praca zespołu (${calculation.hours}h): ${calculation.minTimeCost} - ${calculation.maxTimeCost}
- Konsultacje: ${calculation.minConsulting} - ${calculation.maxConsulting}

SUMA MIN: ${calculation.minTotal.toLocaleString()} zł
SUMA MAX: ${calculation.maxTotal.toLocaleString()} zł
ŚREDNI KOSZT: ${calculation.avgTotal.toLocaleString()} zł

ROI:
- Roczne oszczędności: ${calculation.annualSavings.toLocaleString()} zł
- Zwrot inwestycji po: ${calculation.roiMonths} miesiącach
------------------------------------------
Rekomendacja: ${calculation.roiMonths <= 12 ? 'Inwestycja wysoce opłacalna.' : 'Inwestycja o średnim okresie zwrotu.'}
    `;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Raport_Koszty_KSeF.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border-2 border-green-100 rounded-[2.5rem] shadow-xl mb-8 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-green-600 p-8 text-white">
        <div className="flex items-center space-x-4 mb-2">
          <div className="p-3 bg-white/20 rounded-2xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight">Kalkulator Kosztów Wdrożenia</h3>
            <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Estymacja budżetowa KSeF 2026</p>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">1. Konfiguracja Planu</h4>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Wielkość firmy</label>
              <div className="grid grid-cols-2 gap-2">
                {['Micro', 'Small', 'Medium', 'Large'].map(s => (
                  <button key={s} onClick={() => setSize(s)} className={`py-2 px-3 rounded-xl text-[10px] font-black transition-all border-2 ${size === s ? 'bg-green-600 border-green-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-green-200'}`}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Faktury / Miesiąc</label>
              <select value={volume} onChange={(e) => setVolume(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none text-xs font-bold outline-none">
                <option>1-100</option>
                <option>101-1000</option>
                <option>1001-10000</option>
                <option>10000+</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Typ Integracji</label>
              <select value={integration} onChange={(e) => setIntegration(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none text-xs font-bold outline-none">
                <option>Standard ERP</option>
                <option>Enterprise ERP</option>
                <option>Custom API</option>
                <option>Manual (Free tools)</option>
              </select>
            </div>

            <label className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" checked={consultancy} onChange={(e) => setConsultancy(e.target.checked)} className="w-5 h-5 text-green-600 rounded border-slate-300 focus:ring-green-500" />
              <div>
                <span className="block text-xs font-black text-slate-800">Doradztwo & Audyt</span>
                <span className="block text-[9px] text-slate-400 font-bold">Wsparcie prawne i procesowe</span>
              </div>
            </label>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-6 bg-slate-900 rounded-3xl text-white">
              <div className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Suma Średnia (PLN)</div>
              <div className="text-3xl font-black">{calculation.avgTotal.toLocaleString()} <span className="text-sm opacity-50">zł</span></div>
              <div className="mt-2 text-[10px] font-bold opacity-60">Zakres: {calculation.minTotal.toLocaleString()} - {calculation.maxTotal.toLocaleString()} zł</div>
            </div>
            <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
              <div className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Zwrot (ROI)</div>
              <div className="text-3xl font-black text-slate-900">{calculation.roiMonths} <span className="text-sm opacity-50">mies.</span></div>
              <div className="mt-2 text-[10px] font-bold text-green-700 uppercase tracking-tighter">Oszczędność: {calculation.annualSavings.toLocaleString()} zł/rok</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">2. Podział Kategorii</h4>
            <div className="space-y-3">
              {[
                { label: 'Licencje & IT', min: calculation.minLicenses, max: calculation.maxLicenses, color: 'bg-blue-500' },
                { label: 'Szkolenia', min: calculation.minTraining, max: calculation.maxTraining, color: 'bg-indigo-500' },
                { label: 'Czas Zespołu', min: calculation.minTimeCost, max: calculation.maxTimeCost, color: 'bg-amber-500' },
                { label: 'Konsultacje', min: calculation.minConsulting, max: calculation.maxConsulting, color: 'bg-green-500' }
              ].map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                    <span className="text-[11px] font-black text-slate-600">{cat.label}</span>
                  </div>
                  <div className="text-[11px] font-black text-slate-900">{cat.min.toLocaleString()} - {cat.max.toLocaleString()} zł</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
             <button 
               onClick={handleDownloadPDF}
               className="py-4 bg-green-600 text-white rounded-2xl font-black text-xs hover:bg-green-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-green-100"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               <span>POBIERZ RAPORT PDF</span>
             </button>
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
               <span className="text-[9px] font-black text-slate-400 uppercase leading-none">Scenariusz rekomendowany</span>
               <span className="text-xs font-black text-slate-700 leading-tight">Zbalansowane wsparcie ERP i szkoleń.</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostCalculatorWidget;
