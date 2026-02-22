
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TaskSection, CompanySize } from '../types';
import TaskItem from './TaskItem';
import ProgressBar from './ProgressBar';
import AlertsPanel from './AlertsPanel';
import ComplianceRadar from './ComplianceRadar';
import FAQChatbot from './FAQChatbot';
import RobotIntelligenceCenter from './RobotIntelligenceCenter';
import ExportSettingsModal from './ExportSettingsModal';
import ConnectionModal from './ConnectionModal';
import TaskSummaryWidget from './TaskSummaryWidget'; 
import ChecklistExport from './ChecklistExport';
import ClientManager from './ClientManager';
import { SECTION_ICONS } from '../constants';
import { useChecklist } from '../context/ChecklistContext';

const ResourceCenter: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
      <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 00(5.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
      Oficjalne Zasoby MF
    </h4>
    <div className="space-y-2">
      {[
        { label: 'Portal Podatnika KSeF', url: 'https://ksef.mf.gov.pl/' },
        { label: 'Dokumentacja API (Swagger)', url: 'https://ksef.mf.gov.pl/api/online/index.html' },
        { label: 'Struktury FA-3 (XSD)', url: 'https://www.gov.pl/web/kas/krajowy-system-e-faktur-struktury-logiczn' },
        { label: 'Aplikacja Mobilna (Test)', url: 'https://ksef-test.mf.gov.pl/web/' }
      ].map((link, i) => (
        <a 
          key={i} 
          href={link.url} 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
        >
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-600">{link.label}</span>
          <svg className="w-3 h-3 text-slate-300 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      ))}
    </div>
  </div>
);

const KSeFTimeline: React.FC = () => {
  const events = useMemo(() => [
    { date: new Date('2025-01-01'), label: "START ANALIZY", type: 'past' },
    { date: new Date('2025-09-30'), label: "API 2.0 TEST", type: 'future' },
    { date: new Date('2025-12-10'), label: "JWT 2.0 / TOKENY", type: 'future' },
    { date: new Date('2026-02-01'), label: "OBOWIĄZEK (>200M)", type: 'mandatory' },
    { date: new Date('2026-04-01'), label: "OBOWIĄZEK (MŚP)", type: 'mandatory' },
    { date: new Date('2027-01-01'), label: "AKTYWACJA KAR", type: 'fines' },
  ], []);

  const today = new Date(); 
  
  const getPosition = (date: Date) => {
    const start = events[0].date.getTime();
    const end = events[events.length - 1].date.getTime();
    const pos = ((date.getTime() - start) / (end - start)) * 100;
    return Math.min(Math.max(pos, 0), 100);
  };

  const todayPos = getPosition(today);

  return (
    <div className="bg-slate-900 dark:bg-slate-900/80 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden border border-slate-800 transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-200 mb-8 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
        KSeF Legal Roadmap
      </h3>

      <div className="relative h-[350px] ml-4">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-800 rounded-full"></div>
        <div className="absolute left-0 top-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.5)]" style={{ height: `${todayPos}%` }}></div>
        <div className="absolute left-[-6px] transition-all duration-1000 z-20 group" style={{ top: `${todayPos}%` }}>
          <div className="w-4 h-4 bg-white rounded-full border-4 border-blue-600 shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse"></div>
          <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-blue-600 px-3 py-1 rounded-lg shadow-xl whitespace-nowrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">TU JESTEŚ</span>
          </div>
        </div>

        {events.map((event, idx) => {
          const pos = getPosition(event.date);
          const isPassed = today > event.date;
          return (
            <div key={idx} className="absolute left-[-4px] w-full" style={{ top: `${pos}%` }}>
              <div className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${isPassed ? 'bg-blue-500 border-blue-400' : 'bg-slate-900 border-slate-700'} ${event.type === 'mandatory' ? 'scale-125 border-red-500' : ''}`}></div>
              <div className={`absolute left-8 top-1/2 -translate-y-1/2 transition-opacity duration-500 ${isPassed ? 'opacity-40' : 'opacity-100'}`}>
                <div className={`text-[10px] font-black leading-none mb-1 ${event.type === 'mandatory' ? 'text-red-400' : 'text-slate-400 dark:text-slate-300'}`}>{event.date.toLocaleDateString('pl-PL')}</div>
                <div className={`text-xs font-bold leading-tight uppercase tracking-tight ${event.type === 'mandatory' ? 'text-white' : 'text-slate-300 dark:text-slate-200'}`}>{event.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ChecklistDashboard: React.FC = () => {
  const { tasks, bulkTasks, clients, toggleTask, updateTaskNote, reset, profile, mode } = useChecklist();
  const [activeSection, setActiveSection] = useState<TaskSection>(TaskSection.PREPARATORY);
  const [activeIndustry, setActiveIndustry] = useState<string | null>(bulkTasks ? Object.keys(bulkTasks)[0] : null);
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const tasksRef = useRef<HTMLDivElement>(null);

  const currentTasks = useMemo(() => {
    const rawTasks = mode === 'bulk' && activeIndustry && bulkTasks ? bulkTasks[activeIndustry] : tasks;
    return rawTasks; 
  }, [mode, activeIndustry, bulkTasks, tasks]);

  const completedCount = currentTasks.filter(t => t.completed).length;
  const sections = Object.values(TaskSection);
  
  const firstUncompletedId = useMemo(() => {
     return currentTasks.find(t => !t.completed)?.id;
  }, [currentTasks]);

  const filteredTasksWithIndex = useMemo(() => {
    return currentTasks.map((t, idx) => ({ ...t, globalIndex: idx }))
                       .filter(t => t.section === activeSection);
  }, [currentTasks, activeSection]);

  const showClientManager = profile?.companySize === CompanySize.ACCOUNTING || Object.keys(clients).length > 0;

  useEffect(() => {
    tasksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeSection]);

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 py-4 w-full items-start">
      <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
        {showClientManager && <ClientManager />}
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black dark:text-white">Strategia</h2>
            <div className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded-md">
              FAZA {sections.indexOf(activeSection)}
            </div>
          </div>
          <nav className="space-y-2">
            {sections.map((section) => {
              const count = currentTasks.filter(t => t.section === section).length;
              const done = currentTasks.filter(t => t.section === section && t.completed).length;
              const isActive = activeSection === section;
              const hasNextAction = currentTasks.some(t => t.section === section && t.id === firstUncompletedId);

              return (
                <button
                  key={section}
                  onClick={() => setActiveSection(section as TaskSection)}
                  className={`w-full group relative flex flex-col p-3.5 rounded-2xl transition-all border-2 ${isActive ? 'bg-slate-900 border-slate-900 dark:border-blue-600 dark:bg-slate-800 text-white shadow-xl' : 'bg-white dark:bg-slate-900 border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}
                >
                  <div className="w-full flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <span className={`${isActive ? 'text-blue-400' : 'text-slate-400'}`}>{SECTION_ICONS[section]}</span>
                      <span className="font-bold text-[11px] truncate">{section.split('. ')[1]}</span>
                    </div>
                    <div className="text-[10px] font-black">{done}/{count}</div>
                  </div>
                  {hasNextAction && !isActive && (
                    <div className="absolute right-2 top-2 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <ProgressBar current={completedCount} total={currentTasks.length} />
        <ComplianceRadar tasks={currentTasks} />
      </div>

      <div ref={tasksRef} className="lg:col-span-6 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
           <button 
             onClick={reset}
             className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             <span>Zmień Profil</span>
           </button>
           <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
             {activeSection}
           </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredTasksWithIndex.map(({ globalIndex, ...task }) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              index={globalIndex}
              isNext={task.id === firstUncompletedId}
              onToggle={(id) => toggleTask(id, activeIndustry || undefined)} 
              onUpdateNote={(id, note) => updateTaskNote(id, note, activeIndustry || undefined)}
            />
          ))}
          {filteredTasksWithIndex.length === 0 && (
             <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
               <div className="text-4xl mb-4">📂</div>
               <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Brak zadań w tej sekcji</p>
               <button onClick={() => setActiveSection(TaskSection.PREPARATORY)} className="mt-4 text-blue-600 font-black text-[10px] uppercase">Wróć do Fazy 0</button>
             </div>
          )}
        </div>

        <AlertsPanel />
        <ChecklistExport onOpenSettings={() => setShowExportSettings(true)} />
      </div>

      <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
        <RobotIntelligenceCenter />
        <TaskSummaryWidget tasks={currentTasks} />
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 space-y-3">
            <button 
              onClick={() => setShowConnectionModal(true)}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-blue-600 text-white font-black text-xs hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-xl shadow-blue-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              <span>SYNC / SHARE</span>
            </button>

            <button onClick={() => setShowChat(true)} className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs">AI CHAT</button>
        </div>

        <KSeFTimeline />
        <ResourceCenter />
      </div>

      {showChat && <FAQChatbot onClose={() => setShowChat(false)} />}
      {showConnectionModal && <ConnectionModal isOpen={showConnectionModal} onClose={() => setShowConnectionModal(false)} />}
      <ExportSettingsModal isOpen={showExportSettings} onClose={() => setShowExportSettings(false)} />
    </div>
  );
};

export default ChecklistDashboard;
