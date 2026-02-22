
import React, { useState, useEffect, useRef } from 'react';

const FA3_NODES = [
  { id: 'naglowek', label: 'Nagłówek', desc: 'Kod formularza, wariant, data wytworzenia pliku.', required: true, xml: '<Naglowek>\n  <KodFormularza kodSystemowy="FA (3)" wersjaSchemy="1-0E">FA</KodFormularza>\n  <WariantFormularza>3</WariantFormularza>\n  <DataWytworzeniaFa>2026-02-01T10:00:00Z</DataWytworzeniaFa>\n</Naglowek>' },
  { id: 'podmiot1', label: 'Podmiot 1 (Sprzedawca)', desc: 'NIP, nazwa, adres, dane kontaktowe wystawcy.', required: true, xml: '<Podmiot1>\n  <DaneIdentyfikacyjne>\n    <NIP>1234567890</NIP>\n    <Nazwa>TWOJA FIRMA SP. Z O.O.</Nazwa>\n  </DaneIdentyfikacyjne>\n  <Adres>\n    <KodKraju>PL</KodKraju>\n    <AdresL1>UL. TESTOWA 1</AdresL1>\n    <AdresL2>00-001 WARSZAWA</AdresL2>\n  </Adres>\n</Podmiot1>' },
  { id: 'podmiot2', label: 'Podmiot 2 (Nabywca)', desc: 'Dane kupującego (NIP/brak, adres).', required: true, xml: '<Podmiot2>\n  <DaneIdentyfikacyjne>\n    <NIP>0987654321</NIP>\n    <Nazwa>KONTRAHENT S.A.</Nazwa>\n  </DaneIdentyfikacyjne>\n</Podmiot2>' },
  { id: 'fa', label: 'Fa (Dane merytoryczne)', desc: 'Numer faktury, daty, waluta, wszystkie kwoty.', required: true, xml: '<Fa>\n  <P_1>2026-02-01</P_1>\n  <P_2>FV/2026/001</P_2>\n  <P_13_1>100.00</P_13_1>\n  <P_14_1>23.00</P_14_1>\n  <P_15>123.00</P_15>\n  <KodWaluty>PLN</KodWaluty>\n</Fa>' },
  { id: 'stopy', label: 'Stopka (Płatności)', desc: 'Termin płatności, rachunek bankowy (P_22).', required: false, xml: '<Stopka>\n  <InformacjeDodatkowe>Płatność przelewem</InformacjeDodatkowe>\n  <RejestrPłatności>\n    <TerminPłatności>2026-02-15</TerminPłatności>\n    <RachunekBankowy>12345678901234567890123456</RachunekBankowy>\n  </RejestrPłatności>\n</Stopka>' },
  { id: 'wiersze', label: 'FaWiersz (Pozycje)', desc: 'Szczegóły towarów/usług, stawki, ilości.', required: true, xml: '<FaWiersz>\n  <NrWierszaFa>1</NrWierszaFa>\n  <P_7>Usługa doradcza KSeF 2.0</P_7>\n  <P_8A>szt</P_8A>\n  <P_8B>1</P_8B>\n  <P_9A>100.00</P_9A>\n  <P_11>100.00</P_11>\n  <P_12>23</P_12>\n</FaWiersz>' },
];

const XMLCodeEditor: React.FC<{ 
  value: string; 
  onChange: (val: string) => void;
  nodeId: string;
}> = ({ value, onChange, nodeId }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const highlightXML = (code: string) => {
    let highlighted = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    highlighted = highlighted.replace(
      /(&lt;[/?!]?[a-zA-Z0-9_:]+)(\s+[a-zA-Z0-9_:]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*\s*([/?]?&gt;)/g,
      (match, tagStart, attrs, tagEnd) => {
        let result = `<span class="text-blue-400 font-bold">${tagStart}</span>`;
        if (attrs) {
          result += attrs.replace(
            /([a-zA-Z0-9_:]+)(=)("[^"]*"|'[^']*')/g,
            '<span class="text-sky-300">$1</span><span class="text-white">$2</span><span class="text-amber-300">$3</span>'
          );
        }
        result += `<span class="text-blue-400 font-bold">${tagEnd}</span>`;
        return result;
      }
    );

    return highlighted;
  };

  const lineNumbers = value.split('\n').map((_, i) => i + 1).join('\n');

  return (
    <div className="relative flex bg-slate-950 rounded-[2rem] border-2 border-slate-800 overflow-hidden min-h-[400px] font-mono text-[13px] group/editor shadow-2xl transition-all">
      {/* Line Numbers */}
      <div className="flex-shrink-0 bg-black/40 text-slate-600 p-6 pr-3 text-right select-none border-r border-white/5 min-w-[3.5rem]">
        <pre className="m-0 leading-loose opacity-50">{lineNumbers}</pre>
      </div>

      {/* Editor Surface */}
      <div className="relative flex-grow">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          className="absolute inset-0 w-full h-full p-6 bg-transparent text-transparent caret-white outline-none resize-none leading-loose z-10 font-mono scrollbar-hide"
          placeholder="Wpisz fragment XML..."
        />
        <pre
          ref={preRef}
          aria-hidden="true"
          className="m-0 p-6 w-full h-full text-slate-300 leading-loose pointer-events-none whitespace-pre overflow-hidden"
          dangerouslySetInnerHTML={{ __html: highlightXML(value) + "\n" }}
        />
      </div>

      {/* Info Badge Container */}
      <div className="absolute top-4 right-4 flex space-x-2 z-20">
        <div className="text-[9px] font-black bg-slate-800/80 px-2 py-1 rounded-full text-slate-400 border border-white/10 backdrop-blur-sm">
          XML SCHEMA FA(3)
        </div>
      </div>
    </div>
  );
};

const FA3StructureVisualizer: React.FC = () => {
  const [selected, setSelected] = useState<string | null>('wiersze');
  const [isXsdMode, setIsXsdMode] = useState(false);
  const [editedXml, setEditedXml] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const currentNode = FA3_NODES.find(n => n.id === selected);

  useEffect(() => {
    if (currentNode) {
      setEditedXml(currentNode.xml);
    }
  }, [selected]);

  useEffect(() => {
    if (!isXsdMode) {
      setValidationError(null);
      return;
    }

    const validate = () => {
      const openingTags = (editedXml.match(/<[^/][^>]*>/g) || []).length;
      const closingTags = (editedXml.match(/<\/[^>]+>/g) || []).length;
      if (openingTags !== closingTags) {
        return "Błąd składni XML: Niezbalansowane tagi. Sprawdź zamknięcia </...>";
      }

      if (selected === 'wiersze') {
        if (!editedXml.includes('<P_7>')) return "Błąd XSD: Brak wymaganego opisu towaru <P_7>.";
        if (!editedXml.includes('<P_12>')) return "Błąd XSD: Brak stawki VAT <P_12>.";
      }

      return null;
    };

    const error = validate();
    setValidationError(error);
  }, [editedXml, isXsdMode, selected]);

  const handleReset = () => {
    if (currentNode) {
      setEditedXml(currentNode.xml);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedXml);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy XML:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-2xl mb-8 transition-all">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            <span>Struktura Logiczna FA(3)</span>
          </div>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Anatomia pliku XML</h4>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsXsdMode(!isXsdMode)}
            className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-black text-xs transition-all border-2 ${
              isXsdMode ? 'bg-red-600 border-red-600 text-white shadow-xl animate-pulse' : 'bg-slate-900 dark:bg-slate-800 border-transparent text-white'
            }`}
          >
            <span>{isXsdMode ? 'TRYB WALIDACJI: ON' : 'WŁĄCZ WALIDACJĘ XSD'}</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Navigation - 1/3 Width */}
        <div className="lg:col-span-4 space-y-3">
          {FA3_NODES.map(node => (
            <button
              key={node.id}
              onClick={() => setSelected(node.id)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                selected === node.id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                  : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:border-blue-100'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${node.required ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'bg-slate-300'}`}></div>
                <div>
                  <div className="text-[13px] font-black">{node.label}</div>
                  <div className={`text-[10px] font-medium opacity-60 ${selected === node.id ? 'text-white' : 'text-slate-400'}`}>
                    {node.required ? 'Pole obowiązkowe' : 'Opcjonalne'}
                  </div>
                </div>
              </div>
              <svg className={`w-5 h-5 transition-transform ${selected === node.id ? 'translate-x-1' : 'opacity-20 group-hover:opacity-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg>
            </button>
          ))}
        </div>

        {/* Editor Area - 2/3 Width */}
        <div className="lg:col-span-8 p-8 bg-slate-900 dark:bg-black rounded-[3rem] text-white min-h-[500px] flex flex-col relative overflow-hidden shadow-2xl border border-white/5">
          {selected ? (
             <>
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-xl">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <h5 className="text-xl font-black">{currentNode?.label}</h5>
                 </div>
               </div>
               
               <p className="text-[13px] font-medium text-slate-400 leading-relaxed mb-8 max-w-xl">
                 {currentNode?.desc}
               </p>

               {isXsdMode && validationError && (
                 <div className="mb-6 p-5 bg-red-500/10 border-2 border-red-500/30 rounded-3xl animate-in zoom-in-95">
                   <div className="flex items-start space-x-3 text-red-400">
                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                     <p className="text-[12px] font-black leading-tight">
                       BŁĄD WALIDACJI: <span className="font-normal italic">{validationError}</span>
                     </p>
                   </div>
                 </div>
               )}

               <XMLCodeEditor 
                 value={editedXml} 
                 onChange={setEditedXml} 
                 nodeId={selected} 
               />
               
               <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
                 <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCopy}
                      className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-black text-xs transition-all border-2 ${
                        isCopied 
                          ? 'bg-green-600 border-green-600 text-white shadow-lg' 
                          : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                          <span>SKOPIOWANO XML</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                          <span>KOPIUJ SNIPPET</span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={handleReset}
                      className="px-6 py-4 bg-transparent text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Resetuj kod
                    </button>
                 </div>
                 
                 {isXsdMode && !validationError && (
                   <div className="flex items-center space-x-2 text-green-400 font-black text-[10px] uppercase tracking-widest">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>XSD PASSED</span>
                   </div>
                 )}
               </div>
             </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-slate-700 italic text-sm">Wybierz sekcję po lewej, aby wyświetlić kod...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FA3StructureVisualizer;
