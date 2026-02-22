
import React from 'react';
import { ChecklistTask, TaskSection } from '../types';

interface ComplianceRadarProps {
  tasks: ChecklistTask[];
}

const ComplianceRadar: React.FC<ComplianceRadarProps> = ({ tasks }) => {
  const categories = [
    { label: '0. Przygotowanie', section: TaskSection.PREPARATORY },
    { label: '1. Prawne', section: TaskSection.COMPLIANCE },
    { label: '2. Analiza/Audyt', section: TaskSection.ANALYSIS },
    { label: '3. Techniczne', section: TaskSection.TECHNICAL },
    // Fix: Using ERROR_HANDLING instead of missing INTEGRATION property to resolve TS error
    { label: '4. Integracja', section: TaskSection.ERROR_HANDLING },
    { label: '5. Testy', section: TaskSection.TESTS },
    { label: '6. Wdrożenie', section: TaskSection.DEPLOYMENT }
  ];

  const stats = categories.map(cat => {
    const catTasks = tasks.filter(t => t.section === cat.section);
    const completed = catTasks.filter(t => t.completed).length;
    const total = catTasks.length;
    const percent = total > 0 ? (completed / total) * 100 : 0;
    return { ...cat, percent, completed, total };
  });

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Production Compliance Radar</h4>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">STATUS v2.0</span>
      </div>

      <div className="space-y-4">
        {stats.map(s => (
          <div key={s.label}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-black text-slate-700">{s.label}</span>
              <span className="text-[10px] font-bold text-slate-400">{s.completed}/{s.total}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${s.percent === 100 ? 'bg-green-500' : 'bg-slate-900'}`}
                style={{ width: `${s.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-center space-x-8">
           <div className="text-center">
              <div className="text-lg font-black text-slate-900">{tasks.length > 0 ? Math.round(tasks.filter(t => t.completed).length / tasks.length * 100) : 0}%</div>
              <div className="text-[8px] font-black text-slate-400 uppercase">Ogólny Postęp</div>
           </div>
           <div className="w-px h-8 bg-slate-100"></div>
           <div className="text-center">
              <div className="text-lg font-black text-red-600">{tasks.filter(t => t.priority === 'critical' && !t.completed).length}</div>
              <div className="text-[8px] font-black text-slate-400 uppercase">Krytyczne Luki</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceRadar;
