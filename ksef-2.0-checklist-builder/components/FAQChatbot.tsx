
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
    { role: 'bot', text: 'Cześć! Jestem Twoim asystentem KSeF. \n\nSzukasz czegoś konkretnego w bazie wiedzy, czy potrzebujesz zaawansowanej analizy AI?' }
  ]);
  const [input, setInput] = useState('');
  const [isDeepSearch, setIsDeepSearch] = useState(false);
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
        const aiAnswer = await askGeminiKSeF(userMsg, profile);
        setMessages(prev => [...prev, { role: 'bot', text: aiAnswer }]);
      } else {
        const answer = searchFAQ(userMsg);
        setMessages(prev => [...prev, { role: 'bot', text: answer }]);
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
      <div className="bg-slate-900 dark:bg-black p-7 text-white flex items-center justify-between shadow-xl relative z-20">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isDeepSearch ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-110' : 'bg-white/10 border border-white/10'}`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-black tracking-tight leading-none">Asystent KSeF 2.0</h4>
            <p className="text-[11px] font-black text-blue-400 mt-1.5 uppercase tracking-widest">
              {isDeepSearch ? 'Tryb: AI Deep Research' : 'Tryb: Baza Wiedzy Offline'}
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
      <div className="bg-slate-50 dark:bg-slate-800/80 p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-inner">
        <div className="flex items-center space-x-3 ml-1">
          <div className={`w-3 h-3 rounded-full ${isDeepSearch ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-slate-400'}`}></div>
          <span className="text-[12px] font-black text-slate-600 dark:text-slate-100 uppercase tracking-widest">Analityka Gemini 3.0 Pro</span>
        </div>
        <button 
          onClick={() => setIsDeepSearch(!isDeepSearch)}
          className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${isDeepSearch ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
        >
          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${isDeepSearch ? 'left-9' : 'left-1'}`} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-950">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[92%] px-6 py-4.5 rounded-[2rem] text-[15px] font-medium leading-relaxed shadow-sm transition-colors ${
              m.role === 'user' 
                ? 'bg-slate-900 dark:bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-50 border border-slate-200 dark:border-slate-700 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
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
            placeholder={isDeepSearch ? "Opisz problem (AI rozumie kontekst)..." : "Zadaj proste pytanie (Baza wiedzy)..."}
            className="flex-grow px-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[15px] font-bold outline-none border-2 border-transparent focus:border-slate-900 dark:focus:border-blue-500 text-slate-900 dark:text-white transition-all disabled:opacity-50 placeholder-slate-400"
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
          Tryb AI jest zalecany dla pytań o "Robota Zwiadowcę".
        </p>
      </div>
    </div>
  );
};

export default FAQChatbot;
