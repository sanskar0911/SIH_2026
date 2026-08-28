from typing import List, Dict, Any, Optional
from app.schemas.storm import StormSchema
from app.schemas.forecast import ForecastPointSchema
from app.schemas.system import DataHealthSchema, SourceHealthSchema, ModalityStatusType, ModelPerformanceSchema, ModelVersionSchema
from app.schemas.alert import AlertSchema
from app.schemas.explanation import ExplanationSchema, ModalityContributionsSchema, TemporalInfluenceItem
from app.schemas.annotation import AnnotationSchema

class ScenarioEngine:
    def __init__(self):
        self.current_scenario: str = "NORMAL"
        self.modality_status: Dict[str, ModalityStatusType] = {
            "ir": "AVAILABLE",
            "microwave": "AVAILABLE",
            "scatterometer": "AVAILABLE",
            "sst": "AVAILABLE",
            "environment": "AVAILABLE"
        }
        self.custom_annotations: List[AnnotationSchema] = []
        self.analysis_status: str = "READY"
        self.last_analysis_time: str = "14:32 UTC"

    def set_scenario(self, scenario: str) -> Dict[str, Any]:
        self.current_scenario = scenario
        # Reset modalities
        self.modality_status = {
            "ir": "AVAILABLE",
            "microwave": "AVAILABLE",
            "scatterometer": "AVAILABLE",
            "sst": "AVAILABLE",
            "environment": "AVAILABLE"
        }
        self.analysis_status = "READY"

        if scenario == "MISSING_MICROWAVE":
            self.modality_status["microwave"] = "MISSING"
        elif scenario == "SATELLITE_GAP":
            self.modality_status["ir"] = "STALE"
        elif scenario == "POOR_DATA":
            self.modality_status["microwave"] = "MISSING"
            self.modality_status["scatterometer"] = "MISSING"
            self.modality_status["environment"] = "DEGRADED"
            self.modality_status["sst"] = "UNRELIABLE"
            self.analysis_status = "INSUFFICIENT_EVIDENCE"
        elif scenario == "OOD_CASE":
            self.analysis_status = "DEGRADED"

        return {
            "message": f"Scenario updated to '{scenario}'",
            "currentScenario": self.current_scenario,
            "modalityStatus": self.modality_status,
            "analysisStatus": self.analysis_status
        }

    def toggle_modality(self, modality: str) -> Dict[str, ModalityStatusType]:
        if modality in self.modality_status:
            current = self.modality_status[modality]
            next_status: ModalityStatusType = "MISSING" if current == "AVAILABLE" else "AVAILABLE"
            self.modality_status[modality] = next_status
        return self.modality_status

    def toggle_specific_modality(self, modality: str, status: Optional[str] = None) -> Dict[str, ModalityStatusType]:
        if modality in self.modality_status:
            if status:
                self.modality_status[modality] = status
            else:
                self.toggle_modality(modality)
        return self.modality_status

    def get_active_storms(self) -> List[StormSchema]:
        confidence_modifier = 0.0
        if self.modality_status["microwave"] == "MISSING":
            confidence_modifier -= 5.0
        if self.modality_status["scatterometer"] == "MISSING":
            confidence_modifier -= 3.0
        if self.modality_status["environment"] in ["DEGRADED", "STALE"]:
            confidence_modifier -= 4.0
        if self.modality_status["ir"] == "STALE":
            confidence_modifier -= 10.0

        storms: List[StormSchema] = []

        # NIO-DEMO-001 (Seeded Demo Cyclone for Judges)
        demo_storm = StormSchema(
            id="NIO-DEMO-001",
            name="NIO-DEMO-001",
            classification="SUPER CYCLONIC STORM",
            status="ACTIVE",
            lat=16.4,
            lon=85.2,
            wind=115.0,
            pressure=932.0,
            movement="NW 16 KM/H",
            confidence=max(50.0, 94.0 + confidence_modifier),
            genesisProb=99.0,
            rapidIntensificationProb=88.0,
            trackConfidence=max(50.0, 92.0 + confidence_modifier),
            landInteraction="HIGH",
            organization=96.0,
            symmetry=92.0,
            eyeSignature="DETECTED",
            eyewallConfidence=98.0,
            structureTrend="STRENGTHENING",
            asymmetry=10.0
        )
        storms.append(demo_storm)

        # TC-ARUN
        arun = StormSchema(
            id="TC-ARUN",
            name="TC-ARUN",
            classification="VERY SEVERE CYCLONIC STORM",
            status="ACTIVE",
            lat=15.8,
            lon=84.6,
            wind=78.0,
            pressure=972.0,
            movement="NW 12 KM/H",
            confidence=max(50.0, 91.0 + confidence_modifier),
            genesisProb=98.0,
            rapidIntensificationProb=64.0,
            trackConfidence=max(50.0, 87.0 + confidence_modifier),
            landInteraction="MODERATE",
            organization=87.0,
            symmetry=72.0,
            eyeSignature="DETECTED",
            eyewallConfidence=81.0,
            structureTrend="STRENGTHENING",
            asymmetry=28.0
        )

        if self.current_scenario == "WEAK_DISTURBANCE":
            arun.classification = "CYCLONIC STORM"
            arun.wind = 38.0
            arun.pressure = 998.0
            arun.movement = "W 8 KM/H"
            arun.rapidIntensificationProb = 12.0
            arun.organization = 45.0
            arun.symmetry = 50.0
            arun.eyeSignature = "NOT DETECTED"
            arun.eyewallConfidence = 15.0
            arun.structureTrend = "STEADY"
            arun.asymmetry = 55.0
        elif self.current_scenario == "RAPID_INTENSIFICATION":
            arun.classification = "EXTREMELY SEVERE CYCLONIC STORM"
            arun.wind = 98.0
            arun.pressure = 948.0
            arun.rapidIntensificationProb = 92.0
            arun.organization = 95.0
            arun.symmetry = 89.0
            arun.eyeSignature = "DETECTED"
            arun.eyewallConfidence = 96.0
            arun.structureTrend = "STRENGTHENING"
            arun.asymmetry = 12.0
        elif self.current_scenario == "RAPID_WEAKENING":
            arun.classification = "SEVERE CYCLONIC STORM"
            arun.wind = 52.0
            arun.pressure = 988.0
            arun.movement = "N 10 KM/H"
            arun.rapidIntensificationProb = 5.0
            arun.organization = 60.0
            arun.symmetry = 55.0
            arun.eyeSignature = "NOT DETECTED"
            arun.structureTrend = "WEAKENING"
            arun.asymmetry = 48.0
        elif self.current_scenario == "LAND_INTERACTION":
            arun.lat = 19.4
            arun.lon = 85.1
            arun.movement = "NW 15 KM/H"
            arun.landInteraction = "HIGH"
            arun.wind = 74.0
            arun.pressure = 975.0
        elif self.current_scenario == "POOR_DATA":
            arun.confidence = max(20.0, 42.0 + confidence_modifier)
            arun.trackConfidence = max(20.0, 38.0 + confidence_modifier)
            arun.eyeSignature = "NOT DETECTED"
            arun.eyewallConfidence = 30.0
        elif self.current_scenario == "OOD_CASE":
            arun.confidence = 55.0

        storms.append(arun)

        # TC-VEER
        veer = StormSchema(
            id="TC-VEER",
            name="TC-VEER",
            classification="CYCLONIC STORM",
            status="ACTIVE",
            lat=17.2,
            lon=68.4,
            wind=45.0,
            pressure=990.0,
            movement="NE 15 KM/H",
            confidence=max(50.0, 84.0 + confidence_modifier),
            genesisProb=88.0,
            rapidIntensificationProb=24.0,
            trackConfidence=max(50.0, 80.0 + confidence_modifier),
            landInteraction="LOW",
            organization=65.0,
            symmetry=58.0,
            eyeSignature="NOT DETECTED",
            eyewallConfidence=34.0,
            structureTrend="STEADY",
            asymmetry=42.0
        )
        storms.append(veer)

        # TC-MAYA
        maya = StormSchema(
            id="TC-MAYA",
            name="TC-MAYA",
            classification="DEPRESSION",
            status="WATCH",
            lat=8.5,
            lon=87.2,
            wind=30.0,
            pressure=1002.0,
            movement="W 10 KM/H",
            confidence=max(40.0, 76.0 + confidence_modifier),
            genesisProb=71.0,
            rapidIntensificationProb=8.0,
            trackConfidence=max(40.0, 72.0 + confidence_modifier),
            landInteraction="LOW",
            organization=52.0,
            symmetry=48.0,
            eyeSignature="NOT DETECTED",
            eyewallConfidence=10.0,
            structureTrend="STRENGTHENING",
            asymmetry=50.0
        )
        storms.append(maya)

        if self.current_scenario == "MULTIPLE_DISTURBANCES":
            samudra = StormSchema(
                id="TC-SAMUDRA",
                name="TC-SAMUDRA",
                classification="SEVERE CYCLONIC STORM",
                status="ACTIVE",
                lat=11.2,
                lon=62.1,
                wind=55.0,
                pressure=984.0,
                movement="WNW 18 KM/H",
                confidence=max(50.0, 82.0 + confidence_modifier),
                genesisProb=95.0,
                rapidIntensificationProb=38.0,
                trackConfidence=max(50.0, 79.0 + confidence_modifier),
                landInteraction="LOW",
                organization=70.0,
                symmetry=66.0,
                eyeSignature="NOT DETECTED",
                eyewallConfidence=50.0,
                structureTrend="STRENGTHENING",
                asymmetry=35.0
            )
            storms.append(samudra)

        dist4 = StormSchema(
            id="DISTURBANCE-04",
            name="DISTURBANCE-04",
            classification="LOW PRESSURE AREA",
            status="CANDIDATE",
            lat=12.0,
            lon=92.0,
            wind=20.0,
            pressure=1008.0,
            movement="NW 5 KM/H",
            confidence=68.0,
            genesisProb=68.0,
            rapidIntensificationProb=2.0,
            trackConfidence=54.0,
            landInteraction="LOW",
            organization=30.0,
            symmetry=25.0,
            eyeSignature="NOT DETECTED",
            eyewallConfidence=0.0,
            structureTrend="STEADY",
            asymmetry=70.0
        )
        storms.append(dist4)

        dist7 = StormSchema(
            id="DISTURBANCE-07",
            name="DISTURBANCE-07",
            classification="TROPICAL DISTURBANCE",
            status="CANDIDATE",
            lat=14.5,
            lon=64.0,
            wind=15.0,
            pressure=1012.0,
            movement="W 5 KM/H",
            confidence=43.0,
            genesisProb=43.0,
            rapidIntensificationProb=0.0,
            trackConfidence=35.0,
            landInteraction="LOW",
            organization=15.0,
            symmetry=18.0,
            eyeSignature="NOT DETECTED",
            eyewallConfidence=0.0,
            structureTrend="STEADY",
            asymmetry=85.0
        )
        storms.append(dist7)

        return storms

    def get_forecast(self, storm_id: str) -> List[ForecastPointSchema]:
        uncertainty_mult = 1.0
        if self.modality_status["microwave"] == "MISSING":
            uncertainty_mult += 0.25
        if self.modality_status["scatterometer"] == "MISSING":
            uncertainty_mult += 0.1
        if self.modality_status["ir"] == "STALE":
            uncertainty_mult += 0.4
        if self.current_scenario == "POOR_DATA":
            uncertainty_mult += 0.6

        base_track = []
        if storm_id == "TC-ARUN":
            base_track = [
                {"lead_h": 0, "dLat": 0.0, "dLon": 0.0, "wind": 78, "pressure": 972},
                {"lead_h": 6, "dLat": 0.6, "dLon": -0.4, "wind": 80, "pressure": 970},
                {"lead_h": 12, "dLat": 1.2, "dLon": -0.8, "wind": 82, "pressure": 968},
                {"lead_h": 24, "dLat": 2.6, "dLon": -1.5, "wind": 85, "pressure": 964},
                {"lead_h": 48, "dLat": 5.0, "dLon": -3.0, "wind": 92, "pressure": 955},
                {"lead_h": 72, "dLat": 7.2, "dLon": -4.5, "wind": 98, "pressure": 946},
            ]
        elif storm_id == "TC-VEER":
            base_track = [
                {"lead_h": 0, "dLat": 0.0, "dLon": 0.0, "wind": 45, "pressure": 990},
                {"lead_h": 6, "dLat": 0.4, "dLon": 0.5, "wind": 48, "pressure": 988},
                {"lead_h": 12, "dLat": 0.9, "dLon": 1.0, "wind": 52, "pressure": 985},
                {"lead_h": 24, "dLat": 1.8, "dLon": 2.2, "wind": 60, "pressure": 980},
                {"lead_h": 48, "dLat": 3.5, "dLon": 4.0, "wind": 70, "pressure": 972},
                {"lead_h": 72, "dLat": 5.0, "dLon": 5.8, "wind": 78, "pressure": 965},
            ]
        else:
            base_track = [
                {"lead_h": 0, "dLat": 0.0, "dLon": 0.0, "wind": 30, "pressure": 1002},
                {"lead_h": 6, "dLat": 0.2, "dLon": -0.3, "wind": 32, "pressure": 1000},
                {"lead_h": 12, "dLat": 0.5, "dLon": -0.6, "wind": 35, "pressure": 998},
                {"lead_h": 24, "dLat": 1.1, "dLon": -1.2, "wind": 40, "pressure": 994},
                {"lead_h": 48, "dLat": 2.2, "dLon": -2.5, "wind": 48, "pressure": 988},
                {"lead_h": 72, "dLat": 3.4, "dLon": -3.8, "wind": 55, "pressure": 982},
            ]

        # Find base storm coords
        storms = self.get_active_storms()
        target = next((s for s in storms if s.id == storm_id), storms[0])

        result: List[ForecastPointSchema] = []
        for pt in base_track:
            wind = float(pt["wind"])
            if self.current_scenario == "RAPID_INTENSIFICATION" and storm_id == "TC-ARUN":
                wind += pt["lead_h"] * 0.4
            elif self.current_scenario == "RAPID_WEAKENING" and storm_id == "TC-ARUN":
                wind = max(25.0, wind - pt["lead_h"] * 0.5)

            p10 = max(20.0, wind - (6.0 * uncertainty_mult))
            p90 = wind + (8.0 * uncertainty_mult)
            conf = max(30.0, min(95.0, 90.0 - (pt["lead_h"] * 0.4 * uncertainty_mult)))

            result.append(ForecastPointSchema(
                lead_h=pt["lead_h"],
                lat=round(target.lat + pt["dLat"], 2),
                lon=round(target.lon + pt["dLon"], 2),
                wind_p10=round(p10, 1),
                wind_p50=round(wind, 1),
                wind_p90=round(p90, 1),
                pressure=float(pt["pressure"]),
                confidence=round(conf, 1)
            ))
        return result

    def get_data_health(self) -> DataHealthSchema:
        score = 94.0
        if self.modality_status["microwave"] == "MISSING":
            score -= 12.0
        if self.modality_status["scatterometer"] == "MISSING":
            score -= 10.0
        if self.modality_status["ir"] == "STALE":
            score -= 25.0
        if self.modality_status["sst"] == "UNRELIABLE":
            score -= 15.0

        sources: List[SourceHealthSchema] = [
            SourceHealthSchema(
                source="INSAT-3DR IR",
                status=self.modality_status["ir"],
                lastObservation="14:30 UTC",
                age="02m" if self.modality_status["ir"] == "AVAILABLE" else "48m",
                quality=98.0 if self.modality_status["ir"] == "AVAILABLE" else 60.0,
                priority="P0"
            ),
            SourceHealthSchema(
                source="GPM Microwave",
                status=self.modality_status["microwave"],
                lastObservation="14:15 UTC" if self.modality_status["microwave"] == "AVAILABLE" else "N/A",
                age="17m" if self.modality_status["microwave"] == "AVAILABLE" else "N/A",
                quality=94.0 if self.modality_status["microwave"] == "AVAILABLE" else 0.0,
                priority="P0"
            ),
            SourceHealthSchema(
                source="SCATSAT-1 Wind",
                status=self.modality_status["scatterometer"],
                lastObservation="13:45 UTC" if self.modality_status["scatterometer"] == "AVAILABLE" else "N/A",
                age="47m" if self.modality_status["scatterometer"] == "AVAILABLE" else "N/A",
                quality=91.0 if self.modality_status["scatterometer"] == "AVAILABLE" else 0.0,
                priority="P1"
            ),
            SourceHealthSchema(
                source="MOSDAC SST",
                status=self.modality_status["sst"],
                lastObservation="12:00 UTC",
                age="02h",
                quality=96.0 if self.modality_status["sst"] == "AVAILABLE" else 40.0,
                priority="P1"
            ),
            SourceHealthSchema(
                source="ECMWF Environment",
                status=self.modality_status["environment"],
                lastObservation="12:00 UTC",
                age="02h",
                quality=95.0 if self.modality_status["environment"] == "AVAILABLE" else 70.0,
                priority="P2"
            )
        ]

        return DataHealthSchema(
            score=max(10.0, score),
            latency="02m 18s",
            lastIngest="14:30 UTC",
            sources=sources
        )

    def get_alerts(self) -> List[AlertSchema]:
        alerts: List[AlertSchema] = []

        if self.current_scenario == "RAPID_INTENSIFICATION":
            alerts.append(AlertSchema(
                id="ALT-RI-01",
                level="CRITICAL",
                type="RAPID_INTENSIFICATION_WARNING",
                title="Rapid Intensification Threshold Exceeded",
                stormId="TC-ARUN",
                detail="Deep convective core organization detected. Estimated wind increase >30KT in 24h.",
                timestamp="14:32 UTC",
                prob=92.0
            ))
        elif self.current_scenario == "LAND_INTERACTION":
            alerts.append(AlertSchema(
                id="ALT-LAND-01",
                level="WARNING",
                type="LANDFALL_WATCH",
                title="Coastline Proximity Warning",
                stormId="TC-ARUN",
                detail="Outer convection bands approaching Odisha coast. Expected landfall window within 36 hours.",
                timestamp="14:30 UTC",
                prob=84.0
            ))
        elif self.current_scenario == "MISSING_MICROWAVE":
            alerts.append(AlertSchema(
                id="ALT-DEG-01",
                level="WARNING",
                type="SENSOR_DEGRADATION",
                title="Microwave Sensor Unavailable",
                detail="GPM Microwave pass skipped. System operating on IR + Environmental multi-modal baseline.",
                timestamp="14:28 UTC"
            ))
        elif self.current_scenario == "POOR_DATA":
            alerts.append(AlertSchema(
                id="ALT-DATA-01",
                level="CRITICAL",
                type="DATA_HEALTH_CRITICAL",
                title="Multiple Modality Outage",
                detail="Severe reduction in sensor coverage. Confidence bounded; physics consistency check triggered.",
                timestamp="14:31 UTC"
            ))

        alerts.append(AlertSchema(
            id="ALT-GEN-02",
            level="WATCH",
            type="GENESIS_WATCH",
            title="Cyclogenesis Probable in SE Bay of Bengal",
            stormId="TC-MAYA",
            detail="Low pressure area showing organized vortex signature. 24h genesis probability 71%.",
            timestamp="14:15 UTC",
            prob=71.0
        ))

        return alerts

    def get_explanation(self, storm_id: str) -> ExplanationSchema:
        contrib = ModalityContributionsSchema(
            irCloud=42.0,
            waterVapor=24.0,
            sst=16.0,
            windField=10.0,
            environment=8.0
        )
        if self.modality_status["microwave"] == "MISSING":
            contrib.irCloud = 58.0
            contrib.waterVapor = 28.0
            contrib.sst = 14.0
            contrib.windField = 0.0

        model_evidence = [
            "Grad-CAM highlights tight eyewall convection in INSAT IR channel",
            "Water Vapor imagery reveals strong outflow jet towards East",
            "MOSDAC Sea Surface Temperature exceeds 29.5°C threshold",
            "Vertical Wind Shear remains low (<12 KT) favoring intensification"
        ]

        temp_inf = [
            TemporalInfluenceItem(frame="T-12H", influence="MEDIUM"),
            TemporalInfluenceItem(frame="T-6H", influence="HIGH"),
            TemporalInfluenceItem(frame="T-3H", influence="HIGH"),
            TemporalInfluenceItem(frame="T0", influence="VERY HIGH")
        ]

        return ExplanationSchema(
            stormId=storm_id,
            modalityContributions=contrib,
            visualEvidenceUrl="OVERLAY_HEATMAP_01",
            modelEvidence=model_evidence,
            temporalInfluence=temp_inf
        )

scenario_engine = ScenarioEngine()
