
import React, { useState, useRef, useEffect } from 'react';
import { searchFAQ } from '../services/faqSearch';
import { askGeminiKSeF } from '../services/geminiService';
import { useChecklist } from '../context/ChecklistContext';

interface Message {
  role: 'user' | 'bot' | 'system';
  text: string;
}

interface FAQChatbotProps {
  onClose: () => void;
}

const FAQChatbot: React.FC<FAQChatbotProps> = ({ onClose }) => {
  const { profile } = useChecklist();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Witaj w Centrum Dowodzenia KSeF 2.0. \n\nDziałam w trybie Offline (Baza Wiedzy), ale możesz mnie przełączyć w tryb AI Deep Research, aby analizować błędy techniczne.' }
  ]);
  const [input, setInput] = useState('');
  const [isDeepSearch, setIsDeepSearch] = useState(false);
  const [aiMode, setAiMode] = useState<'technical' | 'business'>('technical');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      if (isDeepSearch) {
        // Używamy wybranego trybu AI (Technical lub Business)
        const aiAnswer = await askGeminiKSeF(userMsg, profile, aiMode);
        setMessages(prev => [...prev, { role: 'bot', text: aiAnswer }]);
      } else {
        // Tryb Offline - szukanie w bazie
        const answer = searchFAQ(userMsg);
        setMessages(prev => [...prev, { role: 'bot', text: answer }]);
        
        // Jeśli odpowiedź jest generyczna (nie znaleziona), zasugeruj AI
        if (answer.includes("nie znalazłem w bazie offline")) {
           setTimeout(() => {
             setMessages(prev => [...prev, { role: 'system', text: "💡 Wskazówka: Włącz 'Analityka Gemini 3.0', aby zapytać o to sztuczną inteligencję." }]);
           }, 1000);
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Wystąpił błąd komunikacji. Spróbuj ponownie za chwilę." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-[450px] max-w-[calc(100vw-3rem)] h-[750px] max-h-[calc(100vh-6rem)] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-[150] animate-in slide-in-from-bottom-8 duration-500 overflow-hidden ring-1 ring-black/5">
      {/* Header */}
      <div className="bg-slate-900 dark:bg-black p-6 text-white flex items-center justify-between shadow-xl relative z-20">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isDeepSearch ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-110' : 'bg-white/10 border border-white/10'}`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-black tracking-tight leading-none">Asystent KSeF 2.0</h4>
            <p className="text-[10px] font-black text-blue-400 mt-1.5 uppercase tracking-widest flex items-center gap-2">
              {isDeepSearch ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  ONLINE: {aiMode === 'technical' ? 'ENGINEER' : 'CONSULTANT'}
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                  OFFLINE: BAZA WIEDZY
                </>
              )}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-2xl transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 ml-1">
            <div className={`w-3 h-3 rounded-full ${isDeepSearch ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-slate-400'}`}></div>
            <span className="text-[11px] font-black text-slate-600 dark:text-slate-100 uppercase tracking-widest">Analityka Gemini 3.0</span>
          </div>
          <button 
            onClick={() => setIsDeepSearch(!isDeepSearch)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isDeepSearch ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${isDeepSearch ? 'left-8' : 'left-1'}`} />
          </button>
        </div>

        {/* Sub-mode selector (Visible only when AI is ON) */}
        {isDeepSearch && (
          <div className="flex bg-slate-200 dark:bg-slate-900/50 p-1 rounded-xl animate-in slide-in-from-top-2">
            <button 
              onClick={() => setAiMode('technical')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                aiMode === 'technical' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              🔧 Techniczny (API/XML)
            </button>
            <button 
              onClick={() => setAiMode('business')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                aiMode === 'business' ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              💼 Biznesowy (Prawo)
            </button>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-950">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            {m.role === 'system' ? (
               <div className="w-full text-center my-2">
                 <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100">{m.text}</span>
               </div>
            ) : (
              <div className={`max-w-[92%] px-6 py-4.5 rounded-[2rem] text-[14px] font-medium leading-relaxed shadow-sm transition-colors ${
                m.role === 'user' 
                  ? 'bg-slate-900 dark:bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-50 border border-slate-200 dark:border-slate-700 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 rounded-[2rem] rounded-tl-none border border-slate-200 dark:border-slate-700 flex space-x-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSend} className="flex items-center space-x-3">
          <input 
            type="text"
            value={input}
            disabled={isTyping}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isDeepSearch 
                ? (aiMode === 'technical' ? "Wpisz kod błędu (np. 21133) lub fragment XML..." : "Zapytaj o termin lub procedurę awaryjną...") 
                : "Szukaj w bazie offline (np. 'kary 2027')..."
            }
            className="flex-grow px-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[14px] font-bold outline-none border-2 border-transparent focus:border-slate-900 dark:focus:border-blue-500 text-slate-900 dark:text-white transition-all disabled:opacity-50 placeholder-slate-400"
          />
          <button 
            type="submit"
            disabled={isTyping || !input.trim()}
            className={`p-5 rounded-2xl transition-all shadow-xl ${
              isTyping || !input.trim() 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-300' 
                : 'bg-slate-900 dark:bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-blue-500/20'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p className="mt-3 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
          {isDeepSearch ? 'Połączenie szyfrowane (Gemini 3 Pro)' : 'Działasz w trybie prywatnym (Offline)'}
        </p>
      </div>
    </div>
  );
};

export default FAQChatbot;
