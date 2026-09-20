import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';

interface OfficialDisclaimerProps {
  compact?: boolean;
}

export const OfficialDisclaimer: React.FC<OfficialDisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-purple-950/40 border border-purple-500/30 rounded p-2 text-[11px] text-purple-200 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-purple-300">Operational Disclaimer:</span> AI
          predictions are decision-support tools and do NOT replace official bulletins issued by IMD
          / RSMC New Delhi.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-purple-500/40 rounded-lg p-3.5 shadow-md shadow-purple-950/20">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg shrink-0 text-purple-400">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-purple-300">
              Scientific Decision Support Notice • RSMC Alignment
            </h4>
            <a
              href="https://mausam.imd.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 underline underline-offset-2"
            >
              IMD Official Portal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            AI-generated cyclone intensity, track, and genesis outputs provided by this system are
            experimental decision-support estimates. They are intended to complement, not replace,
            official warnings from the <strong className="text-slate-100">India Meteorological Department (IMD)</strong> and regional disaster management authorities.
          </p>
        </div>
      </div>
    </div>
  );
};
