
import React, { useState } from 'react';
import { CompanySize, ERPType, INDUSTRIES } from '../types';
import { useChecklist } from '../context/ChecklistContext';

const BulkGenerationForm: React.FC = () => {
  const { generateBulk, isLoading } = useChecklist();
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [merge, setMerge] = useState(false);
  const [baseProfile, setBaseProfile] = useState({
    companySize: CompanySize.MEDIUM,
    erpSystem: ERPType.POPULAR,
    monthlyInvoices: '51-500'
  });

  const toggleIndustry = (ind: string) => {
    setSelectedIndustries(prev => 
      prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
    );
  };

  const selectAll = () => {
    setSelectedIndustries(selectedIndustries.length === INDUSTRIES.length ? [] : [...INDUSTRIES]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndustries.length === 0) return alert("Wybierz przynajmniej jedną branżę!");
    generateBulk(selectedIndustries, baseProfile, merge);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100">
      <div className="mb-10 text-center">
        <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Generowanie Seryjne (Bulk)</h1>
        <p className="text-slate-500 font-medium">Przygotuj pakiety wdrożeniowe dla wielu sektorów jednocześnie.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">1. Wybierz branże</h3>
            <button 
              type="button" 
              onClick={selectAll}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {selectedIndustries.length === INDUSTRIES.length ? "Odznacz wszystkie" : "Zaznacz wszystkie"}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {INDUSTRIES.map(ind => (
              <label 
                key={ind} 
                className={`flex items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedIndustries.includes(ind) 
                    ? 'bg-blue-50 border-blue-500 text-blue-700' 
                    : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'
                }`}
              >
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={selectedIndustries.includes(ind)}
                  onChange={() => toggleIndustry(ind)}
                />
                <span className="text-xs font-black">{ind}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">2. Profil wspólny</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Wielkość firm</label>
                <select 
                  value={baseProfile.companySize}
                  onChange={(e) => setBaseProfile({...baseProfile, companySize: e.target.value as CompanySize})}
                  className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none text-sm font-bold text-slate-700"
                >
                  {Object.values(CompanySize).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">System ERP</label>
                <select 
                  value={baseProfile.erpSystem}
                  onChange={(e) => setBaseProfile({...baseProfile, erpSystem: e.target.value as ERPType})}
                  className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none text-sm font-bold text-slate-700"
                >
                  {Object.values(ERPType).map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">3. Opcje generowania</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={merge}
                  onChange={e => setMerge(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <span className="block text-sm font-bold text-slate-800">Jedna wspólna checklista</span>
                  <span className="block text-[10px] text-slate-400 font-medium">Połącz zadania wszystkich branż w jeden widok</span>
                </div>
              </label>
            </div>
          </div>
        </section>

        <button 
          type="submit"
          disabled={isLoading || selectedIndustries.length === 0}
          className={`w-full py-5 rounded-2xl font-black text-white transition-all transform hover:scale-[1.01] flex items-center justify-center space-x-4 ${
            isLoading || selectedIndustries.length === 0
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl shadow-blue-200'
          }`}
        >
          <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-lg">GENERUJ PAKIET {selectedIndustries.length} CHECKLIST</span>
        </button>
      </form>
    </div>
  );
};

export default BulkGenerationForm;
