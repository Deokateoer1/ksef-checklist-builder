
import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, ShadingType } from "docx";
import { useChecklist } from '../context/ChecklistContext';
import { TaskSection, ChecklistTask } from '../types';

interface ChecklistExportProps {
  onOpenSettings: () => void;
}

// Kolory priorytetów
const PRIORITY_COLORS: Record<string, { hex: string; label: string }> = {
  critical: { hex: '#ef4444', label: 'CRITICAL' },
  high:     { hex: '#f97316', label: 'HIGH' },
  medium:   { hex: '#eab308', label: 'MEDIUM' },
  low:      { hex: '#22c55e', label: 'LOW' },
};

const ChecklistExport: React.FC<ChecklistExportProps> = () => {
  const { tasks, profile, exportToCSV, exportToJSON } = useChecklist();
  const [isExporting, setIsExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Opcje raportu
  const [includeNotes, setIncludeNotes] = useState(false);
  const [colorPrint, setColorPrint] = useState(true);
  const [includeDescription, setIncludeDescription] = useState(true);
  const [onlyCritical, setOnlyCritical] = useState(false);

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

  const toggleSectionSelection = (section: TaskSection) => {
    const sectionTasks = tasks.filter(t => t.section === section);
    const next = new Set(selectedIds);
    const isCurrentlySelected = sectionTasks.every(t => next.has(t.id));
    sectionTasks.forEach(t => {
      if (!isCurrentlySelected) next.add(t.id);
      else next.delete(t.id);
    });
    setSelectedIds(next);
  };

  const selectAll = () => setSelectedIds(new Set(tasks.map(t => t.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const baseTasks = useMemo(() => tasks.filter(t => selectedIds.has(t.id)), [tasks, selectedIds]);
  const filteredTasks = useMemo(
    () => onlyCritical ? baseTasks.filter(t => t.priority === 'critical') : baseTasks,
    [baseTasks, onlyCritical]
  );

  const completedCount = filteredTasks.filter(t => t.completed).length;
  const totalCount = filteredTasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const sections = Object.values(TaskSection);
  const today = new Date().toLocaleDateString('pl-PL');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // ── PDF (jsPDF text-based — pełna strona, bez pustych pól) ──────────────

  const handleGeneratePDF = () => {
    if (filteredTasks.length === 0) return alert("Wybierz zadania do eksportu!");
    setIsExporting(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - 2 * margin;
      let y = margin;

      const checkPageBreak = (needed: number) => {
        if (y + needed > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
      };

      // ── Nagłówek ──
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KSeF 2.0 — Plan Wdrożenia', margin, y);
      y += 8;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Branża: ${profile?.industry ?? 'N/A'} | ${today} | ${filteredTasks.length} zadań | Postęp: ${percentage}%`,
        margin, y
      );
      y += 4;

      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 7;

      // ── Zadania per sekcja ──
      for (const section of sections) {
        const sTasks = filteredTasks.filter(t => t.section === section);
        if (sTasks.length === 0) continue;

        checkPageBreak(14);

        // Nagłówek sekcji
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(section.toUpperCase(), margin, y);
        y += 2;
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineWidth(0.3);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 6;

        for (const task of sTasks) {
          const prioColor = PRIORITY_COLORS[task.priority];

          // Szacujemy wysokość zadania
          const titleLines = pdf.splitTextToSize(`${task.completed ? '☑' : '☐'} ${task.title}`, contentWidth - 5);
          const descLines = includeDescription
            ? pdf.splitTextToSize(task.description, contentWidth - 10)
            : [];
          const noteLines = (includeNotes && task.notes)
            ? pdf.splitTextToSize(`📝 ${task.notes}`, contentWidth - 10)
            : [];

          const estimatedHeight = titleLines.length * 5
            + (descLines.length > 0 ? descLines.length * 4 + 2 : 0)
            + (noteLines.length > 0 ? noteLines.length * 4 + 2 : 0)
            + 8;

          checkPageBreak(estimatedHeight);

          // Checkbox + tytuł
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          pdf.text(titleLines, margin, y);
          y += titleLines.length * 5;

          // Badge priorytetu (prawy margines)
          if (colorPrint) {
            const r = parseInt(prioColor.hex.slice(1, 3), 16);
            const g = parseInt(prioColor.hex.slice(3, 5), 16);
            const b = parseInt(prioColor.hex.slice(5, 7), 16);
            pdf.setTextColor(r, g, b);
          } else {
            pdf.setTextColor(80, 80, 80);
          }
          pdf.setFontSize(7);
          pdf.text(prioColor.label, pageWidth - margin, y - titleLines.length * 5, { align: 'right' });
          pdf.setTextColor(0, 0, 0);

          // Opis
          if (includeDescription && descLines.length > 0) {
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(90, 90, 90);
            pdf.text(descLines, margin + 5, y);
            y += descLines.length * 4 + 2;
            pdf.setTextColor(0, 0, 0);
          }

          // Notatka
          if (includeNotes && noteLines.length > 0) {
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(colorPrint ? 37 : 80, colorPrint ? 99 : 80, colorPrint ? 235 : 80);
            pdf.text(noteLines, margin + 5, y);
            y += noteLines.length * 4 + 2;
            pdf.setTextColor(0, 0, 0);
          }

          // Szacunek czasu + deadline
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(150, 150, 150);
          pdf.text(`⏱ ${task.estimatedHours}h  📅 D+${task.deadlineDays}`, margin + 5, y);
          y += 5;

          // Separator między zadaniami
          pdf.setDrawColor(230, 230, 230);
          pdf.setLineWidth(0.2);
          pdf.line(margin, y, pageWidth - margin, y);
          y += 4;
        }

        y += 4; // Odstęp między sekcjami
      }

      // ── Stopka ──
      const totalPages = (pdf as any).internal.getNumberOfPages?.() ?? 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(180, 180, 180);
        pdf.text(
          `KSeF 2.0 Compliance — PunchlineROI.com — Strona ${i}/${totalPages}`,
          pageWidth / 2,
          pageHeight - 6,
          { align: 'center' }
        );
      }

      pdf.save(`KSeF_Plan_${profile?.industry ?? 'raport'}_${today}.pdf`);
      showSuccess("✅ PDF gotowy!");
    } catch (e) {
      console.error(e);
      alert("Błąd generowania PDF. Sprawdź konsolę.");
    } finally {
      setIsExporting(false);
    }
  };

  // ── DOCX ────────────────────────────────────────────────────────────────

  const handleGenerateDOC = async () => {
    if (filteredTasks.length === 0) return alert("Wybierz zadania!");
    setIsExporting(true);

    try {
      const children: Paragraph[] = [
        new Paragraph({
          text: "KSeF 2.0 — Plan Wdrożenia",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `Branża: ${profile?.industry ?? 'N/A'} | Data: ${today} | Postęp: ${percentage}%`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }),
      ];

      for (const section of sections) {
        const sTasks = filteredTasks.filter(t => t.section === section);
        if (sTasks.length === 0) continue;

        children.push(new Paragraph({
          text: section,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
          border: { bottom: { color: 'auto', style: BorderStyle.SINGLE, size: 6 } },
        }));

        for (const task of sTasks) {
          // Tytuł z checkbox i priorytetem
          children.push(new Paragraph({
            children: [
              new TextRun({ text: task.completed ? '☑ ' : '☐ ', bold: true, size: 22 }),
              new TextRun({ text: task.title, bold: true, size: 22 }),
              new TextRun({ text: `  [${task.priority.toUpperCase()}]`, color: '666666', size: 18 }),
              new TextRun({ text: `  ⏱${task.estimatedHours}h  📅D+${task.deadlineDays}`, color: '999999', size: 16 }),
            ],
            spacing: { before: 150 },
          }));

          // Opis
          if (includeDescription) {
            children.push(new Paragraph({
              text: task.description,
              indent: { left: 720 },
              spacing: { after: 60 },
            }));
          }

          // Notatka
          if (includeNotes && task.notes) {
            children.push(new Paragraph({
              children: [
                new TextRun({ text: '📝 Notatka: ', bold: true, italics: true, color: '2563EB', size: 18 }),
                new TextRun({ text: task.notes, italics: true, color: '4B5563', size: 18 }),
              ],
              indent: { left: 720 },
              spacing: { after: 100 },
              shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'EFF6FF' },
            }));
          }
        }
      }

      // Stopka
      children.push(new Paragraph({
        text: `PunchlineROI.com — KSeF 2.0 Compliance System`,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
      }));

      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `KSeF_Plan_${profile?.industry ?? 'raport'}_${today}.docx`;
      link.click();
      showSuccess("✅ DOCX gotowy!");
    } catch (e) {
      console.error(e);
      alert("Błąd generowania DOCX.");
    } finally {
      setIsExporting(false);
    }
  };

  // ── Print (window.print) ────────────────────────────────────────────────

  const handlePrint = () => {
    window.print();
  };

  // ── Podgląd raportu (ReportContent) ────────────────────────────────────

  const ReportContent = () => (
    <div
      id="printable-report"
      className="bg-white text-black font-sans w-full"
      style={{ minHeight: '297mm', padding: '15mm', boxSizing: 'border-box' }}
    >
      {/* Nagłówek */}
      <div className="flex justify-between items-start pb-4 mb-6" style={{ borderBottom: '3px solid black' }}>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">PunchlineROI × KSeF 2.0</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{profile?.industry}</p>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-black text-slate-400 uppercase">Data</div>
          <div className="text-sm font-bold">{today}</div>
          <div className="text-[9px] font-black text-slate-400 uppercase mt-1">Postęp</div>
          <div className="text-lg font-black text-blue-600">{percentage}%</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-slate-200 p-3 rounded-xl text-center">
          <div className="text-[9px] font-black uppercase text-slate-400 mb-1">Zadań</div>
          <div className="text-2xl font-black">{totalCount}</div>
        </div>
        <div className="border border-slate-200 p-3 rounded-xl text-center">
          <div className="text-[9px] font-black uppercase text-slate-400 mb-1">Ukończono</div>
          <div className="text-2xl font-black text-green-600">{completedCount}</div>
        </div>
        <div className="border border-slate-200 p-3 rounded-xl text-center">
          <div className="text-[9px] font-black uppercase text-slate-400 mb-1">Krytycznych</div>
          <div className="text-2xl font-black text-red-500">{filteredTasks.filter(t => t.priority === 'critical').length}</div>
        </div>
      </div>

      {/* Zadania per sekcja */}
      <div className="space-y-8">
        {sections.map(s => {
          const sTasks = filteredTasks.filter(t => t.section === s);
          if (sTasks.length === 0) return null;
          return (
            <div key={s} style={{ pageBreakInside: 'avoid' }}>
              <h4 className="text-xs font-black uppercase tracking-widest mb-3" style={{ borderLeft: '4px solid black', paddingLeft: '12px' }}>
                {s}
              </h4>
              <div className="space-y-3">
                {sTasks.map(t => {
                  const prio = PRIORITY_COLORS[t.priority];
                  return (
                    <div key={t.id} style={{ pageBreakInside: 'avoid', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <div style={{
                          width: 16, height: 16, border: '2px solid black',
                          flexShrink: 0, marginTop: 2,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {t.completed && <span style={{ fontSize: 9, fontWeight: 900 }}>✓</span>}
                        </div>

                        <div className="flex-grow">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-black leading-snug">{t.title}</span>
                            <span style={{
                              fontSize: 9, fontWeight: 900, padding: '2px 6px',
                              borderRadius: 4, flexShrink: 0,
                              background: colorPrint ? prio.hex + '22' : '#f1f5f9',
                              color: colorPrint ? prio.hex : '#374151',
                              border: `1px solid ${colorPrint ? prio.hex : '#cbd5e1'}`,
                            }}>
                              {prio.label}
                            </span>
                          </div>

                          {includeDescription && (
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{t.description}</p>
                          )}

                          {includeNotes && t.notes && (
                            <div style={{
                              background: '#EFF6FF', borderLeft: '3px solid #2563EB',
                              padding: '4px 8px', marginTop: 6, borderRadius: '0 4px 4px 0',
                            }}>
                              <span style={{ fontSize: 10, color: '#2563EB', fontWeight: 700 }}>📝 Notatka: </span>
                              <span style={{ fontSize: 10, color: '#374151', fontStyle: 'italic' }}>{t.notes}</span>
                            </div>
                          )}

                          <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 4 }}>
                            ⏱ {t.estimatedHours}h &nbsp;|&nbsp; 📅 D+{t.deadlineDays} dni
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stopka */}
      <div className="mt-10 pt-4 text-center" style={{ borderTop: '1px solid #e5e7eb' }}>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          KSeF 2.0 Compliance System — powered by PunchlineROI.com
        </p>
      </div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="mb-8">
      {/* Pasek sukcesu */}
      {successMsg && (
        <div className="mb-3 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-xs font-bold text-center animate-in fade-in">
          {successMsg}
        </div>
      )}

      {/* Główny kafelek eksportu */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black dark:text-white uppercase tracking-tighter">Eksport / Druk</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{filteredTasks.length} zadań wybranych</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            ⚙ Kreator
          </button>
        </div>

        {/* Szybkie akcje */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => exportToJSON(filteredTasks)}
            className="flex flex-col items-center gap-1.5 py-3 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
          >
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            <span className="text-[9px] font-black uppercase text-slate-500">JSON</span>
          </button>
          <button
            onClick={() => exportToCSV(filteredTasks)}
            className="flex flex-col items-center gap-1.5 py-3 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
          >
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2m2 4h10a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2zm5-10V4m0 0l-3 3m3-3l3 3" /></svg>
            <span className="text-[9px] font-black uppercase text-slate-500">CSV</span>
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={isExporting}
            className="flex flex-col items-center gap-1.5 py-3 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            <span className="text-[9px] font-black uppercase text-slate-500">PDF</span>
          </button>
          <button
            onClick={handleGenerateDOC}
            disabled={isExporting}
            className="flex flex-col items-center gap-1.5 py-3 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="text-[9px] font-black uppercase text-slate-500">DOCX</span>
          </button>
        </div>
      </div>

      {/* ── KREATOR EKSPORTU (modal) ──────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl z-[250] flex flex-col items-center animate-in fade-in">

          {/* Header modalu */}
          <div className="w-full max-w-7xl flex items-center justify-between p-4 md:p-6 text-white border-b border-white/10">
            <div className="flex items-center gap-4">
              <button onClick={() => setShowModal(false)} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight">Kreator Raportu</h4>
                <p className="text-[10px] font-bold text-slate-500">{filteredTasks.length} zadań • Postęp: {percentage}%</p>
              </div>
            </div>

            {/* Przyciski pobierania */}
            <div className="flex items-center gap-2">
              <button onClick={() => exportToJSON(filteredTasks)} className="px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-black text-[10px] uppercase transition-colors">JSON</button>
              <button onClick={() => exportToCSV(filteredTasks)} className="px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-black text-[10px] uppercase transition-colors">CSV</button>
              <button onClick={handleGenerateDOC} disabled={isExporting} className="px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-black text-[10px] uppercase transition-colors disabled:opacity-50">DOCX</button>
              <button onClick={handleGeneratePDF} disabled={isExporting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-black text-[10px] uppercase transition-colors shadow-xl shadow-blue-600/30 disabled:opacity-50">
                {isExporting ? '...' : 'PDF'}
              </button>
              <button onClick={handlePrint} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors" title="Drukuj">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              </button>
              {/* Mobile — pokaż/ukryj filtry */}
              <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="md:hidden p-2.5 bg-blue-600 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </button>
            </div>
          </div>

          <div className="flex-grow w-full max-w-7xl flex flex-col md:flex-row overflow-hidden">

            {/* ── LEWA KOLUMNA: Opcje + Selekcja ──────────────────── */}
            <div className={`${showMobileFilters ? 'flex' : 'hidden md:flex'} absolute md:relative inset-0 md:inset-auto z-[260] md:z-auto w-full md:w-80 border-r border-white/10 overflow-y-auto bg-slate-900 flex-col`}>
              <div className="p-6 space-y-6">

                {/* Opcje raportu */}
                <div>
                  <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Opcje Raportu</h5>
                  <div className="space-y-3">
                    {/* Notatki */}
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-white">Dołącz notatki</span>
                        <p className="text-[10px] text-slate-500">Każde zadanie z notatką użytkownika</p>
                      </div>
                      <button
                        onClick={() => setIncludeNotes(!includeNotes)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${includeNotes ? 'bg-blue-600' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${includeNotes ? 'left-7' : 'left-1'}`} />
                      </button>
                    </label>

                    {/* Opis zadań */}
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-white">Dołącz opisy</span>
                        <p className="text-[10px] text-slate-500">Szczegółowy opis każdego zadania</p>
                      </div>
                      <button
                        onClick={() => setIncludeDescription(!includeDescription)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${includeDescription ? 'bg-blue-600' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${includeDescription ? 'left-7' : 'left-1'}`} />
                      </button>
                    </label>

                    {/* Tylko krytyczne */}
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-white">Tylko CRITICAL</span>
                        <p className="text-[10px] text-slate-500">Filtruj do zadań blokujących</p>
                      </div>
                      <button
                        onClick={() => setOnlyCritical(!onlyCritical)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${onlyCritical ? 'bg-red-600' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${onlyCritical ? 'left-7' : 'left-1'}`} />
                      </button>
                    </label>
                  </div>
                </div>

                {/* Tryb druku */}
                <div>
                  <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Tryb Druku</h5>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setColorPrint(true)}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${colorPrint ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      🎨 Kolorowy
                    </button>
                    <button
                      onClick={() => setColorPrint(false)}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${!colorPrint ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      ⬛ Czarno-biały
                    </button>
                  </div>
                </div>

                {/* Selekcja zadań */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Wybierz Zadania</h5>
                    <div className="flex gap-2">
                      <button onClick={selectAll} className="text-[10px] font-black text-blue-400 hover:text-blue-300">Wszystkie</button>
                      <button onClick={deselectAll} className="text-[10px] font-black text-red-400 hover:text-red-300">Nic</button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {sections.map(s => {
                      const sTasks = tasks.filter(t => t.section === s);
                      if (sTasks.length === 0) return null;
                      const allIn = sTasks.every(t => selectedIds.has(t.id));
                      return (
                        <div key={s}>
                          <div onClick={() => toggleSectionSelection(s)} className="flex items-center gap-2 p-2 cursor-pointer hover:bg-white/5 rounded-lg">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${allIn ? 'bg-blue-600 border-blue-600' : 'border-slate-600'}`}>
                              {allIn && <span className="text-[8px] font-black text-white">✓</span>}
                            </div>
                            <span className="text-[10px] font-black text-white truncate">{s.split('. ')[1] ?? s}</span>
                            <span className="text-[9px] text-slate-500 ml-auto">{sTasks.filter(t => selectedIds.has(t.id)).length}/{sTasks.length}</span>
                          </div>
                          <div className="pl-6 space-y-0.5">
                            {sTasks.map(t => (
                              <div
                                key={t.id}
                                onClick={() => toggleTaskSelection(t.id)}
                                className={`text-[10px] p-1 cursor-pointer rounded transition-colors flex items-center gap-2 ${selectedIds.has(t.id) ? 'text-slate-300' : 'text-slate-600'}`}
                              >
                                <div className={`w-3 h-3 rounded border flex-shrink-0 ${selectedIds.has(t.id) ? 'bg-blue-500 border-blue-500' : 'border-slate-700'}`} />
                                <span className="truncate">{t.title}</span>
                                {t.notes && <span title="Ma notatkę" className="text-blue-400 flex-shrink-0">📝</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {showMobileFilters && (
                  <button onClick={() => setShowMobileFilters(false)} className="w-full py-4 bg-blue-600 rounded-xl font-black text-xs uppercase">
                    Zastosuj
                  </button>
                )}
              </div>
            </div>

            {/* ── PRAWA KOLUMNA: Podgląd A4 ──────────────────────── */}
            <div className="flex-grow bg-slate-100 p-4 md:p-12 overflow-y-auto flex flex-col items-center print:p-0 print:bg-white">
              <div
                className="bg-white shadow-2xl origin-top transition-transform duration-300 print:shadow-none print:w-full"
                style={{
                  width: '210mm',
                  transform: 'scale(var(--preview-scale, 0.75))',
                }}
              >
                <style>{`
                  @media screen { :root { --preview-scale: 0.75; } }
                  @media (max-width: 768px) { :root { --preview-scale: 0.45; } }
                  @media print {
                    @page { size: A4 portrait; margin: 1.5cm; }
                    body * { visibility: hidden; }
                    #printable-report, #printable-report * { visibility: visible; }
                    #printable-report { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                  }
                `}</style>
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
