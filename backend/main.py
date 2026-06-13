from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import time
import db
import requests as http

app = FastAPI()

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
