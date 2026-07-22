from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import time
import json
import os
import numpy as np
import joblib
import db
import requests as http

app = FastAPI(root_path=os.getenv("ROOT_PATH", ""))

# Enable CORS so frontend (localhost:3000) can access backend (localhost:8001)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "SUDS backend is running 🚀"}

# ----------------------
# LIVE CONDITIONS
# ----------------------
WEATHERLINK_URL = "https://www.weatherlink.com/embeddablePage/summaryData/a87ff1bc9e5c4ccc9228ea71e02a7b4b"

LIVE_FIELDS = {
    "Temp", "Hum", "Wind Speed", "Wind Direction", "Dew Point",
    "Barometer", "Bar Trend", "Solar Rad", "UV Index", "Rain Rate",
    "Rain Storm",
}

@app.get("/live")
def get_live():
    try:
        resp = http.get(WEATHERLINK_URL, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        readings = {
            r["sensorDataName"]: {
                "value": r["convertedValue"],
                "unit": r["unitLabel"],
            }
            for r in data.get("currConditionValues", [])
            if r["sensorDataName"] in LIVE_FIELDS
        }
        return {
            "lastReceived": data.get("lastReceived"),
            "readings": readings,
        }
    except Exception as e:
        return {"error": str(e)}

# ----------------------
# STATS
# ----------------------
@app.get("/stats")
def get_stats():
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM locations")
    locations = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM sensors")
    sensors = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM measurements WHERE value IS NOT NULL")
    measurements = cursor.fetchone()[0]
    cursor.close()
    conn.close()
    return {"locations": locations, "sensors": sensors, "measurements": measurements}

# ----------------------
# LOCATIONS
# ----------------------
@app.get("/locations")
def get_locations():
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT location_id, name FROM locations")
    results = [{"location_id": row[0], "name": row[1]} for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return results

# ----------------------
# SITES
# ----------------------
@app.get("/sites")
def get_sites(location_id: int):
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT site_id, site_code FROM sites WHERE location_id = ?",
        (location_id,)
    )
    results = [{"site_id": row[0], "site_code": row[1]} for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return results

# ----------------------
# SENSORS
# ----------------------
@app.get("/sensors")
def get_sensors(site_id: int):
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT sensor_id, name, unit FROM sensors WHERE site_id = ?",
        (site_id,)
    )
    results = [
        {"sensor_id": row[0], "name": row[1], "unit": row[2]}
        for row in cursor.fetchall()
    ]
    cursor.close()
    conn.close()
    return results

# ----------------------
# MEASUREMENTS
# ----------------------
# ----------------------
# NETWORK STATUS
# ----------------------
_network_cache = {"data": None, "at": 0}
_CACHE_TTL = 300  # 5 minutes

@app.get("/network-status")
def get_network_status():
    now = time.time()
    if _network_cache["data"] is not None and now - _network_cache["at"] < _CACHE_TTL:
        return _network_cache["data"]

    conn = db.get_connection()
    cursor = conn.cursor()
    # Pre-aggregate max timestamp per sensor first, then join — avoids scanning
    # all 15M measurement rows in a single grouped join.
    cursor.execute("""
        SELECT si.site_id, si.site_code, l.location_id, l.name,
               COUNT(DISTINCT s.sensor_id),
               MAX(latest.max_ts)
        FROM sites si
        JOIN locations l ON si.location_id = l.location_id
        LEFT JOIN sensors s ON s.site_id = si.site_id
        LEFT JOIN (
            SELECT sensor_id, MAX(timestamp) AS max_ts
            FROM measurements
            GROUP BY sensor_id
        ) latest ON latest.sensor_id = s.sensor_id
        GROUP BY si.site_id, si.site_code, l.location_id, l.name
        ORDER BY l.name, si.site_code
    """)
    results = [
        {
            "site_id": row[0],
            "site_code": row[1],
            "location_id": row[2],
            "location_name": row[3],
            "sensor_count": row[4],
            "last_seen": str(row[5]) if row[5] else None,
        }
        for row in cursor.fetchall()
    ]
    cursor.close()
    conn.close()
    _network_cache["data"] = results
    _network_cache["at"] = now
    return results

# ----------------------
# MEASUREMENTS
# ----------------------
@app.get("/measurements")
def get_measurements(
    sensor_id: int,
    start_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
):
    conn = db.get_connection()
    cursor = conn.cursor()

    query = "SELECT timestamp, value FROM measurements WHERE sensor_id = ?"
    params = [sensor_id]

    if start_date:
        query += " AND timestamp >= ?"
        params.append(start_date)
    if end_date:
        query += " AND timestamp <= ?"
        params.append(end_date)

    query += " ORDER BY timestamp ASC"

    cursor.execute(query, tuple(params))
    results = [{"timestamp": str(row[0]), "value": row[1]} for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return {"count": len(results), "results": results}

# ----------------------
# DIGITAL TWIN
# ----------------------
_MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
_twin_cache = {}

def _load_twin(slug):
    if slug not in _twin_cache:
        path = os.path.join(_MODELS_DIR, f"{slug}.joblib")
        if not os.path.exists(path):
            return None
        _twin_cache[slug] = joblib.load(path)
    return _twin_cache[slug]

@app.get("/twin/nodes")
def get_twin_nodes():
    index_path = os.path.join(_MODELS_DIR, "index.json")
    if not os.path.exists(index_path):
        return []
    with open(index_path) as f:
        slugs = json.load(f)
    nodes = []
    for slug in slugs:
        meta_path = os.path.join(_MODELS_DIR, f"{slug}_meta.json")
        if os.path.exists(meta_path):
            with open(meta_path) as f:
                nodes.append(json.load(f))
    return nodes

@app.get("/twin/predict")
def twin_predict(
    node: str = Query(..., description="Model slug, e.g. planter_006"),
    rain_1h:  float = Query(0.0),
    rain_6h:  float = Query(0.0),
    rain_24h: float = Query(0.0),
    temp:     float = Query(15.0),
    hum:      float = Query(75.0),
    sm_10:    float = Query(30.0),
    sm_20:    float = Query(30.0),
    sm_30:    float = Query(30.0),
    sm_40:    float = Query(30.0),
    sm_50:    float = Query(30.0),
    sm_60:    float = Query(30.0),
):
    import math
    bundle = _load_twin(node)
    if bundle is None:
        return {"error": f"Model '{node}' not found"}

    models = bundle["models"]
    feature_names = bundle["feature_names"]

    # Build cyclic time features using server clock
    t = time.localtime()
    hour = t.tm_hour + t.tm_min / 60
    doy  = t.tm_yday

    input_map = {
        "Rain_1h":            rain_1h,
        "Rain_6h":            rain_6h,
        "Rain_24h":           rain_24h,
        "Temp":               temp,
        "Hum":                hum,
        "SoilMoisture_10cm":  sm_10,
        "SoilMoisture_20cm":  sm_20,
        "SoilMoisture_30cm":  sm_30,
        "SoilMoisture_40cm":  sm_40,
        "SoilMoisture_50cm":  sm_50,
        "SoilMoisture_60cm":  sm_60,
        "hour_sin": math.sin(2 * math.pi * hour / 24),
        "hour_cos": math.cos(2 * math.pi * hour / 24),
        "doy_sin":  math.sin(2 * math.pi * doy / 365),
        "doy_cos":  math.cos(2 * math.pi * doy / 365),
    }

    row = np.array([[input_map.get(f, 0.0) for f in feature_names]])

    predictions = {}
    for target, rf in models.items():
        # Use all trees to get std dev as a confidence proxy
        tree_preds = np.array([t.predict(row)[0] for t in rf.estimators_])
        predictions[target] = {
            "predicted": round(float(tree_preds.mean()), 2),
            "std":       round(float(tree_preds.std()), 3),
        }

    return {"node": node, "predictions": predictions}

@app.get("/twin/current")
def twin_current(node: str = Query(...)):
    """Return the most recent actual sensor readings for a node to pre-fill the UI."""
    meta_path = os.path.join(_MODELS_DIR, f"{node}_meta.json")
    if not os.path.exists(meta_path):
        return {"error": "unknown node"}
    with open(meta_path) as f:
        meta = json.load(f)

    site_id = meta["site_id"]
    conn = db.get_connection()
    cursor = conn.cursor()
    sensors_needed = [
        "SoilMoisture_10cm","SoilMoisture_20cm","SoilMoisture_30cm",
        "SoilMoisture_40cm","SoilMoisture_50cm","SoilMoisture_60cm",
        "Rain","Temp","Hum"
    ]
    placeholders = ",".join("?" * len(sensors_needed))
    cursor.execute(f"""
        SELECT s.name, m.value
        FROM measurements m
        JOIN sensors s ON m.sensor_id = s.sensor_id
        JOIN (
            SELECT sensor_id, MAX(timestamp) AS max_ts
            FROM measurements
            WHERE value IS NOT NULL
            GROUP BY sensor_id
        ) latest ON latest.sensor_id = m.sensor_id AND m.timestamp = latest.max_ts
        WHERE s.site_id = ? AND s.name IN ({placeholders})
    """, (site_id, *sensors_needed))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return {row[0]: row[1] for row in rows}
