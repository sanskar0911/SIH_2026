import React, { useState } from 'react';
import { CycloneProvider, useCyclone } from './context/CycloneContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { LandingLoginView } from './views/LandingLoginView';

import { OverviewView } from './views/OverviewView';
import { LiveIntelligenceView } from './views/LiveIntelligenceView';
import { CycloneDetectionView } from './views/CycloneDetectionView';
import { GenesisWatchView } from './views/GenesisWatchView';
import { ForecastView } from './views/ForecastView';
import { StormAnalysisView } from './views/StormAnalysisView';
import { SatelliteDataView } from './views/SatelliteDataView';
import { HistoricalReplayView } from './views/HistoricalReplayView';
import { AlertsView } from './views/AlertsView';
import { ExplainabilityView } from './views/ExplainabilityView';
import { ModelPerformanceView } from './views/ModelPerformanceView';
import { DataHealthView } from './views/DataHealthView';
import { AnalystFeedbackView } from './views/AnalystFeedbackView';
import { SettingsView } from './views/SettingsView';

const MainDashboardLayout: React.FC = () => {
  const { currentView } = useCyclone();

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewView />;
      case 'live_intelligence':
        return <LiveIntelligenceView />;
      case 'cyclone_detection':
        return <CycloneDetectionView />;
      case 'genesis_watch':
        return <GenesisWatchView />;
      case 'forecast':
        return <ForecastView />;
      case 'storm_analysis':
        return <StormAnalysisView />;
      case 'satellite_data':
        return <SatelliteDataView />;
      case 'historical_replay':
        return <HistoricalReplayView />;
      case 'alerts':
        return <AlertsView />;
      case 'explainability':
        return <ExplainabilityView />;
      case 'model_performance':
        return <ModelPerformanceView />;
      case 'data_health':
        return <DataHealthView />;
      case 'analyst_feedback':
        return <AnalystFeedbackView />;
      case 'system_architecture':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070a12] text-slate-100 font-sans antialiased">
      <Sidebar />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-[#070a12]">{renderView()}</main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  if (!isLoggedIn) {
    return <LandingLoginView onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <CycloneProvider>
      <MainDashboardLayout />
    </CycloneProvider>
  );
};

export default App;
