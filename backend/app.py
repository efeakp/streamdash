from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import mariadb, os
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_connection():
    return mariadb.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "efe"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME", "suds_database"),
    )

@app.get("/measurements")
def get_measurements(
    sensor_id: Optional[int] = Query(None, description="sensor_id (preferred)"),
    site_code: Optional[str] = Query(None, description="optional, for name-based filter"),
    sensor_name: Optional[str] = Query(None, description="NOT recommended; use sensor_id"),
    start_date: Optional[str] = Query(None, description="YYYY-MM-DD or ISO"),
    end_date: Optional[str] = Query(None, description="YYYY-MM-DD or ISO"),
    limit: int = Query(100, ge=1, le=10000, description="Max rows to return"),
):
    """
    Returns measurements ordered ASC by timestamp.
    Prefer using sensor_id to avoid name mismatches.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT m.measurement_id, m.timestamp, m.value,
                   s.sensor_id, s.name AS sensor_name, s.unit,
                   si.site_code, l.name AS location
            FROM measurements m
            JOIN sensors s ON m.sensor_id = s.sensor_id
            JOIN sites si ON s.site_id = si.site_id
            JOIN locations l ON si.location_id = l.location_id
        """
        conditions, params = [], []

        if sensor_id is not None:
            conditions.append("s.sensor_id = %s")
            params.append(sensor_id)
        else:
            # fallback to name/site filters if sensor_id not passed
            if site_code:
                conditions.append("si.site_code = %s")
                params.append(site_code)
            if sensor_name:
                conditions.append("s.name = %s")
                params.append(sensor_name)

        if start_date:
            conditions.append("m.timestamp >= %s")
            params.append(start_date)
        if end_date:
            conditions.append("m.timestamp <= %s")
            params.append(end_date)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY m.timestamp ASC LIMIT %s"
        params.append(limit)

        cursor.execute(query, params)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        # normalize timestamp to string
        for r in rows:
            r["timestamp"] = r["timestamp"].isoformat(sep=" ")

        return {"count": len(rows), "results": rows}

    except mariadb.Error as e:
        return {"error": str(e)}
