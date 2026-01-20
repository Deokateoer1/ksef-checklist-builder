
import React, { useState } from 'react';

interface RobotBadgeProps {
  onClick: () => void;
}

const RobotBadge: React.FC<RobotBadgeProps> = ({ onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <button 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-xl border border-green-200 transition-all hover:bg-green-600 hover:text-white group animate-pulse-slow"
      >
        <span className="text-lg">🤖</span>
        <span className="text-[10px] font-black uppercase tracking-tight hidden sm:inline">Auto-Robot</span>
      </button>

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="relative text-center">
            <span className="text-[10px] font-black uppercase text-green-400 block mb-1 tracking-widest">⚡ Automatyzacja</span>
            <p className="text-[9px] font-medium leading-tight opacity-90">Robot Zwiadowca może wykonać to zadanie automatycznie.</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RobotBadge;
