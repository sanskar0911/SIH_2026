import React from 'react';
import { useCyclone, UserRole } from '../../context/CycloneContext';
import { ViewMode } from '../../types/cyclone';
import {
  LayoutDashboard,
  Radio,
  Layers,
  TrendingUp,
  Compass,
  RotateCcw,
  Eye,
  Satellite,
  Bell,
  Activity,
  BarChart2,
  Users,
  Target,
  ChevronDown,
} from 'lucide-react';

interface NavItem {
  id: ViewMode;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  category: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, userRole, setUserRole } = useCyclone();

  const navGroups: NavGroup[] = [
    {
      category: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
        { id: 'live_intelligence', label: 'Live Stream Feed', icon: Radio, badge: 'LIVE', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
      ],
    },
    {
      category: 'ANALYSIS',
      items: [
        { id: 'storm_analysis', label: 'Storm Multi-Channel', icon: Layers },
        { id: 'forecast', label: 'Forecast & Uncertainty', icon: TrendingUp },
        { id: 'genesis_watch', label: 'Genesis Watch', icon: Compass, badge: 'WATCH', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
        { id: 'historical_replay', label: 'Historical Replay', icon: RotateCcw, badge: 'BENCHMARK', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
        { id: 'explainability', label: 'AI Explainability', icon: Eye },
        { id: 'satellite_data', label: 'Raw Satellite Channels', icon: Satellite },
      ],
    },
    {
      category: 'ALERTS',
      items: [
        { id: 'alerts', label: 'Active Alerts & Risk', icon: Bell, badge: '3', badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30' },
      ],
    },
    {
      category: 'SYSTEM & AI',
      items: [
        { id: 'data_health', label: 'Data Status & Sensors', icon: Activity },
        { id: 'model_performance', label: 'AI Validation Metrics', icon: BarChart2 },
        { id: 'analyst_feedback', label: 'Analyst Human-in-Loop', icon: Users },
        { id: 'cyclone_detection', label: 'Candidate Detection', icon: Target },
      ],
    },
  ];

  return (
    <aside className="w-60 bg-[#070b16] border-r border-slate-800/90 flex flex-col h-screen shrink-0 z-30 select-none font-sans text-xs">
      {/* Brand Header */}
      <div className="p-3.5 border-b border-slate-800/80 bg-[#090e1c] space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-cyan-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold text-xs font-mono">
            🌀
          </div>
          <div>
            <h1 className="text-xs font-extrabold tracking-wider text-slate-100 uppercase font-mono">
              CYCLONE INTELLIGENCE
            </h1>
            <p className="text-[9px] text-cyan-400 font-mono tracking-tight">
              SIH 2026 PS26070 • NIO DECISION SUPPORT
            </p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 mt-2">
          <span className="font-mono text-[10px]">ROLE:</span>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[10px] font-mono text-cyan-300 font-bold focus:outline-none"
          >
            <option value="ANALYST">ANALYST</option>
            <option value="PUBLIC">PUBLIC</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-3 font-sans">
        {navGroups.map((group) => (
          <div key={group.category} className="space-y-0.5">
            <div className="px-2 text-[10px] font-bold uppercase text-slate-500 tracking-wider font-mono">
              {group.category}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/50 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="truncate text-[11px]">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold border shrink-0 font-mono ${
                        item.badgeColor || 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer Model Details */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090e1c] text-[10px] font-mono text-slate-400 space-y-1">
        <div className="flex justify-between items-center text-slate-300">
          <span>CHAMPION MODEL</span>
          <span className="text-cyan-400 font-bold">v1.4.2 DualNet</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>BASIN</span>
          <span className="text-slate-200">North Indian Ocean</span>
        </div>
      </div>
    </aside>
  );
};
