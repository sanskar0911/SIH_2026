import React from 'react';
import { useCyclone } from '../../context/CycloneContext';
import { HelpModal } from './HelpModal';
import { Bell, HelpCircle, Clock, ShieldCheck } from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    unitPref,
    setUnitPref,
    utcClock,
    alerts,
    setCurrentView,
    setIsHelpOpen,
  } = useCyclone();

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <>
      <header className="h-12 bg-[#090e1c] border-b border-slate-800/90 px-4 flex items-center justify-between shrink-0 select-none z-20 font-sans text-xs">
        {/* Left Title & Status Badges */}
        <div className="flex items-center space-x-3">
          <h2 className="text-xs font-bold text-slate-100 uppercase font-mono tracking-wider">
            TROPICAL CYCLONE COMMAND CENTER
          </h2>
          <span className="text-slate-600">|</span>

          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AI DUALNET ONLINE</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>MOSDAC / INSAT FEED HEALTHY</span>
          </div>

          <div className="hidden lg:flex items-center space-x-1 text-[11px] text-slate-400 font-mono">
            <span>DATA AGE:</span>
            <strong className="text-slate-200">12m</strong>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          {/* Unit Toggle (KT / KMH) */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded p-0.5 font-mono text-[10px]">
            <button
              onClick={() => setUnitPref('kt')}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                unitPref === 'kt'
                  ? 'bg-cyan-600 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              KT
            </button>
            <button
              onClick={() => setUnitPref('kmh')}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                unitPref === 'kmh'
                  ? 'bg-cyan-600 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              KM/H
            </button>
          </div>

          {/* Demo Badge */}
          <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 font-bold">
            ● SIH DEMO
          </div>

          {/* Clock */}
          <div className="flex items-center space-x-1 font-mono text-[11px] text-cyan-300 font-bold bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 rounded">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{utcClock || '2026-09-12 02:21:58 UTC'}</span>
          </div>

          {/* Alert Bell */}
          <button
            onClick={() => setCurrentView('alerts')}
            className="p-1.5 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 text-slate-300 relative focus:outline-none"
            aria-label="Alerts"
            title="Alerts & Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {unacknowledgedAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                {unacknowledgedAlerts.length}
              </span>
            )}
          </button>

          {/* Help Onboarding */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-1.5 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 text-slate-300 hover:text-slate-100 focus:outline-none"
            title="Help"
            aria-label="Help"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Onboarding Overlay Modal */}
      <HelpModal />
    </>
  );
};
