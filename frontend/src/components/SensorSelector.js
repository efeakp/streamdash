import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

function SensorSelector({ siteId, onSelect }) {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (siteId) {
      setLoading(true);
      setError(null);
      fetch(`${API_URL}/sensors?site_id=${siteId}`)
        .then((res) => res.json())
        .then((data) => setSensors(Array.isArray(data) ? data : []))
        .catch(() => setError("Failed to load sensors."))
        .finally(() => setLoading(false));
    } else {
      setSensors([]);
    }
  }, [siteId]);

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
            onSelect(sensor || null);
          }}
        >
          <option value="">-- Choose --</option>
          {sensors.map((sensor) => (
            <option key={sensor.sensor_id} value={sensor.sensor_id}>
              {sensor.name} {sensor.unit ? `(${sensor.unit})` : ""}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default SensorSelector;
