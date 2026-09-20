import { WindFieldResponse, QuadrantRadii } from '../types/cyclone';

const BASE_URL = 'http://127.0.0.1:8000/api/v1';

export async function fetchWindField(
  stormId: string,
  forecastHour: number = 0,
  targetLat?: number,
  targetLng?: number
): Promise<WindFieldResponse | null> {
  try {
    const res = await fetch(`${BASE_URL}/storms/${stormId}/wind-field?forecast_hour=${forecastHour}`);
    if (!res.ok) {
      console.warn(`Wind field API returned status ${res.status}, using fallback client generator.`);
      return getFallbackWindField(stormId, forecastHour, targetLat, targetLng);
    }
    const data: WindFieldResponse = await res.json();
    return data;
  } catch (err) {
    console.warn('Backend wind field API unavailable, fallback client mode active:', err);
    return getFallbackWindField(stormId, forecastHour, targetLat, targetLng);
  }
}

/**
 * Fallback generator aligned with active storm coordinates.
 */
function getFallbackWindField(
  stormId: string,
  forecastHour: number,
  targetLat?: number,
  targetLng?: number
): WindFieldResponse {
  // Use passed target coordinates or storm-specific defaults
  let baseLat = targetLat ?? (stormId === 'TC-IND-043' ? 16.2 : 18.6);
  let baseLng = targetLng ?? (stormId === 'TC-IND-043' ? 67.8 : 87.4);

  // If no targetLat was provided, shift base position by forecast hour
  if (targetLat === undefined) {
    baseLat += (forecastHour / 24) * 0.9;
    baseLng += (forecastHour / 24) * 1.1;
  }

  const centerLat = baseLat;
  const centerLng = baseLng;

  const r34: QuadrantRadii = {
    NE: 140 + forecastHour,
    SE: 120 + Math.round(forecastHour * 0.8),
    SW: 90 + Math.round(forecastHour * 0.5),
    NW: 110 + Math.round(forecastHour * 0.7),
  };
  const r50: QuadrantRadii = {
    NE: 80 + Math.round(forecastHour * 0.6),
    SE: 70 + Math.round(forecastHour * 0.5),
    SW: 50 + Math.round(forecastHour * 0.3),
    NW: 60 + Math.round(forecastHour * 0.4),
  };
  const r64: QuadrantRadii = {
    NE: 45 + Math.round(forecastHour * 0.3),
    SE: 40 + Math.round(forecastHour * 0.2),
    SW: 30 + Math.round(forecastHour * 0.1),
    NW: 35 + Math.round(forecastHour * 0.2),
  };

  const generatePoints = (radii: QuadrantRadii) => {
    const coords: number[][] = [];
    const numPoints = 72;
    for (let i = 0; i <= numPoints; i++) {
      const angleDeg = (i * 360) / numPoints;
      const angleRad = (angleDeg * Math.PI) / 180;
      let r_nm = radii.NE;
      if (angleDeg >= 0 && angleDeg < 90) r_nm = radii.NE;
      else if (angleDeg >= 90 && angleDeg < 180) r_nm = radii.SE;
      else if (angleDeg >= 180 && angleDeg < 270) r_nm = radii.SW;
      else r_nm = radii.NW;

      const distKm = r_nm * 1.852;
      const dLat = (distKm / 111.0) * Math.cos(angleRad);
      const dLng = (distKm / (111.0 * Math.cos((centerLat * Math.PI) / 180))) * Math.sin(angleRad);
      coords.push([centerLng + dLng, centerLat + dLat]);
    }
    return coords;
  };

  return {
    storm_id: stormId,
    timestamp: new Date().toISOString(),
    center: { lat: centerLat, lng: centerLng },
    max_wind_kts: 96,
    forecast_hour: forecastHour,
    data_source: 'DEMO_MODEL',
    is_mock: true,
    radii: {
      r34_nm: r34,
      r50_nm: r50,
      r64_nm: r64,
    },
    geojson: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [generatePoints(r34)] },
          properties: { threshold_kts: 34, wind_speed_kts: 34, radii_nm: r34, data_source: 'DEMO_MODEL' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [generatePoints(r50)] },
          properties: { threshold_kts: 50, wind_speed_kts: 50, radii_nm: r50, data_source: 'DEMO_MODEL' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [generatePoints(r64)] },
          properties: { threshold_kts: 64, wind_speed_kts: 64, radii_nm: r64, data_source: 'DEMO_MODEL' },
        },
      ],
    },
  };
}
