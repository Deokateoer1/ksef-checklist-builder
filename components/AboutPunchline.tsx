
import React, { useState } from 'react';

// Space Grotesk loaded via Google Fonts (dodaj do index.html jeśli brak)
const FONT_HEADING = "'Space Grotesk', 'Exo 2', 'Inter', sans-serif";
const FONT_BODY = "'Inter', sans-serif";

// Kolory brand
const C = {
  orange: '#F7931E',
  orangeDark: '#FF6B35',
  blue: '#0099CC',
  blueDark: '#00D4FF',
  green: '#059669',
  greenLight: '#10B981',
  dark: '#0a0f1e',
  darkCard: '#111827',
  darkMid: '#0d1a2e',
};

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: C.greenLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

interface PlanProps {
  name: string;
  price: string;
  priceColor: string;
  features: string[];
  featured?: boolean;
  buttonStyle?: 'primary' | 'ghost';
}

const PlanCard: React.FC<PlanProps> = ({ name, price, priceColor, features, featured, buttonStyle = 'ghost' }) => (
  <div
    className="flex flex-col rounded-[1.5rem] p-6 relative"
    style={{
      background: C.darkCard,
      border: featured ? `2px solid ${C.greenLight}` : '1px solid rgba(255,255,255,0.08)',
      boxShadow: featured ? `0 0 40px rgba(16,185,129,0.15)` : 'none',
    }}
  >
    {featured && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <span
          className="text-white text-[9px] font-black uppercase tracking-widest px-5 py-1.5 rounded-full whitespace-nowrap"
          style={{ background: C.greenLight, boxShadow: `0 4px 20px rgba(16,185,129,0.35)`, fontFamily: FONT_BODY }}
        >
          Najczęściej wybierany
        </span>
      </div>
    )}
    <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 mt-1" style={{ fontFamily: FONT_BODY }}>
      {name}
    </div>
    <div className="leading-none mb-1" style={{ fontFamily: FONT_HEADING, color: priceColor, fontSize: '2rem', fontWeight: 800 }}>
      {price}
    </div>
    <div className="text-slate-500 text-[10px] font-bold mb-5" style={{ fontFamily: FONT_BODY }}>/ miesiąc</div>

    <ul className="space-y-2.5 mb-6 flex-1">
      {features.map(f => (
        <li key={f} className="flex items-start gap-2 text-[11px] font-medium" style={{ color: featured ? '#cbd5e1' : '#94a3b8', fontFamily: FONT_BODY }}>
          <CheckIcon /> {f}
        </li>
      ))}
    </ul>

    <a
      href="https://www.punchlineroi.com"
      target="_blank"
      rel="noreferrer"
      className="block w-full text-center font-black uppercase tracking-widest transition-all"
      style={{
        fontFamily: FONT_BODY,
        fontSize: '10px',
        padding: '14px 24px',
        borderRadius: '9999px',
        ...(buttonStyle === 'primary'
          ? {
              background: `linear-gradient(135deg, ${C.orangeDark}, ${C.orange})`,
              color: '#fff',
              boxShadow: `0 8px 24px rgba(247,147,30,0.3)`,
            }
          : {
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.12)',
            }),
      }}
      onMouseEnter={e => {
        if (buttonStyle === 'ghost') {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = C.orange;
          (e.currentTarget as HTMLAnchorElement).style.color = C.orange;
        }
      }}
      onMouseLeave={e => {
        if (buttonStyle === 'ghost') {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.12)';
          (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8';
        }
      }}
    >
      Otrzymaj demo na maila
    </a>
  </div>
);

const AboutPunchline: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: podłącz do CRM / Mailchimp / n8n webhook
    console.log('Lead email:', email);
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 py-8">

      {/* ===== PRICING ===== */}
      <div className="rounded-[2.5rem] overflow-hidden" style={{ background: `linear-gradient(160deg, ${C.dark} 0%, #0d1a2e 100%)` }}>

        {/* Badge + Header */}
        <div className="px-10 pt-12 pb-8 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5"
            style={{ background: 'rgba(247,147,30,0.12)', border: `1px solid rgba(247,147,30,0.25)` }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.orange }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.orange, fontFamily: FONT_BODY }}>
              PunchlineROI · Robot-KSeF 2026
            </span>
          </div>
          <h2
            className="text-white tracking-tight mb-3"
            style={{ fontFamily: FONT_HEADING, fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}
          >
            Prosty i przewidywalny cennik
          </h2>
          <p className="text-slate-400 text-sm font-medium max-w-md mx-auto" style={{ fontFamily: FONT_BODY }}>
            Wybierz plan dopasowany do liczby faktur i wielkości Twojego biura.
            Przy każdym planie – zacznij od <span style={{ color: C.greenLight }}>bezpłatnego demo</span>.
          </p>
        </div>

        {/* Plans */}
        <div className="px-8 pb-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          <PlanCard
            name="Starter"
            price="199 PLN"
            priceColor={C.blueDark}
            features={[
              'Podstawowa AI-kategoryzacja faktur',
              'Wysyłka i odbiór faktur z KSeF',
              'Podstawowy tryb Offline24',
              'Dashboard z podstawowymi statystykami',
            ]}
          />
          <PlanCard
            name="Pro"
            price="490 PLN"
            priceColor={C.greenLight}
            features={[
              'AI-kategoryzacja + detekcja anomalii',
              'Pełny tryb Offline24 + samonaprawa kolejek',
              'Compliance Center (logi, raporty błędów)',
              'Alerty email/SMS, asystent AI KSeF',
              'Wyższy limit faktur / wielu klientów',
            ]}
            featured
            buttonStyle="primary"
          />
          <PlanCard
            name="Enterprise"
            price="1 490+ PLN"
            priceColor={C.orange}
            features={[
              'Pełny Compliance Center (eksporty audytowe)',
              'Rule Engine per klient / branża',
              'Nielimitowana liczba klientów (fair use)',
              'Integracje szyte na miarę',
              'SLA, priorytetowy support, account manager',
            ]}
          />
        </div>

        {/* Bottom CTA */}
        <div className="px-10 pb-12 flex flex-col items-center border-t border-white/5 pt-8 gap-3">
          <a
            href="https://www.punchlineroi.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-black text-white transition-all transform hover:scale-105 active:scale-95"
            style={{
              fontFamily: FONT_BODY,
              fontSize: '13px',
              padding: '18px 40px',
              borderRadius: '9999px',
              background: `linear-gradient(135deg, ${C.orangeDark}, ${C.orange})`,
              boxShadow: `0 12px 32px rgba(247,147,30,0.35)`,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Zobacz więcej automatyzacji
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600" style={{ fontFamily: FONT_BODY }}>
            Cennik 2026 · Przy każdym planie bezpłatne demo
          </p>
        </div>
      </div>

      {/* ===== LEAD MAGNET ===== */}
      <div
        className="rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0d1f18 0%, #0a1a10 60%, #0a0f1e 100%)',
          border: `2px solid rgba(16,185,129,0.35)`,
          boxShadow: `0 0 60px rgba(16,185,129,0.08)`,
        }}
      >
        {/* Glow blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'rgba(16,185,129,0.07)', filter: 'blur(40px)' }} />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full pointer-events-none" style={{ background: `rgba(247,147,30,0.06)`, filter: 'blur(30px)' }} />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start gap-5 mb-8">
            <div
              className="p-4 rounded-2xl w-fit shrink-0"
              style={{ background: 'rgba(16,185,129,0.15)', border: `1px solid rgba(16,185,129,0.3)` }}
            >
              <svg className="w-9 h-9" style={{ color: C.greenLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-2"
                style={{ background: 'rgba(16,185,129,0.15)', border: `1px solid rgba(16,185,129,0.3)` }}
              >
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.greenLight, fontFamily: FONT_BODY }}>
                  🎁 Bonus dla nowych klientów
                </span>
              </div>
              <h3
                className="text-white tracking-tight leading-tight mb-1"
                style={{ fontFamily: FONT_HEADING, fontSize: '1.6rem', fontWeight: 800 }}
              >
                Darmowa Baza Wiedzy KSeF 2.0
              </h3>
              <p className="text-sm font-medium" style={{ color: '#94a3b8', fontFamily: FONT_BODY }}>
                <span style={{ color: C.greenLight, fontWeight: 700 }}>2 546 pytań i odpowiedzi</span> z oficjalnych dokumentów Ministerstwa Finansów · gotowa integracja React/Next.js
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { num: '2 546', label: 'pytań FAQ', color: C.greenLight },
              { num: '17', label: 'kategorii tematycznych', color: C.orange },
              { num: '14', label: 'oficjalnych PDF MF', color: C.blueDark },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: C.darkMid, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontFamily: FONT_HEADING, fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.num}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: '#475569', fontFamily: FONT_BODY }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['Podstawy KSeF', 'Terminy 2026', 'Offline24', 'Certyfikaty', 'FA(3) XML', 'Korekty', 'JPK', 'Kary i sankcje', 'B2C', 'Podmioty zagraniczne'].map(tag => (
              <span
                key={tag}
                className="text-[9px] font-black uppercase tracking-wide"
                style={{
                  fontFamily: FONT_BODY,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  color: C.greenLight,
                  background: 'rgba(16,185,129,0.1)',
                  border: `1px solid rgba(16,185,129,0.25)`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Email capture */}
          {submitted ? (
            <div
              className="flex items-center gap-3 p-5 rounded-2xl"
              style={{ background: 'rgba(16,185,129,0.1)', border: `1px solid rgba(16,185,129,0.3)` }}
            >
              <svg className="w-6 h-6 shrink-0" style={{ color: C.greenLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-black text-sm" style={{ color: C.greenLight, fontFamily: FONT_HEADING }}>Baza wiedzy wysłana! Sprawdź skrzynkę 📬</p>
                <p className="text-[11px] mt-0.5 text-slate-500" style={{ fontFamily: FONT_BODY }}>2 546 FAQ KSeF 2.0 z oficjalnych dokumentów MF</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="twoj@biuro.pl"
                required
                className="flex-1 text-sm font-medium text-white placeholder-slate-600 focus:outline-none transition-colors"
                style={{
                  fontFamily: FONT_BODY,
                  padding: '16px 24px',
                  borderRadius: '9999px',
                  background: C.darkMid,
                  border: `1px solid rgba(255,255,255,0.1)`,
                }}
                onFocus={e => (e.target.style.borderColor = C.greenLight)}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <button
                type="submit"
                className="text-white font-black uppercase tracking-widest whitespace-nowrap transition-all transform hover:scale-105 active:scale-95"
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: '10px',
                  padding: '16px 32px',
                  borderRadius: '9999px',
                  background: `linear-gradient(135deg, ${C.green}, ${C.greenLight})`,
                  boxShadow: `0 8px 24px rgba(16,185,129,0.3)`,
                }}
              >
                📥 Pobierz za 0 zł
              </button>
            </form>
          )}

          <p className="text-center mt-3 text-[9px] font-medium" style={{ color: '#334155', fontFamily: FONT_BODY }}>
            Zero spamu · Jeden mail z bazą · Możesz wypisać się w każdej chwili
          </p>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center pb-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500" style={{ fontFamily: FONT_BODY }}>
          AI Powered Excellence · PunchlineROI · 2026
        </p>
      </div>

    </div>
  );
};

export default AboutPunchline;
