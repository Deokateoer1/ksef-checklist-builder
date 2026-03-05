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

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  [TaskPriority.CRITICAL]: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  [TaskPriority.HIGH]:     'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  [TaskPriority.MEDIUM]:   'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  [TaskPriority.LOW]:      'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

const PRIORITY_DOT: Record<TaskPriority, string> = {
  [TaskPriority.CRITICAL]: 'bg-red-500',
  [TaskPriority.HIGH]:     'bg-orange-400',
  [TaskPriority.MEDIUM]:   'bg-blue-400',
  [TaskPriority.LOW]:      'bg-slate-300',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  [TaskPriority.CRITICAL]: 'KRYTYCZNE',
  [TaskPriority.HIGH]:     'WYSOKIE',
  [TaskPriority.MEDIUM]:   'ŚREDNIE',
  [TaskPriority.LOW]:      'NISKIE',
};

const TaskItem: React.FC<TaskItemProps> = ({ task, index, isNext, onToggle, onUpdateNote }) => {
  const [showModal, setShowModal]   = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteValue, setNoteValue]   = useState(task.notes || '');

  const isRobotReady = task.automatable && !task.completed;
  const stepNumber   = String(index + 1).padStart(2, '0');

  useEffect(() => {
    setNoteValue(task.notes || '');
  }, [task.notes]);

  const handleNoteBlur = () => {
    if (noteValue !== task.notes) onUpdateNote(task.id, noteValue);
  };

  return (
    <>
      <div className={`
        relative group rounded-2xl border transition-all duration-200
        ${task.completed
          ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-55'
          : isNext
            ? 'bg-white dark:bg-slate-900 border-blue-400 dark:border-blue-600 shadow-md shadow-blue-50 dark:shadow-none'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm'
        }
      `}>
        {/* Niebieski pasek po lewej — tylko dla "next" */}
        {isNext && !task.completed && (
          <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-blue-500 rounded-full" />
        )}

        {/* ── Główny wiersz ── */}
        <div className="flex items-center gap-3 px-4 py-3">

          {/* Checkbox */}
          <label className="relative flex-shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              className="peer h-5 w-5 appearance-none rounded-md border-2 border-slate-200 dark:border-slate-600
                         checked:bg-green-500 checked:border-green-500 transition-colors cursor-pointer"
            />
            <svg className="absolute inset-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </label>

          {/* Numer */}
          <span className="flex-shrink-0 text-xs font-bold text-slate-300 dark:text-slate-600 w-6 text-right select-none">
            {stepNumber}
          </span>

          {/* Tytuł */}
          <span className={`flex-grow text-sm font-semibold leading-snug ${
            task.completed
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-800 dark:text-slate-100'
          }`}>
            {task.title}
          </span>

          {/* Metadane — prawa strona */}
          <div className="flex-shrink-0 flex items-center gap-2">

            {/* Priorytet — kropka + etykieta */}
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_BADGE[task.priority]}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
              {PRIORITY_LABEL[task.priority]}
            </span>

            {/* Robot badge — skondensowany */}
            {isRobotReady && (
              <RobotBadge onClick={() => setShowModal(true)} />
            )}

            {/* Czas */}
            <span className="hidden md:block text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {task.estimatedHours}h
            </span>

            {/* Deadline */}
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
              D+{task.deadlineDays}
            </span>

            {/* Notatka — przycisk */}
            <button
              onClick={() => setIsNoteOpen(!isNoteOpen)}
              className={`p-1 rounded-lg transition-colors ${
                noteValue.length > 0
                  ? 'text-amber-500 dark:text-amber-400'
                  : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'
              }`}
              title={noteValue.length > 0 ? 'Edytuj notatkę' : 'Dodaj notatkę'}
            >
              <svg className="w-3.5 h-3.5" fill={noteValue.length > 0 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

            {/* Rozwiń/zwiń opis */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors"
              title="Pokaż opis"
            >
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Panel rozwinięty — opis + notatka + automatyzacja ── */}
        {(isExpanded || isNoteOpen || noteValue.length > 0) && (
          <div className="px-4 pb-4 pt-0 border-t border-slate-50 dark:border-slate-800 mt-0">

            {/* Opis */}
            {isExpanded && (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 py-3 whitespace-pre-line">
                {task.description}
              </p>
            )}

            {/* Automatyzacja */}
            {isExpanded && isRobotReady && (
              <button
                onClick={() => setShowModal(true)}
                className="mb-3 text-[11px] font-bold text-green-600 dark:text-green-400 hover:text-green-700 flex items-center gap-1 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Jak to zautomatyzować?
              </button>
            )}

            {/* Notatka */}
            {isNoteOpen ? (
              <textarea
                value={noteValue}
                onChange={e => setNoteValue(e.target.value)}
                onBlur={handleNoteBlur}
                placeholder="Wpisz notatkę, uwagi wdrożeniowe lub przypomnienia..."
                className="w-full p-3 rounded-xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700
                           text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-amber-400 transition-all
                           resize-y min-h-[70px] font-medium"
                autoFocus
              />
            ) : noteValue.length > 0 && (
              <div
                onClick={() => setIsNoteOpen(true)}
                className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-700
                           cursor-pointer hover:bg-amber-50 transition-colors"
              >
                <p className="text-xs text-slate-600 dark:text-slate-300 italic">{noteValue}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AutomationDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={task.title}
        robotFunction={task.robotFunction || 'Brak określonej funkcji.'}
      />
    </>
  );
};

export default TaskItem;
