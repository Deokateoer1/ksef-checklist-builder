
import React, { useState, useEffect, useCallback } from 'react';
import { robotApi, RobotStatus } from '../services/robotApi';

interface RobotLog {
  id: number;
  text: string;
  time: string;
  level?: 'info' | 'error' | 'warning';
}

const RobotIntelligenceCenter: React.FC = () => {
  const [logs, setLogs] = useState<RobotLog[]>([]);
  const [status, setStatus] = useState<RobotStatus | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [isWorking, setIsWorking] = useState(false);

  const refreshData = useCallback(async () => {
    try {
      const currentStatus = await robotApi.getStatus();
      setStatus(currentStatus);
      setApiStatus('online');
      
      const remoteLogs = await robotApi.getLogs();
      if (Array.isArray(remoteLogs)) setLogs(remoteLogs);
    } catch (e) {
      setApiStatus('offline');
    }
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const handleCommand = async (command: 'sync' | 'rotate') => {
    setIsWorking(true);
    try {
      if (command === 'sync') await robotApi.triggerSync();
      if (command === 'rotate') await robotApi.rotateToken();
      await refreshData();
    } catch (e) {
      console.error('Command failed');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-[2.5rem] shadow-xl overflow-hidden transition-all duration-300">
      <div className="bg-emerald-600 p-6 text-white relative overflow-hidden">
        <div className="flex items-center space-x-4 relative z-10">
          <div className="p-3 bg-white/20 rounded-2xl shadow-inner animate-pulse-slow">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-black tracking-tight leading-none mb-1">Robot Zwiadowca</h4>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                {apiStatus === 'online' ? 'FastAPI:8443 POŁĄCZONY' : 'FastAPI:8443 BRAK SYGNAŁU'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">KSeF Gateway</div>
            <div className={`text-[10px] font-black flex items-center gap-1 ${status?.ksef_connected ? 'text-emerald-500' : 'text-slate-400'}`}>
              <div className={`w-1 h-1 rounded-full ${status?.ksef_connected ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              {status?.ksef_connected ? 'POŁĄCZONO' : 'DISCONNECTED'}
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Dzisiaj</div>
            <div className="text-[10px] font-black text-slate-700 dark:text-emerald-400 flex items-center gap-1">
              {status?.processed_today || 0} FAKTUR
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Terminal</h5>
          <div className="bg-slate-900 p-4 rounded-2xl font-mono text-[10px] min-h-[100px] max-h-[100px] overflow-hidden relative">
            <div className="space-y-1">
              {logs.slice(-3).map((log, i) => (
                <p key={i} className={log.level === 'error' ? 'text-red-400' : 'text-emerald-500'}>
                  <span className="opacity-40">[{log.time}]</span> {log.text}
                </p>
              ))}
              {logs.length === 0 && <p className="text-slate-600 italic">Oczekiwanie na dane z portu 8443...</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setIsConsoleOpen(true)}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2"
          >
            OTWÓRZ COMMAND CENTER
          </button>
          
          <div className="grid grid-cols-2 gap-2">
             <button 
               disabled={apiStatus !== 'online' || isWorking}
               onClick={() => handleCommand('sync')}
               className="py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[9px] font-black uppercase border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-30"
             >
               SYNC XML
             </button>
             <button 
               disabled={apiStatus !== 'online' || isWorking}
               onClick={() => handleCommand('rotate')}
               className="py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[9px] font-black uppercase border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-30"
             >
               REFRESH TOKEN
             </button>
          </div>
        </div>
      </div>

      {isConsoleOpen && (
        <div className="fixed inset-0 bg-black z-[300] flex flex-col font-mono animate-in fade-in zoom-in-95">
          <div className="bg-slate-900 p-4 border-b border-white/10 flex justify-between items-center text-white">
            <span className="text-xs font-black">ROBOT_CMD_V2.9@LOCALHOST:8443</span>
            <button onClick={() => setIsConsoleOpen(false)} className="hover:text-red-500">
               [X] ZAMKNIJ
            </button>
          </div>
          <div className="flex-grow p-8 bg-black text-emerald-500 overflow-y-auto">
             <p className="mb-4 text-emerald-800"># PunchlineROI Robot Engine v2.9 initialized...</p>
             {logs.map((log, i) => (
               <div key={i} className="mb-1">
                 <span className="opacity-40">[{log.time}]</span> {log.text}
               </div>
             ))}
             <div className="mt-4 flex items-center gap-2">
                <span className="animate-pulse">_</span>
                <span className="text-slate-700 text-[10px]">READY FOR COMMANDS</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RobotIntelligenceCenter;
