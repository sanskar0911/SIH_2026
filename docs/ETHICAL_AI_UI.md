# Ethical AI UI Guidelines & Principles
**Project:** SIH 2026 PS26070 - Tropical Cyclone Intelligence System
**Document Version:** 1.0.0

---

## 1. Core Ethical Principles

Disaster decision support directly impacts human safety and operational response. Therefore, transparent, honest, and ethical UI design is mandatory.

---

## 2. Mandatory Rules

### A. Clear Distinction Between AI Estimates and Official Warnings
- **Rule:** AI predictions MUST never look like official government meteorological warnings (IMD/RSMC).
- **Implementation:** Prominently display the official warning disclaimer banner on all decision-support views:
  > *"AI-generated predictions are decision-support tools and do NOT replace official warnings issued by India Meteorological Department (IMD) or national authorities."*
- **Visual Separation:** Official warning bulletins are rendered in dedicated containers labeled **OFFICIAL INFORMATION**, while model outputs are tagged **AI FORECAST** or **AI ESTIMATE**.

### B. Explicit Data Provenance Badges
Every piece of information must clearly declare its provenance tag:
- `OBSERVED`: Raw satellite, radar, or weather station observation.
- `AI ESTIMATE`: Current center or intensity estimated by ML models.
- `FORECAST`: Model-predicted trajectory or intensity for future horizons.
- `UNCERTAINTY`: Statistical range (P10/P50/P90 or position radius ±XX km).
- `SIMULATION` / `DEMO DATA`: Mock, counterfactual, or historical replay scenario.

### C. Honest Representation of Confidence & Uncertainty
- **No Fake Certainty:** Never display single-line deterministic paths without position error bounds.
- **Explain Confidence:** Model confidence must be accompanied by an explanatory breakdown:
  1. Data Freshness (time since last satellite pass)
  2. Available Sensor Modalities (IR, WV, VIS, PMW)
  3. Historical Model Reliability
  4. Ensemble Forecast Dispersion
- **Disclaim Probabilities:** Explicitly state: *"Model confidence reflects confidence in model output consistency; it does not guarantee the meteorological outcome."*

### D. Support for "Insufficient Evidence" & "Degraded" States
- When satellite channels are missing or observation quality is poor, the system must switch to `DEGRADED DATA MODE` or output `"Insufficient evidence for reliable forecast"` rather than forcing a low-quality prediction.
- Never silently substitute missing data without notifying the user.

### E. Prohibited Dark Patterns & Manipulation
- **NO Fake Urgency:** Avoid artificial countdown timers, flashing red screens, or alarmist styling.
- **NO Fabricated Accuracy:** Display exact evaluated metrics or `"Not evaluated"` — never fabricate accuracy percentages.
