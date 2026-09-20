import React, { useState } from 'react';
import { Info, HelpCircle } from 'lucide-react';

interface ConfidenceIndicatorProps {
  score?: number; // 0.0 to 1.0 or level string
  level?: 'HIGH' | 'MODERATE' | 'LOW' | 'DEGRADED' | 'UNAVAILABLE';
  modalitiesUsed?: string[];
  missingModalities?: string[];
  dataAgeMinutes?: number;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  score = 0.85,
  level,
  modalitiesUsed = ['IR (TIR1)', 'Water Vapour', 'Visible'],
  missingModalities = ['Passive Microwave'],
  dataAgeMinutes = 12,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Compute level from score if not provided directly
  const derivedLevel =
    level || (score >= 0.8 ? 'HIGH' : score >= 0.6 ? 'MODERATE' : 'LOW');

  const levelStyles = {
    HIGH: { color: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/30' },
    MODERATE: { color: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30' },
    LOW: { color: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500/30' },
    DEGRADED: { color: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30' },
    UNAVAILABLE: { color: 'text-slate-400', bg: 'bg-slate-600', border: 'border-slate-600/30' },
  };

  const style = levelStyles[derivedLevel] || levelStyles.UNAVAILABLE;
  const percentage = Math.round(score * 100);

  return (
    <div className="relative inline-block">
      <div
        className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-md cursor-pointer hover:border-slate-700 transition-colors"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role="button"
        tabIndex={0}
        aria-label={`Model Confidence: ${derivedLevel} (${percentage}%)`}
      >
        <span className="text-[11px] font-mono text-slate-400">CONFIDENCE:</span>
        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full ${style.bg}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-xs font-mono font-bold ${style.color}`}>{derivedLevel}</span>
        <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
      </div>

      {/* Breakdown Tooltip / Panel */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-2xl z-50 text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-200 font-mono">CONFIDENCE EXPLANATION</span>
            <span className={`font-mono font-bold ${style.color}`}>{derivedLevel} ({percentage}%)</span>
          </div>

          <div className="space-y-1 text-slate-300 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Data Freshness:</span>
              <span className="font-mono text-cyan-300">{dataAgeMinutes} min ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Modalities Available:</span>
              <span className="font-mono text-emerald-400">{modalitiesUsed.length} active</span>
            </div>
            {missingModalities.length > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Missing Modalities:</span>
                <span className="font-mono text-amber-400">{missingModalities.join(', ')}</span>
              </div>
            )}
          </div>

          <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 leading-tight flex items-start gap-1">
            <HelpCircle className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Confidence reflects data freshness, sensor coverage, and model output agreement; it does not guarantee meteorological outcome.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
