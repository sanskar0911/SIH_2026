from typing import Dict, List, Any

class PhysicsChecker:
    def validate_consistency(self, storm_state: Dict[str, Any], forecast: List[Dict[str, Any]]) -> Dict[str, Any]:
        warnings = []
        violations = []
        
        # Check pressure vs wind pressure-wind relation (e.g. Dvorak / Knaff-Zehr)
        wind = storm_state.get("wind_kt", 0)
        pressure = storm_state.get("pressure_hpa", 1013)

        if wind > 64 and pressure > 1000:
            warnings.append("High wind speed reported with relatively high pressure.")

        return {
            "consistency_score": round(max(50.0, 100.0 - len(warnings) * 10 - len(violations) * 25), 1),
            "warnings": warnings,
            "violations": violations,
            "status": "PASSED" if len(violations) == 0 else "FLAGGED"
        }
