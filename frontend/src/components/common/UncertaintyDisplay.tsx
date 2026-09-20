import React from 'react';
import { Compass, Wind, AlertCircle } from 'lucide-react';

interface UncertaintyDisplayProps {
  positionErrorKm?: number | null;
  windP10?: number | null;
  windP50?: number | null;
  windP90?: number | null;
  pressureP50?: number | null;
  horizon?: string;
}

export const UncertaintyDisplay: React.FC<UncertaintyDisplayProps> = ({
  positionErrorKm = 35,
  windP10 = 65,
  windP50 = 75,
  windP90 = 85,
  pressureP50 = 980,
  horizon = '24h',
}) => {
  const isAvailable = positionErrorKm !== null && positionErrorKm !== undefined;

  if (!isAvailable) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-center text-xs text-slate-400 font-mono">
        <AlertCircle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
        Uncertainty bounds unavailable for {horizon} horizon
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="font-mono text-slate-400 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          POSITION UNCERTAINTY ({horizon}):
        </span>
        <span className="font-mono font-bold text-amber-300">±{positionErrorKm} km</span>
      </div>

      {(windP10 !== null || windP90 !== null) && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3 text-cyan-400" /> INTENSITY QUANTILE (P10 / P50 / P90):
            </span>
            <span className="text-slate-200">
              {windP10 ?? 'N/A'} / <strong className="text-cyan-300">{windP50 ?? 'N/A'}</strong> / {windP90 ?? 'N/A'} kt
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full relative overflow-hidden">
            {/* P10 to P90 range bar */}
            <div
              className="absolute h-full bg-cyan-500/30 rounded-full"
              style={{
                left: '20%',
                right: '15%',
              }}
            />
            {/* P50 marker */}
            <div
              className="absolute h-full w-1 bg-cyan-400 rounded-full"
              style={{ left: '50%' }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-400">
            <span>P10: Min ({windP10} kt)</span>
            <span className="text-cyan-300 font-bold">P50: Expected ({windP50} kt)</span>
            <span>P90: Max ({windP90} kt)</span>
          </div>
        </div>
      )}
    </div>
  );
};
