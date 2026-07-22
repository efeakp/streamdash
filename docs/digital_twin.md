# StreamDash Digital Twin — Technical Write-up

## What is a Digital Twin?

A digital twin is a virtual model of a physical system that mirrors its real-world counterpart in real time. In the context of StreamDash, the digital twin is a machine learning model that has learned the hydrological behaviour of the SuDS planters on the UoH campus — specifically, how soil moisture at different depths responds to rainfall, temperature, and humidity. Once trained, it can be used to simulate "what if" scenarios: *if 20mm of rain falls over the next 6 hours, how will the soil moisture profile change at each depth?*

This approach is called a **surrogate model** — it does not simulate the physics of water movement through soil from first principles, but instead learns the input-output relationships directly from real sensor data. It is a data-driven approximation of the true physical system.

---

## Data Foundation

The model is trained on data from the StreamDash sensor database, which contains approximately 15 million readings collected from 22 WeatherLink nodes across the UoH campus since 2021.

Two nodes were selected for training based on data quality and sensor co-location:

| Node | Site ID | Training samples | Period |
|---|---|---|---|
| Planter 006 | 5 | 118,000 | Dec 2022 – Jan 2025 |
| Planter 007A | 11 | 83,000 | Aug 2023 – Jan 2025 |

Both nodes have sensors measuring soil conditions at six depths (10cm, 20cm, 30cm, 40cm, 50cm, 60cm) alongside co-located rain gauges, temperature, and humidity sensors — making them ideal for learning the relationship between weather inputs and soil moisture response.

---

## Feature Engineering

Raw sensor readings are aggregated into a wide-format time series at 5-minute resolution. The following features are constructed for each prediction:

**Rainfall windows** — rather than using instantaneous rain rate, cumulative rainfall is computed over three rolling windows to capture both short-burst and prolonged rainfall effects:
- `Rain_1h` — total rainfall in the last hour (12 steps)
- `Rain_6h` — total rainfall in the last 6 hours (72 steps)
- `Rain_24h` — total rainfall in the last 24 hours (288 steps)

**Atmospheric conditions:**
- `Temp` — air temperature (°C)
- `Hum` — relative humidity (%)

**Antecedent soil moisture** — the current reading at each of the 6 depths. This is critical: a soil that is already saturated will respond very differently to rain than a dry one.
- `SoilMoisture_10cm` through `SoilMoisture_60cm`

**Cyclic time encoding** — hour of day and day of year are encoded as sine/cosine pairs to preserve their circular nature (so that midnight and 23:55 are close to each other, and 31 December is close to 1 January):
- `hour_sin`, `hour_cos`
- `doy_sin`, `doy_cos`

This gives 15 input features in total. The model is trained to predict soil moisture at each depth **one time step ahead** (approximately 5 minutes into the future). In practice, given slowly-changing soil conditions, the model's predictions remain valid over much longer horizons when used interactively.

---

## Model Architecture

A **Random Forest Regressor** was chosen for several reasons:

- **Handles non-linear relationships** well — soil moisture response to rainfall is not linear; it saturates, drains, and responds differently depending on antecedent conditions
- **Robust to outliers and missing data** — important given real-world sensor noise
- **Provides uncertainty estimates** — the variance across individual trees gives a natural measure of prediction confidence (reported as ±std in the UI)
- **Fast to train and serve** — inference on a Raspberry Pi-class server is sub-millisecond per prediction
- **Interpretable feature importance** — the model can report which inputs it relies on most, useful for validating that it has learned physically sensible relationships

One model is trained **per target per node** — six models per node (one per depth), twelve in total. Each model uses 100 decision trees with a maximum depth of 12. Training and test sets are split chronologically (80/20) rather than randomly, to avoid data leakage — the model is only evaluated on data it has never seen, from a later time period.

---

## Model Performance

| Depth | Planter 006 MAE | Planter 006 R² | Planter 007A MAE | Planter 007A R² |
|---|---|---|---|---|
| 10cm | 0.328% | 0.931 | 1.257% | 0.695 |
| 20cm | 0.176% | 0.874 | 0.324% | 0.838 |
| 30cm | 0.210% | 0.870 | 0.071% | 0.990 |
| 40cm | 0.100% | 0.982 | 0.104% | 0.983 |
| 50cm | 0.040% | 0.994 | 0.049% | 0.992 |
| 60cm | 0.081% | 0.978 | 0.229% | 0.987 |

R² values above 0.87 indicate the model explains 87%+ of the variance in soil moisture — which is strong for a real-world environmental dataset. Deeper layers (40–60cm) are more predictable because they change more slowly and are less influenced by surface noise. The 10cm layer at Planter 007A is harder to predict (R²=0.695), likely because shallow soil is more sensitive to small, localised rain events that the node's rain gauge may not capture precisely.

MAE values in the range of 0.04–1.26% are operationally meaningful — soil moisture typically ranges 5–60% at these sites, so even the worst-case error is small relative to the measurement range.

---

## System Architecture

```
Browser (React)
     │
     │  GET /api/twin/nodes          ← model metadata, feature importance
     │  GET /api/twin/current        ← latest actual readings (pre-fill UI)
     │  GET /api/twin/predict        ← scenario → predictions
     ▼
nginx (/api/* → localhost:8001)
     ▼
FastAPI (main.py)
     │
     ├── /twin/nodes   → reads index.json + *_meta.json from models/
     ├── /twin/current → queries MariaDB for latest sensor values per node
     └── /twin/predict → loads .joblib, builds feature vector, runs RF inference
          │
          └── models/
               ├── planter_006.joblib    (12 RF models, ~40MB)
               └── planter_007a.joblib   (~30MB)
```

Model binaries are loaded into memory on first request and cached in-process for subsequent calls — so after a cold start, predictions are served in under 5ms.

---

## The User Interface

The Digital Twin page (`/twin`) is designed around the "what if" interaction:

1. **Select a node** — Planter 006 or Planter 007A
2. **Sliders pre-fill automatically** from the node's most recent actual sensor readings via `/twin/current`
3. **Adjust the scenario** — move rainfall, temperature, humidity, or antecedent moisture sliders to simulate a scenario
4. **Run Simulation** — the frontend sends the slider values to `/twin/predict` and receives predictions
5. **Results are displayed** as:
   - Six depth cards showing predicted moisture %, confidence interval (±std), and delta vs the current actual (▲/▼)
   - A radar chart overlaying the current moisture profile against the predicted one
   - A feature importance bar chart showing which inputs the model weighted most heavily
   - A model accuracy table (MAE, R², training sample count) for transparency

---

## Limitations and Next Steps

**Current limitations:**
- Predictions are one step ahead (~5 minutes); for longer-horizon forecasting, outputs would need to be fed back as inputs iteratively, which accumulates error
- The model only covers two nodes — extending to Newland, Sports, and Wilberforce requires rerunning `train_model.py` with additional node configurations
- The model cannot generalise to conditions far outside its training range (e.g. extreme drought or flooding not seen in the 2022–2025 training data)
- No live re-training — the model is static until `train_model.py` is run again

**Logical next steps:**
- **Anomaly detection** — use the surrogate model's predictions as a baseline; flag when actual readings diverge significantly (potential sensor fault or unusual event)
- **SuDS performance scoring** — combine the soil moisture model with flow sensor data to score drainage efficiency per rain event
- **Extended node coverage** — retrain on all nodes with sufficient co-located data
- **Longer-horizon forecasting** — couple with a weather forecast API to predict 24–48h ahead

---

## Retraining

The models are not stored in the Git repository (the `.joblib` binaries are gitignored due to size). To regenerate them on a new server or after new data arrives:

```bash
cd backend
python3 train_model.py
```

The script connects to the MariaDB database using credentials from `.env`, queries and pivots the sensor data, trains all models, and writes the `.joblib` files and `_meta.json` metadata to `backend/models/`.
