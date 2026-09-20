import React from 'react';
import { useCyclone } from '../context/CycloneContext';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { EthicalBadge } from '../components/common/EthicalBadge';
import { Cpu, Sliders, ShieldCheck, Eye, Database, Server, ExternalLink } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { unitPref, setUnitPref, userRole, setUserRole, degradedMode, setDegradedMode } = useCyclone();

  return (
    <div className="p-4 space-y-4 max-w-[1920px] mx-auto overflow-y-auto font-mono">
      {/* Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>SYSTEM SETTINGS, PREFERENCES & ARCHITECTURE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure display units, role disclosure level, accessibility parameters, and inspect pipeline microservices.
          </p>
        </div>

        <StatusBadge status="GOOD" label="ALL SYSTEMS NOMINAL" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* User Preferences (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card title="DISPLAY & OPERATIONAL PREFERENCES">
            <div className="space-y-4 text-xs">
              {/* Unit Preference */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded border border-slate-800">
                <div>
                  <div className="font-bold text-slate-200">Wind Speed Display Unit</div>
                  <div className="text-[11px] text-slate-400">Choose preferred meteorological unit</div>
                </div>
                <div className="flex gap-1">
                  {(['kt', 'kmh', 'ms'] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setUnitPref(unit)}
                      className={`px-3 py-1 rounded font-bold uppercase transition-all border ${
                        unitPref === unit
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Role Disclosure */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded border border-slate-800">
                <div>
                  <div className="font-bold text-slate-200">System Access Role</div>
                  <div className="text-[11px] text-slate-400">Controls technical metrics disclosure level</div>
                </div>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="bg-slate-900 text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs"
                >
                  <option value="PUBLIC">PUBLIC USER</option>
                  <option value="ANALYST">FORECAST ANALYST</option>
                  <option value="ADMIN">SYSTEM ADMIN</option>
                </select>
              </div>

              {/* Sensor Degraded Mode Simulation */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded border border-slate-800">
                <div>
                  <div className="font-bold text-slate-200">Degraded Sensor Mode Simulation</div>
                  <div className="text-[11px] text-slate-400">Simulates missing microwave sensor feed</div>
                </div>
                <button
                  onClick={() => setDegradedMode(!degradedMode)}
                  className={`px-3 py-1 rounded font-bold transition-all border ${
                    degradedMode
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  {degradedMode ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* System Architecture Overview (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card title="PIPELINE ARCHITECTURE & API CONTRACTS">
            <div className="space-y-2 text-xs text-slate-300">
              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-cyan-400" /> FastAPI Microservices Backend
                </div>
                <p className="text-[11px] text-slate-400">
                  Async REST + WebSocket endpoints serving detection, segmentation masks, track forecasts, and explainability heatmaps.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-400" /> PostgreSQL / PostGIS Spatial Database
                </div>
                <p className="text-[11px] text-slate-400">
                  Geospatial track storage, wind radii polygons, candidate disturbance logs, and immutable analyst annotations.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
