import React from 'react';
import { Zap, ShieldCheck, ArrowRight, Activity, Compass } from 'lucide-react';

export const LandingLoginView: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  return (
    <div className="relative w-screen h-screen bg-[#070a12] flex items-center justify-center overflow-hidden font-mono select-none">
      {/* Animated Dark Weather Radar Background */}
      <div className="absolute inset-0 bg-radial-gradient from-slate-900 via-[#070a12] to-black opacity-90"></div>

      {/* Pulsing Radar Rings */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-cyan-500/10 animate-ping opacity-30"></div>
      <div className="absolute w-[400px] h-[400px] rounded-full border border-indigo-500/20 animate-spin opacity-40" style={{ animationDuration: '40s' }}></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl space-y-6 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <img
            src="/logo.jpg"
            alt="TCI AI Cyclone Intelligence Logo"
            className="w-20 h-20 rounded-2xl border-2 border-cyan-500/60 shadow-xl shadow-cyan-500/30 object-cover"
          />
          <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase mt-2">
            TROPICAL CYCLONE INTELLIGENCE
          </h1>
          <p className="text-xs text-cyan-400 font-semibold tracking-tight">
            AI-Powered Multimodal Cyclone Decision Support
          </p>
          <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            SIH 2026 • PS26070 • NORTH INDIAN OCEAN
          </span>
        </div>

        {/* Security / System Badges */}
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
          <div className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center space-x-1.5 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>DualNet AI v1.4.2</span>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center space-x-1.5 justify-center">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>IMD Data Pipeline</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onLogin}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 text-sm tracking-wider uppercase transition-all"
        >
          <span>ENTER COMMAND CENTER</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-[10px] text-slate-400 leading-tight">
          Operational Command Portal for National Meteorological & Disaster Management Authorities
        </div>
      </div>
    </div>
  );
};
