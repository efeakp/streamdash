import React, { useState } from "react";
import LocationSelector from "../components/LocationSelector";
import SiteSelector from "../components/SiteSelector";
import SensorSelector from "../components/SensorSelector";
import MeasurementChart from "../components/MeasurementChart";

function Home() {
  const [locationId, setLocationId] = useState(null);
  const [siteId, setSiteId] = useState(null);
  const [sensorId, setSensorId] = useState(null);

  return (
    <div>
      <h2>Sensor Dashboard</h2>
      <LocationSelector onSelect={(id) => { setLocationId(id); setSiteId(null); setSensorId(null); }} />
      {locationId && <SiteSelector locationId={locationId} onSelect={(id) => { setSiteId(id); setSensorId(null); }} />}
      {siteId && <SensorSelector siteId={siteId} onSelect={(id) => setSensorId(id)} />}
      {sensorId && <MeasurementChart sensorId={sensorId} />}
    </div>
  );
}

export default Home;
