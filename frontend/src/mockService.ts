import type {
  Storm,
  ForecastPoint,
  DataHealth,
  Alert,
  Explanation,
  HistoricalStorm,
  Annotation,
  ModelPerformance,
  ModelVersion,
  ModalityStatus
} from './types';
import { systemApi } from './api/systemApi';

// ============================================================================
// SIMULATION STATE (InMemory Store)
// ============================================================================

export type ScenarioId =
  | 'NORMAL'
  | 'WEAK_DISTURBANCE'
  | 'RAPID_INTENSIFICATION'
  | 'RAPID_WEAKENING'
  | 'LAND_INTERACTION'
  | 'MULTIPLE_DISTURBANCES'
  | 'SATELLITE_GAP'
  | 'MISSING_MICROWAVE'
  | 'POOR_DATA'
  | 'OOD_CASE';

interface GlobalSimState {
  currentScenario: ScenarioId;
  selectedStormId: string;
  selectedSatelliteMode: 'RAW' | 'AI_SEGMENTATION' | 'CENTER_HEATMAP' | 'STRUCTURE' | 'ATTENTION';
  selectedSatelliteProduct: 'IR' | 'WATER_VAPOR' | 'CLOUD';
  activeLayers: {
    stormTrack: boolean;
    forecast: boolean;
    uncertainty: boolean;
    windField: boolean;
    sst: boolean;
    rainfall: boolean;
    risk: boolean;
  };
  modalityStatus: {
    ir: ModalityStatus;
    microwave: ModalityStatus;
    scatterometer: ModalityStatus;
    sst: ModalityStatus;
    environment: ModalityStatus;
  };
  customAnnotations: Annotation[];
  analysisStatus: 'READY' | 'PROCESSING' | 'COMPLETE' | 'DEGRADED' | 'INSUFFICIENT_EVIDENCE' | 'ERROR';
  lastAnalysisTime: string;
  presentationMode: boolean;
  historicalTimeIndex: number; // For dragging replay: 0 to 7
  selectedHistoricalStormId: string;
  isPlayingHistorical: boolean;
}

const DEFAULT_STATE: GlobalSimState = {
  currentScenario: 'NORMAL',
  selectedStormId: 'TC-ARUN',
  selectedSatelliteMode: 'RAW',
  selectedSatelliteProduct: 'IR',
  activeLayers: {
    stormTrack: true,
    forecast: true,
    uncertainty: true,
    windField: false,
    sst: false,
    rainfall: false,
    risk: false,
  },
  modalityStatus: {
    ir: 'AVAILABLE',
    microwave: 'AVAILABLE',
    scatterometer: 'AVAILABLE',
    sst: 'AVAILABLE',
    environment: 'AVAILABLE',
  },
  customAnnotations: [],
  analysisStatus: 'READY',
  lastAnalysisTime: '14:32 UTC',
  presentationMode: false,
  historicalTimeIndex: 4, // "T0" (Genesis/Current state in replay)
  selectedHistoricalStormId: 'TC-ARUN',
  isPlayingHistorical: false,
};

let simState: GlobalSimState = { ...DEFAULT_STATE };

// Callbacks for notifying state changes to the UI
const listeners = new Set<() => void>();
export function subscribeToSimState(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function notifyListeners() {
  listeners.forEach((l) => l());
}

export function getSimState(): GlobalSimState {
  return simState;
}

export function updateSimState(updates: Partial<GlobalSimState>) {
  simState = { ...simState, ...updates };
  notifyListeners();
}

// ============================================================================
// COMPRESSED SCENARIO HELPERS
// ============================================================================

export function setScenario(scenario: ScenarioId) {
  simState.currentScenario = scenario;
  
  // Reset modality statuses to default then override based on scenario
  simState.modalityStatus = {
    ir: 'AVAILABLE',
    microwave: 'AVAILABLE',
    scatterometer: 'AVAILABLE',
    sst: 'AVAILABLE',
    environment: 'AVAILABLE',
  };
  simState.analysisStatus = 'READY';

  if (scenario === 'MISSING_MICROWAVE') {
    simState.modalityStatus.microwave = 'MISSING';
  } else if (scenario === 'SATELLITE_GAP') {
    simState.modalityStatus.ir = 'STALE';
  } else if (scenario === 'POOR_DATA') {
    simState.modalityStatus.microwave = 'MISSING';
    simState.modalityStatus.scatterometer = 'MISSING';
    simState.modalityStatus.environment = 'DEGRADED';
    simState.modalityStatus.sst = 'UNRELIABLE';
    simState.analysisStatus = 'INSUFFICIENT_EVIDENCE';
  } else if (scenario === 'MULTIPLE_DISTURBANCES') {
    simState.selectedStormId = 'TC-ARUN';
  }
  
  // Asynchronously notify backend API
  systemApi.setScenario(scenario).catch(() => {
    // Graceful offline fallback
  });

  notifyListeners();
}

export function toggleModality(modality: keyof GlobalSimState['modalityStatus']) {
  const current = simState.modalityStatus[modality];
  const next: ModalityStatus = current === 'AVAILABLE' ? 'MISSING' : 'AVAILABLE';
  simState.modalityStatus[modality] = next;
  notifyListeners();
}

// ============================================================================
// DYNAMIC MOCK DATA BUILDERS
// ============================================================================

export function getActiveStorms(): Storm[] {
  const scenario = simState.currentScenario;
  const mods = simState.modalityStatus;

  // Base adjustments from sensors
  let confidenceModifier = 0;
  if (mods.microwave === 'MISSING') confidenceModifier -= 5;
  if (mods.scatterometer === 'MISSING') confidenceModifier -= 3;
  if (mods.environment === 'DEGRADED' || mods.environment === 'STALE') confidenceModifier -= 4;
  if (mods.ir === 'STALE') confidenceModifier -= 10;

  const list: Storm[] = [];

  // --- STORM 1: TC-ARUN ---
  let arun: Storm = {
    id: 'TC-ARUN',
    name: 'TC-ARUN',
    classification: 'VERY SEVERE CYCLONIC STORM',
    status: 'ACTIVE',
    lat: 15.8,
    lon: 84.6,
    wind: 78,
    pressure: 972,
    movement: 'NW 12 KM/H',
    confidence: Math.max(50, 91 + confidenceModifier),
    genesisProb: 98,
    rapidIntensificationProb: 64,
    trackConfidence: Math.max(50, 87 + confidenceModifier),
    landInteraction: 'MODERATE',
    organization: 87,
    symmetry: 72,
    eyeSignature: 'DETECTED',
    eyewallConfidence: 81,
    structureTrend: 'STRENGTHENING',
    asymmetry: 28,
  };

  // Adjust Arun based on Scenario
  if (scenario === 'WEAK_DISTURBANCE') {
    arun.classification = 'CYCLONIC STORM';
    arun.wind = 38;
    arun.pressure = 998;
    arun.movement = 'W 8 KM/H';
    arun.rapidIntensificationProb = 12;
    arun.organization = 45;
    arun.symmetry = 50;
    arun.eyeSignature = 'NOT DETECTED';
    arun.eyewallConfidence = 15;
    arun.structureTrend = 'STEADY';
    arun.asymmetry = 55;
  } else if (scenario === 'RAPID_INTENSIFICATION') {
    arun.classification = 'EXTREMELY SEVERE CYCLONIC STORM';
    arun.wind = 98;
    arun.pressure = 948;
    arun.rapidIntensificationProb = 92;
    arun.organization = 95;
    arun.symmetry = 89;
    arun.eyeSignature = 'DETECTED';
    arun.eyewallConfidence = 96;
    arun.structureTrend = 'STRENGTHENING';
    arun.asymmetry = 12;
  } else if (scenario === 'RAPID_WEAKENING') {
    arun.classification = 'SEVERE CYCLONIC STORM';
    arun.wind = 52;
    arun.pressure = 988;
    arun.movement = 'N 10 KM/H';
    arun.rapidIntensificationProb = 5;
    arun.organization = 60;
    arun.symmetry = 55;
    arun.eyeSignature = 'NOT DETECTED';
    arun.structureTrend = 'WEAKENING';
    arun.asymmetry = 48;
  } else if (scenario === 'LAND_INTERACTION') {
    arun.lat = 19.4;
    arun.lon = 85.1; // closer to Odisha coast
    arun.movement = 'NW 15 KM/H';
    arun.landInteraction = 'HIGH';
    arun.wind = 74;
    arun.pressure = 975;
  } else if (scenario === 'POOR_DATA') {
    arun.confidence = Math.max(20, 42 + confidenceModifier);
    arun.trackConfidence = Math.max(20, 38 + confidenceModifier);
    arun.eyeSignature = 'NOT DETECTED';
    arun.eyewallConfidence = 30;
  } else if (scenario === 'OOD_CASE') {
    arun.confidence = Math.max(30, 55); // high shift warning
  }

  list.push(arun);

  // --- STORM 2: TC-VEER ---
  let veer: Storm = {
    id: 'TC-VEER',
    name: 'TC-VEER',
    classification: 'CYCLONIC STORM',
    status: 'ACTIVE',
    lat: 17.2,
    lon: 68.4,
    wind: 45,
    pressure: 990,
    movement: 'NE 15 KM/H',
    confidence: Math.max(50, 84 + confidenceModifier),
    genesisProb: 88,
    rapidIntensificationProb: 24,
    trackConfidence: Math.max(50, 80 + confidenceModifier),
    landInteraction: 'LOW',
    organization: 65,
    symmetry: 58,
    eyeSignature: 'NOT DETECTED',
    eyewallConfidence: 34,
    structureTrend: 'STEADY',
    asymmetry: 42,
  };
  list.push(veer);

  // --- STORM 3: TC-MAYA ---
  let maya: Storm = {
    id: 'TC-MAYA',
    name: 'TC-MAYA',
    classification: 'DEPRESSION',
    status: 'WATCH',
    lat: 8.5,
    lon: 87.2,
    wind: 30,
    pressure: 1002,
    movement: 'W 10 KM/H',
    confidence: Math.max(40, 76 + confidenceModifier),
    genesisProb: 71,
    rapidIntensificationProb: 8,
    trackConfidence: Math.max(40, 72 + confidenceModifier),
    landInteraction: 'LOW',
    organization: 52,
    symmetry: 48,
    eyeSignature: 'NOT DETECTED',
    eyewallConfidence: 10,
    structureTrend: 'STRENGTHENING',
    asymmetry: 50,
  };
  list.push(maya);

  // Additional Candidate Storm for scenario or general representation
  if (scenario === 'MULTIPLE_DISTURBANCES') {
    let samudra: Storm = {
      id: 'TC-SAMUDRA',
      name: 'TC-SAMUDRA',
      classification: 'SEVERE CYCLONIC STORM',
      status: 'ACTIVE',
      lat: 11.2,
      lon: 62.1,
      wind: 55,
      pressure: 984,
      movement: 'WNW 18 KM/H',
      confidence: Math.max(50, 82 + confidenceModifier),
      genesisProb: 95,
      rapidIntensificationProb: 38,
      trackConfidence: Math.max(50, 79 + confidenceModifier),
      landInteraction: 'LOW',
      organization: 70,
      symmetry: 66,
      eyeSignature: 'NOT DETECTED',
      eyewallConfidence: 50,
      structureTrend: 'STRENGTHENING',
      asymmetry: 35,
    };
    list.push(samudra);
  }

  // Weaker candidate disturbances
  let dist4: Storm = {
    id: 'DISTURBANCE-04',
    name: 'DISTURBANCE-04',
    classification: 'LOW PRESSURE AREA',
    status: 'CANDIDATE',
    lat: 12.0,
    lon: 92.0,
    wind: 20,
    pressure: 1008,
    movement: 'NW 5 KM/H',
    confidence: 68,
    genesisProb: 68,
    rapidIntensificationProb: 2,
    trackConfidence: 54,
    landInteraction: 'LOW',
    organization: 30,
    symmetry: 25,
    eyeSignature: 'NOT DETECTED',
    eyewallConfidence: 0,
    structureTrend: 'STEADY',
    asymmetry: 70,
  };
  list.push(dist4);

  let dist7: Storm = {
    id: 'DISTURBANCE-07',
    name: 'DISTURBANCE-07',
    classification: 'TROPICAL DISTURBANCE',
    status: 'CANDIDATE',
    lat: 14.5,
    lon: 64.0,
    wind: 15,
    pressure: 1012,
    movement: 'W 5 KM/H',
    confidence: 43,
    genesisProb: 43,
    rapidIntensificationProb: 0,
    trackConfidence: 35,
    landInteraction: 'LOW',
    organization: 15,
    symmetry: 18,
    eyeSignature: 'NOT DETECTED',
    eyewallConfidence: 0,
    structureTrend: 'STEADY',
    asymmetry: 85,
  };
  list.push(dist7);

  return list;
}

export function getForecast(stormId: string): ForecastPoint[] {
  const scenario = simState.currentScenario;
  const mods = simState.modalityStatus;

  // Track uncertainty multiplier based on sensors
  let uncertaintyMultiplier = 1.0;
  if (mods.microwave === 'MISSING') uncertaintyMultiplier += 0.25;
  if (mods.scatterometer === 'MISSING') uncertaintyMultiplier += 0.1;
  if (mods.ir === 'STALE') uncertaintyMultiplier += 0.4;
  if (scenario === 'POOR_DATA') uncertaintyMultiplier += 0.6;

  // Let's create realistic tracks for our storms
  if (stormId === 'TC-ARUN') {
    // Current center: 15.8N, 84.6E
    // Path moves North-West
    let baseTrack = [
      { lead_h: 0, dLat: 0.0, dLon: 0.0, wind: 78, pressure: 972 },
      { lead_h: 6, dLat: 0.6, dLon: -0.4, wind: 80, pressure: 970 },
      { lead_h: 12, dLat: 1.2, dLon: -0.8, wind: 82, pressure: 968 },
      { lead_h: 24, dLat: 2.6, dLon: -1.5, wind: 85, pressure: 964 },
      { lead_h: 48, dLat: 5.0, dLon: -3.0, wind: 92, pressure: 955 },
      { lead_h: 72, dLat: 7.2, dLon: -4.5, wind: 98, pressure: 946 },
    ];

    if (scenario === 'WEAK_DISTURBANCE') {
      baseTrack = [
        { lead_h: 0, dLat: 0.0, dLon: 0.0, wind: 38, pressure: 998 },
        { lead_h: 6, dLat: 0.3, dLon: -0.5, wind: 40, pressure: 996 },
        { lead_h: 12, dLat: 0.6, dLon: -1.0, wind: 41, pressure: 995 },
        { lead_h: 24, dLat: 1.1, dLon: -1.8, wind: 42, pressure: 994 },
        { lead_h: 48, dLat: 2.0, dLon: -3.2, wind: 45, pressure: 990 },
        { lead_h: 72, dLat: 2.8, dLon: -4.5, wind: 46, pressure: 988 },
      ];
    } else if (scenario === 'RAPID_INTENSIFICATION') {
      baseTrack = [
        { lead_h: 0, dLat: 0.0, dLon: 0.0, wind: 98, pressure: 948 },
        { lead_h: 6, dLat: 0.6, dLon: -0.4, wind: 105, pressure: 940 },
        { lead_h: 12, dLat: 1.2, dLon: -0.8, wind: 112, pressure: 932 },
        { lead_h: 24, dLat: 2.6, dLon: -1.5, wind: 125, pressure: 918 },
        { lead_h: 48, dLat: 5.0, dLon: -3.0, wind: 135, pressure: 905 },
        { lead_h: 72, dLat: 7.2, dLon: -4.5, wind: 140, pressure: 898 },
      ];
    } else if (scenario === 'RAPID_WEAKENING') {
      baseTrack = [
        { lead_h: 0, dLat: 0.0, dLon: 0.0, wind: 52, pressure: 988 },
        { lead_h: 6, dLat: 0.5, dLon: -0.2, wind: 48, pressure: 991 },
        { lead_h: 12, dLat: 0.9, dLon: -0.4, wind: 42, pressure: 995 },
        { lead_h: 24, dLat: 1.6, dLon: -0.8, wind: 35, pressure: 999 },
        { lead_h: 48, dLat: 2.8, dLon: -1.4, wind: 28, pressure: 1004 },
        { lead_h: 72, dLat: 3.8, dLon: -2.0, wind: 22, pressure: 1008 },
      ];
    } else if (scenario === 'LAND_INTERACTION') {
      // Starts further north: 19.4N, 85.1E
      // Moves towards land, hits coast at 24-48H, then decays rapidly
      baseTrack = [
        { lead_h: 0, dLat: 0.0, dLon: 0.0, wind: 74, pressure: 975 },
        { lead_h: 6, dLat: 0.4, dLon: -0.3, wind: 75, pressure: 974 },
        { lead_h: 12, dLat: 0.8, dLon: -0.6, wind: 76, pressure: 973 },
        { lead_h: 24, dLat: 1.5, dLon: -1.0, wind: 70, pressure: 978 }, // Landfall around 24H
        { lead_h: 48, dLat: 2.6, dLon: -1.6, wind: 40, pressure: 995 }, // Inland weakening
        { lead_h: 72, dLat: 3.5, dLon: -2.0, wind: 25, pressure: 1005 },
      ];
    }

    const currentLat = scenario === 'LAND_INTERACTION' ? 19.4 : 15.8;
    const currentLon = scenario === 'LAND_INTERACTION' ? 85.1 : 84.6;

    return baseTrack.map((pt) => {
      // Spread increases with lead time
      const spread = pt.lead_h * 0.4 * uncertaintyMultiplier;
      return {
        lead_h: pt.lead_h,
        lat: parseFloat((currentLat + pt.dLat).toFixed(2)),
        lon: parseFloat((currentLon + pt.dLon).toFixed(2)),
        wind_p50: pt.wind,
        wind_p10: Math.max(15, Math.round(pt.wind - spread - 2)),
        wind_p90: Math.round(pt.wind + spread + 2),
        pressure: pt.pressure,
        confidence: Math.max(25, Math.round(91 - pt.lead_h * 0.4 * (1 / Math.max(0.5, uncertaintyMultiplier)))),
      };
    });
  }

  // --- STORM 2: TC-VEER ---
  if (stormId === 'TC-VEER') {
    // Current center: 17.2N, 68.4E
    // Moves North-East
    const baseTrack = [
      { lead_h: 0, dLat: 0.0, dLon: 0.0, wind: 45, pressure: 990 },
      { lead_h: 6, dLat: 0.3, dLon: 0.4, wind: 48, pressure: 988 },
      { lead_h: 12, dLat: 0.6, dLon: 0.8, wind: 50, pressure: 986 },
      { lead_h: 24, dLat: 1.3, dLon: 1.5, wind: 52, pressure: 984 },
      { lead_h: 48, dLat: 2.5, dLon: 2.8, wind: 55, pressure: 980 },
      { lead_h: 72, dLat: 3.6, dLon: 4.0, wind: 58, pressure: 976 },
    ];
    return baseTrack.map((pt) => {
      const spread = pt.lead_h * 0.4 * uncertaintyMultiplier;
      return {
        lead_h: pt.lead_h,
        lat: parseFloat((17.2 + pt.dLat).toFixed(2)),
        lon: parseFloat((68.4 + pt.dLon).toFixed(2)),
        wind_p50: pt.wind,
        wind_p10: Math.max(15, Math.round(pt.wind - spread - 3)),
        wind_p90: Math.round(pt.wind + spread + 3),
        pressure: pt.pressure,
        confidence: Math.max(25, Math.round(84 - pt.lead_h * 0.5)),
      };
    });
  }

  // --- STORM 3: TC-MAYA ---
  if (stormId === 'TC-MAYA') {
    // Current center: 8.5N, 87.2E
    // Moves West
    const baseTrack = [
      { lead_h: 0, dLat: 0.0, dLon: 0.0, wind: 30, pressure: 1002 },
      { lead_h: 6, dLat: 0.1, dLon: -0.6, wind: 32, pressure: 1000 },
      { lead_h: 12, dLat: 0.2, dLon: -1.2, wind: 35, pressure: 997 },
      { lead_h: 24, dLat: 0.4, dLon: -2.3, wind: 40, pressure: 993 },
      { lead_h: 48, dLat: 0.7, dLon: -4.5, wind: 48, pressure: 987 },
      { lead_h: 72, dLat: 1.0, dLon: -6.5, wind: 56, pressure: 980 },
    ];
    return baseTrack.map((pt) => {
      const spread = pt.lead_h * 0.45 * uncertaintyMultiplier;
      return {
        lead_h: pt.lead_h,
        lat: parseFloat((8.5 + pt.dLat).toFixed(2)),
        lon: parseFloat((87.2 + pt.dLon).toFixed(2)),
        wind_p50: pt.wind,
        wind_p10: Math.max(10, Math.round(pt.wind - spread - 4)),
        wind_p90: Math.round(pt.wind + spread + 4),
        pressure: pt.pressure,
        confidence: Math.max(20, Math.round(76 - pt.lead_h * 0.6)),
      };
    });
  }

  // Default fallback
  return [];
}

// ============================================================================
// DATA HEALTH MOCK BUILDER
// ============================================================================

export function getDataHealth(): DataHealth {
  const mods = simState.modalityStatus;
  
  // Calculate average quality score
  let totalScore = 0;
  const sources = [
    {
      source: 'INSAT-3D IR',
      status: mods.ir,
      lastObservation: mods.ir === 'AVAILABLE' ? '14:30 UTC' : '13:45 UTC',
      age: mods.ir === 'AVAILABLE' ? '02m' : '47m',
      quality: mods.ir === 'AVAILABLE' ? 98 : mods.ir === 'STALE' ? 65 : 0,
      priority: 'P0' as const,
    },
    {
      source: 'INSAT-3DR VIS',
      status: mods.ir === 'AVAILABLE' ? 'AVAILABLE' as const : mods.ir,
      lastObservation: mods.ir === 'AVAILABLE' ? '14:28 UTC' : '13:40 UTC',
      age: mods.ir === 'AVAILABLE' ? '04m' : '52m',
      quality: mods.ir === 'AVAILABLE' ? 96 : mods.ir === 'STALE' ? 60 : 0,
      priority: 'P0' as const,
    },
    {
      source: 'MICROWAVE (AMSR2/GMI)',
      status: mods.microwave,
      lastObservation: mods.microwave === 'AVAILABLE' ? '13:48 UTC' : '--',
      age: mods.microwave === 'AVAILABLE' ? '44m' : '--',
      quality: mods.microwave === 'AVAILABLE' ? 71 : 0,
      priority: 'P1' as const,
    },
    {
      source: 'SCATTEROMETER (ASCAT)',
      status: mods.scatterometer,
      lastObservation: mods.scatterometer === 'AVAILABLE' ? '14:12 UTC' : '--',
      age: mods.scatterometer === 'AVAILABLE' ? '20m' : '--',
      quality: mods.scatterometer === 'AVAILABLE' ? 89 : 0,
      priority: 'P1' as const,
    },
    {
      source: 'SST (MODIS/AMSR2)',
      status: mods.sst,
      lastObservation: mods.sst === 'AVAILABLE' ? '13:00 UTC' : '--',
      age: mods.sst === 'AVAILABLE' ? '1h 32m' : '--',
      quality: mods.sst === 'AVAILABLE' ? 94 : 0,
      priority: 'P1' as const,
    },
    {
      source: 'ENVIRONMENT (NWP Shear/Moisture)',
      status: mods.environment,
      lastObservation: mods.environment === 'AVAILABLE' ? '12:00 UTC' : '08:00 UTC',
      age: mods.environment === 'AVAILABLE' ? '2h 32m' : '6h 32m',
      quality: mods.environment === 'AVAILABLE' ? 91 : mods.environment === 'DEGRADED' ? 55 : 0,
      priority: 'P1' as const,
    },
  ];

  let activeCount = 0;
  sources.forEach((s) => {
    if (s.status !== 'MISSING') {
      totalScore += s.quality;
      activeCount++;
    }
  });

  const overallScore = activeCount > 0 ? Math.round(totalScore / activeCount) : 0;

  return {
    score: overallScore,
    latency: mods.ir === 'AVAILABLE' ? '02m 18s' : '47m 12s',
    lastIngest: mods.ir === 'AVAILABLE' ? '14:30 UTC' : '13:45 UTC',
    sources,
  };
}

// ============================================================================
// ALERTS MOCK BUILDER
// ============================================================================

export function getAlerts(): Alert[] {
  const scenario = simState.currentScenario;
  const mods = simState.modalityStatus;
  const list: Alert[] = [];

  // 1. Check for rapid intensification
  if (scenario === 'RAPID_INTENSIFICATION') {
    list.push({
      id: 'A-RI-01',
      level: 'CRITICAL',
      type: 'RAPID_INTENSIFICATION_WATCH',
      title: 'RAPID INTENSIFICATION CONFIRMED',
      stormId: 'TC-ARUN',
      detail: 'TC-ARUN rapid intensification probability is 92%. Core structure exhibits clear symmetry and high eyewall temperature gradients.',
      timestamp: '14:20 UTC',
      prob: 92,
    });
  } else if (scenario === 'NORMAL' || scenario === 'LAND_INTERACTION' || scenario === 'SATELLITE_GAP' || scenario === 'MISSING_MICROWAVE') {
    list.push({
      id: 'A-RI-02',
      level: 'CRITICAL',
      type: 'RAPID_INTENSIFICATION_WATCH',
      title: 'RAPID INTENSIFICATION WATCH',
      stormId: 'TC-ARUN',
      detail: 'TC-ARUN rapid intensification probability has exceeded the 60% prototype threshold (currently 64%). Favorable upper-level environment.',
      timestamp: '14:20 UTC',
      prob: 64,
    });
  }

  // 2. Check for land interaction risk
  if (scenario === 'LAND_INTERACTION') {
    list.push({
      id: 'A-LI-01',
      level: 'WARNING',
      type: 'LAND_INTERACTION',
      title: 'COASTAL INTERACTION IMMINENT',
      stormId: 'TC-ARUN',
      detail: 'TC-ARUN forecast track envelope intersects with the Odisha coastline near Gopalpur within 24 hours. High storm surge vulnerability.',
      timestamp: '14:15 UTC',
    });
  }

  // 3. Genesis watches
  list.push({
    id: 'A-GEN-01',
    level: 'WATCH',
    type: 'GENESIS_POTENTIAL',
    title: 'GENESIS POTENTIAL DETECTED',
    stormId: 'TC-MAYA',
    detail: 'Bay of Bengal disturbance (TC-MAYA) shows 71% genesis probability within 24-48 hours. Convective persistence is high.',
    timestamp: '12:58 UTC',
    prob: 71,
  });

  // 4. Modality / Sensor failures
  if (mods.microwave === 'MISSING') {
    list.push({
      id: 'A-SEN-MW',
      level: 'INFO',
      type: 'SENSOR_DEGRADATION',
      title: 'MICROWAVE OBSERVATION AGE EXCEEDED',
      detail: 'Passive microwave stream (AMSR2/GMI) offline or unavailable. Track and intensity uncertainty cones slightly expanded.',
      timestamp: '14:10 UTC',
    });
  }
  if (mods.scatterometer === 'MISSING') {
    list.push({
      id: 'A-SEN-SC',
      level: 'INFO',
      type: 'SENSOR_DEGRADATION',
      title: 'SCATTEROMETER SURFACE WINDS OFFLINE',
      detail: 'ASCAT wind retrieval data delayed or unavailable. Wind radii estimation uncertainty increased.',
      timestamp: '14:02 UTC',
    });
  }
  if (mods.ir === 'STALE') {
    list.push({
      id: 'A-SEN-IR',
      level: 'CRITICAL',
      type: 'SENSOR_DEGRADATION',
      title: 'CRITICAL SAT DATA STALE (INSAT IR)',
      detail: 'INSAT geostationary IR satellite data stream is stale by 47 minutes. System operating in degraded fallback mode.',
      timestamp: '14:32 UTC',
    });
  }

  // 5. Model OOD
  if (scenario === 'OOD_CASE') {
    list.push({
      id: 'A-OOD-01',
      level: 'WARNING',
      type: 'OOD_STATE',
      title: 'MODEL OUT-OF-DISTRIBUTION WARNING',
      detail: 'Environmental input anomaly detected (SST parameters exceed training limits at 34°C). Model confidence score suppressed.',
      timestamp: '14:28 UTC',
    });
  }

  // 6. Insufficient evidence
  if (scenario === 'POOR_DATA') {
    list.push({
      id: 'A-IE-01',
      level: 'WARNING',
      type: 'INSUFFICIENT_EVIDENCE',
      title: 'INSUFFICIENT FORECAST EVIDENCE',
      detail: 'Multiple primary sensor streams offline. Forecast confidence is below operational threshold. Active forecasts suppressed.',
      timestamp: '14:32 UTC',
    });
  }

  return list;
}

// ============================================================================
// EXPLAINABLE AI MOCK BUILDER
// ============================================================================

export function getExplanation(stormId: string): Explanation {
  const scenario = simState.currentScenario;
  const mods = simState.modalityStatus;

  // Base contributions
  let ir = 38;
  let wv = 21;
  let sst = 17;
  let wind = 14;
  let env = 10;

  if (mods.microwave === 'MISSING') {
    // Re-weight contribution because microwave went offline
    ir = 48;
    wv = 26;
    sst = 13;
    wind = 5; // scatterometer/IR estimation takes over
    env = 8;
  }

  let modelEvidence = [
    'Strong convective organization and symmetric structure detected around estimated center.',
    'Warm sea surface conditions (29.5°C) in the Bay of Bengal support continued moisture supply.',
    'Low vertical wind shear (< 10 KT) along the forecast track path allows vertical structure maintenance.',
    'Temporal animation shows a contraction of the central dense overcast (CDO), hinting at strengthening.'
  ];

  if (scenario === 'RAPID_INTENSIFICATION') {
    modelEvidence = [
      'Very strong convective burst and symmetric eyewall thermal signature detected in IR channel.',
      'SST remains highly supportive at 30.2°C, coupled with high upper-level outflow diagnostics.',
      'Model identifies classical eye opening trend in geostationary visual and microwave loops.',
      'Extreme intensification triggers model consensus: wind speeds expected to exceed 95 KT.'
    ];
  } else if (scenario === 'WEAK_DISTURBANCE') {
    modelEvidence = [
      'Convection remains disorganized and sheared to the west of the estimated center.',
      'Dry air intrusion detected in the western periphery from water vapor channel analysis.',
      'Symmetry index is low (50%), indicating a weak baroclinic organization rather than mature core.',
    ];
  } else if (scenario === 'OOD_CASE') {
    modelEvidence = [
      'SST readings of 34.0°C represent an extreme climatological anomaly in this basin.',
      'Model detects anomalous heat flux signals, flag triggers Out-of-Distribution status.',
      'Uncertainty limits are expanded to protect against non-linear physical interactions.'
    ];
  }

  return {
    stormId,
    modalityContributions: {
      irCloud: ir,
      waterVapor: wv,
      sst,
      windField: wind,
      environment: env,
    },
    modelEvidence,
    temporalInfluence: [
      { frame: 'T-12H', influence: 'LOW' },
      { frame: 'T-6H', influence: 'HIGH' },
      { frame: 'T-3H', influence: 'HIGH' },
      { frame: 'T0', influence: 'VERY HIGH' },
    ],
  };
}

// ============================================================================
// HISTORICAL REPLAY MOCK DATA
// ============================================================================

export function getHistoricalStorms(): HistoricalStorm[] {
  // Let's build a timeline for TC-ARUN
  // T-48H to T+48H
  const arunReplay: HistoricalStorm = {
    id: 'TC-ARUN',
    name: 'TC-ARUN (2026)',
    states: [
      {
        timestamp: '26 Aug 2026 14:32 UTC',
        timeOffset: 'T-48H',
        lat: 11.5,
        lon: 90.2,
        wind: 25,
        pressure: 1006,
        classification: 'LOW PRESSURE AREA',
        organization: 25,
        symmetry: 20,
        eyeSignature: 'NOT DETECTED',
        actualLat: 11.4,
        actualLon: 90.1,
        actualWind: 25,
        actualPressure: 1006,
        forecastPoints: [
          { lead_h: 6, lat: 11.8, lon: 89.6, wind_p10: 20, wind_p50: 28, wind_p90: 35, pressure: 1004, confidence: 90 },
          { lead_h: 12, lat: 12.1, lon: 89.0, wind_p10: 22, wind_p50: 30, wind_p90: 40, pressure: 1002, confidence: 85 },
          { lead_h: 24, lat: 12.8, lon: 87.8, wind_p10: 25, wind_p50: 35, wind_p90: 50, pressure: 998, confidence: 75 },
          { lead_h: 48, lat: 14.2, lon: 85.5, wind_p10: 30, wind_p50: 45, wind_p90: 65, pressure: 990, confidence: 60 },
          { lead_h: 72, lat: 15.8, lon: 83.5, wind_p10: 35, wind_p50: 55, wind_p90: 80, pressure: 980, confidence: 45 }
        ]
      },
      {
        timestamp: '27 Aug 2026 02:32 UTC',
        timeOffset: 'T-36H',
        lat: 12.2,
        lon: 89.0,
        wind: 35,
        pressure: 1000,
        classification: 'DEPRESSION',
        organization: 38,
        symmetry: 32,
        eyeSignature: 'NOT DETECTED',
        actualLat: 12.3,
        actualLon: 88.9,
        actualWind: 35,
        actualPressure: 1000,
        forecastPoints: [
          { lead_h: 6, lat: 12.6, lon: 88.3, wind_p10: 30, wind_p50: 38, wind_p90: 45, pressure: 998, confidence: 92 },
          { lead_h: 12, lat: 13.0, lon: 87.6, wind_p10: 32, wind_p50: 42, wind_p90: 52, pressure: 995, confidence: 87 },
          { lead_h: 24, lat: 13.8, lon: 86.2, wind_p10: 36, wind_p50: 48, wind_p90: 62, pressure: 990, confidence: 78 },
          { lead_h: 48, lat: 15.4, lon: 83.8, wind_p10: 42, wind_p50: 62, wind_p90: 82, pressure: 978, confidence: 62 },
          { lead_h: 72, lat: 17.2, lon: 81.8, wind_p10: 48, wind_p50: 75, wind_p90: 100, pressure: 966, confidence: 46 }
        ]
      },
      {
        timestamp: '27 Aug 2026 14:32 UTC',
        timeOffset: 'T-24H',
        lat: 13.0,
        lon: 87.5,
        wind: 48,
        pressure: 992,
        classification: 'CYCLONIC STORM',
        organization: 55,
        symmetry: 46,
        eyeSignature: 'NOT DETECTED',
        actualLat: 13.1,
        actualLon: 87.4,
        actualWind: 50,
        actualPressure: 991,
        forecastPoints: [
          { lead_h: 6, lat: 13.5, lon: 86.8, wind_p10: 42, wind_p50: 52, wind_p90: 62, pressure: 988, confidence: 93 },
          { lead_h: 12, lat: 14.0, lon: 86.1, wind_p10: 45, wind_p50: 56, wind_p90: 68, pressure: 985, confidence: 89 },
          { lead_h: 24, lat: 15.0, lon: 84.7, wind_p10: 52, wind_p50: 66, wind_p90: 82, pressure: 978, confidence: 80 },
          { lead_h: 48, lat: 17.2, lon: 82.5, wind_p10: 60, wind_p50: 82, wind_p90: 105, pressure: 964, confidence: 64 },
          { lead_h: 72, lat: 19.5, lon: 81.0, wind_p10: 65, wind_p50: 95, wind_p90: 125, pressure: 950, confidence: 48 }
        ]
      },
      {
        timestamp: '28 Aug 2026 02:32 UTC',
        timeOffset: 'T-12H',
        lat: 14.2,
        lon: 86.0,
        wind: 62,
        pressure: 982,
        classification: 'SEVERE CYCLONIC STORM',
        organization: 74,
        symmetry: 60,
        eyeSignature: 'NOT DETECTED',
        actualLat: 14.3,
        actualLon: 85.9,
        actualWind: 65,
        actualPressure: 980,
        forecastPoints: [
          { lead_h: 6, lat: 14.8, lon: 85.2, wind_p10: 56, wind_p50: 68, wind_p90: 78, pressure: 978, confidence: 94 },
          { lead_h: 12, lat: 15.4, lon: 84.5, wind_p10: 60, wind_p50: 74, wind_p90: 86, pressure: 974, confidence: 90 },
          { lead_h: 24, lat: 16.6, lon: 83.2, wind_p10: 68, wind_p50: 84, wind_p90: 102, pressure: 965, confidence: 82 },
          { lead_h: 48, lat: 19.0, lon: 81.4, wind_p10: 75, wind_p50: 100, wind_p90: 125, pressure: 948, confidence: 66 },
          { lead_h: 72, lat: 21.5, lon: 80.8, wind_p10: 60, wind_p50: 105, wind_p90: 135, pressure: 942, confidence: 50 }
        ]
      },
      {
        timestamp: '28 Aug 2026 14:32 UTC',
        timeOffset: 'T0',
        lat: 15.8,
        lon: 84.6,
        wind: 78,
        pressure: 972,
        classification: 'VERY SEVERE CYCLONIC STORM',
        organization: 87,
        symmetry: 72,
        eyeSignature: 'DETECTED',
        actualLat: 15.8,
        actualLon: 84.6,
        actualWind: 78,
        actualPressure: 972,
        forecastPoints: [
          { lead_h: 6, lat: 16.4, lon: 84.2, wind_p10: 72, wind_p50: 80, wind_p90: 88, pressure: 970, confidence: 95 },
          { lead_h: 12, lat: 17.0, lon: 83.8, wind_p10: 74, wind_p50: 82, wind_p90: 92, pressure: 968, confidence: 91 },
          { lead_h: 24, lat: 18.4, lon: 83.1, wind_p10: 78, wind_p50: 88, wind_p90: 102, pressure: 962, confidence: 84 },
          { lead_h: 48, lat: 20.8, lon: 81.6, wind_p10: 85, wind_p50: 102, wind_p90: 122, pressure: 948, confidence: 68 },
          { lead_h: 72, lat: 23.2, lon: 80.8, wind_p10: 70, wind_p50: 110, wind_p90: 135, pressure: 940, confidence: 52 }
        ]
      },
      {
        timestamp: '29 Aug 2026 02:32 UTC',
        timeOffset: 'T+12H',
        lat: 17.0,
        lon: 83.8,
        wind: 84,
        pressure: 966,
        classification: 'VERY SEVERE CYCLONIC STORM',
        organization: 90,
        symmetry: 78,
        eyeSignature: 'DETECTED',
        actualLat: 17.1,
        actualLon: 83.7,
        actualWind: 85,
        actualPressure: 965,
        forecastPoints: [
          { lead_h: 6, lat: 17.6, lon: 83.4, wind_p10: 78, wind_p50: 88, wind_p90: 96, pressure: 962, confidence: 94 },
          { lead_h: 12, lat: 18.3, lon: 83.0, wind_p10: 80, wind_p50: 92, wind_p90: 104, pressure: 959, confidence: 90 },
          { lead_h: 24, lat: 19.8, lon: 82.2, wind_p10: 84, wind_p50: 98, wind_p90: 115, pressure: 952, confidence: 82 },
          { lead_h: 48, lat: 22.4, lon: 81.2, wind_p10: 70, wind_p50: 108, wind_p90: 130, pressure: 942, confidence: 65 },
          { lead_h: 72, lat: 25.0, lon: 80.8, wind_p10: 45, wind_p50: 80, wind_p90: 115, pressure: 965, confidence: 48 }
        ]
      },
      {
        timestamp: '29 Aug 2026 14:32 UTC',
        timeOffset: 'T+24H',
        lat: 18.5,
        lon: 83.0,
        wind: 92,
        pressure: 958,
        classification: 'EXTREMELY SEVERE CYCLONIC STORM',
        organization: 93,
        symmetry: 82,
        eyeSignature: 'DETECTED',
        actualLat: 18.6,
        actualLon: 82.9,
        actualWind: 96,
        actualPressure: 955,
        forecastPoints: [
          { lead_h: 6, lat: 19.2, lon: 82.6, wind_p10: 85, wind_p50: 96, wind_p90: 105, pressure: 954, confidence: 93 },
          { lead_h: 12, lat: 19.9, lon: 82.2, wind_p10: 88, wind_p50: 100, wind_p90: 112, pressure: 950, confidence: 89 },
          { lead_h: 24, lat: 21.4, lon: 81.4, wind_p10: 80, wind_p50: 105, wind_p90: 124, pressure: 945, confidence: 81 },
          { lead_h: 48, lat: 24.2, lon: 80.8, wind_p10: 50, wind_p50: 85, wind_p90: 115, pressure: 962, confidence: 62 },
          { lead_h: 72, lat: 26.8, lon: 81.2, wind_p10: 30, wind_p50: 50, wind_p90: 80, pressure: 988, confidence: 44 }
        ]
      },
      {
        timestamp: '30 Aug 2026 14:32 UTC',
        timeOffset: 'T+48H',
        lat: 21.6,
        lon: 81.5,
        wind: 102,
        pressure: 945,
        classification: 'SUPER CYCLONIC STORM',
        organization: 96,
        symmetry: 87,
        eyeSignature: 'DETECTED',
        actualLat: 22.0,
        actualLon: 81.2,
        actualWind: 108,
        actualPressure: 939,
        forecastPoints: [
          { lead_h: 6, lat: 22.3, lon: 81.2, wind_p10: 92, wind_p50: 105, wind_p90: 115, pressure: 942, confidence: 91 },
          { lead_h: 12, lat: 23.0, lon: 80.9, wind_p10: 85, wind_p50: 108, wind_p90: 122, pressure: 940, confidence: 86 },
          { lead_h: 24, lat: 24.5, lon: 80.6, wind_p10: 60, wind_p50: 90, wind_p90: 115, pressure: 955, confidence: 76 },
          { lead_h: 48, lat: 27.2, lon: 81.0, wind_p10: 30, wind_p50: 45, wind_p90: 70, pressure: 990, confidence: 55 },
          { lead_h: 72, lat: 29.8, lon: 82.0, wind_p10: 20, wind_p50: 30, wind_p90: 45, pressure: 1004, confidence: 35 }
        ]
      }
    ]
  };

  const veerReplay: HistoricalStorm = {
    id: 'TC-VEER',
    name: 'TC-VEER (2026)',
    states: arunReplay.states.map((s) => ({
      ...s,
      lat: parseFloat((s.lat + 1.4).toFixed(2)),
      lon: parseFloat((s.lon - 16.2).toFixed(2)),
      actualLat: s.actualLat ? parseFloat((s.actualLat + 1.4).toFixed(2)) : undefined,
      actualLon: s.actualLon ? parseFloat((s.actualLon - 16.2).toFixed(2)) : undefined,
      classification: 'CYCLONIC STORM',
      wind: Math.round(s.wind * 0.6 + 10),
      pressure: Math.round(s.pressure * 0.4 + 600),
      eyeSignature: 'NOT DETECTED',
    }))
  };

  return [arunReplay, veerReplay];
}

// ============================================================================
// METRICS AND TECHNICAL DATA
// ============================================================================

export function getModelPerformance(): ModelPerformance {
  return {
    detectionF1: '91.4% (DEMO / VALIDATION PLACEHOLDER)',
    segmentationDice: '87.2% (DEMO / VALIDATION PLACEHOLDER)',
    intensityMAE: '5.4 KT (DEMO / VALIDATION PLACEHOLDER)',
    intensityRMSE: '7.1 KT (DEMO / VALIDATION PLACEHOLDER)',
    trackError: {
      '6h': '18.2 km',
      '12h': '29.5 km',
      '24h': '42.1 km',
      '48h': '76.4 km',
      '72h': '124.8 km',
    },
    genesisCalibration: '0.94 Reliability Score (DEMO / VALIDATION PLACEHOLDER)',
    brierScore: '0.12 (DEMO / VALIDATION PLACEHOLDER)',
    uncertaintyCoverage: '92.1% of points inside P10-P90 (DEMO)',
    operationalLatency: '2.0s Total Inference Time',
    memoryUsage: '3.4 GB GPU VRAM (FP16 Quantized Model)',
  };
}

export function getModelVersion(): ModelVersion {
  return {
    id: 'TC-INTEL FUSION v0.9',
    status: 'CHAMPION',
    datasetVersion: 'IMD-NIO-SATELLITE-DB-v3',
    preprocessingVersion: 'GRID-RESAMPLE-GEOALIGN-v2',
    gitCommit: '7d3a1f8b3c8e9',
    inferenceConfig: 'HYBRID-FUSION-CONF-v1.4',
  };
}

// ============================================================================
// SIMULATION WORKFLOWS / CONTROLS
// ============================================================================

export function runAnalysis(onProgress: (step: string, percent: number) => void): Promise<void> {
  simState.analysisStatus = 'PROCESSING';
  notifyListeners();

  const steps = [
    'INGESTING OBSERVATIONS',
    'QUALITY CONTROL',
    'TIME ALIGNMENT',
    'STORM DETECTION',
    'SEGMENTATION',
    'CENTER ESTIMATION',
    'MULTIMODAL FUSION',
    'INTENSITY PREDICTION',
    'TRACK FORECAST',
    'WIND FIELD',
    'UNCERTAINTY',
    'CONSISTENCY CHECK',
    'RISK ANALYSIS',
    'ANALYSIS COMPLETE'
  ];

  return new Promise((resolve) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < steps.length) {
        onProgress(steps[index], Math.round(((index + 1) / steps.length) * 100));
        index++;
      } else {
        clearInterval(interval);
        simState.analysisStatus = simState.currentScenario === 'POOR_DATA' ? 'INSUFFICIENT_EVIDENCE' : 'COMPLETE';
        simState.lastAnalysisTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';
        notifyListeners();
        resolve();
      }
    }, 150); // total 2.1 seconds
  });
}

export function saveAnnotation(annotation: Omit<Annotation, 'timestamp'>) {
  const newAnnotation: Annotation = {
    ...annotation,
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC',
  };
  simState.customAnnotations.push(newAnnotation);
  notifyListeners();
}

export function exportForecastReport(stormId: string, format: 'txt' | 'json'): string {
  const storm = getActiveStorms().find((s) => s.id === stormId);
  const forecast = getForecast(stormId);
  const health = getDataHealth();
  const expl = getExplanation(stormId);

  if (!storm) return 'Storm not found';

  const dataObj = {
    storm_id: storm.id,
    name: storm.name,
    analysis_time: simState.lastAnalysisTime,
    current: {
      center: { lat: storm.lat, lon: storm.lon },
      wind_kt: storm.wind,
      pressure_hpa: storm.pressure,
      class: storm.classification,
      confidence: storm.confidence,
    },
    forecast: forecast.map((f) => ({
      lead_h: f.lead_h,
      lat: f.lat,
      lon: f.lon,
      wind_p10: f.wind_p10,
      wind_p50: f.wind_p50,
      wind_p90: f.wind_p90,
      pressure: f.pressure,
    })),
    modalities_used: Object.entries(simState.modalityStatus)
      .filter(([_, v]) => v === 'AVAILABLE')
      .map(([k]) => k.toUpperCase()),
    missing_modalities: Object.entries(simState.modalityStatus)
      .filter(([_, v]) => v !== 'AVAILABLE')
      .map(([k, v]) => `${k.toUpperCase()} (${v})`),
    model_version: getModelVersion().id,
    disclaimer: 'AI-assisted decision support. Not a replacement for official meteorological guidance.',
  };

  if (format === 'json') {
    return JSON.stringify(dataObj, null, 2);
  }

  // Text Report format
  return `------------------------------------------------------------
TC-INTEL INDIA: FORECAST REPORT
------------------------------------------------------------
Generated: ${simState.lastAnalysisTime} (UTC)
Model Version: ${dataObj.model_version}
------------------------------------------------------------
STORM IDENTITY: ${storm.name} (${storm.id})
CLASSIFICATION: ${storm.classification}
STATUS: ${storm.status}

CURRENT POSITION: ${storm.lat}°N / ${storm.lon}°E
INTENSITY (MAX SUSTAINED WIND): ${storm.wind} KT
ESTIMATED CENTRAL PRESSURE: ${storm.pressure} HPA
CURRENT MOVEMENT: ${storm.movement}
AI RETRIEVAL CONFIDENCE: ${storm.confidence}%

TEMPORAL DYNAMICS:
Genesis Probability: ${storm.genesisProb}%
Rapid Intensification (RI) Prob: ${storm.rapidIntensificationProb}%
Structure Trend: ${storm.structureTrend}

------------------------------------------------------------
TRACK & INTENSITY FORECAST (ASSISTIVE AI ESTIMATION)
------------------------------------------------------------
HORIZON  |  LAT   |  LON   |  WIND P10  |  WIND P50  |  WIND P90  |  PRESSURE (HPA)
------------------------------------------------------------
${forecast
  .map(
    (f) =>
      `${f.lead_h.toString().padEnd(8)}|  ${f.lat.toFixed(1).padEnd(6)}|  ${f.lon.toFixed(1).padEnd(6)}|  ${f.wind_p10
        .toString()
        .padEnd(9)}|  ${f.wind_p50.toString().padEnd(9)}|  ${f.wind_p90.toString().padEnd(9)}|  ${f.pressure}`
  )
  .join('\n')}
------------------------------------------------------------
DATA HEALTH & INGESTION STATUS:
Overall Data Quality: ${health.score}%
Latencies: ${health.latency}
Missing Modalities: ${dataObj.missing_modalities.join(', ') || 'None'}

AI ATTENTION ANALYSIS:
${expl.modelEvidence.map((e) => `- ${e}`).join('\n')}

------------------------------------------------------------
DISCLAIMER:
AI-assisted decision-support products. This is a hackathon prototype
and does NOT represent official government warning authority.
------------------------------------------------------------`;
}
