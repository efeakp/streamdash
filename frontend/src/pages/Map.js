import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { UOH_NODES, CATEGORY_COLOUR } from "../data/uohNodes";

const CENTRE = [53.7714, -0.3685];
const ZOOM = 15;

function Map() {
  const [activeCategory, setActiveCategory] = useState(null);

  const allCategories = [...new Set(UOH_NODES.flatMap((n) => n.categories))].sort();

  const visible = activeCategory
    ? UOH_NODES.filter((n) => n.categories.includes(activeCategory))
    : UOH_NODES;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Campus Sensor Network</h2>
      <p style={{ color: "#555", marginBottom: 12 }}>
        {UOH_NODES.length} monitoring nodes across the University of Hull campus.
        Click a marker for details.
      </p>

      {/* Category filter */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setActiveCategory(null)}
          style={{
            padding: "4px 12px",
            borderRadius: 20,
            border: "1px solid #ccc",
            background: activeCategory === null ? "#0077ff" : "#fff",
            color: activeCategory === null ? "#fff" : "#333",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          All
        </button>
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              border: `1px solid ${CATEGORY_COLOUR[cat] ?? "#ccc"}`,
              background: activeCategory === cat ? (CATEGORY_COLOUR[cat] ?? "#999") : "#fff",
              color: activeCategory === cat ? "#fff" : "#333",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Map */}
      <MapContainer
        center={CENTRE}
        zoom={ZOOM}
        style={{ height: 520, borderRadius: 8, border: "1px solid #ddd" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {visible.map((node) => (
          <CircleMarker
            key={node.name}
            center={[node.lat, node.lon]}
            radius={10}
            pathOptions={{
              fillColor: node.colour,
              color: "#fff",
              weight: 2,
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <strong>{node.label}</strong>
              <br />
              <span style={{ fontSize: "0.8rem", color: "#666" }}>{node.name}</span>
              <br />
              <br />
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {node.categories.map((cat) => (
                  <span
                    key={cat}
                    style={{
                      display: "inline-block",
                      background: CATEGORY_COLOUR[cat] ?? "#999",
                      color: "#fff",
                      borderRadius: 10,
                      padding: "2px 8px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
              {node.dbLink && (
                <Link
                  to={`/dashboard?location_id=${node.dbLink.locationId}&site_id=${node.dbLink.siteId}`}
                  style={{
                    display: "block",
                    marginTop: 10,
                    padding: "6px 0",
                    background: "#0077ff",
                    color: "#fff",
                    borderRadius: 5,
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  View sensor data →
                </Link>
              )}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 12 }}>
        {allCategories.map((cat) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem" }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: CATEGORY_COLOUR[cat] ?? "#999",
                display: "inline-block",
              }}
            />
            {cat}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Map;
