import React from "react";

function Map() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Site Map</h2>
      <p style={{ color: "#555", marginBottom: "16px" }}>
        Interactive map of all SuDS monitoring locations across the University of Hull campus and surrounding area.
      </p>
      <iframe
        title="SuDS Monitoring Sites"
        src="https://www.google.com/maps/d/embed?mid=1NBGFkfCjY_he4-ULN4hYiFnmJij_OVo"
        width="100%"
        height="500"
        style={{ border: 0, borderRadius: "8px" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default Map;
