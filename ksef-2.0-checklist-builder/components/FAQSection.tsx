
import React, { useState, useMemo } from 'react';
import { FAQ_DATABASE } from '../data/faqDatabase';

const CATEGORIES = [
  { id: 'ALL', label: 'Wszystkie', icon: '🌟' },
  { id: 'TERMINY', label: 'Terminy', icon: '📅' },
  { id: 'KARY', label: 'Kary', icon: '⚠️' },
  { id: 'ECOMMERCE', label: 'E-commerce', icon: '🛒' },
  { id: 'BIURA', label: 'Biura Rach.', icon: '🏢' },
  { id: 'MEDYCYNA', label: 'Medycyna', icon: '🩺' },
  { id: 'BUDOWLANKA', label: 'Budownictwo', icon: '🏗️' },
  { id: 'GASTRONOMIA', label: 'Gastronomia', icon: '🍕' },
  { id: 'TECHNICZNE', label: 'Techniczne', icon: '🔧' },
  { id: 'PRAWNE', label: 'Prawne', icon: '⚖️' }
];

const FAQSection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFAQ = useMemo(() => {
    return FAQ_DATABASE.filter(item => {
      const matchesSearch = item.question.toLowerCase().includes(search.toLowerCase()) || 
                            item.answer.toLowerCase().includes(search.toLowerCase()) ||
                            item.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">FAQ - Baza Wiedzy KSeF 2.0</h2>
          <p className="text-slate-500 font-medium italic">Ponad 100 eksperckich odpowiedzi na pytania wdrożeniowe z podziałem na branże.</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text"
            placeholder="Szukaj (np. wesele, budowa, lekarz, allegro, kary)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-punchline-blue transition-all font-bold text-slate-800"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setOpenIndex(null);
              }}
              className={`px-3 py-2 rounded-2xl text-[10px] font-black transition-all border-2 flex items-center space-x-2 ${
                activeCategory === cat.id 
                  ? 'bg-punchline-blue border-punchline-blue text-white shadow-lg shadow-blue-100' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-punchline-blue hover:bg-slate-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((item, idx) => (
              <div 
                key={item.id}
                className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-black px-2 py-1 bg-white rounded-lg border border-slate-200 text-slate-400 shadow-sm min-w-[90px] text-center">
                      {item.category}
                    </span>
                    <span className="text-sm font-black text-slate-900 leading-tight">
                      <span className="text-slate-300 mr-2">#{item.id}</span>
                      {item.question}
                    </span>
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === idx && (
                  <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                    <div className="pt-2 border-t border-slate-200/50">
                      <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Brak wyników dla Twojego zapytania w kategorii {activeCategory}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
