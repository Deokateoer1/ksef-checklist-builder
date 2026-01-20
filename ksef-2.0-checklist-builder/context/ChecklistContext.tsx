
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ChecklistState, ChecklistAction, ChecklistTask, UserProfile, BulkChecklistMap, Client, CompanySize, TaskPriority, TaskSection } from '../types';
import { generatePersonalizedChecklist, generateBulkChecklists } from '../services/geminiService';
import { robotApi } from '../services/robotApi';

const initialState: ChecklistState = {
  tasks: [],
  bulkTasks: null,
  profile: null,
  clients: {},
  activeClientId: null,
  isLoading: false,
  bulkProgress: null,
  error: null,
  mode: 'single'
};

const checklistReducer = (state: ChecklistState, action: ChecklistAction): ChecklistState => {
  switch (action.type) {
    case 'LOAD_PERSISTED_STATE':
      return { ...state, ...action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'GENERATE_START':
      return { ...state, isLoading: true, error: null, bulkProgress: null };
    case 'BULK_PROGRESS':
      return { ...state, bulkProgress: action.payload };
    case 'GENERATE_SUCCESS':
      let newClients = { ...state.clients };
      let activeId = state.activeClientId;

      if (Object.keys(newClients).length === 0 && action.payload.mode === 'single' && state.profile) {
         const firstId = 'personal-setup';
         activeId = firstId;
         newClients[firstId] = {
           id: firstId,
           name: 'Mój Plan KSeF',
           nip: '',
           profile: state.profile,
           tasks: action.payload.tasks,
           createdAt: Date.now()
         };
      } else if (activeId && newClients[activeId]) {
         newClients[activeId].tasks = action.payload.tasks;
      }

      return { 
        ...state, 
        tasks: action.payload.tasks, 
        bulkTasks: action.payload.bulkTasks || null,
        mode: action.payload.mode,
        clients: newClients,
        activeClientId: activeId,
        isLoading: false, 
        error: null, 
        bulkProgress: null 
      };
    case 'GENERATE_ERROR':
      return { ...state, isLoading: false, error: action.payload, bulkProgress: null };
    case 'TOGGLE_TASK':
      const { id, industry } = action.payload;
      const updatedTasks = state.tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
      const updatedClients = { ...state.clients };
      if (state.activeClientId && updatedClients[state.activeClientId]) {
        updatedClients[state.activeClientId].tasks = updatedTasks;
      }

      if (industry && state.bulkTasks) {
        return {
          ...state,
          bulkTasks: {
            ...state.bulkTasks,
            [industry]: state.bulkTasks[industry].map(t => t.id === id ? { ...t, completed: !t.completed } : t)
          }
        };
      }
      return { ...state, tasks: updatedTasks, clients: updatedClients };
    case 'UPDATE_TASK_NOTE':
        const { id: noteId, note, industry: noteIndustry } = action.payload;
        const tasksWithNote = state.tasks.map(t => t.id === noteId ? { ...t, notes: note } : t);
        const clientsWithNote = { ...state.clients };
        if (state.activeClientId && clientsWithNote[state.activeClientId]) {
          clientsWithNote[state.activeClientId].tasks = tasksWithNote;
        }

        let bulkWithNote = state.bulkTasks;
        if (noteIndustry && state.bulkTasks) {
           bulkWithNote = {
             ...state.bulkTasks,
             [noteIndustry]: state.bulkTasks[noteIndustry].map(t => t.id === noteId ? { ...t, notes: note } : t)
           };
        }
        return { ...state, tasks: tasksWithNote, clients: clientsWithNote, bulkTasks: bulkWithNote };
    case 'ADD_CLIENT':
      return {
        ...state,
        clients: { ...state.clients, [action.payload.id]: action.payload },
        activeClientId: action.payload.id,
        tasks: action.payload.tasks,
        profile: action.payload.profile,
        mode: 'single'
      };
    case 'SWITCH_CLIENT':
      const targetClient = state.clients[action.payload];
      if (!targetClient) return state;
      return {
        ...state,
        activeClientId: action.payload,
        tasks: targetClient.tasks,
        profile: targetClient.profile,
        mode: 'single'
      };
    case 'REMOVE_CLIENT':
      const remainingClients = { ...state.clients };
      delete remainingClients[action.payload];
      let nextActiveId = state.activeClientId === action.payload ? null : state.activeClientId;
      return { ...state, clients: remainingClients, activeClientId: nextActiveId };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

interface ExportOptions { onlyCritical: boolean; grayscale: boolean; includeRobotDetails: boolean; }

interface ChecklistContextType extends ChecklistState {
  generateChecklist: (profile: UserProfile) => Promise<void>;
  generateBulk: (industries: string[], baseProfile: Omit<UserProfile, 'industry'>, merge: boolean) => Promise<void>;
  addNewClient: (name: string, nip: string, profile: UserProfile) => Promise<void>;
  switchClient: (clientId: string) => void;
  removeClient: (clientId: string) => void;
  toggleTask: (id: string, industry?: string) => void;
  updateTaskNote: (id: string, note: string, industry?: string) => void;
  reset: () => void;
  getShareableLink: () => string;
  exportToJSON: () => void;
  exportToCSV: () => void;
  exportToPDF: (options?: ExportOptions) => void;
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

export const ChecklistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(checklistReducer, initialState);

  useEffect(() => {
    const init = async () => {
      // Szukamy danych TYLKO w LocalStorage tego konkretnego użytkownika
      const saved = localStorage.getItem('ksef_state_v3');
      if (saved) {
        try {
          dispatch({ type: 'LOAD_PERSISTED_STATE', payload: JSON.parse(saved) });
        } catch (e) { console.error("Błąd ładowania LocalStorage"); }
      }
    };
    init();
  }, []);

  useEffect(() => {
    // Zapisujemy TYLKO lokalnie. Każdy użytkownik ma swój własny "świat" w swojej przeglądarce.
    if (state.tasks.length > 0 || state.bulkTasks || Object.keys(state.clients).length > 0) {
      const stateToSave = {
        tasks: state.tasks,
        bulkTasks: state.bulkTasks,
        profile: state.profile,
        mode: state.mode,
        clients: state.clients,
        activeClientId: state.activeClientId
      };
      localStorage.setItem('ksef_state_v3', JSON.stringify(stateToSave));
      // Logika wysyłania do centralnej bazy wyłączona - teraz każdy "odpowiada za swój localstorage"
    }
  }, [state.tasks, state.bulkTasks, state.profile, state.mode, state.clients, state.activeClientId]);

  const generateChecklist = async (profile: UserProfile) => {
    dispatch({ type: 'GENERATE_START' });
    try {
      const tasks = await generatePersonalizedChecklist(profile);
      dispatch({ type: 'GENERATE_SUCCESS', payload: { tasks, mode: 'single' } });
      dispatch({ type: 'SET_PROFILE', payload: profile });
    } catch (err) {
      dispatch({ type: 'GENERATE_ERROR', payload: 'Błąd generowania.' });
    }
  };

  const addNewClient = async (name: string, nip: string, profile: UserProfile) => {
    dispatch({ type: 'GENERATE_START' });
    try {
      const tasks = await generatePersonalizedChecklist(profile);
      const newClient: Client = { id: crypto.randomUUID(), name, nip, profile, tasks, createdAt: Date.now() };
      dispatch({ type: 'ADD_CLIENT', payload: newClient });
    } catch (err) { dispatch({ type: 'GENERATE_ERROR', payload: 'Błąd dodawania.' }); }
  };

  const switchClient = (clientId: string) => dispatch({ type: 'SWITCH_CLIENT', payload: clientId });
  const removeClient = (clientId: string) => {
    if (confirm("Czy na pewno chcesz usunąć te dane? Zostaną trwale usunięte z Twojej przeglądarki.")) {
      dispatch({ type: 'REMOVE_CLIENT', payload: clientId });
    }
  };

  const generateBulk = async (industries: string[], baseProfile: Omit<UserProfile, 'industry'>, merge: boolean) => {
    dispatch({ type: 'GENERATE_START' });
    try {
      const bulkMap = await generateBulkChecklists(industries, baseProfile, (current, total, status) => {
        dispatch({ type: 'BULK_PROGRESS', payload: { current, total, status } });
      });
      let finalTasks: ChecklistTask[] = [];
      if (merge) finalTasks = Object.values(bulkMap).flat();
      dispatch({ type: 'GENERATE_SUCCESS', payload: { tasks: finalTasks, mode: 'bulk', bulkTasks: merge ? undefined : bulkMap } });
    } catch (err) { dispatch({ type: 'GENERATE_ERROR', payload: 'Błąd generowania seryjnego.' }); }
  };

  const toggleTask = (id: string, industry?: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: { id, industry } });
    robotApi.updateTaskStatus(id, true).catch(() => {});
  };

  const updateTaskNote = (id: string, note: string, industry?: string) => {
    dispatch({ type: 'UPDATE_TASK_NOTE', payload: { id, note, industry } });
  };
  
  const reset = () => {
    if (confirm("Reset systemu wyczyści dane TYLKO w Twojej przeglądarce. Kontynuować?")) {
      dispatch({ type: 'RESET' });
      localStorage.removeItem('ksef_state_v3');
    }
  };

  const getShareableLink = () => {
    const encoded = btoa(JSON.stringify(state));
    return `${window.location.origin}${window.location.pathname}?state=${encoded}`;
  };

  const exportToJSON = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KSeF_Moje_Dane_Prywatne.json`;
    link.click();
  };

  const exportToCSV = () => {};
  const exportToPDF = (options: ExportOptions) => { /* Istniejąca logika PDF */ };

  return (
    <ChecklistContext.Provider value={{ 
      ...state, generateChecklist, generateBulk, addNewClient, switchClient, removeClient, toggleTask, updateTaskNote, reset, getShareableLink, exportToJSON, exportToCSV, exportToPDF 
    }}>
      {children}
    </ChecklistContext.Provider>
  );
};

export const useChecklist = () => {
  const context = useContext(ChecklistContext);
  if (!context) throw new Error('useChecklist must be inside Provider');
  return context;
};
