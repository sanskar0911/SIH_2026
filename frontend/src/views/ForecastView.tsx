import React from 'react';
import { useCyclone } from '../context/CycloneContext';
import { CycloneMap } from '../components/map/CycloneMap';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '../components/common/Card';
import { EthicalBadge } from '../components/common/EthicalBadge';
import { OfficialDisclaimer } from '../components/common/OfficialDisclaimer';
import { TrendingUp, Shield } from 'lucide-react';

export const ForecastView: React.FC = () => {
  const { activeStorm, selectedHorizon, setSelectedHorizon, degradedMode, displayMode } = useCyclone();

  const chartData = activeStorm.forecast_track.map((f) => ({
    horizon: f.horizon,
    windP10: f.windP10,
    windP50: f.windP50,
    windP90: f.windP90,
    interval: f.predictionIntervalKm,
  }));

  return (
    <div className="p-5 space-y-4 max-w-[1920px] mx-auto overflow-y-auto font-sans">
      {/* Top Banner */}
      <div className="bg-[#0e1424] border border-slate-800/80 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
        <div>
          <h1 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span>Probabilistic Track & Intensity Forecast</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Non-deterministic forecast trajectories and spatial position uncertainty envelopes.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <EthicalBadge type="FORECAST" customText="AI PROBABILISTIC" />
          <span className="font-bold text-cyan-400 bg-slate-900 border border-slate-700 px-3 py-1 rounded-md">
            {activeStorm.name} ({activeStorm.storm_id})
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Map (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <CycloneMap height="h-[540px]" />
          <OfficialDisclaimer compact={true} />
        </div>

        {/* Right: Forecast Details & Intensity Chart (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Intensity Percentile Chart */}
          <Card title="WIND SPEED PROBABILITY DISTRIBUTION (KTS)">
            <div className="h-44 w-full font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="windBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="horizon" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[20, 130]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d1322', borderColor: '#1e293b', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Area type="monotone" dataKey="windP90" stroke="#ef4444" fill="url(#windBand)" strokeWidth={1} name="P90 Upper Bound" />
                  <Area type="monotone" dataKey="windP50" stroke="#06b6d4" fill="none" strokeWidth={2.5} name="P50 Expected" />
                  <Area type="monotone" dataKey="windP10" stroke="#3b82f6" fill="none" strokeWidth={1} strokeDasharray="3 3" name="P10 Lower Bound" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Probabilistic Forecast Matrix Table */}
          <Card title="FORECAST HORIZONS & POSITION UNCERTAINTY">
            <div className="overflow-x-auto font-mono">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-2">Horizon</th>
                    <th className="p-2 text-cyan-300">Expected (P50)</th>
                    <th className="p-2">Confidence</th>
                    <th className="p-2">Position Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {activeStorm.forecast_track.map((f) => (
                    <tr
                      key={f.horizon}
                      onClick={() => setSelectedHorizon(f.horizon)}
                      className={`cursor-pointer hover:bg-slate-800/50 transition-colors ${
                        selectedHorizon === f.horizon ? 'bg-cyan-950/40 text-cyan-200' : ''
                      }`}
                    >
                      <td className="p-2 font-bold text-slate-100">{f.horizon}</td>
                      <td className="p-2 font-bold text-cyan-400">{f.windP50} kt</td>
                      <td className="p-2 font-bold text-emerald-400">
                        {degradedMode ? f.confidence - 7 : f.confidence}%
                      </td>
                      <td className="p-2 text-slate-400">±{f.predictionIntervalKm} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
