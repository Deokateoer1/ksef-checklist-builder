
import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { useChecklist } from '../context/ChecklistContext';
import { TaskSection } from '../types';

interface ChecklistExportProps {
  onOpenSettings: () => void;
}

const ChecklistExport: React.FC<ChecklistExportProps> = ({ onOpenSettings }) => {
  const { tasks, profile } = useChecklist();
  const [isExporting, setIsExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const sections = Object.values(TaskSection);
  const today = new Date().toLocaleDateString('pl-PL');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // --- PDF GENERATION (HTML2CANVAS + JSPDF) ---
  const handleGeneratePDF = async () => {
    setIsExporting(true);
    
    try {
        const input = document.getElementById('printable-report');
        
        if (!input) {
            throw new Error("Nie znaleziono elementu raportu.");
        }

        // Generowanie canvasu z elementu HTML
        // Używamy skali 2 dla lepszej jakości (Retina/High DPI)
        const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: 1200 // Wymuszamy szerokość, aby układ był stabilny
        });

        const imgData = canvas.toDataURL('image/png');
        
        // Inicjalizacja PDF w formacie A4
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        // Pierwsza strona
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Dodawanie kolejnych stron, jeśli zawartość jest długa
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`KSeF_Plan_${profile?.industry?.replace(/\s+/g, '_') || 'Export'}.pdf`);
        showSuccess("✅ PDF (Visual) pobrany pomyślnie!");

    } catch (error) {
        console.error("Błąd generowania PDF:", error);
        alert("Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.");
    } finally {
        setIsExporting(false);
    }
  };

  // --- DOCX GENERATION ---
  const handleGenerateDOC = () => {
    setIsExporting(true);

    const docChildren: any[] = [
        new Paragraph({
            text: "PunchlineROI · KSeF 2.0 Checklist",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            text: `Branża: ${profile?.industry || 'N/A'} | Data: ${today}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: `Postęp: ${completedCount}/${totalCount} zadań (${percentage}%)`,
            spacing: { after: 400 },
        }),
    ];

    sections.forEach(section => {
        const sectionTasks = tasks.filter(t => t.section === section);
        if (sectionTasks.length === 0) return;

        docChildren.push(
            new Paragraph({
                text: section,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
                border: {
                    bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 },
                },
            })
        );

        sectionTasks.forEach(task => {
            docChildren.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: task.completed ? "[X] " : "[_] ",
                            bold: true,
                            font: "Courier New"
                        }),
                        new TextRun({
                            text: task.title,
                            bold: true,
                        }),
                        new TextRun({
                            text: ` [${task.priority.toUpperCase()}]`,
                            size: 16,
                            color: "666666",
                        }),
                    ],
                }),
                new Paragraph({
                    text: task.description,
                    indent: { left: 720 },
                    spacing: { after: 100 },
                })
            );

            // Add Notes if available, otherwise placeholder
            if (task.notes) {
                docChildren.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Notatka: ${task.notes}`,
                                color: "333333",
                                italics: true,
                                size: 20
                            })
                        ],
                        indent: { left: 720 },
                        spacing: { after: 200 },
                    })
                );
            } else {
                docChildren.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Notatki: ___________________________________________________________________",
                                color: "AAAAAA"
                            })
                        ],
                        indent: { left: 720 },
                        spacing: { after: 200 },
                    })
                );
            }
        });
    });

    // Footer
    docChildren.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: "Wygenerowano automatycznie przez PunchlineROI KSeF Builder",
                    color: "888888"
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 500 },
        })
    );

    const doc = new Document({
        sections: [{
            properties: {},
            children: docChildren,
        }],
    });

    Packer.toBlob(doc).then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `KSeF_Plan_${profile?.industry?.replace(/\s+/g, '_') || 'Export'}.docx`;
        link.click();
        setIsExporting(false);
        showSuccess("✅ DOCX pobrany pomyślnie!");
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg print:hidden">
        <div className="flex-grow">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider ml-2">Eksport Danych</h3>
        </div>
        
        <button 
          onClick={handleGeneratePDF}
          disabled={isExporting}
          className="group flex items-center space-x-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-black transition-all shadow-lg"
        >
          {isExporting ? (
             <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          )}
          <span>POBIERZ PDF (VISUAL)</span>
        </button>

        <button 
          onClick={handleGenerateDOC}
          disabled={isExporting}
          className="group flex items-center space-x-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-black text-xs hover:border-blue-500 hover:text-blue-500 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span>POBIERZ DOC</span>
        </button>

        <button 
          onClick={handlePrint}
          className="group flex items-center space-x-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-xs hover:bg-slate-200 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          <span>DRUKUJ</span>
        </button>
        
        <button 
          onClick={onOpenSettings}
          className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl font-black transition-all hover:bg-blue-200 dark:hover:bg-blue-900/60"
          title="Ustawienia Eksportu (Zaawansowane)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </div>

      {successMsg && (
        <div className="mt-3 text-center animate-in fade-in slide-in-from-top-2 print:hidden">
          <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-black">
            {successMsg}
          </span>
        </div>
      )}

      {/* --- REPORT CONTAINER FOR HTML2CANVAS --- */}
      {/* Pozycjonowany absolutnie "poza ekranem", ale renderowany w DOM, aby html2canvas mógł go przechwycić. */}
      {/* Nie używamy 'hidden', bo html2canvas wtedy ignoruje element. */}
      <div id="printable-report" className="fixed top-0 left-[-10000px] w-[210mm] bg-white text-black p-[15mm]">
        <div className="bg-white text-black">
          
          {/* Header Box */}
          <div className="border border-black p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold uppercase">PunchlineROI · KSeF 2.0</h1>
                <p className="text-xs uppercase">Automatyzacja KSeF | powered by punchlineroi.com</p>
              </div>
            </div>
          </div>

          {/* Info Block */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1">Plan Wdrożenia: {profile?.industry}</h2>
            <p className="text-sm">Firma: {profile?.companySize} | Data: {today}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
             <div className="text-sm mb-1">Postęp wdrożenia: {completedCount}/{totalCount} zadań ({percentage}%)</div>
             <div className="w-full h-2 bg-gray-200 border border-black relative">
               <div className="h-full bg-gray-600" style={{ width: `${percentage}%` }}></div>
             </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-6">
            {sections.map(section => {
              const sectionTasks = tasks.filter(t => t.section === section);
              if (sectionTasks.length === 0) return null;

              return (
                <div key={section} className="break-inside-avoid">
                  <h4 className="text-sm font-bold bg-gray-200 p-2 border-l-4 border-black uppercase mb-3">{section}</h4>
                  <div className="space-y-3">
                    {sectionTasks.map(task => (
                      <div key={task.id} className="mb-2">
                         <div className="flex items-start space-x-3">
                           <div className="w-4 h-4 border border-black flex items-center justify-center flex-shrink-0 mt-0.5 bg-white">
                             {task.completed && <span className="text-xs font-bold">✓</span>}
                           </div>
                           <div className="flex-grow">
                             <div className="text-sm font-bold">
                               {task.title} 
                               {(task.priority === 'critical' || task.priority === 'high') && ` [${task.priority.toUpperCase()}]`}
                             </div>
                             {/* Note Display */}
                             {task.notes ? (
                               <div className="mt-2 text-xs italic border-l-2 border-gray-400 pl-2 text-gray-700">
                                 Notatka: {task.notes}
                               </div>
                             ) : (
                               <div className="mt-4 border-b border-gray-300 w-full h-1"></div>
                             )}
                           </div>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-4 border-t border-black text-center text-xs text-gray-500">
             <p>Wygenerowano przez PunchlineROI.com</p>
             <p>punchlineroi.com | impact@punchlineroi.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChecklistExport;
