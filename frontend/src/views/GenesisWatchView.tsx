import React from 'react';
import { useCyclone } from '../context/CycloneContext';
import { Compass, AlertTriangle } from 'lucide-react';
import { CycloneMap } from '../components/map/CycloneMap';
import { Card } from '../components/common/Card';
import { EthicalBadge } from '../components/common/EthicalBadge';

export const GenesisWatchView: React.FC = () => {
  const { genesisCandidates } = useCyclone();
  const primaryCandidate = genesisCandidates[0];

  return (
    <div className="p-5 space-y-4 max-w-[1920px] mx-auto overflow-y-auto font-sans">
      {/* Top Header */}
      <div className="bg-[#0e1424] border border-slate-800/80 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
        <div>
          <h1 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>Cyclone Genesis Watch</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pre-genesis disturbance detection, convective organization, and environmental favorability.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <EthicalBadge type="FORECAST" customText="GENESIS WATCH" />
          <span className="font-bold text-amber-400 bg-slate-900 border border-slate-700 px-3 py-1 rounded-md">
            {genesisCandidates.length} Active Disturbance(s)
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Location Map */}
        <div className="lg:col-span-7 space-y-3">
          <CycloneMap height="h-[520px]" />
        </div>

        {/* Right Column: Disturbance Card & Gauge */}
        <div className="lg:col-span-5 space-y-4">
          <Card title="POTENTIAL CYCLONE DEVELOPMENT (24H WINDOW)">
            <div className="space-y-4 text-xs">
              {/* Development Probability Gauge */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-400"
                    strokeDasharray={`${primaryCandidate.probability_24h}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-amber-400 font-mono">{primaryCandidate.probability_24h}%</span>
                  <span className="text-[10px] text-slate-400">24h Probability</span>
                </div>
              </div>

              <div className="text-center font-semibold text-amber-300">
                Expected time window: {primaryCandidate.expected_time_to_genesis}
              </div>

              {/* Environmental Support Factors */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 space-y-2">
                <div className="font-semibold text-slate-200">Environmental Support Factors</div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>Sea Surface Temp: <strong className="text-cyan-400 font-mono">{primaryCandidate.sea_surface_temp_c}°C</strong></div>
                  <div>Vertical Wind Shear: <strong className="text-emerald-400 font-mono">{primaryCandidate.vertical_wind_shear_kts} kt</strong></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
