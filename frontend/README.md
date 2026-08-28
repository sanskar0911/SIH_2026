# TC-INTEL INDIA: Cyclone Intelligence & Decision Support

Tropical Cyclone Intelligence, Detection, Forecasting & Decision Support Platform for the North Indian Ocean basin. 
Developed as an AI/ML-assisted decision-support prototype for the India Meteorological Department (IMD) under the Ministry of Earth Sciences.

---

## ⚡ Quick Start: How to Run

### Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (v18.x or higher recommended)
- **npm** (v9.x or higher)

### Setup & Launch
1. **Clone the Repository**
   ```bash
   git clone https://github.com/kunal0796/cyclone_Sih.git
   cd cyclone_Sih
   ```

2. **Install Dependencies**
   Installs React, Lucide Icons, and development tools:
   ```bash
   npm install
   ```

3. **Start the Local Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open your browser and navigate to:
   [http://localhost:5173/](http://localhost:5173/)

---

## 🛠️ Build & Production Preview

To compile the application into static HTML/CSS/JS assets for production deployment:

- **Build Project**
  ```bash
  npm run build
  ```
  *Compiles into the `dist/` directory.*

- **Preview Production Build locally**
  ```bash
  npm run preview
  ```

---

## 🧬 Scientific & AI Architecture

TC-INTEL INDIA is built around a **Multimodal Fusion & Multitask Learning** pipeline:

```
MULTI-SOURCE OBSERVATIONS (INSAT-3D, Polar Microwave, ASCAT Scatterometer)
       ↓
INGEST & QUALITY CONTROL (Outlier filtering)
       ↓
TIME ALIGNMENT & GEO-REGISTRATION (Grid alignment)
       ↓
STORM-CENTERED SPATIOTEMPORAL DATA CUBE
       ↓
CROSS-MODAL ATTENTION BLOCK & MODALITY DROPOUT WEIGHTING
       ↓
CASCADED MULTI-TASK HEADS (Track, Intensity, Radial Wind Field Radii)
       ↓
FORECAST AUDIT & HUMAN-IN-THE-LOOP METEOROLOGIST Review
```

### Key Differentiators
1. **Multimodal Fusion**: Combines geostationary IR, microwave, and scatterometer wind datasets.
2. **Missing-Modality Awareness**: Automatically routes inferences through secondary encoders if a primary sensor stream goes offline.
3. **Physics / Consistency Checking**: Cross-checks wind-pressure correlations and tracks anomalies to prevent out-of-distribution hallucinations.
4. **Explainable AI (XAI)**: Displays model attention overlays showing which features influenced the tracking and intensity outputs.
