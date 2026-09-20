import React from 'react';
import { Eye, Sparkles, Compass, ShieldAlert, Cpu, FlaskConical } from 'lucide-react';

export type EthicalDataProvenance =
  | 'OBSERVED'
  | 'AI ESTIMATE'
  | 'FORECAST'
  | 'UNCERTAINTY'
  | 'SIMULATION'
  | 'DEMO DATA'
  | 'OFFICIAL WARNING';

interface EthicalBadgeProps {
  type: EthicalDataProvenance;
  customText?: string;
  size?: 'sm' | 'md';
}

export const EthicalBadge: React.FC<EthicalBadgeProps> = ({ type, customText, size = 'sm' }) => {
  const configs: Record<
    EthicalDataProvenance,
    { bg: string; text: string; border: string; icon: React.ElementType }
  > = {
    OBSERVED: {
      bg: 'bg-cyan-950/60',
      text: 'text-cyan-300',
      border: 'border-cyan-500/40',
      icon: Eye,
    },
    'AI ESTIMATE': {
      bg: 'bg-blue-950/60',
      text: 'text-blue-300',
      border: 'border-blue-500/40',
      icon: Sparkles,
    },
    FORECAST: {
      bg: 'bg-amber-950/60',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
      icon: Compass,
    },
    UNCERTAINTY: {
      bg: 'bg-indigo-950/60',
      text: 'text-indigo-300',
      border: 'border-indigo-500/40',
      icon: Cpu,
    },
    SIMULATION: {
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
      icon: FlaskConical,
    },
    'DEMO DATA': {
      bg: 'bg-orange-950/60',
      text: 'text-orange-300',
      border: 'border-orange-500/40',
      icon: FlaskConical,
    },
    'OFFICIAL WARNING': {
      bg: 'bg-purple-950/60',
      text: 'text-purple-300',
      border: 'border-purple-500/40',
      icon: ShieldAlert,
    },
  };

  const config = configs[type] || configs.OBSERVED;
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider rounded border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
      aria-label={`Provenance: ${customText || type}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{customText || type}</span>
    </span>
  );
};
