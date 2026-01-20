
import React from 'react';

const CertificateDownloader: React.FC = () => {
  const deadlineDate = new Date('2026-02-01');
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isUrgent = diffDays < 30;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">KSeF Certificate Asset</h4>
        <span className={`px-2 py-1 rounded text-[10px] font-black ${isUrgent ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-200 text-slate-600'}`}>
          DEADLINE: 01.02.2026 ({diffDays} dni)
        </span>
      </div>
      
      <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
        Certyfikat KSeF jest wymagany do podpisywania faktur w trybie offline i generowania weryfikowalnych kodów QR. 
        Pobierz certyfikat przed terminem obowiązkowym.
      </p>

      <a 
        href="https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/certyfikaty-ksef/"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center space-x-2 w-full py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-black text-xs hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>POBIERZ CERTYFIKAT KSEF</span>
      </a>

      {isUrgent && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-[10px] font-black text-red-700 leading-tight">
            UWAGA: Pozostało mniej niż 30 dni! Ryzyko utraty ciągłości sprzedaży w przypadku awarii KSeF.
          </p>
        </div>
      )}
    </div>
  );
};

export default CertificateDownloader;
