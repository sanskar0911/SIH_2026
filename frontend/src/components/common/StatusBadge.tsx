import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, XCircle, RefreshCw, HelpCircle, AlertOctagon } from 'lucide-react';

export type SystemDataState =
  | 'GOOD'
  | 'DEGRADED'
  | 'STALE'
  | 'UNAVAILABLE'
  | 'PROCESSING'
  | 'FAILED'
  | 'INSUFFICIENT EVIDENCE';

interface StatusBadgeProps {
  status: SystemDataState;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const configs: Record<
    SystemDataState,
    { bg: string; text: string; border: string; icon: React.ElementType }
  > = {
    GOOD: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: CheckCircle2,
    },
    DEGRADED: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      icon: AlertTriangle,
    },
    STALE: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-300',
      border: 'border-yellow-500/30',
      icon: Clock,
    },
    UNAVAILABLE: {
      bg: 'bg-slate-700/30',
      text: 'text-slate-400',
      border: 'border-slate-600/30',
      icon: XCircle,
    },
    PROCESSING: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
      icon: RefreshCw,
    },
    FAILED: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/30',
      icon: AlertOctagon,
    },
    'INSUFFICIENT EVIDENCE': {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      icon: HelpCircle,
    },
  };

  const config = configs[status] || configs.UNAVAILABLE;
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
      aria-label={`Status: ${label || status}`}
    >
      <Icon className={`${iconSize} ${status === 'PROCESSING' ? 'animate-spin' : ''}`} />
      <span>{label || status}</span>
    </span>
  );
};
