"""
Synthetic Prototype Dataset Generator for Cyclone Rapid Intensification Model
==============================================================================
WARNING: This is SYNTHETIC PROTOTYPE TRAINING DATA.
It is NOT real meteorological observations.
It imitates the structure and approximate physical relationships of tropical
cyclone reanalysis datasets (e.g. IBTrACS, TCIR, MOSDAC) for demonstration
purposes only.

Target variable: rapid_intensification
  0 = no RI event within prediction window
  1 = rapid intensification / high-intensification event

Target generation rule (documented):
  A continuous "RI score" is computed from a linear combination of
  physically meaningful features with added Gaussian noise. The rule
  captures:
    - Low vertical wind shear   → favours RI
    - High SST                  → favours RI
    - High relative humidity    → favours RI
    - Recent pressure decrease  → ongoing strengthening
    - Recent wind-speed increase→ ongoing intensification
    - Strongly negative cloud-top temperature → deep convection
    - High ocean heat content   → sustained energy source
  The score is passed through a sigmoid and thresholded with added noise.
  A calibration correction ensures ~40% positive class prevalence.
"""

import numpy as np
import pandas as pd

SEED = 42
N_SAMPLES = 10_000


def generate_dataset(n_samples: int = N_SAMPLES, seed: int = SEED) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    # ------------------------------------------------------------------
    # Geographic / temporal features
    # ------------------------------------------------------------------
    # Bay of Bengal / Arabian Sea / Western Pacific range
    latitude = rng.uniform(5.0, 30.0, n_samples)
    longitude = rng.uniform(60.0, 150.0, n_samples)
    cyclone_age_hours = rng.uniform(6.0, 240.0, n_samples)   # hours since genesis

    # ------------------------------------------------------------------
    # Current intensity state
    # ------------------------------------------------------------------
    wind_speed = rng.uniform(20.0, 160.0, n_samples)          # knots
    # Pressure: physically correlated with wind (Atkinson–Holliday)
    pressure_base = 1010.0 - 0.9 * wind_speed
    min_central_pressure = pressure_base + rng.normal(0, 8, n_samples)  # hPa
    min_central_pressure = np.clip(min_central_pressure, 890.0, 1012.0)

    # ------------------------------------------------------------------
    # Recent intensity change (6-h lookback)
    # ------------------------------------------------------------------
    prev_wind_speed = wind_speed - rng.normal(0, 8, n_samples)
    prev_wind_speed = np.clip(prev_wind_speed, 10.0, 180.0)
    prev_pressure = min_central_pressure + rng.normal(0, 5, n_samples)
    prev_pressure = np.clip(prev_pressure, 890.0, 1015.0)
    wind_speed_change = wind_speed - prev_wind_speed            # +ve = intensifying
    pressure_change = min_central_pressure - prev_pressure      # -ve = strengthening

    # ------------------------------------------------------------------
    # Environmental / thermodynamic parameters
    # ------------------------------------------------------------------
    # SST: warmer in tropics; slight dependence on latitude
    sst = rng.uniform(26.0, 31.5, n_samples) - 0.05 * (latitude - 10.0)
    sst = sst + rng.normal(0, 0.5, n_samples)
    sst = np.clip(sst, 24.0, 32.5)

    relative_humidity = rng.uniform(50.0, 98.0, n_samples)    # %

    # Vertical wind shear (low = favours development)
    vertical_wind_shear = rng.uniform(2.0, 40.0, n_samples)    # kt or m/s proxy

    atmospheric_temp_200hPa = rng.uniform(-65.0, -40.0, n_samples)  # °C at 200hPa

    # Cloud-top temperature (strongly negative = deep convective towers)
    cloud_top_temp = rng.uniform(-80.0, -10.0, n_samples)     # °C (IR proxy)

    # Water-vapour proxy (precipitable water, mm)
    water_vapour = rng.uniform(30.0, 80.0, n_samples)

    # Precipitation proxy (mm/hr)
    precipitation = np.abs(rng.normal(5.0, 8.0, n_samples))
    precipitation = np.clip(precipitation, 0.0, 60.0)

    # ------------------------------------------------------------------
    # Ocean heat content proxy (kJ/cm²); depends on SST
    # ------------------------------------------------------------------
    ocean_heat_content = (sst - 26.0) * 10.0 + rng.uniform(0.0, 20.0, n_samples)
    ocean_heat_content = np.clip(ocean_heat_content, 0.0, 90.0)

    # ------------------------------------------------------------------
    # Motion
    # ------------------------------------------------------------------
    movement_speed = rng.uniform(2.0, 25.0, n_samples)        # kt
    movement_direction = rng.uniform(0.0, 360.0, n_samples)   # degrees

    # ------------------------------------------------------------------
    # Cyclical time features (hour of day proxy, season proxy)
    # ------------------------------------------------------------------
    hour_of_day = rng.integers(0, 24, n_samples).astype(float)
    day_of_year = rng.integers(1, 366, n_samples).astype(float)
    season_sin = np.sin(2 * np.pi * day_of_year / 365.25)
    season_cos = np.cos(2 * np.pi * day_of_year / 365.25)
    diurnal_sin = np.sin(2 * np.pi * hour_of_day / 24.0)
    diurnal_cos = np.cos(2 * np.pi * hour_of_day / 24.0)

    # ------------------------------------------------------------------
    # TARGET GENERATION (documented synthetic rule)
    # ------------------------------------------------------------------
    # Normalised contributions (all push score towards RI=1 when favourable):
    #   sst_norm:           higher SST → more RI
    #   shear_norm:         lower shear → more RI (inverted)
    #   rh_norm:            higher RH → more RI
    #   pressure_chg_norm:  falling pressure → more RI (inverted)
    #   wind_chg_norm:      increasing wind → more RI
    #   ctt_norm:           colder cloud-top → more RI (inverted)
    #   ohc_norm:           higher OHC → more RI

    sst_norm          =  (sst - 24.0) / 8.5            # 0→1
    shear_norm        =  1.0 - (vertical_wind_shear - 2.0) / 38.0   # 0→1
    rh_norm           =  (relative_humidity - 50.0) / 48.0
    pressure_chg_norm =  (-pressure_change) / 15.0     # falling pressure → +ve
    wind_chg_norm     =  wind_speed_change / 25.0
    ctt_norm          =  (-cloud_top_temp - 10.0) / 70.0
    ohc_norm          =  ocean_heat_content / 90.0

    ri_score = (
        2.5 * sst_norm
        + 2.8 * shear_norm
        + 1.2 * rh_norm
        + 1.5 * pressure_chg_norm
        + 1.3 * wind_chg_norm
        + 1.4 * ctt_norm
        + 1.0 * ohc_norm
        + rng.normal(0, 1.0, n_samples)   # realistic noise
    )

    # Calibrate threshold so ~40% positive rate
    threshold = np.percentile(ri_score, 60)
    rapid_intensification = (ri_score >= threshold).astype(int)

    # ------------------------------------------------------------------
    # Assemble DataFrame
    # ------------------------------------------------------------------
    df = pd.DataFrame({
        "latitude": latitude,
        "longitude": longitude,
        "cyclone_age_hours": cyclone_age_hours,
        "wind_speed": wind_speed,
        "min_central_pressure": min_central_pressure,
        "prev_wind_speed": prev_wind_speed,
        "prev_pressure": prev_pressure,
        "wind_speed_change": wind_speed_change,
        "pressure_change": pressure_change,
        "sst": sst,
        "relative_humidity": relative_humidity,
        "vertical_wind_shear": vertical_wind_shear,
        "atmospheric_temp_200hPa": atmospheric_temp_200hPa,
        "cloud_top_temp": cloud_top_temp,
        "water_vapour": water_vapour,
        "precipitation": precipitation,
        "ocean_heat_content": ocean_heat_content,
        "movement_speed": movement_speed,
        "movement_direction": movement_direction,
        "season_sin": season_sin,
        "season_cos": season_cos,
        "diurnal_sin": diurnal_sin,
        "diurnal_cos": diurnal_cos,
        "rapid_intensification": rapid_intensification,
    })

    return df


if __name__ == "__main__":
    df = generate_dataset()
    out_path = "cyclone_ai/data/synthetic_cyclone_dataset.csv"
    df.to_csv(out_path, index=False)
    print(f"Dataset saved: {out_path}")
    print(f"Shape: {df.shape}")
    print(f"Class distribution:\n{df['rapid_intensification'].value_counts()}")
    print(f"Class balance: {df['rapid_intensification'].mean():.2%} positive")
