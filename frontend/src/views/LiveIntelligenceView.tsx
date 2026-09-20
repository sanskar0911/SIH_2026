import React from 'react';
import { useCyclone } from '../context/CycloneContext';
import { CycloneMap } from '../components/map/CycloneMap';
import { Activity, ShieldCheck, MapPin, Radio, AlertTriangle } from 'lucide-react';

export const LiveIntelligenceView: React.FC = () => {
  const { activeStorm } = useCyclone();

  return (
    <div className="p-4 space-y-4 max-w-[1920px] mx-auto overflow-y-auto font-mono">
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>LIVE CYCLONE INTELLIGENCE & TELEMETRY STREAM</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time storm center telemetry, wind vector fields, and coastal threat monitoring.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 space-y-3">
          <CycloneMap height="h-[540px]" />
        </div>

        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 p-4 rounded-lg space-y-4">
          <div className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 uppercase">
            LIVE TELEMETRY CARD ({activeStorm.storm_id})
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Class: </span>
              <span className="font-bold text-red-400">{activeStorm.category}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Current Wind: </span>
              <span className="font-bold text-cyan-400">{activeStorm.wind_kts} kts</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Pressure: </span>
              <span className="font-bold text-slate-100">{activeStorm.pressure_hpa} hPa</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Center Coords: </span>
              <span className="font-bold text-cyan-300">{activeStorm.center.lat}°N, {activeStorm.center.lng}°E</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Movement: </span>
              <span className="font-bold text-slate-200">{activeStorm.movement_dir} @ {activeStorm.movement_speed_kmh} km/h</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Distance to Coast: </span>
              <span className="font-bold text-amber-400">{activeStorm.coastal_distance_km} km</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
