import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import LocationSelector from "../components/LocationSelector";
import SiteSelector from "../components/SiteSelector";
import SensorSelector from "../components/SensorSelector";
import MeasurementChart from "../components/MeasurementChart";
import LiveWeather from "../components/LiveWeather";

function Home() {
  const [searchParams] = useSearchParams();
  const defaultLocationId = searchParams.get("location_id") ? Number(searchParams.get("location_id")) : null;
  const defaultSiteId     = searchParams.get("site_id")     ? Number(searchParams.get("site_id"))     : null;

  const [locationId, setLocationId] = useState(defaultLocationId);
  const [siteId, setSiteId]         = useState(defaultSiteId);
  const [sensor, setSensor]         = useState(null);
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");

  return (
    <div>
      <h2>Sensor Dashboard</h2>

      <h3 style={{ marginBottom: 4 }}>Live Conditions</h3>
      <LiveWeather />

      <h3 style={{ marginTop: 28, marginBottom: 8 }}>Sensor Data</h3>
      <LocationSelector
        defaultId={defaultLocationId}
        onSelect={(id) => {
          setLocationId((prev) => {
            if (prev !== id) { setSiteId(null); setSensor(null); }
            return id;
          });
        }}
      />
      {locationId && (
        <SiteSelector
          locationId={locationId}
          defaultId={defaultSiteId}
          onSelect={(id) => {
            setSiteId((prev) => {
              if (prev !== id) setSensor(null);
              return id;
            });
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
