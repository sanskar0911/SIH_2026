import React from 'react';
import { MODEL_METRICS_LIST } from '../services/mockData';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '../components/common/Card';
import { EthicalBadge } from '../components/common/EthicalBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { BarChart3, ShieldCheck, CheckCircle2, Award, Zap, GitBranch } from 'lucide-react';

export const ModelPerformanceView: React.FC = () => {
  const trackErrorComparison = [
    { lead: '+6h', Persistence: 32, ConvLSTM: 21, MultimodalAI: 14 },
    { lead: '+12h', Persistence: 58, ConvLSTM: 36, MultimodalAI: 22 },
    { lead: '+24h', Persistence: 110, ConvLSTM: 64, MultimodalAI: 38.6 },
    { lead: '+48h', Persistence: 210, ConvLSTM: 112, MultimodalAI: 72.1 },
    { lead: '+72h', Persistence: 340, ConvLSTM: 185, MultimodalAI: 124.5 },
  ];

  const modelComparisonTable = [
    { name: 'Persistence Baseline', modalities: 'None (Lag Track)', f1: '0.62', track24: '110 km', track48: '210 km', mae: '14.2 kt', status: 'BASELINE' },
    { name: 'Single IR ConvNet', modalities: 'INSAT IR Only', f1: '0.82', track24: '68 km', track48: '124 km', mae: '8.4 kt', status: 'DEPRECATED' },
    { name: 'Challenger Model (v1.5.0-rc1)', modalities: 'IR + VIS + WV + PMW', f1: '0.94', track24: '36.2 km', track48: '69.4 km', mae: '4.5 kt', status: 'CHALLENGER' },
    { name: 'Champion Model (v1.4.2 DualNet)', modalities: 'IR + VIS + WV + PMW + SST', f1: '0.93', track24: '38.6 km', track48: '72.1 km', mae: '4.8 kt', status: 'CHAMPION' },
  ];

  return (
    <div className="p-4 space-y-4 max-w-[1920px] mx-auto overflow-y-auto font-mono">
      {/* Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>MODEL PERFORMANCE EVALUATION & GOVERNANCE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Storm-held-out cross-validation metrics across detection, segmentation, track lead-times, and intensity MAE.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <EthicalBadge type="OBSERVED" customText="IBTRACS VALIDATED" />
          <span className="text-emerald-400 bg-emerald-950 border border-emerald-500/40 px-3 py-1 rounded font-bold">
            PROTOCOL: NO STORM LEAKAGE
          </span>
        </div>
      </div>

      {/* Model Governance Banner */}
      <div className="bg-[#0e1424] border border-cyan-500/30 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-100 uppercase">PROD MODEL GOVERNANCE</div>
            <div className="text-slate-400 text-[11px]">
              Active Model: <strong className="text-cyan-300">NIO-DualNet v1.4.2</strong> • Commit <code className="text-amber-300">#8f3a92</code> • Dataset Split: Storm-Level Split (70/15/15)
            </div>
          </div>
        </div>
        <StatusBadge status="GOOD" label="CHAMPION MODEL ACTIVE" />
      </div>

      {/* Grid of Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {MODEL_METRICS_LIST.slice(0, 5).map((m) => (
          <Card key={m.metric_name}>
            <div className="text-[10px] text-slate-400 uppercase font-mono">{m.metric_name}</div>
            <div className="text-lg font-bold text-cyan-400 mt-1">{m.value}</div>
            <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80 mt-1">
              <span>Benchmark Target:</span>
              <span className="text-slate-200">{m.benchmark_value}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Lead-Time Track Error Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0e1424] border border-slate-800 p-4 rounded-xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 uppercase">
              TRACK FORECAST MEAN POSITION ERROR (KM) BY LEAD TIME
            </span>
            <span className="text-[10px] text-cyan-400">Lower is Better</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trackErrorComparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="lead" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: '#1e293b', fontSize: '11px' }} />
                <Bar dataKey="Persistence" fill="#64748b" name="Persistence Baseline" />
                <Bar dataKey="ConvLSTM" fill="#3b82f6" name="Single Channel ConvNet" />
                <Bar dataKey="MultimodalAI" fill="#06b6d4" name="NIO-DualNet (Champion)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Champion vs Challenger Benchmark Table (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0e1424] border border-slate-800 p-4 rounded-xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 uppercase">MODEL GOVERNANCE BENCHMARK</span>
            <span className="text-[10px] text-emerald-400 font-bold">CHAMPION VS CHALLENGER</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="p-2">Model</th>
                  <th className="p-2">F1</th>
                  <th className="p-2">24h Err</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {modelComparisonTable.map((row) => (
                  <tr
                    key={row.name}
                    className={
                      row.status === 'CHAMPION'
                        ? 'bg-cyan-950/40 text-cyan-200 font-bold'
                        : row.status === 'CHALLENGER'
                        ? 'bg-purple-950/30 text-purple-200'
                        : ''
                    }
                  >
                    <td className="p-2">{row.name}</td>
                    <td className="p-2 text-emerald-400">{row.f1}</td>
                    <td className="p-2 text-cyan-400">{row.track24}</td>
                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          row.status === 'CHAMPION'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : row.status === 'CHALLENGER'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
