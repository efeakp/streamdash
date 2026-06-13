import React, { useEffect, useState } from "react";
import { getHardwareInfo } from "../data/sensorHardware";

const API_URL = process.env.REACT_APP_API_URL;

function SensorSelector({ siteId, onSelect }) {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (siteId) {
      setLoading(true);
      setError(null);
      setSelected(null);
      fetch(`${API_URL}/sensors?site_id=${siteId}`)
        .then((res) => res.json())
        .then((data) => setSensors(Array.isArray(data) ? data : []))
        .catch(() => setError("Failed to load sensors."))
        .finally(() => setLoading(false));
    } else {
      setSensors([]);
      setSelected(null);
    }
  }, [siteId]);

  const hw = selected ? getHardwareInfo(selected.name) : null;

  return (
    <div style={{ marginTop: 8 }}>
      <label style={{ marginRight: 8 }}>Select Sensor: </label>
      {loading && <span>Loading...</span>}
      {error && <span style={{ color: "red" }}>{error}</span>}
      {!loading && !error && (
        <select
          onChange={(e) => {
            const val = e.target.value;
            const sensor = sensors.find((s) => s.sensor_id === Number(val));
            setSelected(sensor || null);
            onSelect(sensor || null);
          }}
        >
          <option value="">-- Choose --</option>
          {sensors.map((sensor) => {
            const info = getHardwareInfo(sensor.name);
            return (
              <option
                key={sensor.sensor_id}
                value={sensor.sensor_id}
                title={info ? `${info.manufacturer} · ${info.product}` : undefined}
              >
                {sensor.name} {sensor.unit ? `(${sensor.unit})` : ""}
              </option>
            );
          })}
        </select>
      )}
      {hw && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginLeft: 10,
            padding: "3px 10px",
            background: "#f0f6ff",
            border: "1px solid #c8deff",
            borderRadius: 14,
            fontSize: "0.8rem",
            color: "#1a56b0",
          }}
        >
          <span style={{ fontWeight: 600 }}>{hw.manufacturer}</span>
          <span style={{ color: "#666" }}>·</span>
          <span>{hw.product}</span>
        </div>
      )}
    </div>
  );
}

export default SensorSelector;
