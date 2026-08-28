from typing import Dict, Any

class SegmentationService:
    def segment_storm(self, imagery: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "storm_mask": "MASK_URI_01",
            "convective_mask": "CONV_URI_01",
            "center_heatmap": "HEATMAP_URI_01",
            "boundary": [[14.5, 83.5], [17.1, 85.7]],
            "center": [15.8, 84.6],
            "confidence": 92.5
        }
