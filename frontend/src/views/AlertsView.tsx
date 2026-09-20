import React from 'react';
import { useCyclone } from '../context/CycloneContext';
import { Card } from '../components/common/Card';
import { OfficialDisclaimer } from '../components/common/OfficialDisclaimer';
import { EthicalBadge } from '../components/common/EthicalBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { Bell, AlertTriangle, Shield, CheckCircle2, ShieldAlert, ArrowUpRight } from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { alerts, acknowledgeAlert, setCurrentView } = useCyclone();

  return (
    <div className="p-4 space-y-4 max-w-[1920px] mx-auto overflow-y-auto font-mono">
      {/* Official IMD Warning Disclaimer */}
      <OfficialDisclaimer />

      {/* Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <span>OPERATIONAL DECISION-SUPPORT ALERT CENTER</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time persistence-validated notifications for Rapid Intensification, Genesis Watch, and Landfall Risk.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <EthicalBadge type="FORECAST" customText="AI WATCH" />
          <EthicalBadge type="OFFICIAL WARNING" customText="RSMC ALIGNMENT" />
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border bg-[#0e1424] space-y-3 text-xs shadow-lg transition-colors ${
              alert.acknowledged
                ? 'border-slate-800 opacity-75'
                : alert.severity === 'CRITICAL'
                ? 'border-red-500/50 bg-red-950/20'
                : 'border-amber-500/50 bg-amber-950/20'
            }`}
          >
            <div className="flex justify-between items-start border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {alert.severity}
                </span>
                <span className="font-bold text-slate-100 text-sm">{alert.title}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">{alert.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
              <div>
                <span className="text-slate-400">Trigger Reason: </span>
                <strong className="text-amber-300">{alert.trigger_reason}</strong>
              </div>
              <div>
                <span className="text-slate-400">Recommended Action: </span>
                <strong className="text-cyan-300">{alert.recommended_action}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setCurrentView('storm_analysis')}
                className="text-[11px] text-cyan-400 hover:underline inline-flex items-center gap-1 font-bold"
              >
                Inspect Satellite Evidence & GradCAM <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              {!alert.acknowledged ? (
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-xs flex items-center space-x-1 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ACKNOWLEDGE ALERT</span>
                </button>
              ) : (
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Acknowledged by Analyst
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
