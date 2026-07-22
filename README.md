# StreamDash

Real-time SuDS (Sustainable Drainage Systems) monitoring dashboard for the University of Hull campus, funded by the UPP Foundation.

Live site: **[streamdash.org](https://streamdash.org)**

---

## Overview

StreamDash is a student-driven living lab that collects and visualises environmental sensor data from 22 WeatherLink nodes deployed across the UoH campus. It integrates live sensor networks, interactive maps, geospatial analytics, and machine learning to support sustainability research and education.

---

## Features

| Page | Description |
|---|---|
| **Home** | Hero, live stats, feature cards with network health pills, live weather conditions, campus map |
| **Dashboard** | Filter by location → site → sensor, date range picker, time-series chart, sensor hardware tooltips |
| **Network** | Health status of all 22 campus nodes — last data timestamp, installation date, sensor categories |
| **Digital Twin** | ML surrogate model — adjust rainfall and temperature scenarios and predict soil moisture response at 6 depths |
| **Map** | Interactive Leaflet map of campus nodes with category filters, linked directly to dashboard |
| **Parameters** | Catalogue of monitored environmental parameters |
| **Gallery** | Project team |

---

## Tech Stack

**Frontend**
- React 18 (Create React App)
- React Router v6
- Recharts (time-series charts, radar chart, bar chart)
- react-leaflet v4 (interactive map)

**Backend**
- FastAPI + Uvicorn/Gunicorn
- MariaDB (`mariadb` Python connector)
- scikit-learn + joblib (ML surrogate models)
- `requests` (WeatherLink live conditions proxy)

**Infrastructure**
- System nginx with Certbot SSL (Let's Encrypt)
- Systemd service (`fastapi.service`) for the backend — uses conda env at `miniforge3/envs/suds/`
- Static frontend served from `/var/www/streamdash/`

---

## Project Structure

```
suds-lab/
├── backend/
│   ├── main.py              # FastAPI app — all API endpoints
│   ├── db.py                # MariaDB connection (credentials from env)
│   ├── train_model.py       # ML training script — run once to build models
│   ├── models/
│   │   ├── index.json                # List of available model slugs
│   │   ├── planter_006_meta.json     # Feature importance + accuracy metrics
│   │   ├── planter_007a_meta.json
│   │   └── *.joblib                  # Trained model binaries (gitignored)
│   ├── requirements.txt
│   └── .env                 # DB credentials (gitignored)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── About.js          # Home page
│   │   │   ├── Home.js           # Sensor dashboard
│   │   │   ├── Map.js            # Leaflet campus map
│   │   │   ├── NetworkStatus.js  # Node health table
│   │   │   ├── DigitalTwin.js    # ML scenario simulator
│   │   │   ├── Gallery.js
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── MeasurementChart.js
│   │   │   ├── LiveWeather.js
│   │   │   ├── SensorSelector.js  # Shows hardware info chip
│   │   │   ├── LocationSelector.js
│   │   │   └── SiteSelector.js
│   │   ├── data/
│   │   │   ├── uohNodes.js        # 22 UoH campus nodes with GPS, categories, DB links
│   │   │   └── sensorHardware.js  # Maps sensor name patterns to hardware info
│   │   ├── About.css              # Shared badge/pill/chip CSS used across pages
│   │   └── App.js
│   └── .env                 # REACT_APP_API_URL (gitignored)
└── sudslab_data_loc.txt     # WeatherLink sensor catalogue (254 sensors, 68 nodes)
```

---

## API Endpoints

All endpoints are proxied through nginx at `/api/*` → `localhost:8001/*`. See [`docs/API.md`](docs/API.md) for full parameter details, response shapes, and examples, or the rendered reference at [`docs/redoc.html`](docs/redoc.html) / [streamdash.org/api/redoc](https://streamdash.org/api/redoc).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/locations` | All monitoring locations |
| GET | `/sites?location_id=` | Sites for a given location |
| GET | `/sensors?site_id=` | Sensors for a given site |
| GET | `/measurements?sensor_id=&start_date=&end_date=` | Time-series measurements |
| GET | `/stats` | Aggregate counts (locations, sensors, readings) |
| GET | `/live` | Live weather from WeatherLink API (proxied) |
| GET | `/network-status` | Last measurement timestamp per site (5-min cache) |
| GET | `/twin/nodes` | Available ML models with feature importance and accuracy |
| GET | `/twin/predict` | Run a soil moisture scenario prediction |
| GET | `/twin/current` | Latest actual sensor readings for a node |

---

## Digital Twin — ML Surrogate Model

The Digital Twin page uses Random Forest models trained on historical sensor data to simulate how soil moisture responds to different weather scenarios. See [`docs/digital_twin.md`](docs/digital_twin.md) for the full technical write-up.

**Nodes:** Planter 006 and Planter 007A (the two best-instrumented nodes with co-located rain, temp/humidity, flow, and soil moisture sensors at 6 depths).

**Features:** Cumulative rainfall over 1h / 6h / 24h windows, temperature, humidity, antecedent soil moisture at each depth, cyclic hour-of-day and day-of-year encoding.

**Targets:** Soil moisture at 10cm, 20cm, 30cm, 40cm, 50cm, 60cm depth (one step ahead).

**Accuracy:** R² = 0.87–0.99 across all depths on held-out test data.

**Retraining:**
```bash
cd backend
python3 train_model.py
```

---

## Local Development

**Backend**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # fill in DB credentials
uvicorn main:app --reload --port 8001
```

**Frontend**
```bash
cd frontend
npm install
# create .env with: REACT_APP_API_URL=http://localhost:8001
npm start
```

---

## Production Deployment

**Backend** — restart the systemd service after any changes to `main.py` or `db.py`:
```bash
sudo systemctl restart fastapi.service
sudo systemctl status fastapi.service
```

> Note: the service runs inside the `miniforge3/envs/suds` conda environment. Install new Python packages with `/home/streamdash/miniforge3/envs/suds/bin/pip install <package>`.

**Frontend** — rebuild and copy the static bundle:
```bash
cd frontend
npm run build
sudo cp -r build/* /var/www/streamdash/
```

The systemd service loads credentials from `backend/.env` via `EnvironmentFile=`.

---

## Data Sources

- **Sensor measurements** — MariaDB database (`suds_database`), populated from the WeatherLink network. ~15 million readings across 296 sensors.
- **Live conditions** — WeatherLink embeddable API (campus weather station).
- **Node metadata** — `sudslab_data_loc.txt`, a JSON export of the WeatherLink sensor catalogue including GPS coordinates, installation dates, and sensor categories.

---

## Funding

This project is funded by the **UPP Foundation** as part of the University of Hull's commitment to campus sustainability and student-led research.
