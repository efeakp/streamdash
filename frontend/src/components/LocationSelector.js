import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

function LocationSelector({ onSelect }) {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/locations`)
      .then((res) => res.json())
      .then((data) => setLocations(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error fetching locations:", err);
        setLocations([]);
      });
  }, []);

  return (
    <div style={{ marginTop: 8 }}>
      <label style={{ marginRight: 8 }}>Select Location: </label>
      <select
        onChange={(e) => {
          const val = e.target.value;
          onSelect(val ? Number(val) : null);
        }}
      >
        <option value="">-- Choose --</option>
        {locations.map((loc) => (
          <option key={loc.location_id} value={loc.location_id}>
            {loc.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LocationSelector;
