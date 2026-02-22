
import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { useChecklist } from '../context/ChecklistContext';
import { TaskSection, ChecklistTask } from '../types';

interface ChecklistExportProps {
  onOpenSettings: () => void;
}

const ChecklistExport: React.FC<ChecklistExportProps> = ({ onOpenSettings }) => {
  const { tasks, profile, exportToCSV, exportToJSON } = useChecklist();
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (tasks.length > 0 && selectedIds.size === 0) {
      setSelectedIds(new Set(tasks.map(t => t.id)));
    }
  }, [tasks]);

  const toggleTaskSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSectionSelection = (section: TaskSection, forceState?: boolean) => {
    const sectionTasks = tasks.filter(t => t.section === section);
    const next = new Set(selectedIds);
    const isCurrentlySelected = sectionTasks.every(t => next.has(t.id));
    const targetState = forceState !== undefined ? forceState : !isCurrentlySelected;

    sectionTasks.forEach(t => {
      if (targetState) next.add(t.id);
      else next.delete(t.id);
    });
    setSelectedIds(next);
  };

  const selectAll = () => setSelectedIds(new Set(tasks.map(t => t.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const filteredTasks = useMemo(() => tasks.filter(t => selectedIds.has(t.id)), [tasks, selectedIds]);
  const completedCount = filteredTasks.filter(t => t.completed).length;
  const totalCount = filteredTasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const sections = Object.values(TaskSection);
  const today = new Date().toLocaleDateString('pl-PL');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleGeneratePDF = async () => {
    if (filteredTasks.length === 0) return alert("Wybierz zadania!");
    setIsExporting(true);
    try {
        const input = document.getElementById('printable-report');
        if (!input) throw new Error("Report element not found");
        const canvas = await html2canvas(input, { scale: 2, useCORS: true, logging: false, windowWidth: 1200 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }
        pdf.save(`KSeF_Report.pdf`);
        showSuccess("✅ PDF gotowy!");
    } catch (e) { alert("Błąd PDF."); } finally { setIsExporting(false); }
  };

  const handleGenerateDOC = () => {
    if (filteredTasks.length === 0) return alert("Wybierz zadania!");
    setIsExporting(true);
    const children: any[] = [
      new Paragraph({ text: "KSeF 2.0 Report", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: `Branża: ${profile?.industry || 'N/A'} | ${today}`, alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
    ];
    sections.forEach(s => {
      const sTasks = filteredTasks.filter(t => t.section === s);
      if (sTasks.length === 0) return;
      children.push(new Paragraph({ text: s, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 }, border: { bottom: { color: "auto", style: BorderStyle.SINGLE, size: 6 } } }));
      sTasks.forEach(t => {
        children.push(new Paragraph({ children: [new TextRun({ text: t.completed ? "[X] " : "[ ] ", bold: true }), new TextRun({ text: t.title, bold: true })] }), new Paragraph({ text: t.description, indent: { left: 720 }, spacing: { after: 100 } }));
      });
    });
    const doc = new Document({ sections: [{ children }] });
    Packer.toBlob(doc).then(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `KSeF_Report.docx`;
      link.click();
      setIsExporting(false);
      showSuccess("✅ DOCX gotowy!");
    });
  };

  const ReportContent = () => (
    <div className="bg-white text-black p-[5mm] md:p-[10mm] font-sans w-full">
      <div className="border-b-2 md:border-b-4 border-black pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">PunchlineROI x KSeF</h1>
          <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">{profile?.industry}</p>
        </div>
        <div className="text-left md:text-right mt-2 md:mt-0">
          <div className="text-[8px] md:text-[10px] font-black uppercase text-slate-400">Data raportu</div>
          <div className="text-xs md:text-sm font-bold">{today}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
         <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 block mb-1">Zadania</span>
            <span className="text-xl md:text-3xl font-black">{totalCount}</span>
         </div>
         <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 block mb-1">Postęp</span>
            <span className="text-xl md:text-3xl font-black text-blue-600">{percentage}%</span>
         </div>
      </div>

      <div className="space-y-10">
        {sections.map(s => {
          const sTasks = filteredTasks.filter(t => t.section === s);
          if (sTasks.length === 0) return null;
          return (
            <div key={s} className="break-inside-avoid">
              <h4 className="text-xs md:text-sm font-black border-l-2 md:border-l-4 border-black pl-3 md:pl-4 mb-4 uppercase tracking-widest">{s}</h4>
              <div className="space-y-4">
                {sTasks.map(t => (
                  <div key={t.id} className="pl-6 md:pl-8 relative border-b border-slate-100 pb-3">
                     <div className="absolute left-0 top-0.5 md:top-1 w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-black flex items-center justify-center">
                       {t.completed && <span className="text-[7px] md:text-[8px] font-black">X</span>}
                     </div>
                     <div className="text-xs md:text-sm font-black">{t.title}</div>
                     <p className="text-[10px] md:text-xs text-slate-600 mt-1 leading-relaxed">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-10 pt-6 border-t border-slate-200 text-center text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
         POWRED BY PUNCHLINEROI.COM
      </div>
    </div>
  );

  return (
    <div className="mb-8">
      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
           <h3 className="text-base md:text-lg font-black dark:text-white uppercase tracking-tighter">Eksport Dokumentacji</h3>
           <p className="text-[10px] md:text-xs text-slate-500 font-medium">Udostępnij raport wdrożeniowy w PDF, DOCX, CSV</p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2">
           <button 
             onClick={() => setShowPreview(true)}
             className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
             OTWÓRZ KREATOR
           </button>
           <button onClick={() => exportToCSV(filteredTasks)} className="p-2 md:p-3 bg-slate-100 dark:bg-slate-800 rounded-lg md:rounded-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2m2 4h10a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg></button>
           <button onClick={() => exportToJSON(filteredTasks)} className="p-2 md:p-3 bg-slate-100 dark:bg-slate-800 rounded-lg md:rounded-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg></button>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-2xl z-[250] flex flex-col items-center animate-in fade-in">
           {/* Mobile-Optimized Header */}
           <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between p-4 md:p-6 text-white border-b border-white/10 gap-4">
              <div className="flex items-center space-x-4 w-full md:w-auto">
                 <button onClick={() => setShowPreview(false)} className="p-3 bg-white/10 rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
                 <div className="flex-grow">
                    <h4 className="text-sm md:text-xl font-black truncate uppercase tracking-tighter">Konfigurator Raportu</h4>
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">{filteredTasks.length} wybranych zadań</p>
                 </div>
                 <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="md:hidden p-3 bg-blue-600 rounded-xl">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                 </button>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                 <button onClick={handleGeneratePDF} className="flex-grow md:flex-grow-0 px-6 py-3 bg-blue-600 rounded-xl font-black text-[10px] md:text-xs">POBIERZ PDF</button>
                 <button onClick={handleGenerateDOC} className="px-4 py-3 bg-white/10 rounded-xl font-black text-[10px] md:text-xs">DOCX</button>
                 <button onClick={() => window.print()} className="p-3 bg-white/10 rounded-xl hidden md:block"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg></button>
              </div>
           </div>

           <div className="flex-grow w-full max-w-7xl flex flex-col md:flex-row overflow-hidden relative">
              {/* Responsive Sidebar (Drawer on mobile) */}
              <div className={`
                ${showMobileFilters ? 'flex' : 'hidden md:flex'} 
                absolute md:relative inset-0 md:inset-auto z-[260] md:z-auto
                w-full md:w-80 border-r border-white/10 p-6 overflow-y-auto bg-slate-900 md:bg-black/20 flex-col
              `}>
                 <div className="flex items-center justify-between mb-8">
                    <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Filtrowanie Treści</h5>
                    <div className="flex gap-2">
                       <button onClick={selectAll} className="text-[10px] font-black text-blue-400">Wszystko</button>
                       <button onClick={deselectAll} className="text-[10px] font-black text-red-400">Nic</button>
                    </div>
                 </div>
                 <div className="space-y-6">
                    {sections.map(s => {
                       const sTasks = tasks.filter(t => t.section === s);
                       if (sTasks.length === 0) return null;
                       const allIn = sTasks.every(t => selectedIds.has(t.id));
                       return (
                          <div key={s} className="space-y-2">
                             <div onClick={() => toggleSectionSelection(s)} className="flex items-center gap-3 p-2 cursor-pointer">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${allIn ? 'bg-blue-600 border-blue-600' : 'border-slate-700'}`}>
                                   {allIn && <span className="text-[8px] font-black">✓</span>}
                                </div>
                                <span className="text-[10px] font-black uppercase text-white truncate">{s}</span>
                             </div>
                             <div className="pl-6 space-y-1">
                                {sTasks.map(t => (
                                   <div key={t.id} onClick={() => toggleTaskSelection(t.id)} className={`text-[10px] font-medium p-1 cursor-pointer transition-colors ${selectedIds.has(t.id) ? 'text-slate-300' : 'text-slate-700'}`}>
                                      {t.title}
                                   </div>
                                ))}
                             </div>
                          </div>
                       );
                    })}
                 </div>
                 {showMobileFilters && (
                    <button onClick={() => setShowMobileFilters(false)} className="md:hidden mt-8 w-full py-4 bg-blue-600 rounded-xl font-black text-xs">ZASTOSUJ</button>
                 )}
              </div>

              {/* Scalable Preview */}
              <div className="flex-grow bg-slate-100 p-4 md:p-12 overflow-y-auto flex flex-col items-center">
                 <div className="bg-white shadow-2xl w-[210mm] min-h-[297mm] transform origin-top transition-transform duration-500 scale-[0.38] sm:scale-[0.55] md:scale-[0.75] lg:scale-100 mb-20">
                    <ReportContent />
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistExport;
