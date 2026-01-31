import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

function SiteSelector({ locationId, onSelect }) {
  const [sites, setSites] = useState([]);

  useEffect(() => {
    if (locationId) {
      fetch(`${API_URL}/sites?location_id=${locationId}`)
        .then((res) => res.json())
        .then((data) => setSites(Array.isArray(data) ? data : []))
        .catch((err) => {
          console.error("Error fetching sites:", err);
          setSites([]);
        });
    } else {
      setSites([]);
    }
  }, [locationId]);

  return (
    <div style={{ marginTop: 8 }}>
      <label style={{ marginRight: 8 }}>Select Site: </label>
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
    </div>
  );
}

export default SiteSelector;
