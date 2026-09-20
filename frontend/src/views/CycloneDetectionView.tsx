import React from 'react';
import { useCyclone } from '../context/CycloneContext';
import { CycloneMap } from '../components/map/CycloneMap';
import { Scan, CheckCircle2, Target } from 'lucide-react';

export const CycloneDetectionView: React.FC = () => {
  const { activeStorm } = useCyclone();

  return (
    <div className="p-4 space-y-4 max-w-[1920px] mx-auto overflow-y-auto font-mono">
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
            <Scan className="w-4 h-4 text-cyan-400" />
            <span>AI CYCLONE DETECTION & BOUNDING BOX MASK</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated cyclone center localization, bounding box detection, and confidence decomposition.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 space-y-3">
          <CycloneMap height="h-[520px]" />
        </div>

        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 p-4 rounded-lg space-y-3">
          <div className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 uppercase">
            DETECTION DECOMPOSITION ({activeStorm.storm_id})
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">Detection Confidence:</span>
              <span className="font-bold text-emerald-400">{activeStorm.confidence}%</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">Estimated Center:</span>
              <span className="font-bold text-cyan-400">{activeStorm.center.lat}°N, {activeStorm.center.lng}°E</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">Center Error Proxy:</span>
              <span className="font-bold text-emerald-400">11.4 km</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">Bounding Box Extent:</span>
              <span className="text-slate-200">520 km x 480 km</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
