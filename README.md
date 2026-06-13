# StreamDash

Real-time SuDS (Sustainable Drainage Systems) monitoring dashboard for the University of Hull campus, funded by the UPP Foundation.

Live site: **[streamdash.org](https://streamdash.org)**

---

## Overview

StreamDash is a student-driven living lab that collects and visualises environmental sensor data from 22 WeatherLink nodes deployed across the UoH campus. It integrates live sensor networks, interactive maps, and geospatial analytics to support sustainability research and education.

---

## Features

| Page | Description |
|---|---|
| **Home** | Hero, live stats, feature cards with network health, live weather conditions, campus map |
| **Dashboard** | Filter by location → site → sensor, date range picker, time-series chart |
| **Network** | Health status of all 22 campus nodes — last data timestamp, installation date, sensor categories |
| **Parameters** | Catalogue of monitored environmental parameters |
| **Map** | Interactive Leaflet map of campus nodes with category filters, linked to dashboard |
| **Gallery** | Project team |

---

## Tech Stack

**Frontend**
- React 18 (Create React App)
- React Router v6
- Recharts (time-series charts)
- react-leaflet v4 (interactive map)

**Backend**
- FastAPI + Uvicorn/Gunicorn
- MariaDB (`mariadb` Python connector)
- `requests` (WeatherLink live conditions proxy)

**Infrastructure**
- System nginx with Certbot SSL (Let's Encrypt)
- Systemd service (`fastapi.service`) for the backend
- Static frontend served from `/var/www/streamdash/`

---

## Project Structure

```
suds-lab/
├── backend/
│   ├── main.py              # FastAPI app — all API endpoints
│   ├── db.py                # MariaDB connection (credentials from env)
│   ├── requirements.txt
│   └── .env                 # DB credentials (gitignored)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── About.js     # Home page
│   │   │   ├── Home.js      # Sensor dashboard
│   │   │   ├── Map.js       # Leaflet campus map
│   │   │   ├── NetworkStatus.js
│   │   │   ├── Gallery.js
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── MeasurementChart.js
│   │   │   ├── LiveWeather.js
│   │   │   ├── SensorSelector.js
│   │   │   ├── LocationSelector.js
│   │   │   └── SiteSelector.js
│   │   ├── data/
│   │   │   ├── uohNodes.js        # 22 UoH campus nodes with GPS, categories, DB links
│   │   │   └── sensorHardware.js  # Maps sensor name patterns to hardware info
│   │   └── App.js
│   └── .env                 # REACT_APP_API_URL (gitignored from .gitignore rules)
└── sudslab_data_loc.txt     # WeatherLink sensor catalogue (254 sensors, 68 nodes)
```

---

## API Endpoints

All endpoints are proxied through nginx at `/api/*` → `localhost:8001/*`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/locations` | All monitoring locations |
| GET | `/sites?location_id=` | Sites for a given location |
| GET | `/sensors?site_id=` | Sensors for a given site |
| GET | `/measurements?sensor_id=&start_date=&end_date=` | Time-series measurements |
| GET | `/stats` | Aggregate counts (locations, sensors, readings) |
| GET | `/live` | Live weather from WeatherLink API (proxied, cached) |
| GET | `/network-status` | Last measurement timestamp per site (cached 5 min) |

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
