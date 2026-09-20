import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ViewMode,
  Storm,
  GenesisCandidate,
  Modality,
  Alert,
  AnalystAnnotation,
} from '../types/cyclone';
import {
  INITIAL_STORMS,
  INITIAL_GENESIS_CANDIDATES,
  INITIAL_MODALITIES,
  INITIAL_ALERTS,
  INITIAL_ANNOTATIONS,
} from '../services/mockData';

export type UserRole = 'PUBLIC' | 'ANALYST' | 'ADMIN';
export type DisplayMode = 'STANDARD' | 'ANALYST';
export type UnitPreference = 'kt' | 'kmh' | 'ms';

export interface MapLayerConfig {
  satelliteIR: boolean;
  satelliteVis: boolean;
  waterVapor: boolean;
  sst: boolean;
  windVectors: boolean;
  observedTrack: boolean;
  forecastTrack: boolean;
  uncertaintyCone: boolean;
  ensembleTrajectories: boolean;
  windRadii: boolean;
  coastalRisk: boolean;
  segmentationMask: boolean;
}

interface CycloneContextType {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  unitPref: UnitPreference;
  setUnitPref: (unit: UnitPreference) => void;
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  storms: Storm[];
  activeStorm: Storm;
  setActiveStorm: (storm: Storm) => void;
  selectedHorizon: string;
  setSelectedHorizon: (horizon: string) => void;
  mapLayers: MapLayerConfig;
  toggleMapLayer: (layerKey: keyof MapLayerConfig) => void;
  degradedMode: boolean;
  setDegradedMode: (degraded: boolean) => void;
  demoMode: boolean;
  setDemoMode: (demo: boolean) => void;
  demoStep: number;
  setDemoStep: (step: number) => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  counterfactualRemoved: string[];
  toggleCounterfactualSensor: (sensorId: string) => void;
  genesisCandidates: GenesisCandidate[];
  modalities: Modality[];
  alerts: Alert[];
  acknowledgeAlert: (id: string) => void;
  annotations: AnalystAnnotation[];
  addAnnotation: (annotation: Omit<AnalystAnnotation, 'id' | 'timestamp'>) => void;
  utcClock: string;
}

const CycloneContext = createContext<CycloneContextType | undefined>(undefined);

export const CycloneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewMode>('overview');
  const [userRole, setUserRole] = useState<UserRole>('ANALYST');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('STANDARD');
  const [unitPref, setUnitPref] = useState<UnitPreference>('kt');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  const [storms] = useState<Storm[]>(INITIAL_STORMS);
  const [activeStorm, setActiveStorm] = useState<Storm>(INITIAL_STORMS[0]);
  const [selectedHorizon, setSelectedHorizon] = useState<string>('+24h');
  const [degradedMode, setDegradedMode] = useState<boolean>(false);
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(1);
  const [counterfactualRemoved, setCounterfactualRemoved] = useState<string[]>(['Scatterometer']);

  const [genesisCandidates] = useState<GenesisCandidate[]>(INITIAL_GENESIS_CANDIDATES);
  const [modalities, setModalities] = useState<Modality[]>(INITIAL_MODALITIES);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [annotations, setAnnotations] = useState<AnalystAnnotation[]>(INITIAL_ANNOTATIONS);

  const [mapLayers, setMapLayers] = useState<MapLayerConfig>({
    satelliteIR: false,
    satelliteVis: false,
    waterVapor: false,
    sst: false,
    windVectors: false,
    observedTrack: true,
    forecastTrack: true,
    uncertaintyCone: true,
    ensembleTrajectories: false,
    windRadii: true,
    coastalRisk: true,
    segmentationMask: false,
  });

  const [utcClock, setUtcClock] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcString = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      setUtcClock(utcString);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMapLayer = (layerKey: keyof MapLayerConfig) => {
    setMapLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const toggleCounterfactualSensor = (sensorId: string) => {
    setCounterfactualRemoved((prev) =>
      prev.includes(sensorId) ? prev.filter((s) => s !== sensorId) : [...prev, sensorId]
    );
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const addAnnotation = (newAnn: Omit<AnalystAnnotation, 'id' | 'timestamp'>) => {
    const created: AnalystAnnotation = {
      ...newAnn,
      id: `ann-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
    };
    setAnnotations((prev) => [created, ...prev]);
  };

  const nextDemoStep = () => {
    const stepViews: ViewMode[] = [
      'overview',
      'storm_analysis',
      'forecast',
      'genesis_watch',
      'alerts',
      'explainability',
      'historical_replay',
      'data_health',
      'model_performance',
      'analyst_feedback',
      'system_architecture',
    ];
    if (demoStep < stepViews.length) {
      const nextStep = demoStep + 1;
      setDemoStep(nextStep);
      setCurrentView(stepViews[nextStep - 1]);
    }
  };

  const prevDemoStep = () => {
    const stepViews: ViewMode[] = [
      'overview',
      'storm_analysis',
      'forecast',
      'genesis_watch',
      'alerts',
      'explainability',
      'historical_replay',
      'data_health',
      'model_performance',
      'analyst_feedback',
      'system_architecture',
    ];
    if (demoStep > 1) {
      const prevStep = demoStep - 1;
      setDemoStep(prevStep);
      setCurrentView(stepViews[prevStep - 1]);
    }
  };

  return (
    <CycloneContext.Provider
      value={{
        currentView,
        setCurrentView,
        userRole,
        setUserRole,
        displayMode,
        setDisplayMode,
        unitPref,
        setUnitPref,
        isHelpOpen,
        setIsHelpOpen,
        storms,
        activeStorm,
        setActiveStorm,
        selectedHorizon,
        setSelectedHorizon,
        mapLayers,
        toggleMapLayer,
        degradedMode,
        setDegradedMode,
        demoMode,
        setDemoMode,
        demoStep,
        setDemoStep,
        nextDemoStep,
        prevDemoStep,
        counterfactualRemoved,
        toggleCounterfactualSensor,
        genesisCandidates,
        modalities,
        alerts,
        acknowledgeAlert,
        annotations,
        addAnnotation,
        utcClock,
      }}
    >
      {children}
    </CycloneContext.Provider>
  );
};

export const useCyclone = () => {
  const context = useContext(CycloneContext);
  if (!context) {
    throw new Error('useCyclone must be used within a CycloneProvider');
  }
  return context;
};
