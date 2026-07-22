# StreamDash API Reference

The StreamDash backend is a [FastAPI](https://fastapi.tiangolo.com/) service exposing sensor data, network health, and digital-twin predictions for the SuDS (Sustainable Drainage Systems) monitoring network at the University of Hull.

## Base URL

| Environment | Base URL |
|---|---|
| Production | `https://streamdash.org/api/` |
| Local development | `http://localhost:8001/` |

All paths below are relative to the base URL. In production, `/api/` is stripped by the nginx reverse proxy before reaching the backend — e.g. `GET /stats` in this doc means `GET https://streamdash.org/api/stats` in production, or `GET http://localhost:8001/stats` locally.

## Authentication

None. All endpoints are public, read-only, and unauthenticated.

## Interactive docs

FastAPI also auto-generates interactive Swagger UI and ReDoc pages at `/docs` and `/redoc` on whichever base URL above applies.

---

## Endpoints

### `GET /`

Health check.

**Response**
```json
{ "message": "SUDS backend is running 🚀" }
```

---

### `GET /live`

Current live weather conditions from the campus weather station, proxied from the WeatherLink API.

**Response**
```json
{
  "lastReceived": 1737550000,
  "readings": {
    "Temp":        { "value": 14.2, "unit": "°C" },
    "Hum":         { "value": 82,   "unit": "%" },
    "Wind Speed":  { "value": 6.1,  "unit": "mph" },
    "Rain Rate":   { "value": 0.0,  "unit": "mm/hr" }
  }
}
```
On upstream failure, returns `{ "error": "<message>" }` instead of raising.

---

### `GET /stats`

Aggregate counts across the whole network.

**Response**
```json
{ "locations": 4, "sensors": 214, "measurements": 15342891 }
```

---

### `GET /locations`

List all campus locations.

**Response**
```json
[ { "location_id": 1, "name": "Main Campus" }, ... ]
```

---

### `GET /sites`

Sites within a location.

| Query param | Type | Required | Description |
|---|---|---|---|
| `location_id` | int | yes | Location to filter by |

**Response**
```json
[ { "site_id": 5, "site_code": "PLANTER-006" }, ... ]
```

---

### `GET /sensors`

Sensors installed at a site.

| Query param | Type | Required | Description |
|---|---|---|---|
| `site_id` | int | yes | Site to filter by |

**Response**
```json
[ { "sensor_id": 42, "name": "SoilMoisture_30cm", "unit": "%" }, ... ]
```

---

### `GET /measurements`

Time-series readings for a single sensor, optionally bounded by date.

| Query param | Type | Required | Description |
|---|---|---|---|
| `sensor_id` | int | yes | Sensor to query |
| `start_date` | string (`YYYY-MM-DD`) | no | Inclusive lower bound |
| `end_date` | string (`YYYY-MM-DD`) | no | Inclusive upper bound |

**Response**
```json
{
  "count": 2,
  "results": [
    { "timestamp": "2026-07-20 00:00:00", "value": 31.4 },
    { "timestamp": "2026-07-20 00:05:00", "value": 31.2 }
  ]
}
```

---

### `GET /network-status`

Health summary per site — sensor count and most recent reading timestamp. Cached server-side for 5 minutes to avoid repeatedly scanning the full measurements table.

**Response**
```json
[
  {
    "site_id": 5,
    "site_code": "PLANTER-006",
    "location_id": 1,
    "location_name": "Main Campus",
    "sensor_count": 9,
    "last_seen": "2026-07-22 12:40:00"
  }
]
```

---

## Digital Twin

ML-powered "what if" simulation of soil moisture response to weather, backed by per-node Random Forest surrogate models. See [`docs/digital_twin.md`](digital_twin.md) for the modelling methodology.

### `GET /twin/nodes`

List sensor nodes that have a trained digital-twin model available.

**Response**
```json
[
  {
    "slug": "planter_006",
    "site_id": 5,
    "site_code": "PLANTER-006",
    ...
  }
]
```
The exact metadata fields come from each model's `*_meta.json` file. Returns `[]` if no models are installed.

---

### `GET /twin/predict`

Run the surrogate model for a node given a set of weather/soil inputs, returning a prediction (and standard deviation across the forest's trees, as a confidence proxy) for soil moisture at each of the six monitored depths.

| Query param | Type | Default | Description |
|---|---|---|---|
| `node` | string | — (required) | Model slug, e.g. `planter_006` |
| `rain_1h` | float | `0.0` | Rainfall in the last hour (mm) |
| `rain_6h` | float | `0.0` | Rainfall in the last 6 hours (mm) |
| `rain_24h` | float | `0.0` | Rainfall in the last 24 hours (mm) |
| `temp` | float | `15.0` | Air temperature (°C) |
| `hum` | float | `75.0` | Relative humidity (%) |
| `sm_10`…`sm_60` | float | `30.0` | Current soil moisture (%) at 10–60cm depth |

Time-of-day and day-of-year features are derived automatically from the server clock.

**Response**
```json
{
  "node": "planter_006",
  "predictions": {
    "SoilMoisture_10cm": { "predicted": 32.4, "std": 0.81 },
    "SoilMoisture_20cm": { "predicted": 31.9, "std": 0.65 }
  }
}
```
Returns `{ "error": "Model '<node>' not found" }` (HTTP 200) if the slug has no corresponding trained model.

---

### `GET /twin/current`

Fetch the most recent actual sensor readings for a node, used to pre-fill the prediction form in the UI with real current conditions.

| Query param | Type | Required | Description |
|---|---|---|---|
| `node` | string | yes | Model slug, e.g. `planter_006` |

**Response**
```json
{
  "SoilMoisture_10cm": 30.1,
  "SoilMoisture_20cm": 29.8,
  "Rain": 0.0,
  "Temp": 14.2,
  "Hum": 82.0
}
```
Returns `{ "error": "unknown node" }` if no metadata file exists for the given slug.

---

## Error handling

Most endpoints do not currently wrap database or upstream errors — an unhandled exception returns an HTTP 500 with a generic FastAPI error body. `/live` and the digital-twin endpoints are the exception, returning a `200` with an `{"error": "..."}` body on failure.
