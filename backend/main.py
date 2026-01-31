from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import db

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

    query += " ORDER BY timestamp ASC"   # ASC for proper time-series order

    cursor.execute(query, tuple(params))
    results = [{"timestamp": str(row[0]), "value": row[1]} for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return results
