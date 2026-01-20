
import React, { useState } from 'react';

const QRCodeGenerator: React.FC = () => {
  const [invoiceNo, setInvoiceNo] = useState('FV/2026/001');
  
  // Używamy publicznego API do generowania QR dla celów wizualizacji (Zgodnie z wymogiem interfejsu)
  const getQRUrl = (data: string) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;

  return (
    <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm mb-6">
      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Generator Podglądu Kodów QR</h4>
      
      <div className="mb-6">
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Numer faktury do testu</label>
        <input 
          type="text" 
          value={invoiceNo}
          onChange={(e) => setInvoiceNo(e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center border border-slate-200 mb-2 overflow-hidden shadow-sm">
            <img src={getQRUrl(`KSEF_OFFLINE_${invoiceNo}`)} alt="Offline QR" className="w-full h-full" />
          </div>
          <span className="text-[10px] font-black text-slate-900">OFFLINE</span>
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Weryfikacja Dokumentu</span>
        </div>

        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center border border-slate-200 mb-2 overflow-hidden shadow-sm">
            <img src={getQRUrl(`CERT_HASH_${invoiceNo}_SHA256`)} alt="Cert QR" className="w-full h-full" />
          </div>
          <span className="text-[10px] font-black text-slate-900">CERTYFIKAT</span>
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Tożsamość Wystawcy</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="py-2 px-3 bg-slate-900 text-white rounded-lg text-[10px] font-black hover:bg-blue-600 transition-colors">
          DOWNLOAD PNG
        </button>
        <button className="py-2 px-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black hover:border-slate-900 transition-colors">
          PRINT PREVIEW
        </button>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
