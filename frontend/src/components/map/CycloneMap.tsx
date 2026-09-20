import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useCyclone } from '../../context/CycloneContext';
import { Layers } from 'lucide-react';
import { fetchWindField } from '../../services/windFieldApi';
import { WindFieldResponse } from '../../types/cyclone';

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom clean storm marker generator
const createStormIcon = (wind: number) => {
  const color = wind >= 90 ? '#ef4444' : wind >= 60 ? '#f59e0b' : '#10b981';

  const html = `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="absolute w-8 h-8 rounded-full opacity-30 animate-ping" style="background-color: ${color};"></div>
      <div class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-md" style="background-color: ${color};">
        🌀
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-storm-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 7, { duration: 1.0 });
  }, [center, map]);
  return null;
};

export const CycloneMap: React.FC<{ height?: string }> = ({ height = 'h-[520px]' }) => {
  const {
    activeStorm,
    setActiveStorm,
    storms,
    mapLayers,
    toggleMapLayer,
    selectedHorizon,
    genesisCandidates,
  } = useCyclone();

  const [windField, setWindField] = useState<WindFieldResponse | null>(null);

  const getDisplayCenter = (): [number, number] => {
    if (selectedHorizon === 'NOW') {
      return [activeStorm.center.lat, activeStorm.center.lng];
    }
    const fp = activeStorm.forecast_track.find((f) => f.horizon === selectedHorizon);
    if (fp) return [fp.lat, fp.lng];
    return [activeStorm.center.lat, activeStorm.center.lng];
  };

  const currentCenter = getDisplayCenter();

  useEffect(() => {
    let forecastHour = 0;
    if (selectedHorizon && selectedHorizon.startsWith('+') && selectedHorizon.endsWith('h')) {
      forecastHour = parseInt(selectedHorizon.replace('+', '').replace('h', ''), 10) || 0;
    }
    fetchWindField(activeStorm.storm_id, forecastHour, currentCenter[0], currentCenter[1]).then((data) => {
      if (data) setWindField(data);
    });
  }, [activeStorm.storm_id, selectedHorizon, currentCenter[0], currentCenter[1]]);
  const observedPolyline = activeStorm.observed_track.map((p) => [p.lat, p.lng] as [number, number]);
  const forecastPolyline = [
    [activeStorm.center.lat, activeStorm.center.lng] as [number, number],
    ...activeStorm.forecast_track.map((p) => [p.lat, p.lng] as [number, number]),
  ];

  const uncertaintyConePoints: [number, number][] = [
    [activeStorm.center.lat, activeStorm.center.lng],
    ...activeStorm.forecast_track.map((p) => [p.lat + p.predictionIntervalKm * 0.008, p.lng + p.predictionIntervalKm * 0.009] as [number, number]),
    ...activeStorm.forecast_track.slice().reverse().map((p) => [p.lat - p.predictionIntervalKm * 0.008, p.lng - p.predictionIntervalKm * 0.009] as [number, number]),
  ];

  return (
    <div className={`relative w-full ${height} rounded-xl overflow-hidden border border-slate-800 bg-[#070a12] shadow-xl font-sans`}>
      <MapContainer
        center={currentCenter}
        zoom={7}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <MapController center={currentCenter} />

        {/* Clean, Watermark-Free Esri World Dark Gray GIS Basemap */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> & IMD Multimodal AI'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />

        {/* Optional Satellite Overlay */}
        {mapLayers.satelliteIR && (
          <TileLayer
            url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${import.meta.env.VITE_OPENWEATHERMAP_API_KEY || 'demo_key'}`}
            opacity={0.35}
          />
        )}

        {/* Observed Track Line */}
        {mapLayers.observedTrack && (
          <Polyline
            positions={observedPolyline}
            pathOptions={{ color: '#06b6d4', weight: 3, opacity: 0.9 }}
          />
        )}

        {/* Forecast Track Line */}
        {mapLayers.forecastTrack && (
          <Polyline
            positions={forecastPolyline}
            pathOptions={{ color: '#ef4444', weight: 3, opacity: 0.95, dashArray: '5, 5' }}
          />
        )}

        {/* Uncertainty Cone Polygon */}
        {mapLayers.uncertaintyCone && (
          <Polygon
            positions={uncertaintyConePoints}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.25,
              weight: 1,
              dashArray: '3, 3',
            }}
          />
        )}

        {/* Asymmetric 4-Quadrant Wind Field Polygons (R34, R50, R64) */}
        {mapLayers.windRadii && windField && windField.geojson && windField.geojson.features && (
          <>
            {windField.geojson.features.map((feature, idx) => {
              const props = feature.properties;
              const threshold = props.threshold_kts;
              const radii = props.radii_nm;

              const latLngs = (feature.geometry.coordinates[0] || []).map(
                (coord) => [coord[1], coord[0]] as [number, number]
              );

              let color = '#3b82f6';
              let fillColor = '#3b82f6';
              let opacity = 0.2;
              let label = 'R34 (34 kt / gale force)';

              if (threshold === 50) {
                color = '#f59e0b';
                fillColor = '#f59e0b';
                opacity = 0.25;
                label = 'R50 (50 kt / storm force)';
              } else if (threshold === 64) {
                color = '#ef4444';
                fillColor = '#ef4444';
                opacity = 0.35;
                label = 'R64 (64 kt / hurricane force)';
              }

              return (
                <Polygon
                  key={`wind-poly-${threshold}-${idx}`}
                  positions={latLngs}
                  pathOptions={{
                    color,
                    fillColor,
                    fillOpacity: opacity,
                    weight: threshold === 64 ? 2 : 1,
                    dashArray: threshold === 34 ? '4, 4' : undefined,
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px] text-xs font-sans space-y-1.5">
                      <div className="font-bold text-slate-100 border-b border-slate-700 pb-1 flex justify-between items-center">
                        <span style={{ color }}>{label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{windField.data_source}</span>
                      </div>
                      <div className="text-slate-300">
                        Forecast Horizon: <strong className="text-cyan-400">+{windField.forecast_hour}h</strong>
                      </div>
                      <div className="text-slate-300">
                        Center: <span className="font-mono">{windField.center.lat.toFixed(2)}°N, {windField.center.lng.toFixed(2)}°E</span>
                      </div>
                      <div className="pt-1 text-[11px]">
                        <div className="font-semibold text-slate-200 border-b border-slate-800 pb-0.5 mb-1">
                          Quadrant Radii (Nautical Miles):
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono text-slate-300">
                          <div>NE: <strong className="text-slate-100">{radii?.NE || 0} NM</strong></div>
                          <div>SE: <strong className="text-slate-100">{radii?.SE || 0} NM</strong></div>
                          <div>SW: <strong className="text-slate-100">{radii?.SW || 0} NM</strong></div>
                          <div>NW: <strong className="text-slate-100">{radii?.NW || 0} NM</strong></div>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}
          </>
        )}

        {/* Active Storm Center Markers */}
        {storms.map((storm) => (
          <Marker
            key={storm.storm_id}
            position={[storm.center.lat, storm.center.lng]}
            icon={createStormIcon(storm.wind_kts)}
            eventHandlers={{
              click: () => setActiveStorm(storm),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[180px] text-xs font-sans space-y-1">
                <div className="font-bold text-slate-100 border-b border-slate-700 pb-1">
                  {storm.name} ({storm.storm_id})
                </div>
                <div className="text-slate-300">{storm.category}</div>
                <div className="text-slate-400">Wind: <strong className="text-cyan-400">{storm.wind_kts} kt</strong></div>
                <div className="text-slate-400">Pressure: <strong className="text-slate-200">{storm.pressure_hpa} hPa</strong></div>
                <div className="text-slate-400">Movement: {storm.movement_dir} {storm.movement_speed_kmh} km/h</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Genesis Candidate Markers */}
        {mapLayers.sst && genesisCandidates.map((candidate) => (
          <Marker
            key={candidate.candidate_id}
            position={[candidate.center.lat, candidate.center.lng]}
            icon={L.divIcon({
              html: `
                <div class="w-6 h-6 rounded-full border border-amber-400 bg-amber-500/20 flex items-center justify-center text-[9px] font-bold text-amber-300">
                  ${candidate.probability_24h}%
                </div>
              `,
              className: 'candidate-marker',
              iconSize: [24, 24],
            })}
          >
            <Popup>
              <div className="p-1.5 font-sans text-xs">
                <div className="font-bold text-amber-400">Genesis Disturbance {candidate.candidate_id}</div>
                <div>Development Prob: {candidate.probability_24h}%</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Layer Overlay Box (Matches Screenshot Top-Right) */}
      <div className="absolute top-3 right-3 z-10 bg-[#090e1c]/90 border border-slate-700/80 rounded-lg p-3 text-xs space-y-1.5 text-slate-200 shadow-2xl backdrop-blur-md font-sans w-56">
        <div className="font-bold text-slate-100 border-b border-slate-700/80 pb-1 flex items-center space-x-1.5 font-mono text-[11px]">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>MAP LAYERS & AI PRODUCTS</span>
        </div>
        <label className="flex items-center space-x-2 cursor-pointer text-[11px]">
          <input type="checkbox" checked={mapLayers.satelliteIR} onChange={() => toggleMapLayer('satelliteIR')} className="accent-cyan-500 rounded" />
          <span>INSAT IR Satellite</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer text-[11px]">
          <input type="checkbox" checked={mapLayers.windVectors} onChange={() => toggleMapLayer('windVectors')} className="accent-cyan-500 rounded" />
          <span>Scatterometer Winds</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer text-[11px]">
          <input type="checkbox" checked={mapLayers.forecastTrack} onChange={() => toggleMapLayer('forecastTrack')} className="accent-red-500 rounded" />
          <span className="text-red-300 font-semibold">AI Forecast Track</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer text-[11px]">
          <input type="checkbox" checked={mapLayers.uncertaintyCone} onChange={() => toggleMapLayer('uncertaintyCone')} className="accent-amber-500 rounded" />
          <span className="text-amber-300">Uncertainty Cone (P10-P90)</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer text-[11px]">
          <input type="checkbox" checked={mapLayers.ensembleTrajectories} onChange={() => toggleMapLayer('ensembleTrajectories')} className="accent-indigo-500 rounded" />
          <span>Ensemble Trajectories</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer text-[11px]">
          <input type="checkbox" checked={mapLayers.windRadii} onChange={() => toggleMapLayer('windRadii')} className="accent-amber-500 rounded" />
          <span className="text-amber-300 font-semibold">Wind Radii (R34/R50/R64)</span>
        </label>
      </div>

      {/* Map Legend Overlay (Matches Screenshot Bottom-Left) */}
      <div className="absolute bottom-3 left-3 bg-[#090e1c]/90 border border-slate-700/80 px-3 py-1.5 rounded-md z-10 text-[11px] font-mono flex items-center space-x-3 text-slate-300 shadow-md">
        <div className="flex items-center space-x-1">
          <span className="w-3 h-0.5 bg-cyan-400"></span>
          <span>Observed Track</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-0.5 bg-red-400"></span>
          <span>AI Forecast</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 bg-red-500/30 border border-red-400 rounded"></span>
          <span>P10-P90 Cone</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Genesis Candidate</span>
        </div>
      </div>
    </div>
  );
};
