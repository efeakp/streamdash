import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

function SiteSelector({ locationId, onSelect }) {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (locationId) {
      setLoading(true);
      setError(null);
      fetch(`${API_URL}/sites?location_id=${locationId}`)
        .then((res) => res.json())
        .then((data) => setSites(Array.isArray(data) ? data : []))
        .catch(() => setError("Failed to load sites."))
        .finally(() => setLoading(false));
    } else {
      setSites([]);
    }
  }, [locationId]);

  return (
    <div style={{ marginTop: 8 }}>
      <label style={{ marginRight: 8 }}>Select Site: </label>
      {loading && <span>Loading...</span>}
      {error && <span style={{ color: "red" }}>{error}</span>}
      {!loading && !error && (
        <select
          onChange={(e) => {
            const val = e.target.value;
            onSelect(val ? Number(val) : null);
          }}
        >
          <option value="">-- Choose --</option>
          {sites.map((site) => (
            <option key={site.site_id} value={site.site_id}>
              {site.site_code}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default SiteSelector;
