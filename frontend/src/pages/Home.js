import React, { useState } from "react";
import LocationSelector from "../components/LocationSelector";
import SiteSelector from "../components/SiteSelector";
import SensorSelector from "../components/SensorSelector";
import MeasurementChart from "../components/MeasurementChart";

function Home() {
  const [locationId, setLocationId] = useState(null);
  const [siteId, setSiteId] = useState(null);
  const [sensor, setSensor] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div>
      <h2>Sensor Dashboard</h2>
      <LocationSelector
        onSelect={(id) => {
          setLocationId(id);
          setSiteId(null);
          setSensor(null);
        }}
      />
      {locationId && (
        <SiteSelector
          locationId={locationId}
          onSelect={(id) => {
            setSiteId(id);
            setSensor(null);
          }}
        />
      )}
      {siteId && (
        <SensorSelector
          siteId={siteId}
          onSelect={(s) => setSensor(s)}
        />
      )}
      {sensor && (
        <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <label>
            From:{" "}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            To:{" "}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>
      )}
      {sensor && (
        <MeasurementChart
          sensorId={sensor.sensor_id}
          sensorName={sensor.name}
          unit={sensor.unit}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  );
}

export default Home;
