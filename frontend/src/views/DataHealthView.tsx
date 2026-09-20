import React from 'react';
import { useCyclone } from '../context/CycloneContext';
import { DATA_HEALTH_ITEMS } from '../services/mockData';
import { Card } from '../components/common/Card';
import { StatusBadge, SystemDataState } from '../components/common/StatusBadge';
import { HeartPulse, ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export const DataHealthView: React.FC = () => {
  const { degradedMode, setDegradedMode } = useCyclone();

  return (
    <div className="p-4 space-y-4 max-w-[1920px] mx-auto overflow-y-auto font-mono">
      {/* Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 text-cyan-400" />
            <span>DATA STATUS & PIPELINE OBSERVABILITY DASHBOARD</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-sensor satellite data freshness, ingestion latency, and missing-modality degraded state triggers.
          </p>
        </div>

        <button
          onClick={() => setDegradedMode(!degradedMode)}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all border flex items-center space-x-1.5 ${
            degradedMode
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
          aria-label="Toggle Degraded Sensor Simulation Mode"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{degradedMode ? 'SIMULATION: DEGRADED MODE (ACTIVE)' : 'TEST DEGRADED SENSOR MODE'}</span>
        </button>
      </div>

      {/* Standard System Overview Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card title="SATELLITE DATA STATUS">
          <div className="flex items-center justify-between">
            <StatusBadge status={degradedMode ? 'DEGRADED' : 'GOOD'} />
            <span className="text-xs text-slate-300 font-bold">{degradedMode ? '5/6 Active' : '6/6 Active'}</span>
          </div>
        </Card>

        <Card title="AI MODEL PIPELINE">
          <div className="flex items-center justify-between">
            <StatusBadge status="GOOD" label="MODEL ONLINE" />
            <span className="text-xs text-cyan-400 font-bold">NIO-DualNet v1.4.2</span>
          </div>
        </Card>

        <Card title="POSTGIS DATABASE">
          <div className="flex items-center justify-between">
            <StatusBadge status="GOOD" />
            <span className="text-xs text-emerald-400 font-bold">Latency: 2.1 ms</span>
          </div>
        </Card>

        <Card title="BACKGROUND WORKER">
          <div className="flex items-center justify-between">
            <StatusBadge status="GOOD" label="REDIS SYNCED" />
            <span className="text-xs text-slate-300 font-bold">Queue: 0 jobs</span>
          </div>
        </Card>
      </div>

      {/* Grid of Sensor Observability Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DATA_HEALTH_ITEMS.map((sensor) => {
          const isDegradedSensor = sensor.sensor_code === 'OS3_OSCAT' && degradedMode;
          const mappedStatus: SystemDataState = isDegradedSensor
            ? 'DEGRADED'
            : sensor.status === 'HEALTHY'
            ? 'GOOD'
            : (sensor.status as SystemDataState);

          return (
            <Card
              key={sensor.sensor_code}
              title={
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="text-xs font-bold text-slate-100">{sensor.source_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{sensor.sensor_code}</div>
                  </div>
                  <StatusBadge status={mappedStatus} />
                </div>
              }
            >
              <div className="space-y-1.5 text-[11px] text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Received:</span>
                  <strong className="text-cyan-400">{sensor.last_received}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ingestion Latency:</span>
                  <span className="text-slate-200">{sensor.latency_sec}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pipeline Uptime:</span>
                  <strong className="text-emerald-400">{sensor.uptime_pct}%</strong>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
