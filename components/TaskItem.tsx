
import React, { useState, useEffect } from 'react';
import { ChecklistTask, TaskPriority } from '../types';
import RobotBadge from './RobotBadge';
import AutomationDetailsModal from './AutomationDetailsModal';

interface TaskItemProps {
  task: ChecklistTask;
  index: number;
  isNext: boolean;
  onToggle: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
}

const getPriorityStyles = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.CRITICAL: return 'bg-red-600 text-white border-red-700 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse';
    case TaskPriority.HIGH: return 'bg-orange-500 text-white border-orange-600';
    case TaskPriority.MEDIUM: return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-800';
    case TaskPriority.LOW: return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const TaskItem: React.FC<TaskItemProps> = ({ task, index, isNext, onToggle, onUpdateNote }) => {
  const [showModal, setShowModal] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteValue, setNoteValue] = useState(task.notes || '');

  // Sprawdzamy czy zadanie jest przeznaczone dla robota i nieukończone
  const isRobotReady = task.automatable && !task.completed;
  const stepNumber = index + 1;
  const formattedStep = stepNumber < 10 ? `0${stepNumber}` : stepNumber;

  // Sync local note state if prop changes (e.g. bulk update or reset)
  useEffect(() => {
    setNoteValue(task.notes || '');
  }, [task.notes]);

  const handleNoteBlur = () => {
    if (noteValue !== task.notes) {
      onUpdateNote(task.id, noteValue);
    }
  };

  return (
    <>
      <div 
        className={`relative group p-6 rounded-[2rem] border-2 transition-all duration-300 flex items-start space-x-5 overflow-hidden ${
          task.completed 
            ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-60 grayscale' 
            : isNext 
              ? 'bg-white dark:bg-slate-900 border-blue-500 ring-4 ring-blue-500/10 shadow-2xl scale-[1.02] z-10'
              : 'bg-white dark:bg-slate-900 border-transparent dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-500/30 hover:shadow-2xl hover:shadow-slate-200 dark:hover:shadow-none'
        } ${task.priority === TaskPriority.CRITICAL && !task.completed ? 'border-red-100 dark:border-red-900/50' : ''} ${
          isRobotReady && !isNext
            ? 'shadow-[0_0_25px_rgba(34,197,94,0.18)] border-green-200 dark:border-green-800/50 bg-green-50/20 dark:bg-green-900/10' 
            : ''
        }`}
      >
        {/* Numeracja w tle (Watermark) */}
        <div className={`absolute -right-4 -top-6 text-[8rem] font-black leading-none select-none transition-colors pointer-events-none ${
           isNext ? 'text-blue-50 dark:text-blue-900/20' : 'text-slate-50 dark:text-slate-800/30'
        }`}>
          {formattedStep}
        </div>

        {isNext && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-gradient-x"></div>
        )}

        <div className="flex-shrink-0 mt-1 relative z-10">
          <label className="relative flex items-center justify-center cursor-pointer group/checkbox">
            <input 
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              className="peer h-8 w-8 appearance-none rounded-xl border-2 border-slate-200 dark:border-slate-700 checked:bg-green-600 checked:border-green-600 transition-all cursor-pointer shadow-sm relative z-20"
            />
            <svg className="absolute w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none z-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
            </svg>
            <div className="absolute inset-0 bg-blue-100 rounded-xl scale-0 peer-hover:scale-125 transition-transform opacity-50 z-10"></div>
          </label>
        </div>
        
        <div className="flex-grow relative z-10">
          {isNext && (
             <div className="mb-2 inline-flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span>Twoje zadanie priorytetowe</span>
             </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-3">
              <h4 className={`text-xl font-black leading-tight tracking-tight max-w-2xl ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                <span className="text-slate-300 dark:text-slate-600 mr-2 text-sm font-bold">#{formattedStep}</span>
                {task.title}
              </h4>
              {isRobotReady && (
                <RobotBadge onClick={() => setShowModal(true)} />
              )}
              {/* Note Toggle Button */}
              <button 
                onClick={() => setIsNoteOpen(!isNoteOpen)}
                className={`p-1.5 rounded-lg transition-all ${
                  isNoteOpen || noteValue.length > 0
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' 
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={noteValue.length > 0 ? "Edytuj notatkę" : "Dodaj notatkę"}
              >
                <svg className="w-4 h-4" fill={noteValue.length > 0 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-2">
               <span className="text-[9px] font-black text-slate-400 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center gap-1">
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 {task.estimatedHours}h
               </span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getPriorityStyles(task.priority)}`}>
                {task.priority}
              </span>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                D+{task.deadlineDays}
              </span>
            </div>
          </div>
          
          <p className={`text-base whitespace-pre-line leading-relaxed font-medium mb-3 ${task.completed ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-200'}`}>
            {task.description}
          </p>

          {/* Notes Area */}
          {(isNoteOpen || noteValue.length > 0) && (
            <div className={`mt-3 mb-4 animate-in slide-in-from-top-2 duration-300 ${!isNoteOpen && noteValue.length > 0 ? 'opacity-80' : ''}`}>
              {isNoteOpen ? (
                <textarea
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  onBlur={handleNoteBlur}
                  placeholder="Wpisz notatkę, uwagi wdrożeniowe lub przypomnienia..."
                  className="w-full p-4 rounded-xl bg-amber-50 dark:bg-slate-800 border-2 border-amber-100 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-amber-400 transition-all resize-y min-h-[80px]"
                  autoFocus
                />
              ) : (
                <div 
                  onClick={() => setIsNoteOpen(true)}
                  className="p-3 rounded-xl bg-amber-50/50 dark:bg-slate-800/50 border border-amber-100 dark:border-slate-700 cursor-pointer hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 italic flex items-center gap-2">
                    <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    {noteValue}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            {task.dependencies.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest">Wymaga:</span>
                {task.dependencies.map((depId, idx) => (
                  <span key={idx} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded-md border dark:border-slate-700">#{depId}</span>
                ))}
              </div>
            )}
            {task.automatable && task.robotFunction && !task.completed && (
               <button 
                 onClick={() => setShowModal(true)}
                 className="text-[10px] font-black text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors uppercase tracking-widest flex items-center gap-1"
               >
                 <span>Jak to zautomatyzować?</span>
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
               </button>
            )}
          </div>
        </div>
      </div>

      <AutomationDetailsModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={task.title} 
        robotFunction={task.robotFunction || "Brak określonej funkcji."}
      />
    </>
  );
};

export default TaskItem;
