import React from 'react';

export const MapLegend: React.FC = () => {
  return (
    <div
      className="bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-lg text-[11px] font-mono flex flex-wrap items-center gap-4 text-slate-300 shadow-xl"
      aria-label="Map visual legend"
    >
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-0.5 bg-cyan-400"></span>
        <span className="text-cyan-300 font-semibold">OBSERVED TRACK</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-0.5 bg-amber-400 border-b border-dashed border-amber-300"></span>
        <span className="text-amber-300 font-semibold">AI FORECAST</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 bg-amber-500/20 border border-dashed border-amber-500/60 rounded"></span>
        <span className="text-slate-300">POSITION UNCERTAINTY (±km)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full border border-amber-400 bg-amber-500/30 flex items-center justify-center text-[8px] font-bold text-amber-300">
          ●
        </span>
        <span className="text-slate-300">GENESIS CANDIDATE</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-[8px] flex items-center justify-center">
          IMD
        </span>
        <span className="text-purple-300 font-semibold">OFFICIAL BULLETIN</span>
      </div>
    </div>
  );
};
