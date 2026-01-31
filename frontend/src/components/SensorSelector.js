import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

function SensorSelector({ siteId, onSelect }) {
  const [sensors, setSensors] = useState([]);

  useEffect(() => {
    if (siteId) {
      fetch(`${API_URL}/sensors?site_id=${siteId}`)
        .then((res) => res.json())
        .then((data) => setSensors(Array.isArray(data) ? data : []))
        .catch((err) => {
          console.error("Error fetching sensors:", err);
          setSensors([]);
        });
    } else {
      setSensors([]);
    }
  }, [siteId]);

  return (
    <div style={{ marginTop: 8 }}>
      <label style={{ marginRight: 8 }}>Select Sensor: </label>
      <select
        onChange={(e) => {
          const val = e.target.value;
          onSelect(val ? Number(val) : null);
        }}
      >
        <option value="">-- Choose --</option>
        {sensors.map((sensor) => (
          <option key={sensor.sensor_id} value={sensor.sensor_id}>
            {sensor.name} {sensor.unit ? `(${sensor.unit})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SensorSelector;
