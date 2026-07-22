"""
ML surrogate model training script for StreamDash digital twin.

Trains a Random Forest that predicts soil moisture at 6 depths (10-60cm)
one step ahead (~5 min) given:
  - recent rainfall (last 1h, 6h, 24h cumulative)
  - current temperature and humidity
  - antecedent soil moisture at each depth (current reading)
  - hour of day and day of year (cyclic)

Best nodes: Planter 006 (site_id=5) and Planter 007A (site_id=11).
Temp/hum sourced from the node itself where available, else Library.

Run from the backend/ directory:
  python3 train_model.py
"""

import os
import sys
import json
import joblib
import mariadb
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from dotenv import load_dotenv

load_dotenv()

DB = dict(
    host=os.environ["DB_HOST"],
    port=int(os.environ.get("DB_PORT", 3306)),
    user=os.environ["DB_USER"],
    password=os.environ["DB_PASSWORD"],
    database=os.environ["DB_NAME"],
)

DEPTHS = [10, 20, 30, 40, 50, 60]
TARGETS = [f"SoilMoisture_{d}cm" for d in DEPTHS]

# Nodes to train on: (location_name, site_code, site_id)
NODES = [
    {"name": "Planter 006", "site_id": 5,  "location": "Planter"},
    {"name": "Planter 007A","site_id": 11, "location": "Planter"},
]


def get_connection():
    return mariadb.connect(**DB)


def load_node_data(conn, site_id):
    """Pull all relevant sensor readings for a node into a wide DataFrame."""
    sensors_needed = TARGETS + [
        f"SoilTemperature_{d}cm" for d in DEPTHS
    ] + ["Rain", "RainRate", "Temp", "Hum"]

    placeholders = ",".join("?" * len(sensors_needed))
    cur = conn.cursor()
    cur.execute(f"""
        SELECT s.name, m.timestamp, m.value
        FROM measurements m
        JOIN sensors s ON m.sensor_id = s.sensor_id
        WHERE s.site_id = ?
          AND s.name IN ({placeholders})
          AND m.value IS NOT NULL
        ORDER BY m.timestamp
    """, (site_id, *sensors_needed))

    rows = cur.fetchall()
    cur.close()

    if not rows:
        return None

    df = pd.DataFrame(rows, columns=["sensor", "timestamp", "value"])
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    # Pivot to wide format; average duplicates within the same minute
    df = df.groupby(["timestamp", "sensor"])["value"].mean().unstack("sensor")
    df = df.resample("5min").mean()
    return df


def add_rain_windows(df):
    """Add cumulative rainfall over 1h, 6h, 24h rolling windows."""
    if "Rain" not in df.columns:
        for col in ["Rain_1h", "Rain_6h", "Rain_24h"]:
            df[col] = 0.0
        return df
    rain = df["Rain"].fillna(0)
    df["Rain_1h"]  = rain.rolling(12,  min_periods=1).sum()
    df["Rain_6h"]  = rain.rolling(72,  min_periods=1).sum()
    df["Rain_24h"] = rain.rolling(288, min_periods=1).sum()
    return df


def add_cyclic_time(df):
    df["hour_sin"] = np.sin(2 * np.pi * df.index.hour / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df.index.hour / 24)
    df["doy_sin"]  = np.sin(2 * np.pi * df.index.dayofyear / 365)
    df["doy_cos"]  = np.cos(2 * np.pi * df.index.dayofyear / 365)
    return df


def build_features(df, target_col):
    """
    Feature set for predicting target_col at t+1:
      - rain windows (1h, 6h, 24h)
      - current Temp, Hum
      - current soil moisture at all 6 depths (antecedent state)
      - cyclic time features
    Target: target_col shifted back by 1 step (predict next reading).
    """
    feature_cols = ["Rain_1h", "Rain_6h", "Rain_24h", "hour_sin", "hour_cos", "doy_sin", "doy_cos"]

    for col in ["Temp", "Hum"]:
        if col in df.columns:
            feature_cols.append(col)

    for d in DEPTHS:
        col = f"SoilMoisture_{d}cm"
        if col in df.columns:
            feature_cols.append(col)

    available = [c for c in feature_cols if c in df.columns]
    X = df[available].copy()
    y = df[target_col].shift(-1)  # predict one step ahead

    mask = X.notna().all(axis=1) & y.notna()
    return X[mask], y[mask], available


def train_node(conn, node):
    print(f"\n=== Training: {node['name']} (site_id={node['site_id']}) ===")
    df = load_node_data(conn, node["site_id"])
    if df is None or len(df) < 500:
        print("  Not enough data, skipping.")
        return None

    print(f"  Raw rows: {len(df)}")
    df = add_rain_windows(df)
    df = add_cyclic_time(df)

    models = {}
    metrics = {}
    feature_names = None

    for target in TARGETS:
        if target not in df.columns:
            print(f"  {target}: missing, skipping")
            continue

        X, y, feats = build_features(df, target)
        if len(X) < 200:
            print(f"  {target}: too few samples ({len(X)}), skipping")
            continue

        feature_names = feats
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

        rf = RandomForestRegressor(n_estimators=100, max_depth=12, n_jobs=-1, random_state=42)
        rf.fit(X_train, y_train)

        y_pred = rf.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        r2  = r2_score(y_test, y_pred)
        print(f"  {target}: MAE={mae:.3f}%  R²={r2:.3f}  (n={len(X)})")

        models[target] = rf
        metrics[target] = {"mae": round(mae, 4), "r2": round(r2, 4), "n_samples": len(X)}

    if not models:
        print("  No models trained.")
        return None

    # Feature importance (average across target models)
    importances = np.zeros(len(feature_names))
    for rf in models.values():
        importances += rf.feature_importances_
    importances /= len(models)
    fi = dict(zip(feature_names, importances.tolist()))

    result = {
        "node_name": node["name"],
        "site_id": node["site_id"],
        "feature_names": feature_names,
        "feature_importance": fi,
        "metrics": metrics,
        "models": models,
    }
    return result


def save_node(result):
    slug = result["node_name"].lower().replace(" ", "_")
    path = f"models/{slug}.joblib"
    meta_path = f"models/{slug}_meta.json"

    joblib.dump(
        {"models": result["models"], "feature_names": result["feature_names"]},
        path
    )
    meta = {
        "node_name": result["node_name"],
        "site_id": result["site_id"],
        "feature_names": result["feature_names"],
        "feature_importance": result["feature_importance"],
        "metrics": result["metrics"],
    }
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"  Saved: {path}, {meta_path}")
    return slug


def main():
    conn = get_connection()
    slugs = []
    for node in NODES:
        result = train_node(conn, node)
        if result:
            slug = save_node(result)
            slugs.append(slug)
    conn.close()

    # Write index of available models
    with open("models/index.json", "w") as f:
        json.dump(slugs, f)
    print(f"\nDone. Models saved: {slugs}")


if __name__ == "__main__":
    main()
