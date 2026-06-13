import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

function LocationSelector({ onSelect, defaultId }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [value, setValue] = useState(defaultId ? String(defaultId) : "");

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/locations`)
      .then((res) => res.json())
      .then((data) => {
        const locs = Array.isArray(data) ? data : [];
        setLocations(locs);
        if (defaultId && locs.find((l) => l.location_id === defaultId)) {
          onSelect(defaultId);
        }
      })
      .catch(() => setError("Failed to load locations."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ marginTop: 8 }}>
      <label style={{ marginRight: 8 }}>Select Location: </label>
      {loading && <span>Loading...</span>}
      {error && <span style={{ color: "red" }}>{error}</span>}
      {!loading && !error && (
        <select
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            setValue(val);
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
      )}
    </div>
  );
}

export default LocationSelector;
