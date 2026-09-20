import React from 'react';
import { Loader2, AlertTriangle, HelpCircle, Inbox, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SystemDataState } from './StatusBadge';

interface StateContainerProps {
  state: SystemDataState | 'LOADING' | 'EMPTY' | 'ERROR';
  message?: string;
  submessage?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export const StateContainer: React.FC<StateContainerProps> = ({
  state,
  message,
  submessage,
  onRetry,
  children,
}) => {
  if (state === 'GOOD' && children) {
    return <>{children}</>;
  }

  const configs: Record<
    string,
    { icon: React.ElementType; color: string; title: string; sub?: string; spin?: boolean }
  > = {
    GOOD: {
      icon: CheckCircle2,
      color: 'text-emerald-400',
      title: message || 'System Healthy',
      sub: submessage || 'All observation channels operational.',
    },
    LOADING: {
      icon: Loader2,
      color: 'text-cyan-400',
      title: message || 'Loading operational data...',
      spin: true,
    },
    PROCESSING: {
      icon: Loader2,
      color: 'text-cyan-400',
      title: message || 'Generating ML inference forecast...',
      spin: true,
    },
    DEGRADED: {
      icon: AlertTriangle,
      color: 'text-amber-400',
      title: message || 'System Operating in Degraded Data Mode',
      sub: submessage || 'Certain satellite observations are missing; confidence metrics adjusted.',
    },
    STALE: {
      icon: AlertTriangle,
      color: 'text-yellow-400',
      title: message || 'Satellite Observation Stale',
      sub: submessage || 'Last observation exceeds freshness threshold.',
    },
    UNAVAILABLE: {
      icon: Inbox,
      color: 'text-slate-400',
      title: message || 'Data Currently Unavailable',
      sub: submessage || 'Observation dataset not received for current timestep.',
    },
    FAILED: {
      icon: ShieldAlert,
      color: 'text-red-400',
      title: message || 'Pipeline Analysis Failed',
      sub: submessage || 'Model execution failed to generate valid output.',
    },
    ERROR: {
      icon: ShieldAlert,
      color: 'text-red-400',
      title: message || 'Error Fetching Information',
      sub: submessage || 'Please check connection or backend server status.',
    },
    'INSUFFICIENT EVIDENCE': {
      icon: HelpCircle,
      color: 'text-purple-400',
      title: message || 'Insufficient Evidence for Prediction',
      sub: submessage || 'Model confidence below acceptable operational threshold; forecast suppressed.',
    },
    EMPTY: {
      icon: Inbox,
      color: 'text-slate-400',
      title: message || 'No Records Found',
      sub: submessage || 'No active cyclones or candidates detected.',
    },
  };

  const config = configs[state] || configs.UNAVAILABLE;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900/40 border border-slate-800 rounded-xl text-center space-y-3">
      <div className={`p-3 rounded-full bg-slate-800/80 border border-slate-700/80 ${config.color}`}>
        <Icon className={`w-6 h-6 ${config.spin ? 'animate-spin' : ''}`} />
      </div>
      <div>
        <h4 className="text-sm font-bold font-mono text-slate-200 uppercase">{config.title}</h4>
        {config.sub && <p className="text-xs text-slate-400 font-sans mt-1 max-w-md">{config.sub}</p>}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-slate-700 rounded transition-colors"
        >
          Retry Pipeline
        </button>
      )}
    </div>
  );
};
