import React, { useState } from 'react';
import { Cpu, Server, Database, GitBranch, Shield, Activity, CheckCircle2, ChevronRight } from 'lucide-react';

export const SystemArchitectureView: React.FC = () => {
  const [activeBlock, setActiveBlock] = useState<string | null>('MULTIMODAL FUSION');

  const pipelineStages = [
    { name: 'INGEST', status: 'HEALTHY', latency: '42ms' },
    { name: 'QC', status: 'HEALTHY', latency: '18ms' },
    { name: 'ALIGN', status: 'HEALTHY', latency: '35ms' },
    { name: 'DETECT', status: 'HEALTHY', latency: '64ms' },
    { name: 'SEGMENT', status: 'HEALTHY', latency: '88ms' },
    { name: 'FUSE', status: 'HEALTHY', latency: '110ms' },
    { name: 'FORECAST', status: 'HEALTHY', latency: '145ms' },
    { name: 'UNCERTAINTY', status: 'HEALTHY', latency: '32ms' },
    { name: 'RISK', status: 'HEALTHY', latency: '12ms' },
    { name: 'PUBLISH', status: 'HEALTHY', latency: '8ms' },
  ];

  const architectureBlocks = [
    { id: 'b1', title: 'MULTI-SOURCE DATA', desc: 'INSAT IR, VIS, Water Vapor, Microwave GMI, Scatterometer, ECMWF HRES, OISST.' },
    { id: 'b2', title: 'INGESTION & QC', desc: 'Automated telemetry validation, corrupted frame rejection, timestamp sanity check.' },
    { id: 'b3', title: 'TIME ALIGNMENT & GEOREGISTRATION', desc: 'Spatial interpolation to 0.05° grid, temporal synchronization within ±15 min window.' },
    { id: 'b4', title: 'STORM-CENTERED DATA CUBE', desc: '512x512xN spatiotemporal tensor cropped around candidate center.' },
    { id: 'b5', title: 'GENESIS & DETECTION', desc: '3D ConvNet disturbance classifier with pre-genesis probability gauge.' },
    { id: 'b6', title: 'SEGMENTATION & CENTER', desc: 'U-Net+ Attention model extracting convective core, eyewall boundary, and eye center.' },
    { id: 'b7', title: 'MULTIMODAL FUSION', desc: 'Cross-attention transformer fusing satellite channels with atmospheric fields.' },
    { id: 'b8', title: 'INTENSITY & TRACK ENGINE', desc: 'ConvLSTM deep recurrent regressor forecasting wind, pressure, and lat/lon track.' },
    { id: 'b9', title: 'UNCERTAINTY ENGINE', desc: 'Monte Carlo dropout + Ensemble dispersion parameterizing P10/P50/P90 cones.' },
    { id: 'b10', title: 'PHYSICS / CONSISTENCY CHECK', desc: 'Hydrostatic balance & thermal wind constraint validation.' },
    { id: 'b11', title: 'RISK PRODUCT & DASHBOARD API', desc: 'FastAPI JSON endpoints, WebSocket live stream, and command-center web dashboard.' },
  ];

  return (
    <div className="p-4 space-y-4 max-w-[1920px] mx-auto overflow-y-auto font-mono">
      {/* Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>END-TO-END SYSTEM ARCHITECTURE & GOVERNANCE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete data flow, model versioning, hardware metrics, API endpoint registry, and real-time execution pipeline monitor.
          </p>
        </div>
      </div>

      {/* Live Real-time Execution Pipeline Monitor Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg space-y-2">
        <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-1.5">
          <span className="text-slate-200 uppercase">REAL-TIME INFERENCE PIPELINE STAGE MONITOR</span>
          <span className="text-emerald-400">TOTAL LATENCY: 554ms</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
          {pipelineStages.map((stg) => (
            <div key={stg.name} className="bg-slate-950 p-2 rounded border border-slate-800 text-center space-y-0.5">
              <div className="text-[10px] font-bold text-cyan-300">{stg.name}</div>
              <div className="text-[9px] text-emerald-400 flex items-center justify-center space-x-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>{stg.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive End-to-End Workflow Diagram */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg space-y-3">
        <div className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 uppercase">
          INTERACTIVE SYSTEM PIPELINE WORKFLOW (CLICK ANY BLOCK)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {architectureBlocks.map((block) => (
            <div
              key={block.id}
              onClick={() => setActiveBlock(block.title)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                activeBlock === block.title
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-md'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="font-bold text-cyan-400 mb-1">{block.title}</div>
              <p className="text-[10px] text-slate-400 leading-tight">{block.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Governance (Left 50%) + Hardware Metrics (Right 50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Governance */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 p-4 rounded-lg space-y-3 text-xs">
          <div className="flex items-center space-x-2 text-cyan-300 font-bold border-b border-slate-800 pb-2 uppercase">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <span>MODEL GOVERNANCE & METADATA</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="text-slate-400">MODEL VERSION</div>
              <div className="font-bold text-cyan-400">v1.4.2 (DualNet)</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="text-slate-400">TRAINING DATASET</div>
              <div className="font-bold text-slate-200">NIO Snapshot 2026.08</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="text-slate-400">GIT COMMIT</div>
              <div className="font-bold text-slate-200">a83f92d</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="text-slate-400">GOVERNANCE STATUS</div>
              <div className="font-bold text-emerald-400">CHAMPION DEPLOYED</div>
            </div>
          </div>
        </div>

        {/* System Hardware Metrics */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 p-4 rounded-lg space-y-3 text-xs">
          <div className="flex items-center space-x-2 text-cyan-300 font-bold border-b border-slate-800 pb-2 uppercase">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>INFERENCE SERVER HARDWARE METRICS</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="text-slate-400">GPU UTILIZATION</div>
              <div className="font-bold text-emerald-400">64% (NVIDIA A100-80GB)</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="text-slate-400">VRAM ALLOCATED</div>
              <div className="font-bold text-cyan-400">14.2 GB / 80 GB</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="text-slate-400">API REQUESTS / MIN</div>
              <div className="font-bold text-slate-200">2,450 req/min</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="text-slate-400">AVERAGE LATENCY</div>
              <div className="font-bold text-emerald-400">210 ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
