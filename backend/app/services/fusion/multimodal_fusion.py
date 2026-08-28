from typing import Dict, List, Any

class MultimodalFusionService:
    def fuse_modalities(self, modalities: Dict[str, Any], modality_status: Dict[str, str]) -> Dict[str, Any]:
        available_modalities = [m for m, status in modality_status.items() if status == "AVAILABLE"]
        missing_modalities = [m for m, status in modality_status.items() if status != "AVAILABLE"]

        fusion_confidence = max(40.0, 95.0 - (len(missing_modalities) * 12.0))

        return {
            "fused_representation": "FUSED_TENSOR_01",
            "available_modalities": available_modalities,
            "missing_modalities": missing_modalities,
            "fusion_confidence": fusion_confidence,
            "degraded_mode": len(missing_modalities) > 0
        }
