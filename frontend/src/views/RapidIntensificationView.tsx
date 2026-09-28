import React, { useState, useEffect } from 'react';
import { useCyclone } from '../context/CycloneContext';
import {
  RapidIntensificationInput,
  RapidIntensificationResult,
  RIMetricsData,
} from '../types/cyclone';
import {
  cycloneAiService,
  DEMO_RI_SCENARIOS,
  STATIC_METRICS,
} from '../services/cycloneAiService';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import {
  Zap,
  Activity,
  Sliders,
  AlertTriangle,
  ShieldCheck,
  Flame,
  Wind,
  Waves,
  Thermometer,
  CloudRain,
  Compass,
  RotateCcw,
  CheckCircle2,
  Info,
  Layers,
  BarChart3,
  GitBranch,
} from 'lucide-react';

export const RapidIntensificationView: React.FC = () => {
  const { activeStorm } = useCyclone();

  // Active inputs state
  const [inputs, setInputs] = useState<RapidIntensificationInput>(
    DEMO_RI_SCENARIOS.high_risk.data
  );
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('high_risk');
  const [prediction, setPrediction] = useState<RapidIntensificationResult | null>(null);
  const [metrics, setMetrics] = useState<RIMetricsData>(STATIC_METRICS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'simulator' | 'governance' | 'attribution'>('simulator');

  // Fetch prediction whenever inputs change
  useEffect(() => {
    let isCancelled = false;
    async function runInference() {
      setIsLoading(true);
      const res = await cycloneAiService.predictRapidIntensification(inputs);
      if (!isCancelled) {
        setPrediction(res);
        setIsLoading(false);
      }
    }
    runInference();
    return () => {
      isCancelled = true;
    };
  }, [inputs]);

  // Load metrics on mount
  useEffect(() => {
    cycloneAiService.getMetrics().then((m) => setMetrics(m));
  }, []);

  const handleScenarioChange = (key: string) => {
    setSelectedScenarioKey(key);
    if (key === 'active_storm') {
      setInputs({
        latitude: activeStorm.center.lat,
        longitude: activeStorm.center.lng,
        cyclone_age_hours: 54.0,
        wind_speed: activeStorm.wind_kts,
        min_central_pressure: activeStorm.pressure_hpa,
        prev_wind_speed: Math.max(30, activeStorm.wind_kts - 14),
        prev_pressure: activeStorm.pressure_hpa + 8,
        wind_speed_change: 14.0,
        pressure_change: -8.0,
        sst: 30.2,
        relative_humidity: 86.0,
        vertical_wind_shear: 8.5,
        atmospheric_temp_200hPa: -60.0,
        cloud_top_temp: -68.0,
        water_vapour: 65.0,
        precipitation: 24.0,
        ocean_heat_content: 62.0,
        movement_speed: activeStorm.movement_speed_kmh * 0.54, // kmh to kt
        movement_direction: 335.0,
        season_sin: 0.866,
        season_cos: 0.5,
        diurnal_sin: 0.707,
        diurnal_cos: 0.707,
      });
    } else if (DEMO_RI_SCENARIOS[key]) {
      setInputs(DEMO_RI_SCENARIOS[key].data);
    }
  };

  const updateField = (field: keyof RapidIntensificationInput, value: number) => {
    setSelectedScenarioKey('custom');
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const riskCat = prediction?.risk_category || 'MODERATE';
  const riskProb = prediction?.risk_probability ?? 0.5;
  const riskPct = prediction?.risk_percentage ?? 50.0;

  // Chart data for feature importance
  const topFeaturesData = (metrics?.top_features || []).slice(0, 7).map((f) => ({
    name: f.label.replace(/\(.*\)/, '').trim(),
    importance: Math.round(f.importance * 1000) / 10,
    unit: f.unit,
  }));

  return (
    <div className="p-4 space-y-4 max-w-[1920px] mx-auto overflow-y-auto font-mono text-slate-100">
      {/* Top Header & Model Lineage Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            </span>
            <div>
              <h1 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
                <span>CYCLONE RAPID INTENSIFICATION (RI) AI ENGINE</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-mono">
                  XGBoost 2.0+ Native
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Predicts probability of explosive cyclone intensification (ΔV ≥ 30 kt / 24h) via 23 thermodynamic, kinematic & satellite proxies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center space-x-2">
            <span className="text-slate-400">TEST ROC-AUC:</span>
            <span className="text-emerald-400 font-bold">{metrics.test_roc_auc}</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center space-x-2">
            <span className="text-slate-400">F1 SCORE:</span>
            <span className="text-cyan-400 font-bold">{metrics.test_f1}</span>
          </div>
          <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>5-FOLD CV: {metrics.tuned_cv_roc_auc_mean}</span>
          </div>
        </div>
      </div>

      {/* Scenario Selection Toolbar */}
      <div className="bg-[#0b101e] border border-slate-800 p-3 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-300 uppercase">1-CLICK BENCHMARK SCENARIOS:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleScenarioChange('high_risk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center space-x-1.5 ${
              selectedScenarioKey === 'high_risk'
                ? 'bg-red-500/20 text-red-300 border-red-500/60 shadow-md shadow-red-950'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            <span>🔴 Super Cyclone RI (Amphan Class)</span>
          </button>

          <button
            onClick={() => handleScenarioChange('moderate_risk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center space-x-1.5 ${
              selectedScenarioKey === 'moderate_risk'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-md shadow-amber-950'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
            }`}
          >
            <span>🟡 Moderate Deepening Cyclone</span>
          </button>

          <button
            onClick={() => handleScenarioChange('low_risk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center space-x-1.5 ${
              selectedScenarioKey === 'low_risk'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-md shadow-emerald-950'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
            }`}
          >
            <span>🟢 Hostile / Suppressed Depression</span>
          </button>

          <button
            onClick={() => handleScenarioChange('active_storm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center space-x-1.5 ${
              selectedScenarioKey === 'active_storm'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-md shadow-cyan-950'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
            }`}
          >
            <span>🌀 Live Active Storm ({activeStorm.name})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left 5 Cols (Threat Gauge & Disaster SOP), Right 7 Cols (Interactive Sliders & Attribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Live AI Output & Threat Radar */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Risk Card */}
          <div
            className={`border rounded-xl p-5 space-y-4 transition-all duration-300 ${
              riskCat === 'HIGH'
                ? 'bg-gradient-to-b from-red-950/40 via-slate-900 to-slate-950 border-red-500/50 shadow-xl shadow-red-950/40'
                : riskCat === 'MODERATE'
                ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/50 shadow-xl shadow-amber-950/40'
                : 'bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/50 shadow-xl shadow-emerald-950/40'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Flame
                  className={`w-5 h-5 ${
                    riskCat === 'HIGH'
                      ? 'text-red-400 animate-bounce'
                      : riskCat === 'MODERATE'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                />
                <span className="text-xs font-extrabold uppercase tracking-wide">
                  RI THREAT ASSESSMENT GAUGE
                </span>
              </div>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider font-mono ${
                  riskCat === 'HIGH'
                    ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                    : riskCat === 'MODERATE'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                }`}
              >
                {riskCat} RI RISK ({prediction?.severity_level})
              </span>
            </div>

            {/* Big Risk Percentage Display */}
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <div className="relative flex items-center justify-center">
                <div
                  className={`text-5xl md:text-6xl font-black tracking-tight ${
                    riskCat === 'HIGH'
                      ? 'text-red-400'
                      : riskCat === 'MODERATE'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {riskPct}%
                </div>
              </div>
              <div className="text-xs text-slate-400 font-sans text-center max-w-xs">
                {riskProb >= 0.67
                  ? 'High probability of Rapid Intensification within 24 hours. Central pressure dropping exponentially.'
                  : riskProb >= 0.34
                  ? 'Marginal thermodynamic state. Core could consolidate if shear relaxes.'
                  : 'Environmental shear and dry air prevent rapid spin-up. Decay or steady state expected.'}
              </div>

              {/* Progress Bar Gauge */}
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 mt-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    riskCat === 'HIGH'
                      ? 'bg-gradient-to-r from-amber-500 to-red-500'
                      : riskCat === 'MODERATE'
                      ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
                      : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.max(4, riskPct)}%` }}
                ></div>
              </div>

              <div className="w-full flex justify-between text-[10px] text-slate-500 font-mono px-1">
                <span>0% LOW</span>
                <span>33%</span>
                <span>66%</span>
                <span>100% HIGH</span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">RI BINARY PREDICTION</div>
                <div className="font-bold text-slate-100 flex items-center space-x-1 mt-0.5">
                  {prediction?.prediction === 1 ? (
                    <span className="text-red-400 font-extrabold flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> POSITIVE (RI OCCURS)
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> NEGATIVE (NO RI)
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">MODEL CONFIDENCE</div>
                <div className="font-bold text-cyan-300 mt-0.5">
                  {Math.round(Math.abs(riskProb - 0.5) * 200)}% MARGIN
                </div>
              </div>
            </div>
          </div>

          {/* Operational SOP Actionable Guidance Box */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2.5 text-xs">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200 uppercase">METEOROLOGICAL & NDRF ADVISORY SOP</span>
            </div>

            {riskCat === 'HIGH' ? (
              <div className="space-y-1.5 text-red-200 bg-red-950/40 p-3 rounded-lg border border-red-500/30 text-[11px] font-sans">
                <div className="font-bold text-red-300 font-mono flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>EMERGENCY PROTOCOL LEVEL 3:</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li>Issue Immediate Red Cyclone Warning for coastal maritime vessels.</li>
                  <li>Advance coastal evacuation timeline by +18 hours prior to anticipated peak wind.</li>
                  <li>Trigger automated INSAT-3DR rapid scan schedule (6-minute intervals).</li>
                  <li>Pre-position NDRF / SDRF storm surge rescue battalions along landfall corridor.</li>
                </ul>
              </div>
            ) : riskCat === 'MODERATE' ? (
              <div className="space-y-1.5 text-amber-200 bg-amber-950/40 p-3 rounded-lg border border-amber-500/30 text-[11px] font-sans">
                <div className="font-bold text-amber-300 font-mono flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>WATCH PROTOCOL LEVEL 2:</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li>Maintain 3-hourly Dvorak technique and microwave eye consolidation checks.</li>
                  <li>Alert port authorities in Bay of Bengal & Arabian Sea sectors.</li>
                  <li>Run ensemble perturbation tracks to capture rapid intensity spread.</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-1.5 text-emerald-200 bg-emerald-950/40 p-3 rounded-lg border border-emerald-500/30 text-[11px] font-sans">
                <div className="font-bold text-emerald-300 font-mono flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ROUTINE SURVEILLANCE LEVEL 1:</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li>Standard 6-hourly synoptic bulletin issuance.</li>
                  <li>Environmental shear and dry air intrusion currently inhibiting intensification.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Parameter Controls & Shapley Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 font-bold transition-all border-b-2 ${
                activeTab === 'simulator'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>ENVIRONMENTAL PARAMETER TUNER</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('attribution')}
              className={`px-4 py-2 font-bold transition-all border-b-2 ${
                activeTab === 'attribution'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>FEATURE ATTRIBUTION & IMPACTS</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('governance')}
              className={`px-4 py-2 font-bold transition-all border-b-2 ${
                activeTab === 'governance'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <GitBranch className="w-3.5 h-3.5" />
                <span>MODEL VALIDATION & METRICS</span>
              </div>
            </button>
          </div>

          {activeTab === 'simulator' && (
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 uppercase">
                  METEOROLOGICAL & THERMODYNAMIC SLIDERS
                </span>
                <button
                  onClick={() => handleScenarioChange('high_risk')}
                  className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Sliders</span>
                </button>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Sea Surface Temperature */}
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 flex items-center space-x-1">
                      <Thermometer className="w-3.5 h-3.5 text-red-400" />
                      <span>Sea Surface Temp (SST)</span>
                    </span>
                    <span className="font-bold text-cyan-300 font-mono">{inputs.sst}°C</span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="33"
                    step="0.1"
                    value={inputs.sst}
                    onChange={(e) => updateField('sst', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>24°C (Cold)</span>
                    <span>28.5°C (Optimum)</span>
                    <span>33°C (Extreme)</span>
                  </div>
                </div>

                {/* 2. Vertical Wind Shear */}
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 flex items-center space-x-1">
                      <Wind className="w-3.5 h-3.5 text-blue-400" />
                      <span>Vertical Wind Shear</span>
                    </span>
                    <span className="font-bold text-cyan-300 font-mono">{inputs.vertical_wind_shear} kt</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="45"
                    step="0.5"
                    value={inputs.vertical_wind_shear}
                    onChange={(e) => updateField('vertical_wind_shear', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>2 kt (Calm)</span>
                    <span>15 kt</span>
                    <span>45 kt (Hostile)</span>
                  </div>
                </div>

                {/* 3. Ocean Heat Content */}
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 flex items-center space-x-1">
                      <Waves className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ocean Heat Content (OHC)</span>
                    </span>
                    <span className="font-bold text-cyan-300 font-mono">{inputs.ocean_heat_content} kJ/cm²</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={inputs.ocean_heat_content}
                    onChange={(e) => updateField('ocean_heat_content', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0 kJ/cm²</span>
                    <span>50 kJ/cm²</span>
                    <span>100 kJ/cm²</span>
                  </div>
                </div>

                {/* 4. 6-Hour Pressure Change */}
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 flex items-center space-x-1">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <span>6h Pressure Change</span>
                    </span>
                    <span className="font-bold text-cyan-300 font-mono">{inputs.pressure_change} hPa</span>
                  </div>
                  <input
                    type="range"
                    min="-25"
                    max="10"
                    step="0.5"
                    value={inputs.pressure_change}
                    onChange={(e) => updateField('pressure_change', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>-25 hPa (Rapid Drop)</span>
                    <span>0 hPa</span>
                    <span>+10 hPa (Filling)</span>
                  </div>
                </div>

                {/* 5. Cloud-Top IR Temperature */}
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 flex items-center space-x-1">
                      <CloudRain className="w-3.5 h-3.5 text-purple-400" />
                      <span>Cloud Top IR Temp</span>
                    </span>
                    <span className="font-bold text-cyan-300 font-mono">{inputs.cloud_top_temp}°C</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="-10"
                    step="1"
                    value={inputs.cloud_top_temp}
                    onChange={(e) => updateField('cloud_top_temp', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>-90°C (Overshooting)</span>
                    <span>-50°C</span>
                    <span>-10°C (Warm)</span>
                  </div>
                </div>

                {/* 6. Current Max Wind Speed */}
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 flex items-center space-x-1">
                      <Wind className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Current Wind Speed</span>
                    </span>
                    <span className="font-bold text-cyan-300 font-mono">{inputs.wind_speed} kt</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="165"
                    step="1"
                    value={inputs.wind_speed}
                    onChange={(e) => updateField('wind_speed', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>25 kt (Depression)</span>
                    <span>95 kt</span>
                    <span>165 kt (Super Cyclone)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attribution' && (
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 uppercase">
                  EXPLAINABILITY & FEATURE CONTRIBUTIONS (SHAPLEY PROXIES)
                </span>
                <span className="text-[10px] text-slate-400">Directional Drivers</span>
              </div>

              <div className="space-y-2 text-xs">
                {(prediction?.feature_impacts || []).slice(0, 5).map((f) => (
                  <div
                    key={f.feature}
                    className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-200 flex items-center space-x-2">
                        <span>{f.label}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                            f.direction === 'INCREASES_RISK'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : f.direction === 'DECREASES_RISK'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {f.direction.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans">{f.impact_text}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-cyan-400 font-bold font-mono">{f.value}</div>
                      <div className="text-[10px] text-slate-500">Weight: {(f.importance * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'governance' && (
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 uppercase">
                  XGBOOST FEATURE IMPORTANCE (GAIN ATTRIBUTION)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">10,000 Trained Cases</span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topFeaturesData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" />
                    <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 10, fill: '#cbd5e1' }} width={140} />
                    <Tooltip contentStyle={{ backgroundColor: '#0b101e', borderColor: '#1e293b', fontSize: '11px' }} />
                    <Bar dataKey="importance" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                      {topFeaturesData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index < 3 ? '#f59e0b' : '#06b6d4'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs pt-2 border-t border-slate-800">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-500">ACCURACY</div>
                  <div className="font-bold text-slate-200">{metrics.test_accuracy * 100}%</div>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-500">PRECISION</div>
                  <div className="font-bold text-cyan-400">{metrics.test_precision * 100}%</div>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-500">RECALL</div>
                  <div className="font-bold text-emerald-400">{metrics.test_recall * 100}%</div>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-500">TEST F1</div>
                  <div className="font-bold text-purple-400">{metrics.test_f1}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
