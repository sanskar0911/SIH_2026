import React, { useState } from 'react';
import { useCyclone } from '../context/CycloneContext';
import { Card } from '../components/common/Card';
import { EthicalBadge } from '../components/common/EthicalBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { MessageSquare, CheckCircle2, AlertTriangle, UserCheck, Edit3, XCircle, ShieldCheck } from 'lucide-react';

export const AnalystFeedbackView: React.FC = () => {
  const { activeStorm, annotations, addAnnotation, userRole } = useCyclone();
  const [analystName, setAnalystName] = useState('Dr. R. Sharma (Senior Forecaster)');
  const [actionType, setActionType] = useState<'ACCEPTED' | 'CORRECTED_CENTER' | 'CORRECTED_CLASS' | 'FALSE_DETECTION'>('ACCEPTED');
  const [notes, setNotes] = useState('');
  const [corrLat, setCorrLat] = useState(activeStorm.center.lat.toString());
  const [corrLng, setCorrLng] = useState(activeStorm.center.lng.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAnnotation({
      storm_id: activeStorm.storm_id,
      analyst_name: analystName,
      action: actionType,
      notes: notes || 'Validated via Doppler weather radar cross-check.',
      original_center: activeStorm.center,
      corrected_center: actionType === 'CORRECTED_CENTER' ? { lat: Number(corrLat), lng: Number(corrLng) } : undefined,
    });
    setNotes('');
  };

  return (
    <div className="p-4 space-y-4 max-w-[1920px] mx-auto overflow-y-auto font-mono">
      {/* Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>HUMAN-IN-THE-LOOP ANALYST ANNOTATION & AUDIT WORKSPACE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Non-destructive forecaster oversight, storm center overrides, and immutable decision audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <EthicalBadge type="OBSERVED" customText="NON-DESTRUCTIVE AUDIT" />
          <StatusBadge status="GOOD" label={`ROLE: ${userRole}`} />
        </div>
      </div>

      {/* Grid: Form (Left 6 Cols) + Audit Log (Right 6 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Annotation Form */}
        <div className="lg:col-span-6">
          <Card title={`SUBMIT FORECASTER OVERRIDE / VERIFICATION (${activeStorm.storm_id})`}>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Analyst Identity & Badge:</label>
                <input
                  type="text"
                  value={analystName}
                  onChange={(e) => setAnalystName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
                  aria-label="Analyst Name"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Action Type:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ACCEPTED', label: 'ACCEPT AI RESULT', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                    { id: 'CORRECTED_CENTER', label: 'CORRECT CENTER COORDS', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
                    { id: 'CORRECTED_CLASS', label: 'CORRECT CLASS', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                    { id: 'FALSE_DETECTION', label: 'FLAG FALSE DETECTION', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setActionType(act.id as any)}
                      className={`p-2 rounded border font-bold text-[10px] text-center transition-all ${
                        actionType === act.id ? act.color : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {actionType === 'CORRECTED_CENTER' && (
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded border border-slate-800">
                  <div>
                    <label className="text-slate-400">Corrected Lat (°N):</label>
                    <input
                      type="text"
                      value={corrLat}
                      onChange={(e) => setCorrLat(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-cyan-300"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400">Corrected Lng (°E):</label>
                    <input
                      type="text"
                      value={corrLng}
                      onChange={(e) => setCorrLng(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-cyan-300"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Reason / Radar Evidence Notes:</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter justification for forecast override..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded shadow transition-all"
              >
                LOG FORECASTER ANNOTATION
              </button>
            </form>
          </Card>
        </div>

        {/* Right: Audit Trail Log */}
        <div className="lg:col-span-6">
          <Card title={`IMMUTABLE AUDIT TRAIL LOG (${annotations.length} ENTRIES)`}>
            <div className="space-y-3 max-h-[420px] overflow-y-auto font-mono">
              {annotations.map((ann) => (
                <div key={ann.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-cyan-300">{ann.analyst_name}</span>
                    <span className="text-[10px] text-slate-400">{ann.timestamp}</span>
                  </div>
                  <div className="text-slate-300">
                    Action: <span className="font-bold text-amber-400">{ann.action}</span> ({ann.storm_id})
                  </div>
                  <p className="text-slate-400 italic bg-slate-900/50 p-2 rounded border border-slate-800/80">
                    "{ann.notes}"
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
