
import React, { useState, useEffect } from 'react';
import { UserProfile, CompanySize, ERPType, CollaborationModel } from '../types';
import { useChecklist } from '../context/ChecklistContext';
import Tooltip from './Tooltip';

const LOADING_STEPS = [
  "Inicjalizacja silnika wnioskowania Gemini 3.1 Pro Preview...",
  "Analiza struktury logicznej FA-3 (Ministerstwo Finansów)...",
  "Mapowanie 92 kodów błędów dla Twojego sektora...",
  "Symulacja scenariuszy trybu offline i awaryjnego...",
  "Weryfikacja zgodności z rozporządzeniem z dnia 24.12.2025...",
  "Optymalizacja ścieżki krytycznej wdrożenia...",
  "Generowanie dokumentacji technicznej XML/XSD...",
  "Finalizacja strategii 10/10 Standard..."
];

const OnboardingForm: React.FC = () => {
  const { generateChecklist, isLoading, error: apiError } = useChecklist();
  const [stepIndex, setStepIndex] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    companySize: CompanySize.SMALL,
    industry: '', 
    erpSystem: ERPType.POPULAR,
    monthlyInvoices: '1-100',
  });

  const getValidationError = (field: string) => {
    if (!touched[field]) return "";
    switch (field) {
      case 'industry':
        if (profile.industry.trim().length === 0) return "Pole branży nie może być puste.";
        if (profile.industry.trim().length < 2) return "Podaj min. 2 znaki (np. 'IT').";
        if (profile.industry.trim().length > 100) return "Zbyt długi opis.";
        return "";
      default:
        return "";
    }
  };

  const errors = {
    industry: getValidationError('industry'),
  };

  const isFormValid = profile.industry.trim().length >= 2 && (errors.industry === "") && termsAccepted && dataConsent;

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      interval = window.setInterval(() => {
        setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 4000);
    } else {
      setStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ industry: true });

    if (isFormValid) {
      generateChecklist(profile)
        .then(() => console.log("[DEBUG] Generowanie zakończone sukcesem."))
        .catch((err) => console.error("[DEBUG] Błąd podczas generowania:", err));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
      <div className="mb-8 text-center">
        <div className="inline-block p-4 bg-punchline-blue text-white rounded-2xl mb-4 shadow-lg shadow-blue-200">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">KSeF 2.0 Compliance Builder</h1>
        <p className="text-slate-500 font-medium italic">Profesjonalna ścieżka wdrożenia zgodna z wytycznymi Ministerstwa Finansów 2026.</p>
      </div>

      {(apiError || (Object.values(touched).some(t => t) && !isFormValid)) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
          {apiError || "Proszę poprawić błędy w formularzu przed kontynuacją."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-xs font-black uppercase tracking-[0.2em] ${errors.industry ? 'text-red-500' : 'text-slate-400'}`}>
                Sektor i profil działalności *
              </label>
              <Tooltip content="Wpisz konkretną branżę (np. IT, Transport, Budownictwo). Pozwoli to Gemini AI dobrać specyficzne kody GTU i procedury weryfikacyjne dla Twojego sektora.">
                <svg className="w-4 h-4 text-slate-300 hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
              </Tooltip>
            </div>
            <input 
              type="text"
              required
              placeholder="Np. IT, Produkcja mebli, Handel online"
              value={profile.industry}
              onBlur={() => setTouched({ ...touched, industry: true })}
              onChange={(e) => setProfile({...profile, industry: e.target.value})}
              className={`w-full px-5 py-4 rounded-2xl border-2 focus:ring-0 outline-none transition-all bg-slate-50/50 text-slate-800 font-semibold ${
                errors.industry ? 'border-red-500 focus:border-red-600' : 'border-slate-100 focus:border-punchline-blue'
              }`}
            />
            {errors.industry && (
              <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.industry}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Typ Organizacji</label>
              <Tooltip content="Wielkość firmy determinuje datę obowiązkowego wejścia do systemu (01.02.2026 vs 01.04.2026).">
                <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z" /></svg>
              </Tooltip>
            </div>
            <select 
              value={profile.companySize}
              onChange={(e) => setProfile({...profile, companySize: e.target.value as CompanySize})}
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-punchline-blue focus:ring-0 outline-none transition-all bg-slate-50/50 text-slate-800 font-semibold"
            >
              {Object.values(CompanySize).map(size => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Środowisko ERP</label>
              <Tooltip content="Zintegrowane systemy SAP/Dynamics wymagają certyfikowanych modułów MCU, podczas gdy popularne systemy (Optima/Subiekt) zazwyczaj oferują gotowe konektory API.">
                <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z" /></svg>
              </Tooltip>
            </div>
            <select 
              value={profile.erpSystem}
              onChange={(e) => setProfile({...profile, erpSystem: e.target.value as ERPType})}
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-punchline-blue focus:ring-0 outline-none transition-all bg-slate-50/50 text-slate-800 font-semibold"
            >
              {Object.values(ERPType).map(erp => <option key={erp} value={erp}>{erp}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Wolumen faktur / mies.</label>
            <Tooltip content="Przy wolumenach powyżej 1000 faktur/mies. Gemini zasugeruje mechanizmy 'Batch Processing' i procedury obsługi limitów API (Kod 429).">
              <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z" /></svg>
            </Tooltip>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['1-100', '101-1000', '1001-10000', '10000+'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setProfile({...profile, monthlyInvoices: val})}
                className={`py-3 px-4 rounded-2xl text-[10px] font-black transition-all border-2 ${
                  profile.monthlyInvoices === val 
                    ? 'bg-punchline-blue border-punchline-blue text-white shadow-lg shadow-blue-100' 
                    : 'bg-white border-slate-100 text-slate-500 hover:border-punchline-blue hover:bg-slate-50'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Checkboxy zgody — wymagane przed wysłaniem */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-punchline-blue focus:ring-punchline-blue cursor-pointer"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              Akceptuję{' '}
              <a href="https://punchlineroi.com/regulamin.html" target="_blank" rel="noopener noreferrer" className="text-punchline-blue underline font-semibold">
                Regulamin
              </a>{' '}
              i rozumiem, że wyniki generowane przez AI (Gemini 3.1) mają charakter{' '}
              <strong>wyłącznie pomocniczy</strong> i wymagają weryfikacji przez człowieka
              przed podjęciem decyzji biznesowych (Human-in-the-loop).
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              required
              checked={dataConsent}
              onChange={(e) => setDataConsent(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-punchline-blue focus:ring-punchline-blue cursor-pointer"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              Wyrażam zgodę na powierzenie danych podprocesorom (Google Gemini AI, Hetzner, Netlify, Stripe)
              zgodnie z{' '}
              <a href="https://punchlineroi.com/polityka-prywatnosci.html" target="_blank" rel="noopener noreferrer" className="text-punchline-blue underline font-semibold">
                Polityką Prywatności
              </a>{' '}
              oraz{' '}
              <a href="https://punchlineroi.com/dpa.html" target="_blank" rel="noopener noreferrer" className="text-punchline-blue underline font-semibold">
                Umową Powierzenia (DPA)
              </a>.
            </span>
          </label>
        </div>

        <div className="relative">
          <button
            type="submit"
            disabled={isLoading || !termsAccepted || !dataConsent}
            className={`w-full py-5 px-6 rounded-2xl font-black text-white transition-all transform flex flex-col items-center justify-center space-y-2 ${
              isLoading ? 'bg-slate-900 cursor-wait' :
              (!termsAccepted || !dataConsent) ? 'bg-slate-300 cursor-not-allowed opacity-60' :
              'bg-gradient-to-br from-punchline-blue to-slate-900 hover:opacity-90 hover:scale-[1.02] active:scale-95 shadow-2xl shadow-blue-200'
            }`}
          >
            {isLoading ? (
              <>
                <div className="flex items-center space-x-3">
                  <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm uppercase tracking-widest text-blue-400">Deep Reasoning w toku...</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400 animate-pulse">{LOADING_STEPS[stepIndex]}</span>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-lg uppercase tracking-wider">Zbuduj Plan KSeF 2.0</span>
                </div>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingForm;
