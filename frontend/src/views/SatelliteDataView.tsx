import React from 'react';
import { useCyclone } from '../context/CycloneContext';
import { Satellite, CheckCircle2, AlertTriangle } from 'lucide-react';

export const SatelliteDataView: React.FC = () => {
  const { modalities } = useCyclone();

  return (
    <div className="p-4 space-y-4 max-w-[1920px] mx-auto overflow-y-auto font-mono">
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
            <Satellite className="w-4 h-4 text-cyan-400" />
            <span>SATELLITE & SENSOR DATA FEED MONITOR</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-spectral ingestion feeds, spatial resolutions, acquisition timestamps, and coverage statuses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modalities.map((mod) => (
          <div key={mod.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2 text-xs">
            <div className="flex justify-between items-start border-b border-slate-800 pb-2">
              <div>
                <div className="font-bold text-slate-100">{mod.name}</div>
                <div className="text-[10px] text-slate-400">{mod.sensor_type}</div>
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                  mod.available
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}
              >
                {mod.available ? 'AVAILABLE' : 'MISSING'}
              </span>
            </div>

            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>Timestamp: <span className="text-cyan-400 font-bold">{mod.timestamp}</span></div>
              <div>Age: <span className="text-slate-200">{mod.age_minutes} min old</span></div>
              <div>Resolution: <span className="text-slate-200">{mod.resolution_km} km</span></div>
              <div>Quality Score: <span className="text-emerald-400 font-bold">{mod.quality_score}%</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
