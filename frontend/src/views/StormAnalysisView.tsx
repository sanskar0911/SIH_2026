import React, { useState } from 'react';
import { useCyclone } from '../context/CycloneContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { EthicalBadge } from '../components/common/EthicalBadge';
import { InfoButton } from '../components/common/InfoButton';
import {
  Microscope,
  Eye,
  Zap,
  Sliders,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  FlaskConical,
  MessageSquare,
} from 'lucide-react';

export const StormAnalysisView: React.FC = () => {
  const { activeStorm, degradedMode, counterfactualRemoved, toggleCounterfactualSensor, addAnnotation, displayMode } = useCyclone();
  const [activeChannel, setActiveChannel] = useState<'TIR1' | 'TIR2' | 'WV' | 'VIS' | 'PMW'>('TIR1');
  const [showSegmentationMask, setShowSegmentationMask] = useState<boolean>(true);
  const [contrast, setContrast] = useState<number>(100);

  const [notes, setNotes] = useState('');
  const isMicrowaveRemoved = counterfactualRemoved.includes('Passive Microwave');

  const intensityHistory = [
    { time: '-24h', wind: 45, pressure: 996 },
    { time: '-18h', wind: 60, pressure: 990 },
    { time: '-12h', wind: 75, pressure: 984 },
    { time: '-6h', wind: 85, pressure: 980 },
    { time: 'NOW', wind: activeStorm.wind_kts, pressure: activeStorm.pressure_hpa },
    { time: '+6h', wind: activeStorm.wind_kts + 4, pressure: activeStorm.pressure_hpa - 4 },
    { time: '+12h', wind: activeStorm.wind_kts + 10, pressure: activeStorm.pressure_hpa - 10 },
  ];

  const handleAccept = () => {
    addAnnotation({
      storm_id: activeStorm.storm_id,
      analyst_name: 'Duty Forecaster',
      action: 'ACCEPTED',
      notes: notes || 'Verified via radar & satellite imagery.',
      original_center: activeStorm.center,
    });
    setNotes('');
  };

  return (
    <div className="p-5 space-y-4 max-w-[1920px] mx-auto overflow-y-auto font-sans">
      {/* Header */}
      <div className="bg-[#0e1424] border border-slate-800/80 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
        <div>
          <h1 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Microscope className="w-5 h-5 text-cyan-400" />
            <span>Storm Structure & Multimodal Analysis</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep convective core extraction, eyewall organization, and model evidence diagnostics.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <EthicalBadge type="OBSERVED" customText="MOSDAC INSAT-3D" />
          <span className="font-bold text-cyan-400 bg-slate-900 border border-slate-700 px-3 py-1 rounded-md">
            {activeStorm.name} ({activeStorm.storm_id})
          </span>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Cols: Satellite Observation Canvas */}
        <div className="lg:col-span-7 bg-[#0e1424] border border-slate-800/80 p-4 rounded-xl space-y-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-1 font-mono">
              {(['TIR1', 'TIR2', 'WV', 'VIS', 'PMW'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setActiveChannel(ch)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors border ${
                    activeChannel === ch
                      ? 'bg-cyan-600 text-slate-950 font-bold border-cyan-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {ch} <InfoButton term={ch} />
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-300">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSegmentationMask}
                  onChange={(e) => setShowSegmentationMask(e.target.checked)}
                  className="accent-cyan-500 rounded"
                />
                <span>Overlay AI mask</span>
              </label>
            </div>
          </div>

          {/* Large Satellite Viewer Canvas */}
          <div
            className="relative w-full h-[400px] rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950 flex items-center justify-center"
            style={{ filter: `contrast(${contrast}%)` }}
          >
            <div className="absolute inset-0 bg-radial-gradient from-slate-900 via-[#070a12] to-black opacity-90"></div>

            {/* Cloud Spiral Graphic */}
            <div className="relative w-72 h-72 rounded-full border border-cyan-500/20 flex items-center justify-center animate-spin" style={{ animationDuration: '60s' }}>
              <div className="w-56 h-56 rounded-full border-2 border-dashed border-cyan-400/40"></div>
              <div className="w-40 h-40 rounded-full border border-indigo-500/50 bg-indigo-950/30"></div>
              <div className="w-20 h-20 rounded-full border-2 border-red-500/60 bg-red-950/40 animate-pulse"></div>
            </div>

            {showSegmentationMask && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-cyan-400 rounded-full border-dashed opacity-80 flex items-center justify-center">
                  <div className="w-44 h-44 border-2 border-amber-400 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <div className="w-20 h-20 border-2 border-red-500 rounded-full bg-red-500/20 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-cyan-400 border border-white flex items-center justify-center font-bold text-[8px] text-slate-950 font-mono">
                        EYE
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-xs space-y-0.5">
              <div className="text-cyan-400 font-bold">INSAT-3D Channel: {activeChannel}</div>
              <div className="text-slate-300">Time: {activeStorm.timestamp}</div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Structural Details & Analyst Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Storm Structure & Intensity */}
          <Card title="STORM STRUCTURE & INTENSITY TREND">
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400">Eye Structure:</span>
                  <div className="font-bold text-emerald-400 mt-0.5">Pinhole Eye (18km)</div>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400">Organization Score:</span>
                  <div className="font-bold text-cyan-400 mt-0.5">0.89 / 1.0 (High)</div>
                </div>
              </div>

              <div className="h-28 w-full font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={intensityHistory} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: '#1e293b', fontSize: '10px' }} />
                    <Line type="monotone" dataKey="wind" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} name="Wind (kt)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* Analyst Controls */}
          <Card title="ANALYST REVIEW & DECISION CONTROL">
            <div className="space-y-3 text-xs">
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter forecaster review notes..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAccept}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center space-x-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept AI Output</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
