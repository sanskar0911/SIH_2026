import React from 'react';
import { X, HelpCircle, ShieldAlert, Compass, Eye, Cpu, BookOpen, ExternalLink } from 'lucide-react';
import { useCyclone } from '../../context/CycloneContext';

export const HelpModal: React.FC = () => {
  const { isHelpOpen, setIsHelpOpen } = useCyclone();

  if (!isHelpOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e1424] border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-slate-200 overflow-y-auto max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono uppercase text-slate-100">
                System Guide & Onboarding • SIH 2026 PS26070
              </h3>
              <p className="text-xs text-cyan-400 font-mono">
                India-Focused AI Cyclone Decision Support System
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHelpOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-100 rounded bg-slate-800/60"
            aria-label="Close help modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operational Flow */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold font-mono uppercase text-cyan-300 tracking-wider">
            30-Second Operational Assessment Flow
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
              <div className="font-bold text-slate-100 font-mono flex items-center gap-1.5">
                <span className="text-cyan-400 font-extrabold">1.</span> Command Center
              </div>
              <p className="text-slate-400 text-[11px]">
                Instantly view current cyclone location, maximum sustained wind (kt), pressure (hPa), and observation freshness.
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
              <div className="font-bold text-slate-100 font-mono flex items-center gap-1.5">
                <span className="text-amber-400 font-extrabold">2.</span> Probabilistic Forecast
              </div>
              <p className="text-slate-400 text-[11px]">
                Review 6h to 72h track predictions with position uncertainty bounds (±km) and intensity quantiles (P10/P50/P90).
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
              <div className="font-bold text-slate-100 font-mono flex items-center gap-1.5">
                <span className="text-purple-400 font-extrabold">3.</span> Ethical Provenance
              </div>
              <p className="text-slate-400 text-[11px]">
                Visually distinguish raw observations (<span className="text-cyan-300 font-mono">OBSERVED</span>) from model predictions (<span className="text-amber-300 font-mono">AI FORECAST</span>).
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
              <div className="font-bold text-slate-100 font-mono flex items-center gap-1.5">
                <span className="text-emerald-400 font-extrabold">4.</span> Operational Alerts
              </div>
              <p className="text-slate-400 text-[11px]">
                Receive plain-language notifications (Genesis Watch, Rapid Intensification, Landfall Risk) with evidence details.
              </p>
            </div>
          </div>
        </div>

        {/* Ethical AI Disclaimer */}
        <div className="p-3.5 bg-purple-950/40 border border-purple-500/30 rounded-lg text-xs space-y-1 text-purple-200">
          <div className="font-bold font-mono uppercase text-purple-300 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            Official Meteorological Disclaimer
          </div>
          <p className="text-[11px] leading-relaxed text-purple-100">
            This platform provides decision-support information derived from experimental AI models. It does NOT replace official warnings issued by the <strong>India Meteorological Department (IMD)</strong> or national disaster agencies.
          </p>
        </div>

        {/* Key Terminology */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold font-mono uppercase text-slate-300">Technical Glossary Shortcuts</h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
            <div><strong className="text-cyan-300">CMV:</strong> Cloud Motion Vector</div>
            <div><strong className="text-cyan-300">WVW:</strong> Water Vapour Wind</div>
            <div><strong className="text-cyan-300">PMW:</strong> Passive Microwave</div>
            <div><strong className="text-cyan-300">OOD:</strong> Out-of-Distribution Safety</div>
            <div><strong className="text-cyan-300">P10/P50/P90:</strong> Intensity Quantiles</div>
            <div><strong className="text-cyan-300">NIO:</strong> North Indian Ocean</div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button
            onClick={() => setIsHelpOpen(false)}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono rounded text-xs transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
