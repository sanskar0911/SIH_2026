import React, { useState } from 'react';
import { Info } from 'lucide-react';

const TECHNICAL_GLOSSARY: Record<string, { title: string; description: string }> = {
  CMV: {
    title: 'Cloud Motion Vector (CMV)',
    description: 'Estimated speed and direction of atmospheric motion derived by tracking cloud features in sequential satellite images.',
  },
  WVW: {
    title: 'Water Vapour Wind (WVW)',
    description: 'Atmospheric wind vectors computed from motion patterns in satellite water vapour absorption channels (6.7µm).',
  },
  UTH: {
    title: 'Upper Tropospheric Humidity (UTH)',
    description: 'Relative humidity measurement in the upper troposphere (300-500 hPa level) derived from water vapour radiances.',
  },
  OOD: {
    title: 'Out-of-Distribution Check (OOD)',
    description: 'An AI safety check evaluating whether current satellite observations differ significantly from the model training dataset.',
  },
  PMW: {
    title: 'Passive Microwave (PMW)',
    description: 'Satellite microwave sensors capable of penetrating upper cloud layers to observe deep convection and eye wall structure.',
  },
  TIR1: {
    title: 'Thermal Infrared 1 (TIR1 - 10.8µm)',
    description: 'Primary thermal channel measuring cloud-top temperatures, critical for estimating convective intensity day and night.',
  },
  WV: {
    title: 'Water Vapour Channel (6.7µm)',
    description: 'Infrared channel measuring atmospheric moisture in the middle to upper troposphere.',
  },
  RI: {
    title: 'Rapid Intensification (RI)',
    description: 'An increase in maximum sustained wind speed of at least 30 knots (35 mph) within a 24-hour period.',
  },
  P10: {
    title: '10th Percentile (P10 Minimum)',
    description: 'Lower bound statistical estimate: 90% of model ensemble outcomes exceed this intensity value.',
  },
  P50: {
    title: '50th Percentile (P50 Median)',
    description: 'Expected central forecast value: most likely intensity prediction based on current evidence.',
  },
  P90: {
    title: '90th Percentile (P90 Maximum)',
    description: 'Upper bound statistical estimate: 10% of model ensemble outcomes exceed this intensity value.',
  },
};

interface InfoButtonProps {
  term: string;
  className?: string;
}

export const InfoButton: React.FC<InfoButtonProps> = ({ term, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const info = TECHNICAL_GLOSSARY[term.toUpperCase()] || {
    title: term,
    description: 'Technical meteorological or AI model diagnostic parameter.',
  };

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-slate-400 hover:text-cyan-300 ml-1 p-0.5 rounded transition-colors focus:ring-1 focus:ring-cyan-400"
        aria-label={`Explanation for ${term}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-slate-900 border border-cyan-500/40 rounded-lg p-2.5 shadow-2xl z-50 text-left text-xs pointer-events-none">
          <div className="font-bold text-cyan-300 font-mono mb-1">{info.title}</div>
          <p className="text-slate-300 text-[11px] leading-snug">{info.description}</p>
        </div>
      )}
    </span>
  );
};
