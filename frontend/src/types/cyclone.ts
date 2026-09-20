export type ViewMode =
  | 'overview'
  | 'live_intelligence'
  | 'cyclone_detection'
  | 'genesis_watch'
  | 'forecast'
  | 'storm_analysis'
  | 'satellite_data'
  | 'historical_replay'
  | 'alerts'
  | 'explainability'
  | 'model_performance'
  | 'data_health'
  | 'analyst_feedback'
  | 'system_architecture';

export type CycloneClass =
  | 'TROPICAL DEPRESSION'
  | 'DEEP DEPRESSION'
  | 'CYCLONIC STORM'
  | 'SEVERE CYCLONIC STORM'
  | 'VERY SEVERE CYCLONIC STORM'
  | 'EXTREMELY SEVERE CYCLONIC STORM'
  | 'SUPER CYCLONIC STORM';

export type SeverityLevel = 'LOW' | 'WATCH' | 'HIGH' | 'CRITICAL';

export interface StormCenter {
  lat: number;
  lng: number;
}

export interface WindRadii {
  r34_nm: number; // 34-knot wind radius
  r50_nm: number; // 50-knot wind radius
  r64_nm: number; // 64-knot wind radius
}

export interface QuadrantRadii {
  NE: number;
  SE: number;
  SW: number;
  NW: number;
}

export interface ThresholdRadii {
  r34_nm: QuadrantRadii;
  r50_nm: QuadrantRadii;
  r64_nm: QuadrantRadii;
}

export interface WindFieldResponse {
  storm_id: string;
  timestamp: string;
  center: StormCenter;
  max_wind_kts: number;
  forecast_hour: number;
  data_source: string;
  is_mock: boolean;
  radii: ThresholdRadii;
  geojson: {
    type: string;
    features: Array<{
      type: string;
      geometry: {
        type: string;
        coordinates: number[][][];
      };
      properties: {
        threshold_kts: number;
        wind_speed_kts: number;
        radii_nm: QuadrantRadii;
        data_source: string;
      };
    }>;
  };
}

export interface ForecastPoint {
  horizon: '+6h' | '+12h' | '+24h' | '+48h' | '+72h';
  hours: number;
  lat: number;
  lng: number;
  windP10: number;
  windP50: number;
  windP90: number;
  pressureHpa: number;
  confidence: number;
  predictionIntervalKm: number;
}

export interface EnsembleMember {
  id: string;
  name: string;
  color: string;
  points: { lat: number; lng: number; wind: number }[];
}

export interface Storm {
  storm_id: string;
  name: string;
  basin: string;
  timestamp: string; // UTC ISO
  center: StormCenter;
  wind_kts: number;
  pressure_hpa: number;
  category: CycloneClass;
  confidence: number; // e.g. 91%
  movement_dir: string; // e.g. "NE"
  movement_speed_kmh: number;
  rapid_intensification_risk: number; // e.g. 67%
  genesis_probability: number; // e.g. 82%
  wind_radii: WindRadii;
  coastal_distance_km: number;
  nearest_landfall_point: string;
  estimated_landfall_time?: string;
  observed_track: { lat: number; lng: number; wind: number; pressure: number; timestamp: string }[];
  forecast_track: ForecastPoint[];
  ensemble_trajectories: EnsembleMember[];
  data_quality: 'EXCELLENT' | 'GOOD' | 'DEGRADED' | 'CRITICAL';
}

export interface GenesisCandidate {
  candidate_id: string;
  basin: string;
  center: StormCenter;
  probability_24h: number;
  probability_48h: number;
  expected_time_to_genesis: string;
  persistence_hours: number;
  environmental_score: number; // 0-100
  sea_surface_temp_c: number;
  vertical_wind_shear_kts: number;
  relative_humidity_pct: number;
  vorticity: number;
  status: SeverityLevel;
}

export interface Modality {
  id: string;
  name: string;
  sensor_type: string;
  available: boolean;
  timestamp: string;
  age_minutes: number;
  quality_score: number; // 0-100
  contribution_percent: number;
  resolution_km: number;
}

export interface Alert {
  id: string;
  category: 'GENESIS WATCH' | 'RAPID INTENSIFICATION' | 'TRACK UNCERTAINTY' | 'LAND INTERACTION' | 'SENSOR DEGRADATION';
  severity: SeverityLevel;
  storm_id: string;
  storm_name: string;
  title: string;
  description: string;
  trigger_reason: string;
  confidence: number;
  timestamp: string;
  recommended_action: string;
  acknowledged: boolean;
}

export interface CounterfactualResult {
  sensor_removed: string;
  original_track_error_km: number;
  modified_track_error_km: number;
  original_confidence: number;
  modified_confidence: number;
  prediction_change_km: number;
}

export interface Explanation {
  storm_id: string;
  attention_regions: { label: string; importance: number; coords: [number, number] }[];
  modality_contributions: { modality: string; percentage: number }[];
  counterfactuals: CounterfactualResult[];
  convective_core_score: number;
  eyewall_symmetry_score: number;
  organization_score: number;
}

export interface HistoricalStormReplay {
  storm_id: string;
  name: string;
  year: number;
  max_category: CycloneClass;
  peak_wind_kts: number;
  actual_track: { lat: number; lng: number; wind: number; timestamp: string }[];
  ai_predicted_track: { lat: number; lng: number; wind: number; timestamp: string }[];
  satellite_frames: { timestamp: string; url: string; category: string }[];
  track_error_km_24h: number;
  intensity_mae_kts: number;
}

export interface ModelMetricItem {
  metric_name: string;
  value: string | number;
  unit?: string;
  benchmark_value?: string | number;
  status: 'EXCEEDS_TARGET' | 'MET' | 'NEEDS_ATTENTION';
}

export interface AnalystAnnotation {
  id: string;
  storm_id: string;
  analyst_name: string;
  action: 'ACCEPTED' | 'CORRECTED_CENTER' | 'CORRECTED_CLASS' | 'FALSE_DETECTION';
  original_center?: StormCenter;
  corrected_center?: StormCenter;
  notes: string;
  timestamp: string;
}

export interface DataHealthItem {
  source_name: string;
  sensor_code: string;
  status: 'HEALTHY' | 'STALE' | 'DEGRADED' | 'OFFLINE';
  last_received: string;
  latency_sec: number;
  data_age_min: number;
  uptime_pct: number;
}
