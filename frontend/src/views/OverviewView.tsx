import React, { useState, useEffect } from 'react';
import { useCyclone } from '../context/CycloneContext';
import { CycloneMap } from '../components/map/CycloneMap';
import { fetchWindField } from '../services/windFieldApi';
import { WindFieldResponse } from '../types/cyclone';
import {
  ShieldAlert,
  ExternalLink,
  Clock,
  Info,
  Radio,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const {
    activeStorm,
    setActiveStorm,
    storms,
    selectedHorizon,
    setSelectedHorizon,
    unitPref,
    setCurrentView,
  } = useCyclone();

  const [windField, setWindField] = useState<WindFieldResponse | null>(null);

  useEffect(() => {
    let forecastHour = 0;
    if (selectedHorizon && selectedHorizon.startsWith('+') && selectedHorizon.endsWith('h')) {
      forecastHour = parseInt(selectedHorizon.replace('+', '').replace('h', ''), 10) || 0;
    }
    fetchWindField(activeStorm.storm_id, forecastHour).then((data) => {
      if (data) setWindField(data);
    });
  }, [activeStorm.storm_id, selectedHorizon]);

  const horizons = ['NOW', '+6h', '+12h', '+24h', '+48h', '+72h'];

  const formatWind = (kts: number) => {
    if (unitPref === 'kmh') return `${Math.round(kts * 1.852)} km/h`;
    return `${kts} kt`;
  };

  const activeForecast = activeStorm.forecast_track.find(
    (f) => f.horizon === selectedHorizon
  ) || activeStorm.forecast_track[2];

  return (
    <div className="p-4 space-y-3.5 max-w-[1920px] mx-auto overflow-y-auto font-sans bg-[#050811] min-h-screen text-slate-100">
      {/* 1. Scientific Decision Support Notice Banner (Top Banner matching Screenshot) */}
      <div className="bg-[#120a21] border border-purple-800/60 p-3 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-2 shadow-md">
        <div className="flex items-start space-x-2.5">
          <div className="p-1.5 bg-purple-900/60 border border-purple-600/40 rounded-lg text-purple-300 shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-purple-200 uppercase tracking-wider font-mono text-[11px]">
              SCIENTIFIC DECISION SUPPORT NOTICE • RSMC ALIGNMENT
            </div>
            <p className="text-purple-300/80 text-[11px] leading-relaxed mt-0.5">
              AI-generated cyclone intensity, track, and genesis outputs provided by this system are experimental decision-support estimates. They are intended to complement, not replace, official warnings from the <strong className="text-purple-100">India Meteorological Department (IMD)</strong> and regional disaster management authorities.
            </p>
          </div>
        </div>

        <a
          href="https://mausam.imd.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-300 hover:text-purple-100 font-mono text-[11px] font-bold border border-purple-600/40 bg-purple-950/60 px-3 py-1.5 rounded-lg shrink-0 inline-flex items-center gap-1.5 transition-colors"
        >
          <span>IMD Official Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 2. Main Grid: 70% Map & Controls (Left) + Active Cyclones & Quantiles (Right 30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left 8 Cols: Map Header, Leaflet Container & Forecast Scrubber */}
        <div className="lg:col-span-8 space-y-2.5">
          {/* Map Section Title */}
          <div className="flex items-center justify-between bg-[#090e1c] border border-slate-800/80 px-3.5 py-2 rounded-xl text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="font-bold text-slate-200 tracking-wider">GEOSPATIAL SITUATIONAL MAP — NORTH INDIAN OCEAN</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">● MOSDAC / INSAT-3D</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">● AI DUALNET</span>
            </div>
          </div>

          {/* Interactive Map Component */}
          <CycloneMap height="h-[520px]" />

          {/* Forecast Scrubber Control Bar (Matching Screenshot Bottom-Center) */}
          <div className="bg-[#090e1c] border border-slate-800 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center space-x-2 text-slate-400 font-bold">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>FORECAST HORIZON:</span>
            </div>

            <div className="flex items-center space-x-1.5">
              {horizons.map((h) => {
                const isSelected = selectedHorizon === h;
                return (
                  <button
                    key={h}
                    onClick={() => setSelectedHorizon(h)}
                    className={`px-3 py-1 rounded text-xs font-bold font-mono transition-all ${
                      isSelected
                        ? 'bg-cyan-600 text-slate-950 shadow-sm border border-cyan-400'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-300">
              Selected: <strong className="text-cyan-400 font-bold">{selectedHorizon}</strong> (Position ±{activeForecast.predictionIntervalKm} km)
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Active Cyclone Cards & Uncertainty Quantiles */}
        <div className="lg:col-span-4 space-y-3">
          {/* Active Cyclones Card */}
          <div className="bg-[#090e1c] border border-slate-800/90 p-3.5 rounded-xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-100 font-mono tracking-wider uppercase">
                ACTIVE CYCLONE SUMMARY
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                GOOD
              </span>
            </div>

            {/* Cyclones List */}
            <div className="space-y-2.5">
              {storms.map((s) => {
                const isSelected = activeStorm.storm_id === s.storm_id;
                return (
                  <div
                    key={s.storm_id}
                    onClick={() => setActiveStorm(s)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#0e162a] border-cyan-500/60 shadow-md'
                        : 'bg-[#070b16] border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono">{s.storm_id}</span>
                        <h4 className="text-xs font-bold text-slate-100 font-mono mt-0.5">
                          {s.name} ({s.category})
                        </h4>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold font-mono uppercase border ${
                        s.wind_kts >= 90
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      }`}>
                        {s.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-400">Wind: </span>
                        <strong className="text-cyan-400">{formatWind(s.wind_kts)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Pressure: </span>
                        <strong className="text-slate-200">{s.pressure_hpa} hPa</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Center: </span>
                        <strong className="text-slate-200">{s.center.lat}°N {s.center.lng}°E</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Motion: </span>
                        <strong className="text-slate-200">{s.movement_dir} @ {s.movement_speed_kmh} km/h</strong>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-400">CONFIDENCE:</span>
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden inline-block ml-1">
                          <div className="h-full bg-emerald-400 w-[90%]"></div>
                        </div>
                        <span className="text-emerald-400 font-bold ml-1">HIGH</span>
                      </div>
                      <div className="text-amber-400 font-bold">
                        RI RISK: {s.rapid_intensification_risk}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Forecast Uncertainty & Quantiles Panel (Matches Screenshot Bottom Right) */}
          <div className="bg-[#090e1c] border border-slate-800/90 p-3.5 rounded-xl space-y-2.5 shadow-lg font-mono text-xs">
            <div className="font-bold text-slate-100 border-b border-slate-800 pb-2 uppercase tracking-wider text-[11px]">
              FORECAST UNCERTAINTY & QUANTILES
            </div>

            <div className="space-y-2 pt-1 text-[11px]">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>POSITION UNCERTAINTY ({selectedHorizon}):</span>
                </span>
                <strong className="text-amber-400 font-bold">±{activeForecast.predictionIntervalKm} km</strong>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>INTENSITY QUANTILE (P10 / P50 / P90):</span>
                </span>
                <strong className="text-cyan-300 font-bold">
                  {activeForecast.windP10} / {activeForecast.windP50} / {activeForecast.windP90} kt
                </strong>
              </div>

              <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between text-[10px] text-slate-400">
                <span>P10: Min ({activeForecast.windP10} kt)</span>
                <span className="text-cyan-400 font-bold">P50: Expected ({activeForecast.windP50} kt)</span>
                <span>P90: Max ({activeForecast.windP90} kt)</span>
              </div>
            </div>
          </div>

          {/* 4-Quadrant Wind Radii NM Table */}
          <div className="bg-[#090e1c] border border-slate-800/90 p-3 rounded-xl space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-cyan-300">WIND RADII (R34/R50/R64)</span>
              <span className="text-[10px] text-slate-400">{windField?.data_source || 'DEMO_MODEL'}</span>
            </div>
            <table className="w-full text-center text-[11px] font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/60">
                  <th className="text-left pb-1 font-normal">Thresh</th>
                  <th className="pb-1 font-normal text-blue-400">NE</th>
                  <th className="pb-1 font-normal text-blue-400">SE</th>
                  <th className="pb-1 font-normal text-blue-400">SW</th>
                  <th className="pb-1 font-normal text-blue-400">NW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-200">
                <tr>
                  <td className="text-left py-1 text-blue-300 font-semibold">R34 (34kt)</td>
                  <td>{windField?.radii.r34_nm.NE ?? 140}</td>
                  <td>{windField?.radii.r34_nm.SE ?? 120}</td>
                  <td>{windField?.radii.r34_nm.SW ?? 90}</td>
                  <td>{windField?.radii.r34_nm.NW ?? 110}</td>
                </tr>
                <tr>
                  <td className="text-left py-1 text-amber-300 font-semibold">R50 (50kt)</td>
                  <td>{windField?.radii.r50_nm.NE ?? 80}</td>
                  <td>{windField?.radii.r50_nm.SE ?? 70}</td>
                  <td>{windField?.radii.r50_nm.SW ?? 50}</td>
                  <td>{windField?.radii.r50_nm.NW ?? 60}</td>
                </tr>
                <tr>
                  <td className="text-left py-1 text-rose-400 font-semibold">R64 (64kt)</td>
                  <td>{windField?.radii.r64_nm.NE ?? 45}</td>
                  <td>{windField?.radii.r64_nm.SE ?? 40}</td>
                  <td>{windField?.radii.r64_nm.SW ?? 30}</td>
                  <td>{windField?.radii.r64_nm.NW ?? 35}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
