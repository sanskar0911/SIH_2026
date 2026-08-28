export type StormStatus = 'ACTIVE' | 'WATCH' | 'CANDIDATE';

export interface Storm {
  id: string;
  name: string;
  classification: string;
  status: StormStatus;
  lat: number;
  lon: number;
  wind: number; // in KT
  pressure: number; // in HPA
  movement: string; // e.g. "NW 12 KM/H"
  confidence: number; // percentage (0-100)
  genesisProb: number; // percentage (0-100)
  rapidIntensificationProb: number; // percentage (0-100)
  trackConfidence: number; // percentage (0-100)
  landInteraction: 'LOW' | 'MODERATE' | 'HIGH';
  organization: number; // percentage (0-100)
  symmetry: number; // percentage (0-100)
  eyeSignature: 'DETECTED' | 'NOT DETECTED';
  eyewallConfidence: number; // percentage (0-100)
  structureTrend: 'STRENGTHENING' | 'STEADY' | 'WEAKENING';
  asymmetry: number; // percentage (0-100)
}

export interface ForecastPoint {
  lead_h: number; // 6, 12, 24, 48, 72
  lat: number;
  lon: number;
  wind_p10: number;
  wind_p50: number;
  wind_p90: number;
  pressure: number;
  confidence: number;
}

export type ModalityStatus = 'AVAILABLE' | 'DEGRADED' | 'STALE' | 'MISSING' | 'UNRELIABLE';

export interface SourceHealth {
  source: string;
  status: ModalityStatus;
  lastObservation: string; // e.g. "14:30 UTC"
  age: string; // e.g. "02m"
  quality: number; // percentage (0-100)
  priority: 'P0' | 'P1' | 'P2';
}

export interface DataHealth {
  score: number; // overall percentage (e.g. 94%)
  latency: string; // "02m 18s"
  lastIngest: string; // "14:30 UTC"
  sources: SourceHealth[];
}

export interface Alert {
  id: string;
  level: 'CRITICAL' | 'WARNING' | 'WATCH' | 'INFO';
  type: string; // e.g. "RAPID_INTENSIFICATION_WATCH"
  title: string;
  stormId?: string;
  detail: string;
  timestamp: string;
  prob?: number;
}

export interface ModalityContributions {
  irCloud: number;
  waterVapor: number;
  sst: number;
  windField: number;
  environment: number;
}

export interface Explanation {
  stormId: string;
  modalityContributions: ModalityContributions;
  visualEvidenceUrl?: string; // local procedural overlay identifier
  modelEvidence: string[];
  temporalInfluence: {
    frame: string; // e.g. "T-12H", "T-6H", "T-3H", "T0"
    influence: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH';
  }[];
}

export interface HistoricalState {
  timestamp: string;
  timeOffset: string; // e.g. "T-24H", "T0"
  lat: number;
  lon: number;
  wind: number;
  pressure: number;
  classification: string;
  organization: number;
  symmetry: number;
  eyeSignature: 'DETECTED' | 'NOT DETECTED';
  forecastPoints: ForecastPoint[];
  actualLat?: number;
  actualLon?: number;
  actualWind?: number;
  actualPressure?: number;
}

export interface HistoricalStorm {
  id: string;
  name: string;
  states: HistoricalState[];
}

export interface Annotation {
  stormId: string;
  timestamp: string;
  observedIssue: string;
  correctedCenterLat: number;
  correctedCenterLon: number;
  correctedClass: string;
  comment: string;
}

export interface ModelPerformance {
  detectionF1: string;
  segmentationDice: string;
  intensityMAE: string;
  intensityRMSE: string;
  trackError: {
    '6h': string;
    '12h': string;
    '24h': string;
    '48h': string;
    '72h': string;
  };
  genesisCalibration: string;
  brierScore: string;
  uncertaintyCoverage: string;
  operationalLatency: string;
  memoryUsage: string;
}

export interface ModelVersion {
  id: string;
  status: 'CHAMPION' | 'CHALLENGER';
  datasetVersion: string;
  preprocessingVersion: string;
  gitCommit: string;
  inferenceConfig: string;
}
