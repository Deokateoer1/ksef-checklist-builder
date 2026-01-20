
import React, { useState, useMemo } from 'react';

const RiskEstimatorWidget: React.FC<{ monthlyVolume: string }> = ({ monthlyVolume }) => {
  const [avgInvoiceValue, setAvgInvoiceValue] = useState(2500);
  const [errorRate, setErrorRate] = useState(2); // 2% faktur z błędami
  const [integrationType, setIntegrationType] = useState('Standard');

  const volume = useMemo(() => {
    if (monthlyVolume === '1-100') return 50;
    if (monthlyVolume === '101-1000') return 500;
    if (monthlyVolume === '1001-10000') return 5000;
    return 20000;
  }, [monthlyVolume]);

  const stats = useMemo(() => {
    const monthlyVAT = volume * avgInvoiceValue * 0.23;
    const errorsCount = Math.ceil(volume * (errorRate / 100));
    const potentialFinePerMonth = errorsCount * avgInvoiceValue * 0.23; // Kara do 100% VAT
    const annualRisk = potentialFinePerMonth * 12;

    let licenseCost = 0;
    let implementationTime = '';

    switch (integrationType) {
        case 'Standard':
            licenseCost = 3500;
            implementationTime = '2 tyg.';
            break;
        case 'Enterprise':
            licenseCost = 45000;
            implementationTime = '3 mies.';
            break;
        case 'Custom API':
            licenseCost = 18000;
            implementationTime = '1.5 mies.';
            break;
        case 'Manual':
            licenseCost = 0;
            implementationTime = '0 dni';
            break;
    }

    return { 
        monthlyVAT, 
        errorsCount, 
        potentialFinePerMonth, 
        annualRisk,
        licenseCost,
        implementationTime
    };
  }, [volume, avgInvoiceValue, errorRate, integrationType]);

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border-4 border-red-500/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
          <span className="text-red-500">Kalkulator Ryzyka vs Koszt</span>
        </h3>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Estymacja odpowiedzialności skarbowej (KSeF 2027)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Średnia wartość faktury (brutto)</label>
              <input 
                type="range" min="100" max="50000" step="100"
                value={avgInvoiceValue} onChange={(e) => setAvgInvoiceValue(parseInt(e.target.value))}
                className="w-full accent-red-500"
              />
              <div className="text-right text-xs font-black text-blue-400">{avgInvoiceValue.toLocaleString()} PLN</div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Przewidywany błąd procesowy (%)</label>
              <input 
                type="range" min="0.1" max="10" step="0.1"
                value={errorRate} onChange={(e) => setErrorRate(parseFloat(e.target.value))}
                className="w-full accent-red-500"
              />
              <div className="text-right text-xs font-black text-red-400">{errorRate}% wolumenu</div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Planowany Typ Integracji</label>
              <select 
                value={integrationType}
                onChange={(e) => setIntegrationType(e.target.value)}
                className="w-full p-2 bg-slate-800 rounded-xl text-xs font-bold text-white border border-slate-700 outline-none"
              >
                <option value="Standard">Standard ERP (Gotowy moduł)</option>
                <option value="Enterprise">Enterprise (SAP/Dynamics)</option>
                <option value="Custom API">Custom API (Własne rozwiązanie)</option>
                <option value="Manual">Ręcznie (KSeF WEB / Darmowe)</option>
              </select>
            </div>
          </div>

          <div className="bg-red-500/10 rounded-3xl p-6 border border-red-500/20 flex flex-col justify-between">
            <div>
                <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Potencjalna kara roczna</div>
                <div className="text-4xl font-black text-red-500">{stats.annualRisk.toLocaleString()} <span className="text-sm">PLN</span></div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-red-500/20">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Koszt wdrożenia (Ochrona)</div>
                        <div className="text-2xl font-black text-white">{stats.licenseCost.toLocaleString()} <span className="text-xs text-slate-400">PLN</span></div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Czas wdrożenia</div>
                        <div className="text-lg font-black text-blue-400">{stats.implementationTime}</div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-2xl">
            <div className="text-[10px] font-black text-slate-500 uppercase">Błędne faktury</div>
            <div className="text-lg font-black">{stats.errorsCount}/mies</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-2xl">
            <div className="text-[10px] font-black text-slate-500 uppercase">VAT w ryzyku</div>
            <div className="text-lg font-black">{Math.round(stats.monthlyVAT).toLocaleString()}</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-2xl border border-red-500/30">
            <div className="text-[10px] font-black text-red-400 uppercase">Max Mandat</div>
            <div className="text-lg font-black text-red-500">100% VAT</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskEstimatorWidget;
