
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { robotApi, RobotStatus } from '../services/robotApi';

interface RobotLog {
  id: number;
  text: string;
  time: string;
  level?: 'info' | 'error' | 'warning';
}

const StatusDot: React.FC<{ active: boolean }> = ({ active }) => (
  <span className={`inline-block w-2 h-2 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
);

const RobotIntelligenceCenter: React.FC = () => {
  const [logs, setLogs] = useState<RobotLog[]>([]);
  const [status, setStatus] = useState<RobotStatus | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
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

  const statusColor = apiStatus === 'online' ? 'text-emerald-600' : apiStatus === 'offline' ? 'text-red-500' : 'text-slate-400';
  const statusLabel = apiStatus === 'online' ? 'ONLINE' : apiStatus === 'offline' ? 'OFFLINE' : 'SPRAWDZANIE...';

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-[2.5rem] shadow-xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-emerald-600 p-6 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -right-2 -bottom-10 w-20 h-20 bg-white/5 rounded-full" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-black tracking-tight leading-none">Compliance Center</h4>
              <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mt-0.5">Robot Zwiadowca · v2.9</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
              <StatusDot active={apiStatus === 'online'} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${apiStatus === 'online' ? 'text-emerald-200' : 'text-red-300'}`}>
                {statusLabel}
              </span>
            </div>
            <span className="text-[9px] text-emerald-300 font-mono">localhost:8000</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">KSeF Gateway</div>
            <div className="flex items-center gap-1.5">
              <StatusDot active={!!status?.ksef_connected} />
              <span className={`text-[11px] font-black ${status?.ksef_connected ? 'text-emerald-600' : 'text-slate-400'}`}>
                {status?.ksef_connected ? 'POŁĄCZONY' : 'BRAK POŁĄCZENIA'}
              </span>
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Faktury dziś</div>
            <div className="flex items-end gap-1">
              <span className="text-xl font-black text-slate-800 dark:text-emerald-400 leading-none">
                {status?.processed_today ?? 0}
              </span>
              <span className="text-[9px] font-bold text-slate-400 mb-0.5">szt.</span>
            </div>
          </div>
        </div>

        {/* Last log preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ostatnia aktywność</span>
            <span className={`text-[9px] font-black uppercase ${statusColor}`}>Backend: {statusLabel}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
            {logs.length === 0 ? (
              <div className="px-4 py-3 text-[10px] text-slate-400 italic">
                {apiStatus === 'offline' ? 'Backend niedostępny — uruchom Robot-KSeF na porcie 8000' : 'Oczekiwanie na dane...'}
              </div>
            ) : (
              logs.slice(-3).map((log, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                  <span className="text-[9px] text-slate-400 font-mono pt-0.5 shrink-0">{log.time}</span>
                  <span className={`text-[10px] font-medium ${log.level === 'error' ? 'text-red-500' : log.level === 'warning' ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {log.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setIsPanelOpen(true)}
            className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={apiStatus === 'checking'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            SZCZEGÓŁY BACKENDU
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={apiStatus !== 'online' || isWorking}
              onClick={() => handleCommand('sync')}
              className="py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[9px] font-black uppercase border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              SYNC XML
            </button>
            <button
              disabled={apiStatus !== 'online' || isWorking}
              onClick={() => handleCommand('rotate')}
              className="py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[9px] font-black uppercase border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              REFRESH TOKEN
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Center Detail Panel — renderowany przez Portal w body, żeby uciec z kontekstu sticky */}
      {isPanelOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Panel header */}
            <div className="bg-emerald-600 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight">Compliance Center</h3>
                <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest mt-0.5">Robot Zwiadowca · Backend Status</p>
              </div>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status tiles */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Backend API', value: statusLabel, active: apiStatus === 'online', sub: 'localhost:8000' },
                  { label: 'KSeF Gateway', value: status?.ksef_connected ? 'POŁĄCZONY' : 'BRAK', active: !!status?.ksef_connected, sub: 'api.ksef.mf.gov.pl' },
                  { label: 'Faktury dziś', value: `${status?.processed_today ?? 0} szt.`, active: (status?.processed_today ?? 0) > 0, sub: 'przetworzone' },
                  { label: 'Robot Engine', value: 'v2.9', active: apiStatus === 'online', sub: 'PunchlineROI' },
                ].map((item) => (
                  <div key={item.label} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <StatusDot active={item.active} />
                      <span className={`text-[11px] font-black ${item.active ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{item.value}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">{item.sub}</div>
                  </div>
                ))}
              </div>

              {/* Activity log */}
              <div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Log aktywności</div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                  {logs.length === 0 ? (
                    <div className="px-4 py-4 text-[10px] text-slate-400 italic text-center">
                      {apiStatus === 'offline'
                        ? '⚠ Backend offline — uruchom Robot-KSeF na porcie 8000'
                        : 'Brak danych aktywności'}
                    </div>
                  ) : (
                    [...logs].reverse().map((log, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${log.level === 'error' ? 'bg-red-400' : log.level === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <span className="text-[9px] text-slate-400 font-mono pt-0.5 shrink-0">{log.time}</span>
                        <span className={`text-[10px] font-medium ${log.level === 'error' ? 'text-red-500' : log.level === 'warning' ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>
                          {log.text}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={apiStatus !== 'online' || isWorking}
                  onClick={() => handleCommand('sync')}
                  className="py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-30 transition-all shadow-sm shadow-emerald-100 flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  SYNC XML
                </button>
                <button
                  disabled={apiStatus !== 'online' || isWorking}
                  onClick={() => handleCommand('rotate')}
                  className="py-3 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  REFRESH TOKEN
                </button>
              </div>

              <button
                onClick={() => setIsPanelOpen(false)}
                className="w-full py-3 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                ZAMKNIJ
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default RobotIntelligenceCenter;
