import { useState, useEffect, useRef } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Award,
  BookOpen,
  ChevronRight,
  Database,
  Download,
  Layers,
  MessageSquare,
  Play,
  RefreshCw,
  Sliders,
  Terminal,
  User,
  Wifi,
  Wind
} from 'lucide-react';
import {
  getSimState,
  updateSimState,
  setScenario,
  toggleModality,
  getActiveStorms,
  getForecast,
  getDataHealth,
  getAlerts,
  getExplanation,
  getHistoricalStorms,
  getModelPerformance,
  getModelVersion,
  runAnalysis,
  saveAnnotation,
  exportForecastReport,
  subscribeToSimState,
  type ScenarioId
} from './mockService';

// ============================================================================
// SVG GEOGRAPHY COORDINATE CALCULATORS & PRESETS
// ============================================================================

const lonMin = 50;
const lonMax = 100;
const latMin = 0;
const latMax = 30;

function convertCoords(lat: number, lon: number, width: number, height: number) {
  const x = ((lon - lonMin) / (lonMax - lonMin)) * (width - 80) + 40;
  const y = height - (((lat - latMin) / (latMax - latMin)) * (height - 80) + 40);
  return { x, y };
}

// Coastline points (lat, lon)
const indiaCoast = [
  [23.5, 68.2], [22.8, 70.1], [22.0, 70.2], [22.7, 72.2], [21.0, 72.5], 
  [19.0, 72.8], [15.5, 73.8], [12.8, 74.8], [10.0, 75.8], [8.1, 77.3], 
  [9.3, 78.2], [9.3, 79.5], [10.2, 79.8], [11.5, 79.8], [13.1, 80.3], 
  [16.2, 81.8], [17.8, 83.4], [19.3, 85.0], [21.0, 87.0], [21.9, 89.0], 
  [22.8, 89.5]
];

const sriLankaCoast = [
  [9.5, 80.2], [9.0, 79.8], [8.0, 79.7], [7.0, 79.9], [6.0, 80.3], 
  [6.0, 81.3], [7.0, 81.8], [8.5, 81.7], [9.3, 81.0], [9.5, 80.2]
];

const arabianCoast = [
  [12.2, 43.5], [12.8, 45.0], [14.0, 48.0], [15.0, 52.2], [17.0, 54.0], 
  [19.0, 57.5], [22.5, 59.7], [23.8, 58.5], [24.0, 57.0], [25.0, 58.0], 
  [25.3, 61.5], [25.1, 64.0], [24.8, 67.0], [23.5, 68.2]
];

const bangladeshMyanmarCoast = [
  [22.8, 89.5], [22.8, 91.2], [22.0, 91.8], [21.0, 92.2], [20.0, 92.8], 
  [17.0, 94.3], [16.0, 94.2], [15.8, 95.5], [16.5, 96.3], [16.3, 97.5], 
  [13.5, 98.2], [10.0, 98.5]
];

const geographicLabels = [
  { name: 'INDIA', lat: 21.0, lon: 78.0 },
  { name: 'SRI LANKA', lat: 7.5, lon: 82.5 },
  { name: 'BAY OF BENGAL', lat: 14.0, lon: 88.5 },
  { name: 'ARABIAN SEA', lat: 15.0, lon: 63.0 },
  { name: 'MALDIVES', lat: 3.0, lon: 73.0 },
  { name: 'BANGLADESH', lat: 23.8, lon: 90.3 },
  { name: 'MYANMAR', lat: 19.5, lon: 96.0 },
  { name: 'PAKISTAN', lat: 26.5, lon: 65.0 },
  { name: 'ANDAMAN IS.', lat: 11.5, lon: 92.8 },
];

export default function App() {
  const [route, setRoute] = useState<string>('/');
  const [simVersion, setSimVersion] = useState<number>(0);
  const [activeAnalysisStep, setActiveAnalysisStep] = useState<string>('');
  const [analysisPercent, setAnalysisPercent] = useState<number>(0);
  const [showAnalysisModal, setShowAnalysisModal] = useState<boolean>(false);
  const [showAnnotateModal, setShowAnnotateModal] = useState<boolean>(false);
  const [annotationSavedMsg, setAnnotationSavedMsg] = useState<boolean>(false);
  const [exportedReport, setExportedReport] = useState<{ txt: string; json: string } | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [apiConsoleResponse, setApiConsoleResponse] = useState<string>('');
  const [apiActiveEndpoint, setApiActiveEndpoint] = useState<string>('');
  
  // Custom Annotation Form State
  const [annLat, setAnnLat] = useState<number>(15.8);
  const [annLon, setAnnLon] = useState<number>(84.6);
  const [annClass, setAnnClass] = useState<string>('VERY SEVERE CYCLONIC STORM');
  const [annIssue, setAnnIssue] = useState<string>('Eye structure anomaly');
  const [annComment, setAnnComment] = useState<string>('SST values show extreme convection gradients.');

  // Timing/Clock
  const [currentTime, setCurrentTime] = useState<string>('14:32:18');

  // Trigger UI update when mockService state changes
  useEffect(() => {
    const unsub = subscribeToSimState(() => setSimVersion((v) => v + 1));

    // Simple UTC Clock
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'UTC',
        })
      );
    }, 1000);

    // Initial routing setup
    const handleHash = () => {
      const h = window.location.hash || '#/';
      setRoute(h.slice(1));
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();

    return () => {
      unsub();
      clearInterval(timer);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = `#${path}`;
  };

  const state = getSimState();
  const storms = getActiveStorms();
  const selectedStorm = storms.find((s) => s.id === state.selectedStormId) || storms[0];
  const dataHealth = getDataHealth();
  const alerts = getAlerts();
  const explanation = getExplanation(selectedStorm.id);
  const modelMetrics = getModelPerformance();
  const modelVer = getModelVersion();

  // Scenario trigger wrapper
  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setScenario(e.target.value as ScenarioId);
  };

  // Run analysis trigger
  const handleRunAnalysis = () => {
    setShowAnalysisModal(true);
    setAnalysisPercent(0);
    setActiveAnalysisStep('INITIALIZING...');
    runAnalysis((step, pct) => {
      setActiveAnalysisStep(step);
      setAnalysisPercent(pct);
    }).then(() => {
      setTimeout(() => setShowAnalysisModal(false), 800);
    });
  };

  // Handle saving annotations
  const handleSaveAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    saveAnnotation({
      stormId: selectedStorm.id,
      observedIssue: annIssue,
      correctedCenterLat: annLat,
      correctedCenterLon: annLon,
      correctedClass: annClass,
      comment: annComment,
    });
    setShowAnnotateModal(false);
    setAnnotationSavedMsg(true);
    setTimeout(() => setAnnotationSavedMsg(false), 3000);
  };

  // Export report trigger
  const handleExport = () => {
    const txt = exportForecastReport(selectedStorm.id, 'txt');
    const json = exportForecastReport(selectedStorm.id, 'json');
    setExportedReport({ txt, json });
    setShowExportModal(true);
  };

  // Download client side
  const downloadReport = (format: 'txt' | 'json') => {
    if (!exportedReport) return;
    const content = format === 'txt' ? exportedReport.txt : exportedReport.json;
    const mime = format === 'txt' ? 'text/plain' : 'application/json';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedStorm.id}_forecast_report_${state.lastAnalysisTime.replace(' ', '_')}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Router layout
  const renderCurrentView = () => {
    if (route.startsWith('/storms/') || route === '/storms') {
      return renderStormAnalysisView();
    }
    switch (route) {
      case '/':
        return renderCommandCenterView();
      case '/genesis':
        return renderGenesisView();
      case '/historical':
        return renderHistoricalReplayView();
      case '/alerts':
        return renderAlertsView();
      case '/data-health':
        return renderDataHealthView();
      case '/model':
        return renderModelIntelligenceView();
      default:
        return renderCommandCenterView();
    }
  };

  // ============================================================================
  // PROCEDURAL CANVAS SATELLITE CYCLONE RENDERING
  // ============================================================================
  const satelliteCanvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = satelliteCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let rotationAngle = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Deep space black base
      ctx.fillStyle = '#030508';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw geographic boundaries overlay representation
      ctx.strokeStyle = 'rgba(38, 49, 61, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, width * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Satellite mode dependent drawing
      const mode = state.selectedSatelliteMode;
      const product = state.selectedSatelliteProduct;

      // Generate cloud pattern procedurally
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotationAngle);

      const arms = 6;
      const step = (Math.PI * 2) / arms;
      const windSpeed = selectedStorm.wind; // influences eye size and tightness

      for (let arm = 0; arm < arms; arm++) {
        const startAngle = arm * step;
        ctx.beginPath();
        ctx.moveTo(0, 0);

        // Draw spiral bezier cloud structure
        for (let i = 0; i < 40; i++) {
          const r = i * 4.5;
          const a = startAngle + (i * 0.12) - (windSpeed * 0.002 * i);
          const x = r * Math.cos(a);
          const y = r * Math.sin(a);

          ctx.lineTo(x, y);
        }

        // Color profiles based on product
        if (product === 'IR') {
          // Temperature cold rings (cyan -> orange -> red -> white)
          const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 180);
          grad.addColorStop(0, '#ffffff'); // Warm eye edge
          grad.addColorStop(0.15, '#f87171'); // Cold cloud tops
          grad.addColorStop(0.35, '#fbbf24');
          grad.addColorStop(0.55, '#38bdf8'); // Outer bands
          grad.addColorStop(0.85, 'rgba(16, 185, 129, 0.08)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.strokeStyle = 'transparent';
          ctx.fillStyle = grad;
        } else if (product === 'WATER_VAPOR') {
          // Moisture grey-purple profiles
          const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, 200);
          grad.addColorStop(0, 'rgba(25, 16, 45, 0.9)'); // dry eye
          grad.addColorStop(0.2, 'rgba(96, 165, 250, 0.8)'); // moisture band
          grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.4)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
        } else {
          // CLOUD - raw grey/white reflectance
          const grad = ctx.createRadialGradient(0, 0, 15, 0, 0, 190);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          grad.addColorStop(0.3, 'rgba(226, 232, 240, 0.8)');
          grad.addColorStop(0.7, 'rgba(148, 163, 184, 0.3)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
        }

        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.lineTo(20, 20);
        ctx.fill();
      }

      ctx.restore();

      // Clear the eye center (cyclone eye signature)
      const eyeRad = Math.max(5, 24 - (windSpeed * 0.18));
      ctx.fillStyle = '#030508';
      ctx.beginPath();
      ctx.arc(cx, cy, eyeRad, 0, Math.PI * 2);
      ctx.fill();

      // AI SEGMENTATION OVERLAY LAYER
      if (mode === 'AI_SEGMENTATION') {
        // Draw storm boundary outline
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, 110, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.fill();

        // Convective bands mask (Green)
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, 65, rotationAngle, rotationAngle + Math.PI * 1.3);
        ctx.stroke();

        // Eyewall ring mask (Red/Orange)
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.7)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, eyeRad + 8, 0, Math.PI * 2);
        ctx.stroke();

        // Labels
        ctx.fillStyle = 'rgba(7, 10, 15, 0.85)';
        ctx.fillRect(10, height - 75, 140, 65);
        ctx.strokeStyle = 'var(--border-color)';
        ctx.strokeRect(10, height - 75, 140, 65);

        ctx.font = '9px var(--font-mono)';
        ctx.fillStyle = 'var(--accent-red)';
        ctx.fillText('■ EYEWALL MASK', 18, height - 60);
        ctx.fillStyle = 'var(--accent-green)';
        ctx.fillText('■ CONVECTIVE BAND', 18, height - 44);
        ctx.fillStyle = 'var(--accent-cyan)';
        ctx.fillText('■ STORM INNER DOME', 18, height - 28);
      }

      // CENTER HEATMAP TARGET OVERLAY
      if (mode === 'CENTER_HEATMAP') {
        // Red target locator crosshair
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.9)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy); ctx.lineTo(cx + 30, cy);
        ctx.moveTo(cx, cy - 30); ctx.lineTo(cx, cy + 30);
        ctx.stroke();

        // Confidence heatmap overlay rings
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.4)';
        ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.2)';
        ctx.beginPath(); ctx.arc(cx, cy, 25, 0, Math.PI * 2); ctx.stroke();

        // Metadata box
        ctx.fillStyle = 'rgba(7, 10, 15, 0.9)';
        ctx.fillRect(width - 150, 12, 138, 50);
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.5)';
        ctx.strokeRect(width - 150, 12, 138, 50);

        ctx.font = '9px var(--font-mono)';
        ctx.fillStyle = 'var(--text-primary)';
        ctx.fillText(`EST CENTER: ${selectedStorm.lat}°N / ${selectedStorm.lon}°E`, width - 142, 26);
        ctx.fillStyle = 'var(--accent-green)';
        ctx.fillText(`CONFIDENCE: ${selectedStorm.eyewallConfidence}%`, width - 142, 44);
      }

      // ATTENTION GRADIENT
      if (mode === 'ATTENTION') {
        const attGrad = ctx.createRadialGradient(cx, cy, 5, cx - 10, cy - 10, 120);
        attGrad.addColorStop(0, 'rgba(167, 139, 250, 0.7)'); // Purple high attention
        attGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.4)');
        attGrad.addColorStop(0.7, 'rgba(52, 211, 153, 0.1)');
        attGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = attGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 140, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(7, 10, 15, 0.85)';
        ctx.fillRect(10, 10, 160, 42);
        ctx.strokeStyle = 'var(--accent-purple)';
        ctx.strokeRect(10, 10, 160, 42);
        ctx.font = '9px var(--font-mono)';
        ctx.fillStyle = 'var(--accent-purple)';
        ctx.fillText('CROSS-MODAL ATTENTION MAP', 16, 24);
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.fillText('Model focus: Inner eyewall dynamics', 16, 38);
      }

      // STRUCTURE ANALYSIS ANNOTATION
      if (mode === 'STRUCTURE') {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.lineWidth = 1;
        // Draw shear vectors
        ctx.beginPath();
        ctx.moveTo(cx + 80, cy - 80);
        ctx.lineTo(cx + 120, cy - 120);
        ctx.stroke();

        ctx.fillStyle = 'var(--accent-amber)';
        ctx.font = '9px var(--font-sans)';
        ctx.fillText('OUTFLOW VECTOR', cx + 110, cy - 125);
        ctx.fillText('SYMMETRY INDEX: ' + selectedStorm.symmetry + '%', cx - 160, cy + 130);
        ctx.fillText('ASYMMETRY: ' + selectedStorm.asymmetry + '%', cx - 160, cy + 145);
      }

      // Slowly rotate clouds
      rotationAngle += 0.0015;
      frameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [state.selectedSatelliteMode, state.selectedSatelliteProduct, selectedStorm, state.currentScenario]);

  // ============================================================================
  // MAP VISUALIZER COMPONENT
  // ============================================================================
  const renderMap = (interactive = true, mapWidth = 720, mapHeight = 440) => {
    const list = getActiveStorms();

    // Ingest lines & coordinates
    const toPath = (coords: number[][]) => {
      return coords
        .map((c, i) => {
          const { x, y } = convertCoords(c[0], c[1], mapWidth, mapHeight);
          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ');
    };

    return (
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        className="map-canvas-container"
        style={{ cursor: interactive ? 'crosshair' : 'default' }}
      >
        {/* Draw Lat/Lon gridlines */}
        {[55, 65, 75, 85, 95].map((lon) => {
          const { x: x1 } = convertCoords(latMin, lon, mapWidth, mapHeight);
          const { x: x2 } = convertCoords(latMax, lon, mapWidth, mapHeight);
          return (
            <g key={`lon-${lon}`}>
              <line x1={x1} y1={0} x2={x2} y2={mapHeight} className="map-grid-lines" />
              <text x={x1 + 4} y={mapHeight - 8} className="map-labels">
                {lon}°E
              </text>
            </g>
          );
        })}
        {[5, 15, 25].map((lat) => {
          const { y: y1 } = convertCoords(lat, lonMin, mapWidth, mapHeight);
          const { y: y2 } = convertCoords(lat, lonMax, mapWidth, mapHeight);
          return (
            <g key={`lat-${lat}`}>
              <line x1={0} y1={y1} x2={mapWidth} y2={y2} className="map-grid-lines" />
              <text x={8} y={y1 - 4} className="map-labels">
                {lat}°N
              </text>
            </g>
          );
        })}

        {/* Draw Coastlines */}
        <path d={toPath(indiaCoast)} className="map-coastline" fill="none" />
        <path d={toPath(sriLankaCoast)} className="map-coastline" />
        <path d={toPath(bangladeshMyanmarCoast)} className="map-coastline" fill="none" />
        <path d={toPath(arabianCoast)} className="map-coastline" fill="none" />

        {/* Geographic Labels */}
        {geographicLabels.map((lbl) => {
          const { x, y } = convertCoords(lbl.lat, lbl.lon, mapWidth, mapHeight);
          return (
            <text key={lbl.name} x={x} y={y} className="map-labels" textAnchor="middle" style={{ opacity: 0.55, fontWeight: 700 }}>
              {lbl.name}
            </text>
          );
        })}

        {/* Map Layers Rendering */}
        {state.activeLayers.sst && renderSstOverlay(mapWidth, mapHeight)}
        {state.activeLayers.rainfall && renderRainfallOverlay(mapWidth, mapHeight)}

        {/* Selected Storm Track, Forecast, and Uncertainty Corridor */}
        {list.map((st) => {
          const isSelected = st.id === selectedStorm.id;
          if (!isSelected) return null;

          const forecastPoints = getForecast(st.id);
          if (forecastPoints.length === 0) return null;

          const { x: cx, y: cy } = convertCoords(st.lat, st.lon, mapWidth, mapHeight);

          // Render Past Track (mocked historical line leading to current center)
          const pastCoords = [
            [st.lat - 1.2, st.lon + 1.8],
            [st.lat - 0.7, st.lon + 1.0],
            [st.lat - 0.3, st.lon + 0.5],
            [st.lat, st.lon]
          ];
          const pastPath = toPath(pastCoords);

          // Render Forecast Track Line
          const fcCoords = forecastPoints.map((fp) => [fp.lat, fp.lon]);
          const fcPath = toPath([[st.lat, st.lon], ...fcCoords]);

          // Render Uncertainty Polygon Corridor
          let corridorPath = '';
          if (state.activeLayers.uncertainty && forecastPoints.length > 0) {
            // Build polygon matching P10 & P90 divergence
            const leftPoints: number[][] = [];
            const rightPoints: number[][] = [];

            forecastPoints.forEach((fp, index) => {
              if (index === 0) return;
              // Diverge orthogonal to direction
              const angle = Math.atan2(fp.lat - forecastPoints[index - 1].lat, fp.lon - forecastPoints[index - 1].lon);
              const perp = angle + Math.PI / 2;
              
              // Modulate width by uncertainty (wider corridor if microwave is offline)
              const widthFactor = fp.lead_h * 0.05 * (state.modalityStatus.microwave === 'MISSING' ? 1.4 : 1.0);
              
              leftPoints.push([
                fp.lat + Math.sin(perp) * widthFactor,
                fp.lon + Math.cos(perp) * widthFactor
              ]);
              rightPoints.unshift([
                fp.lat - Math.sin(perp) * widthFactor,
                fp.lon - Math.cos(perp) * widthFactor
              ]);
            });

            const merged = [[st.lat, st.lon], ...leftPoints, ...rightPoints, [st.lat, st.lon]];
            corridorPath = toPath(merged);
          }

          // Wind radii overlay representation
          const renderWindRadii = () => {
            if (!state.activeLayers.windField) return null;
            return (
              <g opacity="0.3">
                {/* 34 KT Radius (Cyan) */}
                <circle cx={cx} cy={cy} r="65" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeDasharray="3 3" />
                {/* 50 KT Radius (Amber) */}
                <circle cx={cx} cy={cy} r="42" fill="none" stroke="var(--accent-amber)" strokeWidth="1.5" />
                {/* 64 KT Radius (Red) */}
                <circle cx={cx} cy={cy} r="22" fill="none" stroke="var(--accent-red)" strokeWidth="1.5" />
              </g>
            );
          };

          return (
            <g key={`storm-graphics-${st.id}`}>
              {/* Wind Radii circles */}
              {renderWindRadii()}

              {/* Uncertainty corridor */}
              {state.activeLayers.uncertainty && corridorPath && (
                <path d={corridorPath} fill="rgba(56, 189, 248, 0.08)" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" />
              )}

              {/* Past Track */}
              {state.activeLayers.stormTrack && (
                <path d={pastPath} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 4" />
              )}

              {/* Forecast Track */}
              {state.activeLayers.forecast && (
                <path d={fcPath} fill="none" stroke="var(--accent-cyan)" strokeWidth="2.5" />
              )}

              {/* Forecast Lead points */}
              {state.activeLayers.forecast &&
                forecastPoints.map((fp) => {
                  const { x: fx, y: fy } = convertCoords(fp.lat, fp.lon, mapWidth, mapHeight);
                  return (
                    <g key={`fc-pt-${fp.lead_h}`}>
                      <circle cx={fx} cy={fy} r="4" fill="var(--bg-darker)" stroke="var(--accent-cyan)" strokeWidth="2" />
                      <text x={fx + 7} y={fy + 3} className="text-mono" fill="var(--text-primary)" fontSize="8px">
                        {fp.lead_h}H
                      </text>
                    </g>
                  );
                })}
            </g>
          );
        })}

        {/* Render Storm Markers */}
        {list.map((st) => {
          const { x, y } = convertCoords(st.lat, st.lon, mapWidth, mapHeight);
          const isSelected = st.id === selectedStorm.id;
          
          let color = 'var(--accent-cyan)';
          if (st.status === 'WATCH') color = 'var(--accent-amber)';
          if (st.status === 'CANDIDATE') color = 'var(--text-muted)';
          
          return (
            <g
              key={`marker-${st.id}`}
              transform={`translate(${x}, ${y})`}
              className="cyclone-marker"
              onClick={() => {
                if (interactive) {
                  updateSimState({ selectedStormId: st.id });
                }
              }}
            >
              {/* Outer pulsing ring for active/high risk */}
              {st.status !== 'CANDIDATE' && (
                <circle cx="0" cy="0" r={isSelected ? '22' : '15'} fill="none" stroke={color} className="cyclone-eye-pulse" strokeWidth="1.2" />
              )}

              {/* Rotating Spiral cloud lines representing cyclone eye */}
              <g className="cyclone-eye-rotate" stroke={color} strokeWidth="1.8" fill="none">
                <circle cx="0" cy="0" r="4" fill={color} />
                <path d="M 0,0 Q 5,-8 10,-4" />
                <path d="M 0,0 Q -5,8 -10,4" />
                <path d="M 0,0 Q 8,5 4,10" />
                <path d="M 0,0 Q -8,-5 -4,-10" />
              </g>

              {/* Label */}
              <g transform="translate(14, -14)">
                <rect x="-2" y="-10" width="70" height="24" fill="var(--surface-primary)" stroke={isSelected ? 'var(--accent-cyan)' : 'var(--border-color)'} strokeWidth="1" rx="2" />
                <text x="4" y="2" fill="var(--text-primary)" fontSize="9px" fontWeight="700">
                  {st.name}
                </text>
                <text x="4" y="11" fill={color} className="text-mono" fontSize="8px">
                  {st.status === 'CANDIDATE' ? `${st.confidence}% Candidate` : `${st.wind} KT | ${st.pressure} HPa`}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    );
  };

  // Sea surface temperature rendering helper
  const renderSstOverlay = (width: number, height: number) => {
    return (
      <g opacity="0.35">
        <rect x="0" y="0" width={width} height={height} fill="url(#sstGrad)" style={{ mixBlendMode: 'soft-light' }} />
        <defs>
          <radialGradient id="sstGrad" cx="70%" cy="80%" r="60%">
            <stop offset="0%" stopColor="var(--accent-red)" />
            <stop offset="50%" stopColor="var(--accent-amber)" />
            <stop offset="100%" stopColor="var(--accent-blue)" />
          </radialGradient>
        </defs>
        <text x={width - 120} y="32" className="map-labels" fill="var(--accent-red)">
          SST Gradient Active (&gt;29.5°C)
        </text>
      </g>
    );
  };

  // Rainfall rendering helper
  const renderRainfallOverlay = (width: number, height: number) => {
    return (
      <g opacity="0.3">
        {selectedStorm && (() => {
          const { x, y } = convertCoords(selectedStorm.lat, selectedStorm.lon, width, height);
          return (
            <g>
              <circle cx={x} cy={y} r="85" fill="var(--accent-green)" />
              <circle cx={x} cy={y} r="50" fill="var(--accent-blue)" />
              <text x={x + 10} y={y + 110} className="map-labels" fill="var(--accent-green)">
                Precipitation Band Overlay
              </text>
            </g>
          );
        })()}
      </g>
    );
  };

  // ============================================================================
  // INTENSITY FORECAST SVG CHART
  // ============================================================================
  const renderIntensityChart = () => {
    const fPoints = getForecast(selectedStorm.id);
    if (fPoints.length === 0) return null;

    const width = 360;
    const height = 180;

    // Convert lead_h and wind value to chart coordinates
    // lead_h range: 0 to 72 -> X: 40 to 320
    // wind range: 20 to 140 -> Y: 150 to 20
    const getX = (h: number) => 40 + (h / 72) * 280;
    const getY = (w: number) => 150 - ((w - 20) / 120) * 130;

    // Shaded uncertainty bounds polygon points
    const p10Points = fPoints.map((fp) => `${getX(fp.lead_h).toFixed(1)},${getY(fp.wind_p10).toFixed(1)}`);
    const p90Points = fPoints.map((fp) => `${getX(fp.lead_h).toFixed(1)},${getY(fp.wind_p90).toFixed(1)}`).reverse();
    const polyPoints = [...p10Points, ...p90Points].join(' ');

    // Main line path points
    const linePath = fPoints.map((fp) => `${getX(fp.lead_h).toFixed(1)},${getY(fp.wind_p50).toFixed(1)}`).join(' L ');

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Y Axis Gridlines */}
        {[34, 50, 64, 90, 115].map((level) => {
          const y = getY(level);
          return (
            <g key={`grid-${level}`}>
              <line x1={40} y1={y} x2={320} y2={y} stroke="var(--border-color)" strokeWidth="0.8" strokeDasharray="2 3" />
              <text x={35} y={y + 3} textAnchor="end" className="text-mono" fontSize="8px" fill="var(--text-muted)">
                {level}
              </text>
            </g>
          );
        })}

        {/* X Axis gridlines */}
        {fPoints.map((fp) => {
          const x = getX(fp.lead_h);
          return (
            <g key={`grid-x-${fp.lead_h}`}>
              <line x1={x} y1={20} x2={x} y2={150} stroke="var(--border-color)" strokeWidth="0.8" strokeDasharray="2 3" />
              <text x={x} y={162} textAnchor="middle" className="text-mono" fontSize="8px" fill="var(--text-muted)">
                {fp.lead_h === 0 ? 'NOW' : `${fp.lead_h}H`}
              </text>
            </g>
          );
        })}

        {/* Y Axis labels */}
        <text x="12" y="90" fill="var(--text-muted)" fontSize="8px" transform="rotate(-90 12 90)" textAnchor="middle">
          WIND SPEED (KT)
        </text>

        {/* P10-P90 Shaded Uncertainty band */}
        <polygon points={polyPoints} fill="rgba(56, 189, 248, 0.08)" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.8" />

        {/* P50 Forecast line */}
        <path d={`M ${linePath}`} fill="none" stroke="var(--accent-cyan)" strokeWidth="2" />

        {/* Interactive circles */}
        {fPoints.map((fp) => {
          const x = getX(fp.lead_h);
          const y = getY(fp.wind_p50);
          return (
            <g key={`dot-${fp.lead_h}`}>
              <circle cx={x} cy={y} r="3.5" fill="var(--bg-darker)" stroke="var(--accent-cyan)" strokeWidth="2" />
              <title>{`T+${fp.lead_h}H: ${fp.wind_p50} KT (P10:${fp.wind_p10} - P90:${fp.wind_p90})`}</title>
            </g>
          );
        })}
      </svg>
    );
  };

  // ============================================================================
  // SUB-PAGES / VIEWS RENDERERS
  // ============================================================================

  // 1. COMMAND CENTER (DASHBOARD)
  const renderCommandCenterView = () => {
    return (
      <div className="command-center-layout">
        {/* Status Strip */}
        <div className="status-strip">
          <div className="status-strip-item">
            <div className="status-strip-label">Active Systems</div>
            <div className="status-strip-value text-cyan">
              {storms.filter((s) => s.status === 'ACTIVE').length.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="status-strip-item">
            <div className="status-strip-label">High Risk Systems</div>
            <div className="status-strip-value text-red">01</div>
          </div>
          <div className="status-strip-item">
            <div className="status-strip-label">Genesis Watch</div>
            <div className="status-strip-value text-amber">
              {storms.filter((s) => s.status === 'WATCH').length.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="status-strip-item">
            <div className="status-strip-label">Ingest Quality Score</div>
            <div className="status-strip-value text-green">{dataHealth.score}%</div>
          </div>
        </div>

        {/* Grid Area: Map and Panel */}
        <div className="dashboard-grid">
          {/* Map Section */}
          <div className="map-container-wrapper">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'var(--bg-dark)' }}>
              <div>
                <span className="panel-title">NORTH INDIAN OCEAN OBSERVATIONAL GRID</span>
                <span className="panel-subtitle" style={{ marginLeft: '12px' }}>● LIVE SATELLITE PLOT</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-secondary" style={{ fontSize: '10px', padding: '4px 8px' }} onClick={handleRunAnalysis}>
                  <RefreshCw size={10} style={{ marginRight: '4px' }} /> REFRESH
                </button>
              </div>
            </div>

            {/* Render the SVG map */}
            <div style={{ flexGrow: 1, position: 'relative' }}>
              {renderMap(true, 720, 390)}

              {/* Floating Layer Controls */}
              <div className="map-floating-controls">
                <div className="control-section">
                  <div className="control-title">Layers</div>
                  <label className="control-option">
                    <input
                      type="checkbox"
                      checked={state.activeLayers.stormTrack}
                      onChange={(e) => updateSimState({ activeLayers: { ...state.activeLayers, stormTrack: e.target.checked } })}
                    />
                    Storm Track
                  </label>
                  <label className="control-option">
                    <input
                      type="checkbox"
                      checked={state.activeLayers.forecast}
                      onChange={(e) => updateSimState({ activeLayers: { ...state.activeLayers, forecast: e.target.checked } })}
                    />
                    AI Forecast
                  </label>
                  <label className="control-option">
                    <input
                      type="checkbox"
                      checked={state.activeLayers.uncertainty}
                      onChange={(e) => updateSimState({ activeLayers: { ...state.activeLayers, uncertainty: e.target.checked } })}
                    />
                    Uncertainty Cone
                  </label>
                  <label className="control-option">
                    <input
                      type="checkbox"
                      checked={state.activeLayers.windField}
                      onChange={(e) => updateSimState({ activeLayers: { ...state.activeLayers, windField: e.target.checked } })}
                    />
                    Wind Radial
                  </label>
                </div>

                <div className="control-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                  <div className="control-title">Environment</div>
                  <label className="control-option">
                    <input
                      type="checkbox"
                      checked={state.activeLayers.sst}
                      onChange={(e) => updateSimState({ activeLayers: { ...state.activeLayers, sst: e.target.checked, rainfall: false } })}
                    />
                    SST (&gt;29°C)
                  </label>
                  <label className="control-option">
                    <input
                      type="checkbox"
                      checked={state.activeLayers.rainfall}
                      onChange={(e) => updateSimState({ activeLayers: { ...state.activeLayers, rainfall: e.target.checked, sst: false } })}
                    />
                    Precipitation
                  </label>
                </div>
              </div>

              {/* Floating Simulator Bar */}
              <div className="simulator-strip">
                <div className="simulator-title">
                  <Sliders size={12} /> SIMULATOR CONSOLE
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Scenario:</span>
                  <select
                    value={state.currentScenario}
                    onChange={handleScenarioChange}
                    style={{ background: 'var(--bg-darker)', border: '1px solid var(--border-color)', fontSize: '11px', padding: '2px 4px', borderRadius: '3px' }}
                  >
                    <option value="NORMAL">Normal Conditions</option>
                    <option value="WEAK_DISTURBANCE">Weak Disturbance (TC-ARUN)</option>
                    <option value="RAPID_INTENSIFICATION">Rapid Intensification</option>
                    <option value="RAPID_WEAKENING">Rapid Weakening</option>
                    <option value="LAND_INTERACTION">Land Interaction (Odisha)</option>
                    <option value="MULTIPLE_DISTURBANCES">Multiple Disturbances</option>
                    <option value="SATELLITE_GAP">Stale INSAT Satellite Stream</option>
                    <option value="MISSING_MICROWAVE">Microwave Sensor Offline</option>
                    <option value="POOR_DATA">Poor Data Ingest (No Forecast)</option>
                    <option value="OOD_CASE">Model Out-Of-Distribution</option>
                  </select>
                </div>
                <div className="simulator-buttons">
                  <button
                    className={`sim-btn ${state.modalityStatus.microwave === 'MISSING' ? 'offline' : 'active'}`}
                    onClick={() => toggleModality('microwave')}
                  >
                    MW: {state.modalityStatus.microwave === 'MISSING' ? 'OFFLINE' : 'ONLINE'}
                  </button>
                  <button
                    className={`sim-btn ${state.modalityStatus.scatterometer === 'MISSING' ? 'offline' : 'active'}`}
                    onClick={() => toggleModality('scatterometer')}
                  >
                    SCAT: {state.modalityStatus.scatterometer === 'MISSING' ? 'OFFLINE' : 'ONLINE'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Sidebar */}
          <div className="info-sidebar-wrapper">
            <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-dark)' }}>
              <div className="panel-title">{selectedStorm.name}</div>
              <div className="panel-subtitle text-cyan">{selectedStorm.classification}</div>
            </div>

            <div className="panel-section">
              <div className="panel-section-title">Current State</div>
              <div className="metric-grid">
                <div className="metric-card">
                  <div className="metric-label">Max Wind</div>
                  <div className="metric-value text-mono text-cyan">{selectedStorm.wind} KT</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Central Press.</div>
                  <div className="metric-value text-mono text-cyan">{selectedStorm.pressure} HPa</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Movement</div>
                  <div className="metric-value text-mono">{selectedStorm.movement}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">AI Confidence</div>
                  <div className="metric-value text-mono text-green">{selectedStorm.confidence}%</div>
                </div>
              </div>
            </div>

            <div className="panel-section">
              <div className="panel-section-title">AI Genesis & Struct. Analytics</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span>Genesis Probability (&lt;24H)</span>
                    <span className="text-mono">{selectedStorm.genesisProb}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${selectedStorm.genesisProb}%` }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span>Rapid Intensification Watch</span>
                    <span className="text-mono">{selectedStorm.rapidIntensificationProb}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className={`progress-bar-fill ${selectedStorm.rapidIntensificationProb > 60 ? 'red' : 'amber'}`} style={{ width: `${selectedStorm.rapidIntensificationProb}%` }}></div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '6px' }}>
                  <span>Eye Signature</span>
                  <span className={selectedStorm.eyeSignature === 'DETECTED' ? 'text-red' : 'text-muted'}>
                    {selectedStorm.eyeSignature}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span>Structure Trend</span>
                  <span className="text-cyan font-bold">{selectedStorm.structureTrend}</span>
                </div>
              </div>
            </div>

            <div className="panel-section" style={{ flexGrow: 1, borderBottom: 'none', display: 'flex', alignItems: 'flex-end' }}>
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                onClick={() => navigateTo(`/storms/${selectedStorm.id}`)}
              >
                OPEN STORM ANALYSIS VIEW <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. GENESIS WATCH VIEW
  const renderGenesisView = () => {
    // Collect watch-level or candidate storms
    const candidateList = storms.filter((s) => s.status === 'WATCH' || s.status === 'CANDIDATE');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800' }}>GENESIS WATCH & CANDIDATE DETECTION</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              Early development anomalies and spatiotemporal clustering monitoring
            </p>
          </div>
        </div>

        <div className="storm-analysis-layout">
          {/* Genesis Map */}
          <div className="satellite-viewer-card" style={{ padding: '16px' }}>
            <div className="panel-section-title">NIO Early Disturbances Map</div>
            <div style={{ height: '360px', width: '100%', position: 'relative' }}>
              {renderMap(true, 680, 360)}
            </div>
          </div>

          {/* Evidence and Probabilities Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {candidateList.map((cand) => (
              <div key={cand.id} className={`alert-card ${cand.status === 'WATCH' ? 'warning' : 'info'}`} style={{ margin: 0 }}>
                <div className="alert-header">
                  <div className="alert-title">{cand.name}</div>
                  <span className="text-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Lat/Lon: {cand.lat}°N / {cand.lon}°E
                  </span>
                </div>
                <div style={{ margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span>Genesis Probability (24-48 Hours)</span>
                      <span className="text-mono">{cand.genesisProb}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${cand.genesisProb}%` }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '6px' }}>
                    <span>Estimated Time-to-Genesis</span>
                    <span className="text-mono text-cyan">~ 18 Hours</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span>Model Confidence</span>
                    <span className="text-mono text-green">{cand.confidence}%</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '6px' }}>
                  <div className="panel-section-title" style={{ fontSize: '9px', marginBottom: '6px' }}>SUPPORTING PHYSICAL EVIDENCE</div>
                  <ul style={{ fontSize: '10px', color: 'var(--text-secondary)', paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <li>Convective Core Persistence: &gt;12 Hours (Symmetric cloud pattern starting to cluster)</li>
                    <li>Environmental SST Support: 29.8°C (Favorable heat engine index)</li>
                    <li>Symmetry index: {cand.symmetry}% | Organization: {cand.organization}%</li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 3. STORM ANALYSIS (DETAILED VIEW)
  const renderStormAnalysisView = () => {
    if (state.analysisStatus === 'INSUFFICIENT_EVIDENCE') {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
          <AlertOctagon size={48} className="text-red" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>INSUFFICIENT FORECAST EVIDENCE</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0 24px 0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
            Multiple critical satellite observation modes are offline. System cannot build a reliable forecast with the current configuration.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={() => setScenario('NORMAL')}>
              RESTORE TO NORMAL SCENARIO
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '10px' }} onClick={() => navigateTo('/')}>
                ← BACK
              </button>
              <h2 style={{ fontSize: '16px', fontWeight: '800' }}>{selectedStorm.name} ANALYSIS</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '3px' }}>
              {selectedStorm.classification} · Live Run: {state.lastAnalysisTime}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={() => setShowAnnotateModal(true)}>
              <MessageSquare size={12} style={{ marginRight: '6px' }} /> ADD ANALYST NOTE
            </button>
            <button className="btn-primary" onClick={handleExport}>
              <Download size={12} style={{ marginRight: '6px' }} /> EXPORT REPORT
            </button>
          </div>
        </div>

        {/* Analyst Annotation Saved Message banner */}
        {annotationSavedMsg && (
          <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', padding: '10px', borderRadius: '4px', fontSize: '11px' }}>
            ✓ ANALYST AUDIT ANNOTATION REGISTERED SUCCESSFULLY. EXPORT CONTAINS AUDIT LOGS.
          </div>
        )}

        {/* Top Metric Strip */}
        <div className="status-strip" style={{ padding: '10px 20px' }}>
          <div className="status-strip-item">
            <div className="status-strip-label">Max Sustained Wind</div>
            <div className="status-strip-value text-mono text-cyan">{selectedStorm.wind} KT</div>
          </div>
          <div className="status-strip-item">
            <div className="status-strip-label">Central Pressure</div>
            <div className="status-strip-value text-mono text-cyan">{selectedStorm.pressure} HPa</div>
          </div>
          <div className="status-strip-item">
            <div className="status-strip-label">Movement Vector</div>
            <div className="status-strip-value text-mono">{selectedStorm.movement}</div>
          </div>
          <div className="status-strip-item">
            <div className="status-strip-label">Model Confidence</div>
            <div className="status-strip-value text-mono text-green">{selectedStorm.confidence}%</div>
          </div>
          <div className="status-strip-item">
            <div className="status-strip-label">RI Probability</div>
            <div className="status-strip-value text-mono text-red">{selectedStorm.rapidIntensificationProb}%</div>
          </div>
        </div>

        {/* Core Layout Split */}
        <div className="storm-analysis-layout">
          {/* Left Column: Procedural Imagery & Charts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Satellite Viewer Component */}
            <div className="satellite-viewer-card">
              <div className="scientific-tabs">
                <button
                  className={`scientific-tab ${state.selectedSatelliteMode === 'RAW' ? 'active' : ''}`}
                  onClick={() => updateSimState({ selectedSatelliteMode: 'RAW' })}
                >
                  RAW SATELLITE
                </button>
                <button
                  className={`scientific-tab ${state.selectedSatelliteMode === 'AI_SEGMENTATION' ? 'active' : ''}`}
                  onClick={() => updateSimState({ selectedSatelliteMode: 'AI_SEGMENTATION' })}
                >
                  AI SEGMENTATION
                </button>
                <button
                  className={`scientific-tab ${state.selectedSatelliteMode === 'CENTER_HEATMAP' ? 'active' : ''}`}
                  onClick={() => updateSimState({ selectedSatelliteMode: 'CENTER_HEATMAP' })}
                >
                  CENTER ESTIMATION
                </button>
                <button
                  className={`scientific-tab ${state.selectedSatelliteMode === 'STRUCTURE' ? 'active' : ''}`}
                  onClick={() => updateSimState({ selectedSatelliteMode: 'STRUCTURE' })}
                >
                  STRUCTURE
                </button>
                <button
                  className={`scientific-tab ${state.selectedSatelliteMode === 'ATTENTION' ? 'active' : ''}`}
                  onClick={() => updateSimState({ selectedSatelliteMode: 'ATTENTION' })}
                >
                  XAI ATTENTION
                </button>
              </div>

              {/* Canvas viewport */}
              <div className="satellite-canvas-wrapper">
                <canvas ref={satelliteCanvasRef} width="480" height="380" className="cloud-canvas" />
                
                {/* Meta details Overlay */}
                <div className="satellite-meta">
                  <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    INSAT-3D GEOSPATIAL
                  </div>
                  <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>
                    UTC 14:30 · DELAY: 02m · PRODUCT: {state.selectedSatelliteProduct}
                  </div>
                </div>

                {/* Sub-selector for Satellite band */}
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', display: 'flex', gap: '4px', background: 'rgba(7, 10, 15, 0.85)', padding: '4px', borderRadius: '3px', border: '1px solid var(--border-color)' }}>
                  {['IR', 'WATER_VAPOR', 'CLOUD'].map((prod) => (
                    <button
                      key={prod}
                      style={{ fontSize: '8px', border: 'none', background: state.selectedSatelliteProduct === prod ? 'var(--accent-cyan)' : 'transparent', color: state.selectedSatelliteProduct === prod ? 'var(--bg-darker)' : 'var(--text-secondary)', padding: '2px 6px', borderRadius: '2px', cursor: 'pointer', fontWeight: 700 }}
                      onClick={() => updateSimState({ selectedSatelliteProduct: prod as any })}
                    >
                      {prod}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Intensity Forecast Section */}
            <div className="satellite-viewer-card" style={{ padding: '16px' }}>
              <div className="panel-section-title">AI Intensity Forecast Quantiles (P10 - P50 - P90)</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {renderIntensityChart()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                <span style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>■ P50 Mean Track</span>
                <span style={{ fontSize: '10px', color: 'rgba(56, 189, 248, 0.3)' }}>■ P10 - P90 Uncertainty Envelope</span>
              </div>
            </div>

            {/* Counterfactual Modality Simulator */}
            <div className="satellite-viewer-card" style={{ padding: '16px' }}>
              <div className="panel-section-title">WHAT-IF COUNTERFACTUAL ANALYSIS (MODALITY ATTRIBUTION)</div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Simulate forecasting response if a sensor vanishes. The system cascades uncertainty calculation automatically.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  className={`btn-secondary ${state.modalityStatus.microwave === 'AVAILABLE' ? 'active' : ''}`}
                  onClick={() => updateSimState({ modalityStatus: { ...state.modalityStatus, microwave: 'AVAILABLE' } })}
                  style={{ fontSize: '10px' }}
                >
                  FULL MULTIMODAL DATA
                </button>
                <button
                  className={`btn-secondary ${state.modalityStatus.microwave === 'MISSING' ? 'active' : ''}`}
                  onClick={() => updateSimState({ modalityStatus: { ...state.modalityStatus, microwave: 'MISSING' } })}
                  style={{ fontSize: '10px' }}
                >
                  WITHOUT MICROWAVE (OFFLINE)
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-dark)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '3px' }}>
                <div>
                  <div className="metric-label">Track Estimation Confidence</div>
                  <div className="metric-value text-mono text-cyan" style={{ fontSize: '14px' }}>
                    {selectedStorm.trackConfidence}%
                  </div>
                </div>
                <div>
                  <div className="metric-label">Intensity Estimation Confidence</div>
                  <div className="metric-value text-mono text-cyan" style={{ fontSize: '14px' }}>
                    {selectedStorm.confidence}%
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2', fontSize: '10px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  {state.modalityStatus.microwave === 'MISSING' ? (
                    <span className="text-amber">
                      ⚠ Microwave offline. Forecast continues using geostationary IR and environmental steering variables. Forecast confidence degraded.
                    </span>
                  ) : (
                    <span className="text-green">
                      ✓ All core sensor models aligned. High resolution inner core microwave observations integrated.
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Tabular Forecast, XAI and Consistency Check */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Table Forecast */}
            <div className="satellite-viewer-card" style={{ padding: '16px' }}>
              <div className="panel-section-title">Forecast Coordinates & Track Table</div>
              <table className="scientific-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Lat</th>
                    <th>Lon</th>
                    <th>Wind (P50)</th>
                    <th>Pressure</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {getForecast(selectedStorm.id).map((fp) => (
                    <tr key={fp.lead_h}>
                      <td className="text-mono">{fp.lead_h === 0 ? 'NOW' : `${fp.lead_h}H`}</td>
                      <td className="text-mono">{fp.lat.toFixed(1)}°N</td>
                      <td className="text-mono">{fp.lon.toFixed(1)}°E</td>
                      <td className="text-mono text-cyan">{fp.wind_p50} KT</td>
                      <td className="text-mono">{fp.pressure} HPa</td>
                      <td className="text-mono text-green">{fp.confidence}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Explainable AI panel */}
            <div className="satellite-viewer-card" style={{ padding: '16px' }}>
              <div className="panel-section-title">WHY DID THE MODEL PREDICT THIS? (EXPLAINABLE AI)</div>
              
              <div style={{ marginBottom: '14px' }}>
                <div className="metric-label" style={{ marginBottom: '6px' }}>SATELLITE MODALITY CHANNEL CONTRIBUTION</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                      <span>INSAT IR Cloud Structure</span>
                      <span className="text-mono">{explanation.modalityContributions.irCloud}%</span>
                    </div>
                    <div className="progress-bar-container" style={{ height: '3px' }}>
                      <div className="progress-bar-fill" style={{ width: `${explanation.modalityContributions.irCloud}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                      <span>Water Vapor Channel</span>
                      <span className="text-mono">{explanation.modalityContributions.waterVapor}%</span>
                    </div>
                    <div className="progress-bar-container" style={{ height: '3px' }}>
                      <div className="progress-bar-fill" style={{ width: `${explanation.modalityContributions.waterVapor}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                      <span>Passive Microwave</span>
                      <span className="text-mono">{explanation.modalityContributions.sst}%</span>
                    </div>
                    <div className="progress-bar-container" style={{ height: '3px' }}>
                      <div className="progress-bar-fill" style={{ width: `${explanation.modalityContributions.sst}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                      <span>ASCAT Scatterometer Surface Winds</span>
                      <span className="text-mono">{explanation.modalityContributions.windField}%</span>
                    </div>
                    <div className="progress-bar-container" style={{ height: '3px' }}>
                      <div className="progress-bar-fill" style={{ width: `${explanation.modalityContributions.windField}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div className="metric-label" style={{ marginBottom: '6px' }}>MODEL EVIDENCE ATTRIBUTIONS</div>
                <ul style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {explanation.modelEvidence.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
                <div className="metric-label" style={{ marginBottom: '6px' }}>TEMPORAL ATTENTION SENSITIVITY</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {explanation.temporalInfluence.map((t, idx) => (
                    <div key={idx} style={{ textAlign: 'center', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '3px', flex: 1, margin: '0 2px' }}>
                      <div className="text-mono" style={{ fontSize: '9px', fontWeight: 'bold' }}>{t.frame}</div>
                      <div style={{ fontSize: '8px', color: t.influence === 'VERY HIGH' ? 'var(--accent-red)' : t.influence === 'HIGH' ? 'var(--accent-amber)' : 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>
                        {t.influence}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Safety & Meteorological Consistency */}
            <div className="satellite-viewer-card" style={{ padding: '16px' }}>
              <div className="panel-section-title">PHYSICS & CONSISTENCY CHECKS</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                  <span>Geographic validity bounds</span>
                  <span className="text-green" style={{ fontWeight: 'bold' }}>✓ PASS</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                  <span>Spatiotemporal track continuity</span>
                  <span className="text-green" style={{ fontWeight: 'bold' }}>✓ PASS</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                  <span>Intensity transition bounds check</span>
                  <span className="text-green" style={{ fontWeight: 'bold' }}>✓ PASS</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                  <span>Pressure-Wind correlation (Wind &lt;-&gt; Pressure consistency)</span>
                  <span className="text-green" style={{ fontWeight: 'bold' }}>✓ PASS</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                  <span>Out-of-Distribution shift score</span>
                  {state.currentScenario === 'OOD_CASE' ? (
                    <span className="text-red" style={{ fontWeight: 'bold' }}>⚠ ELEVATED</span>
                  ) : (
                    <span className="text-green" style={{ fontWeight: 'bold' }}>✓ LOW</span>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px', fontSize: '10px', color: 'var(--text-muted)' }}>
                {state.currentScenario === 'OOD_CASE' ? (
                  <span className="text-red">
                    ⚠ Warning: Ambient inputs show anomalous values. Model predictions should be reviewed with elevated caution.
                  </span>
                ) : (
                  <span>
                    Physics checking system verifies that the multi-task heads produce meteorologically consistent outputs.
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  // 4. HISTORICAL REPLAY VIEW
  const renderHistoricalReplayView = () => {
    const historicalStorms = getHistoricalStorms();
    const activeReplayStorm = historicalStorms.find((s) => s.id === state.selectedHistoricalStormId) || historicalStorms[0];
    const activeState = activeReplayStorm.states[state.historicalTimeIndex];

    const handleReplaySlider = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateSimState({ historicalTimeIndex: parseInt(e.target.value) });
    };

    const handleRunAIReplay = () => {
      updateSimState({ isPlayingHistorical: true });
      let current = 0;
      const interval = setInterval(() => {
        if (current < 8) {
          updateSimState({ historicalTimeIndex: current });
          current++;
        } else {
          clearInterval(interval);
          updateSimState({ isPlayingHistorical: false });
        }
      }, 700);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '800' }}>HISTORICAL REPLAY & BENCHMARKING</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            Replay historical storms, inspect track deviation, and compare AI predictions vs observed best-track coordinates
          </p>
        </div>

        {/* Historical Controls Strip */}
        <div className="historical-controls-strip">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SELECT CASE STUDY:</span>
              <select
                value={state.selectedHistoricalStormId}
                onChange={(e) => updateSimState({ selectedHistoricalStormId: e.target.value, historicalTimeIndex: 4 })}
                style={{ background: 'var(--bg-darker)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '3px', fontSize: '11px' }}
              >
                {historicalStorms.map((hs) => (
                  <option key={hs.id} value={hs.id}>
                    {hs.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn-primary" onClick={handleRunAIReplay} disabled={state.isPlayingHistorical}>
              <Play size={12} /> {state.isPlayingHistorical ? 'REPLAY IN PROGRESS...' : '▶ RUN AI REPLAY'}
            </button>
          </div>

          {/* Timeline slider */}
          <div className="timeline-slider-container">
            <input
              type="range"
              min="0"
              max="7"
              value={state.historicalTimeIndex}
              onChange={handleReplaySlider}
              className="timeline-range-input"
            />
            <div className="timeline-ticks">
              {activeReplayStorm.states.map((st, i) => (
                <span
                  key={i}
                  className="timeline-tick-label"
                  style={{
                    left: `${(i / 7) * 100}%`,
                    fontWeight: state.historicalTimeIndex === i ? '700' : '400',
                    color: state.historicalTimeIndex === i ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  }}
                >
                  {st.timeOffset}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Split Grid */}
        <div className="storm-analysis-layout">
          {/* Map Viewer */}
          <div className="satellite-viewer-card" style={{ padding: '16px' }}>
            <div className="panel-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Historical Track Map</span>
              <span className="text-mono text-cyan">{activeState.timestamp}</span>
            </div>
            <div style={{ height: '360px', width: '100%', position: 'relative' }}>
              {/* Custom historical map rendering */}
              <svg width="100%" height="100%" viewBox="0 0 680 360" className="map-canvas-container">
                {/* Lat/Lon gridlines */}
                {[55, 65, 75, 85, 95].map((lon) => {
                  const { x: x1 } = convertCoords(latMin, lon, 680, 360);
                  const { x: x2 } = convertCoords(latMax, lon, 680, 360);
                  return <line key={lon} x1={x1} y1={0} x2={x2} y2={360} className="map-grid-lines" />;
                })}
                {[5, 15, 25].map((lat) => {
                  const { y: y1 } = convertCoords(lat, lonMin, 680, 360);
                  const { y: y2 } = convertCoords(lat, lonMax, 680, 360);
                  return <line key={lat} x1={0} y1={y1} x2={680} y2={y2} className="map-grid-lines" />;
                })}

                {/* Coastlines */}
                <path d={toPath(indiaCoast)} className="map-coastline" fill="none" />
                <path d={toPath(sriLankaCoast)} className="map-coastline" />
                <path d={toPath(bangladeshMyanmarCoast)} className="map-coastline" fill="none" />

                {/* Draw AI Forecast Track */}
                {(() => {
                  const fcCoords = activeState.forecastPoints.map((fp) => [fp.lat, fp.lon]);
                  const fcPath = toPath([[activeState.lat, activeState.lon], ...fcCoords]);
                  return <path d={fcPath} fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeDasharray="3 3" />;
                })()}

                {/* Draw Actual Ground Truth Track */}
                {(() => {
                  const allActualPoints = activeReplayStorm.states
                    .filter((s) => s.actualLat !== undefined)
                    .map((s) => [s.actualLat!, s.actualLon!]);
                  return <path d={toPath(allActualPoints)} fill="none" stroke="var(--accent-green)" strokeWidth="2" />;
                })()}

                {/* Current positions */}
                {(() => {
                  const { x: ax, y: ay } = convertCoords(activeState.lat, activeState.lon, 680, 360);
                  return (
                    <g transform={`translate(${ax}, ${ay})`}>
                      <circle cx="0" cy="0" r="6" fill="var(--accent-cyan)" />
                      <text x="8" y="2" fill="var(--accent-cyan)" fontSize="9px" fontWeight="bold">
                        AI Center
                      </text>
                    </g>
                  );
                })()}

                {activeState.actualLat !== undefined && activeState.actualLon !== undefined && (() => {
                  const { x: gx, y: gy } = convertCoords(activeState.actualLat!, activeState.actualLon!, 680, 360);
                  return (
                    <g transform={`translate(${gx}, ${gy})`}>
                      <circle cx="0" cy="0" r="4" fill="var(--accent-green)" />
                      <text x="8" y="-6" fill="var(--accent-green)" fontSize="9px" fontWeight="bold">
                        Ground Truth
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
              <span style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>■ AI Prediction Track</span>
              <span style={{ fontSize: '10px', color: 'var(--accent-green)' }}>■ Actual Best-Track (Ground Truth)</span>
            </div>
          </div>

          {/* Verification Metrics Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="satellite-viewer-card" style={{ padding: '16px' }}>
              <div className="panel-section-title">REPLAY OBSERVATION METRICS</div>
              <div className="metric-grid" style={{ marginBottom: '14px' }}>
                <div className="metric-card">
                  <div className="metric-label">Observed Wind (AI)</div>
                  <div className="metric-value text-mono text-cyan">{activeState.wind} KT</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Actual Wind (GT)</div>
                  <div className="metric-value text-mono text-green">
                    {activeState.actualWind !== undefined ? `${activeState.actualWind} KT` : '--'}
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Pressure (AI)</div>
                  <div className="metric-value text-mono">{activeState.pressure} HPa</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Actual Pressure (GT)</div>
                  <div className="metric-value text-mono text-green">
                    {activeState.actualPressure !== undefined ? `${activeState.actualPressure} HPa` : '--'}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div className="panel-section-title" style={{ fontSize: '9px', marginBottom: '8px' }}>AI PREDICTION VS ACTUAL ERROR</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Track Displacement Error @ 24H</span>
                    <span className="text-mono text-cyan">42 KM (DEMO PLACEHOLDER)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Intensity Estimation Error @ 24H</span>
                    <span className="text-mono text-cyan">6 KT (DEMO PLACEHOLDER)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Baseline Ablations table */}
            <div className="satellite-viewer-card" style={{ padding: '16px' }}>
              <div className="panel-section-title">Model Baseline Ablation Comparison</div>
              <table className="scientific-table">
                <thead>
                  <tr>
                    <th>Baseline</th>
                    <th>Intensity MAE</th>
                    <th>Track Error 24H</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>B0: Persistence Model</td>
                    <td className="text-mono">12.5 KT</td>
                    <td className="text-mono">82 km</td>
                  </tr>
                  <tr>
                    <td>B1: Single-channel CNN</td>
                    <td className="text-mono">8.4 KT</td>
                    <td className="text-mono">58 km</td>
                  </tr>
                  <tr style={{ background: 'rgba(56, 189, 248, 0.05)' }}>
                    <td className="text-cyan">B5: Full Multimodal (TC-INTEL)</td>
                    <td className="text-mono text-cyan">5.4 KT</td>
                    <td className="text-mono text-cyan">42 km</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper coastline path generator for map visuals
  const toPath = (coords: number[][]) => {
    return coords
      .map((c, i) => {
        const { x, y } = convertCoords(c[0], c[1], 680, 360);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // 5. DATA HEALTH VIEW
  const renderDataHealthView = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '800' }}>DATA PIPELINE & SENSOR HEALTH</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            Real-time latency, age, and observation stream quality monitoring
          </p>
        </div>

        {/* Global health state */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '16px' }}>
          <div className="satellite-viewer-card" style={{ padding: '16px' }}>
            <div className="panel-section-title">INTEGRATION QUALITY SCORE</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '28px', fontWeight: '800' }} className="text-green">
                {dataHealth.score}%
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>OPERATIONAL LIMIT: &gt;75%</span>
            </div>
          </div>
          <div className="satellite-viewer-card" style={{ padding: '16px' }}>
            <div className="panel-section-title">PRIMARY INGEST LATENCY</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '28px', fontWeight: '800' }}>
                {dataHealth.latency}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>LAST INGEST: {dataHealth.lastIngest}</span>
            </div>
          </div>
          <div className="satellite-viewer-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '11px' }}>
              <Wifi size={14} /> LIVE SAT FEED STATUS
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              System actively listening to INSAT-3D/3DR geostationary broadcasts and ASCAT L2 polar runs.
            </p>
          </div>
        </div>

        {/* Source Table */}
        <div className="satellite-viewer-card" style={{ padding: '16px' }}>
          <div className="panel-section-title">SENSOR STREAM REGISTRY</div>
          <table className="scientific-table">
            <thead>
              <tr>
                <th>Source Stream</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Last Obs Time</th>
                <th>Age</th>
                <th>Quality Score</th>
              </tr>
            </thead>
            <tbody>
              {dataHealth.sources.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 'bold' }}>{s.source}</td>
                  <td className="text-mono">{s.priority}</td>
                  <td>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontWeight: '700',
                        background:
                          s.status === 'AVAILABLE'
                            ? 'rgba(52, 211, 153, 0.1)'
                            : s.status === 'STALE' || s.status === 'DEGRADED'
                            ? 'rgba(251, 191, 36, 0.1)'
                            : 'rgba(248, 113, 113, 0.1)',
                        color:
                          s.status === 'AVAILABLE'
                            ? 'var(--accent-green)'
                            : s.status === 'STALE' || s.status === 'DEGRADED'
                            ? 'var(--accent-amber)'
                            : 'var(--accent-red)',
                      }}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="text-mono">{s.lastObservation}</td>
                  <td className="text-mono">{s.age}</td>
                  <td className="text-mono" style={{ color: s.quality > 80 ? 'var(--accent-green)' : s.quality > 50 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>
                    {s.quality}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pipeline flowchart */}
        <div className="satellite-viewer-card" style={{ padding: '16px' }}>
          <div className="panel-section-title">OBSERVATION PIPELINE STAGES</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0', overflowX: 'auto', gap: '10px' }}>
            {[
              { title: 'INGEST', desc: 'Raw telemetry ingest' },
              { title: 'QUALITY CONTROL', desc: 'Outlier rejection' },
              { title: 'TIME ALIGNMENT', desc: 'Temporal sync' },
              { title: 'GEOREGISTRATION', desc: 'Earth coordinate alignment' },
              { title: 'COMMON GRID', desc: 'Uniform resolution resample' },
              { title: 'STORM CUBE', desc: 'Storm-centered crop' },
              { title: 'FUSION READY', desc: 'Multimodal feed align' },
            ].map((p, idx) => (
              <div key={idx} style={{ flex: 1, minWidth: '110px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '4px', textAlign: 'center', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                  <span style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--accent-green)', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                    ✓
                  </span>
                </div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{p.title}</div>
                <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 6. ALERT CENTER VIEW
  const renderAlertsView = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '800' }}>ALERT CENTER</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            System-generated operational alarms and hazard triggers
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {alerts.map((al) => (
            <div key={al.id} className={`alert-card ${al.level.toLowerCase()}`}>
              <div className="alert-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={14} className={al.level === 'CRITICAL' ? 'text-red' : 'text-amber'} />
                  <span className="alert-title">{al.title}</span>
                </div>
                <span className="text-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {al.timestamp}
                </span>
              </div>
              <div className="alert-desc">{al.detail}</div>
              {al.stormId && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '9px', padding: '3px 6px' }}
                    onClick={() => {
                      updateSimState({ selectedStormId: al.stormId });
                      navigateTo(`/storms/${al.stormId}`);
                    }}
                  >
                    INVESTIGATE STORM
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 7. MODEL INTELLIGENCE VIEW
  const renderModelIntelligenceView = () => {
    const handleEndpointClick = (endpoint: string) => {
      setApiActiveEndpoint(endpoint);
      // Fetch dynamic JSON mock output
      let res = '';
      if (endpoint === '/storms/current') {
        res = exportForecastReport(selectedStorm.id, 'json');
      } else if (endpoint === '/data-health') {
        res = JSON.stringify(dataHealth, null, 2);
      } else if (endpoint === '/models/version') {
        res = JSON.stringify(modelVer, null, 2);
      } else {
        res = JSON.stringify({ message: `API Endpoint ${endpoint} mock verified.` }, null, 2);
      }
      setApiConsoleResponse(res);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '800' }}>MODEL INTELLIGENCE & ARCHITECTURE</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            Multimodal Fusion, Cascaded Multitask Heads, and Operational Validation Metrics
          </p>
        </div>

        {/* Model Meta info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '16px' }}>
          <div className="satellite-viewer-card" style={{ padding: '16px' }}>
            <div className="panel-section-title">CHAMPION MODEL VERSION</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
              {modelVer.id}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
              GIT SHA: {modelVer.gitCommit}
            </div>
          </div>
          <div className="satellite-viewer-card" style={{ padding: '16px' }}>
            <div className="panel-section-title">EVALUATION METRICS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Intensity MAE</span>
                <span className="text-mono text-cyan">{modelMetrics.intensityMAE}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Segmentation Dice</span>
                <span className="text-mono text-cyan">{modelMetrics.segmentationDice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Track displacement error 24H</span>
                <span className="text-mono text-cyan">{modelMetrics.trackError['24h']}</span>
              </div>
            </div>
          </div>
          <div className="satellite-viewer-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent-green)' }}>
              <Award size={14} /> LEAKAGE PROTECTION
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Temporal cross-validation split by Storm Season ID. Prevents multi-frame data leakage.
            </p>
          </div>
        </div>

        {/* Interactive Architecture Flowchart */}
        <div className="satellite-viewer-card" style={{ padding: '16px' }}>
          <div className="panel-section-title">MULTIMODAL FUSION ARCHITECTURE</div>
          <div style={{ background: 'var(--bg-dark)', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '4px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', minWidth: '600px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '10px', borderRadius: '3px' }}>INSAT IR/VIS (P0)</div>
                <div style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '10px', borderRadius: '3px' }}>Polar Microwave (P1)</div>
                <div style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '10px', borderRadius: '3px' }}>Scatterometer winds (P1)</div>
              </div>
              <div className="text-cyan" style={{ fontSize: '16px' }}>→</div>
              <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid var(--accent-cyan)', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11px' }}>CROSS-MODAL ATTENTION BLOCK</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>Modality dropout weights & masks</div>
              </div>
              <div className="text-cyan" style={{ fontSize: '16px' }}>→</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid var(--accent-green)', padding: '6px 12px', fontSize: '10px', borderRadius: '3px' }}>Classification (Category)</div>
                <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid var(--accent-green)', padding: '6px 12px', fontSize: '10px', borderRadius: '3px' }}>Regression (Wind/Pressure)</div>
                <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid var(--accent-green)', padding: '6px 12px', fontSize: '10px', borderRadius: '3px' }}>Future Track Predictor</div>
              </div>
            </div>
          </div>
        </div>

        {/* API Sandbox Console */}
        <div className="storm-analysis-layout">
          <div className="satellite-viewer-card" style={{ padding: '16px' }}>
            <div className="panel-section-title">ASSISTIVE FORECAST API INTERACTIVE SANDBOX</div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              REST API endpoints matching standard output formats. Click to test sandbox response:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                '/storms/current',
                '/data-health',
                '/models/version',
              ].map((endpoint) => (
                <button
                  key={endpoint}
                  className={`btn-secondary ${apiActiveEndpoint === endpoint ? 'active' : ''}`}
                  style={{ textAlign: 'left', fontSize: '11px', padding: '8px 12px', fontFamily: 'var(--font-mono)' }}
                  onClick={() => handleEndpointClick(endpoint)}
                >
                  GET {endpoint}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="panel-section-title">Sandbox Response Console</div>
            <pre className="code-box" style={{ height: '240px', overflowY: 'auto', margin: 0 }}>
              {apiConsoleResponse || '// Select an endpoint to view mock response JSON'}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`app-container ${state.presentationMode ? 'presentation-mode' : ''}`}>
      
      {/* 1. persistent desktop left navigation */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            TC-INTEL <span>INDIA</span>
          </div>
          <div style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.05em' }}>
            AI Cyclone Intelligence
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Command center</div>
          <a className={`nav-item ${route === '/' ? 'active' : ''}`} href="#/" title="Live Dashboard" aria-label="Live Dashboard" aria-current={route === '/' ? 'page' : undefined}>
            <Activity size={14} /> <span className="nav-label">Live Dashboard</span>
          </a>
          <a className={`nav-item ${route.startsWith('/storms/') ? 'active' : ''}`} href={`#/storms/${selectedStorm.id}`} title="Storm Analysis" aria-label="Storm Analysis" aria-current={route.startsWith('/storms/') ? 'page' : undefined}>
            <Wind size={14} /> <span className="nav-label">Storm Analysis</span>
          </a>
          
          <div className="nav-section-title" style={{ marginTop: '10px' }}>Observations</div>
          <a className={`nav-item ${route === '/genesis' ? 'active' : ''}`} href="#/genesis" title="Genesis Watch" aria-label="Genesis Watch" aria-current={route === '/genesis' ? 'page' : undefined}>
            <Layers size={14} /> <span className="nav-label">Genesis Watch</span>
          </a>
          <a className={`nav-item ${route === '/historical' ? 'active' : ''}`} href="#/historical" title="Historical Replay" aria-label="Historical Replay" aria-current={route === '/historical' ? 'page' : undefined}>
            <BookOpen size={14} /> <span className="nav-label">Historical Replay</span>
          </a>

          <div className="nav-section-title" style={{ marginTop: '10px' }}>System health</div>
          <a className={`nav-item ${route === '/alerts' ? 'active' : ''}`} href="#/alerts" title="Alert Center" aria-label={alerts.length > 0 ? `Alert Center, ${alerts.length} active alerts` : 'Alert Center'} aria-current={route === '/alerts' ? 'page' : undefined}>
            <AlertTriangle size={14} /> <span className="nav-label">Alert Center</span>
            {alerts.length > 0 && (
              <span className="nav-badge">
                {alerts.length}
              </span>
            )}
          </a>
          <a className={`nav-item ${route === '/data-health' ? 'active' : ''}`} href="#/data-health" title="Data Freshness" aria-label="Data Freshness" aria-current={route === '/data-health' ? 'page' : undefined}>
            <Database size={14} /> <span className="nav-label">Data Freshness</span>
          </a>
          <a className={`nav-item ${route === '/model' ? 'active' : ''}`} href="#/model" title="Model Intel" aria-label="Model Intel" aria-current={route === '/model' ? 'page' : undefined}>
            <Terminal size={14} /> <span className="nav-label">Model Intel</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-dot pulse"></span>
            <span>SYSTEM OPERATIONAL</span>
          </div>
          <div>v0.9 SIH PROTOTYPE</div>
        </div>
      </aside>

      {/* 2. Main content pane */}
      <main className="app-main">
        {/* Topbar */}
        <header className="app-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">
              {route === '/' && 'COMMAND CENTER'}
              {route.startsWith('/storms/') && `${selectedStorm.name} ADVANCED ANALYSIS`}
              {route === '/genesis' && 'GENESIS INTELLIGENCE'}
              {route === '/historical' && 'HISTORICAL REPLAY & BENCHMARKS'}
              {route === '/alerts' && 'ALERT CENTER'}
              {route === '/data-health' && 'DATA STREAM Freshness'}
              {route === '/model' && 'MODEL ARCHITECTURE'}
            </h1>
            <span className="topbar-subtitle">NORTH INDIAN OCEAN MONITORING</span>
          </div>

          <div className="topbar-middle">
            <span>● PROTOTYPE WORKSPACE</span>
          </div>

          <div className="topbar-right">
            <span className="text-mono">UTC {currentTime}</span>
            <button
              className="btn-secondary"
              style={{ padding: '3px 6px', fontSize: '9px' }}
              onClick={() => updateSimState({ presentationMode: !state.presentationMode })}
            >
              {state.presentationMode ? 'EXIT PRESENTATION' : 'PRESENTATION MODE'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={12} />
              <span>Analyst</span>
            </div>
          </div>
        </header>

        {/* Content viewport */}
        <div className="page-content">
          {renderCurrentView()}
        </div>
      </main>

      {/* ============================================================================
         MODALS & DIALOGS
         ============================================================================ */}

      {/* 1. Ingress Processing Progress Loader modal */}
      {showAnalysisModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>
              EXECUTING SATELLITE MULTIMODAL INFERENCE
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '20px' }}>
              {activeAnalysisStep}
            </p>
            <div className="progress-bar-container" style={{ height: '6px', marginBottom: '16px' }}>
              <div className="progress-bar-fill" style={{ width: `${analysisPercent}%` }}></div>
            </div>
            <div className="text-mono" style={{ fontSize: '12px' }}>
              {analysisPercent}%
            </div>
          </div>
        </div>
      )}

      {/* 2. Export report overlay dialog */}
      {showExportModal && exportedReport && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '80%', maxWidth: '800px', display: 'flex', flexDirection: 'column', height: '80%' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="panel-title">FORECAST REPORT OUTPUTS</span>
                <span className="panel-subtitle" style={{ marginLeft: '12px' }}>Assisted decision-support metrics export</span>
              </div>
              <button className="btn-secondary" onClick={() => setShowExportModal(false)}>
                ✕
              </button>
            </div>
            
            <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="panel-section-title" style={{ margin: 0 }}>Human Readable Text</span>
                  <button className="btn-secondary" style={{ fontSize: '10px', padding: '3px 6px' }} onClick={() => downloadReport('txt')}>
                    Download TXT
                  </button>
                </div>
                <pre style={{ flexGrow: 1, overflowY: 'auto', background: '#05070a', border: '1px solid var(--border-color)', padding: '10px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {exportedReport.txt}
                </pre>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="panel-section-title" style={{ margin: 0 }}>Machine Readable JSON</span>
                  <button className="btn-secondary" style={{ fontSize: '10px', padding: '3px 6px' }} onClick={() => downloadReport('json')}>
                    Download JSON
                  </button>
                </div>
                <pre style={{ flexGrow: 1, overflowY: 'auto', background: '#05070a', border: '1px solid var(--border-color)', padding: '10px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', whiteSpace: 'pre-wrap' }}>
                  {exportedReport.json}
                </pre>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', padding: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginRight: 'auto', display: 'flex', alignItems: 'center' }}>
                ⚠ Assistive predictions. Not a replacement for official Warnings.
              </span>
              <button className="btn-secondary" onClick={() => setShowExportModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'none' }}>{simVersion}</div>

      {/* 3. Analyst Review feedback editor popup */}
      {showAnnotateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="panel-header">
              <div className="panel-title">HUMAN-IN-THE-LOOP METEOROLOGIST REVIEW</div>
              <div className="panel-subtitle">Correct AI outputs & append notes to the training audit log</div>
            </div>
            
            <form onSubmit={handleSaveAnnotation} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Observed Structural Issue
                </label>
                <input
                  type="text"
                  value={annIssue}
                  onChange={(e) => setAnnIssue(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-darker)', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '3px', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Corrected Lat
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={annLat}
                    onChange={(e) => setAnnLat(parseFloat(e.target.value))}
                    style={{ width: '100%', background: 'var(--bg-darker)', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '3px', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Corrected Lon
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={annLon}
                    onChange={(e) => setAnnLon(parseFloat(e.target.value))}
                    style={{ width: '100%', background: 'var(--bg-darker)', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '3px', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Corrected Classification
                </label>
                <select
                  value={annClass}
                  onChange={(e) => setAnnClass(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-darker)', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '3px', color: 'var(--text-primary)' }}
                >
                  <option value="CYCLONIC STORM">Cyclonic Storm</option>
                  <option value="SEVERE CYCLONIC STORM">Severe Cyclonic Storm</option>
                  <option value="VERY SEVERE CYCLONIC STORM">Very Severe Cyclonic Storm</option>
                  <option value="EXTREMELY SEVERE CYCLONIC STORM">Extremely Severe Cyclonic Storm</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Comment / Explanation
                </label>
                <textarea
                  rows={3}
                  value={annComment}
                  onChange={(e) => setAnnComment(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-darker)', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '3px', color: 'var(--text-primary)', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAnnotateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Annotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
