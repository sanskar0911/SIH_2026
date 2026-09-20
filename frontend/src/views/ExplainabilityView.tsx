import React from 'react';
import { useCyclone } from '../context/CycloneContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Brain, Sparkles, SlidersHorizontal, AlertCircle, CheckCircle2, ArrowRight, Eye } from 'lucide-react';

export const ExplainabilityView: React.FC = () => {
  const {
    activeStorm,
    counterfactualRemoved,
    toggleCounterfactualSensor,
    degradedMode,
  } = useCyclone();

  const modalitiesData = [
    { modality: 'INSAT IR', contribution: 38, color: '#06b6d4' },
    { modality: 'Water Vapor', contribution: 21, color: '#3b82f6' },
    { modality: 'Microwave', contribution: 17, color: '#8b5cf6' },
    { modality: 'Environmental', contribution: 14, color: '#10b981' },
    { modality: 'Scatterometer', contribution: counterfactualRemoved.includes('Scatterometer') ? 0 : 10, color: '#f59e0b' },
  ];

  // Calculate dynamic impact of counterfactual removed sensors
  const isScatterometerRemoved = counterfactualRemoved.includes('Scatterometer');
  const isMicrowaveRemoved = counterfactualRemoved.includes('Microwave');
  const isSSTRemoved = counterfactualRemoved.includes('SST');

  let trackErrorChange = 0;
  let confidenceDrop = 0;

  if (isScatterometerRemoved) {
    trackErrorChange += 28;
    confidenceDrop += 7;
  }
  if (isMicrowaveRemoved) {
    trackErrorChange += 34;
    confidenceDrop += 9;
  }
  if (isSSTRemoved) {
    trackErrorChange += 18;
    confidenceDrop += 4;
  }

  const originalConfidence = activeStorm.confidence;
  const modifiedConfidence = Math.max(60, originalConfidence - confidenceDrop);

  return (
    <div className="p-4 space-y-4 max-w-[1920px] mx-auto overflow-y-auto font-mono">
      {/* Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span>WHY DID THE MODEL PREDICT THIS? — AI EXPLAINABILITY WORKSPACE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Grad-CAM spatial attention maps, feature attribution breakdowns, and missing-modality counterfactual testing.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Target System:</span>
          <span className="font-bold text-cyan-400 bg-cyan-950 border border-cyan-500/40 px-2.5 py-1 rounded">
            {activeStorm.storm_id}
          </span>
        </div>
      </div>

      {/* Grid: Grad-CAM Attention Map (Left 50%) + Modality Breakdown & Counterfactual Engine (Right 50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Grad-CAM Heatmap Viewer */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200 uppercase">GRAD-CAM SPATIAL ATTENTION MAP</span>
            </div>
            <span className="text-[10px] text-cyan-400">Model Layer: ConvLSTM_Block4_Attn</span>
          </div>

          {/* Grad-CAM Canvas Display */}
          <div className="relative w-full h-[380px] rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
            {/* Base Satellite Imagery */}
            <div className="absolute inset-0 bg-radial-gradient from-slate-900 via-slate-950 to-black opacity-80"></div>

            {/* Grad-CAM Heatmap Glow Overlay */}
            <div className="relative w-72 h-72 rounded-full border border-amber-500/30 flex items-center justify-center">
              {/* Primary Convective Heatmap Hotspot */}
              <div className="w-48 h-48 rounded-full bg-red-500/30 blur-md animate-pulse"></div>
              <div className="absolute w-28 h-28 rounded-full bg-amber-400/40 blur-sm"></div>
              <div className="absolute w-12 h-12 rounded-full bg-cyan-400/60 blur-xs"></div>
            </div>

            {/* Region Annotations */}
            <div className="absolute top-6 left-6 border border-cyan-500/40 bg-cyan-950/80 p-2 rounded text-[10px] space-y-0.5">
              <div className="font-bold text-cyan-300">1. Deep Convective Core (Grad-CAM: 0.94)</div>
              <div className="text-slate-300">Driving intensity prediction (+12 kts/12h)</div>
            </div>

            <div className="absolute bottom-12 right-6 border border-amber-500/40 bg-amber-950/80 p-2 rounded text-[10px] space-y-0.5">
              <div className="font-bold text-amber-300">2. Spiral Moisture Inflow (Grad-CAM: 0.78)</div>
              <div className="text-slate-300">Sustaining asymmetric cloud band</div>
            </div>

            <div className="absolute top-1/2 left-8 border border-emerald-500/40 bg-emerald-950/80 p-2 rounded text-[10px] space-y-0.5">
              <div className="font-bold text-emerald-300">3. Environmental Ridge (Grad-CAM: 0.65)</div>
              <div className="text-slate-300">Steering track toward NE sector</div>
            </div>
          </div>

          {/* Important Regions Legend */}
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-slate-300 space-y-1">
            <div className="font-bold text-cyan-400">KEY REGIONAL INFLUENCE HIGHLIGHTS:</div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>• Convective Core: 42% spatial weight</div>
              <div>• Spiral Bands: 24% spatial weight</div>
              <div>• Eye Region: 18% spatial weight</div>
              <div>• Env Steering Ridge: 16% spatial weight</div>
            </div>
          </div>
        </div>

        {/* Right Column: Modality Contribution & What-If Counterfactual Engine */}
        <div className="lg:col-span-6 space-y-4">
          {/* Modality Contribution Chart */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 uppercase">MODEL EVIDENCE & MODALITY CONTRIBUTION %</span>
              <span className="text-[10px] text-slate-400">Shapley Feature Values</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modalitiesData} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 5 }}>
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 45]} />
                  <YAxis dataKey="modality" type="category" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} width={90} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1322', borderColor: '#1e293b', fontSize: '11px' }} />
                  <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                    {modalitiesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
              Note: Percentages represent model feature attributions (Shapley values), not physical causal energy parameters.
            </div>
          </div>

          {/* Interactive What-If Counterfactual Analyzer */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs uppercase">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <span>INTERACTIVE WHAT-IF COUNTERFACTUAL ANALYZER</span>
              </div>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                DEGRADED MODE SIMULATOR
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] text-slate-300">Toggle input sensor availability to observe forecast impact:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'Scatterometer', label: 'Remove Scatterometer' },
                  { id: 'Microwave', label: 'Remove Microwave' },
                  { id: 'SST', label: 'Remove SST' },
                ].map((sensor) => {
                  const isRemoved = counterfactualRemoved.includes(sensor.id);
                  return (
                    <button
                      key={sensor.id}
                      onClick={() => toggleCounterfactualSensor(sensor.id)}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all border ${
                        isRemoved
                          ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-sm'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {isRemoved ? `❌ ${sensor.label} (OFF)` : `✅ ${sensor.label}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Impact Results Comparison Card */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">ORIGINAL VS MODIFIED FORECAST IMPACT:</span>
                <span className="font-bold text-cyan-400">
                  {counterfactualRemoved.length > 0 ? `${counterfactualRemoved.length} Sensor(s) Disabled` : 'Full Modalities'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <div className="text-slate-400">Track Error Change</div>
                  <div className={`text-base font-bold ${trackErrorChange > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    +{trackErrorChange} km <span className="text-[10px] font-normal text-slate-400">dispersion</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <div className="text-slate-400">Model Confidence Drop</div>
                  <div className="text-base font-bold text-slate-200">
                    <span className="text-emerald-400">{originalConfidence}%</span>
                    <ArrowRight className="inline w-3 h-3 mx-1 text-slate-400" />
                    <span className="text-amber-400">{modifiedConfidence}%</span>
                  </div>
                </div>
              </div>

              {counterfactualRemoved.length > 0 && (
                <div className="text-[10px] text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-500/30 flex items-start space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Forecast generated using remaining available modalities (INSAT IR, Water Vapor). Missing observations slightly broaden uncertainty cone.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
