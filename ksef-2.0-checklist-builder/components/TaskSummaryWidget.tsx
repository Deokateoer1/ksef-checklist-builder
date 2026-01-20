
import React, { useMemo } from 'react';
import { ChecklistTask, TaskPriority } from '../types';

interface TaskSummaryWidgetProps {
  tasks: ChecklistTask[];
}

const TaskSummaryWidget: React.FC<TaskSummaryWidgetProps> = ({ tasks }) => {
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Podział na priorytety (Context)
    const criticalTotal = tasks.filter(t => t.priority === TaskPriority.CRITICAL).length;
    const criticalDone = tasks.filter(t => t.priority === TaskPriority.CRITICAL && t.completed).length;
    
    const highTotal = tasks.filter(t => t.priority === TaskPriority.HIGH).length;
    const highDone = tasks.filter(t => t.priority === TaskPriority.HIGH && t.completed).length;

    const standardTotal = tasks.filter(t => t.priority !== TaskPriority.CRITICAL && t.priority !== TaskPriority.HIGH).length;
    const standardDone = tasks.filter(t => t.priority !== TaskPriority.CRITICAL && t.priority !== TaskPriority.HIGH && t.completed).length;

    // Czas
    const totalHours = tasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
    const burnedHours = tasks.reduce((acc, t) => t.completed ? acc + (t.estimatedHours || 0) : acc, 0);
    const remainingHours = totalHours - burnedHours;
    const timePercentage = totalHours > 0 ? (burnedHours / totalHours) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      percentage,
      critical: { total: criticalTotal, done: criticalDone },
      high: { total: highTotal, done: highDone },
      standard: { total: standardTotal, done: standardDone },
      time: { total: totalHours, burned: burnedHours, remaining: remainingHours, percentage: timePercentage }
    };
  }, [tasks]);

  if (tasks.length === 0) return null;

  // Obliczenia dla SVG Circle
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.percentage / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl mb-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Status Wdrożenia</h4>
        <div className="flex items-center space-x-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg border border-green-100 dark:border-green-800">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase">Active</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Row 1: Visual Progress & Priority Context */}
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative flex-shrink-0 w-24 h-24 flex items-center justify-center">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-blue-600 dark:text-blue-500 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-black text-slate-900 dark:text-white">{stats.percentage}%</span>
            </div>
          </div>

          {/* Priority Context Breakdown */}
          <div className="flex-grow space-y-3">
            {/* Critical */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-md text-red-600 dark:text-red-400">
                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 </div>
                 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Krytyczne</span>
               </div>
               <span className="text-[10px] font-black text-slate-900 dark:text-white">{stats.critical.done}/{stats.critical.total}</span>
            </div>
            
            {/* High */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-md text-orange-600 dark:text-orange-400">
                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </div>
                 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Wysokie</span>
               </div>
               <span className="text-[10px] font-black text-slate-900 dark:text-white">{stats.high.done}/{stats.high.total}</span>
            </div>

            {/* Standard */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400">
                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Standard</span>
               </div>
               <span className="text-[10px] font-black text-slate-900 dark:text-white">{stats.standard.done}/{stats.standard.total}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Burn Rate (Time) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Estymacja Czasu</span>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
              <span className="text-slate-900 dark:text-white font-black">{stats.time.remaining}h</span> pozostało
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-slate-900 dark:bg-slate-500" 
              style={{ width: `${stats.time.percentage}%` }}
            ></div>
          </div>
          <div className="mt-1 flex justify-between text-[8px] font-bold text-slate-400 uppercase">
            <span>Start</span>
            <span>Razem: {stats.time.total}h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskSummaryWidget;
