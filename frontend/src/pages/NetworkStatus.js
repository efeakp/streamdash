import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UOH_NODES, CATEGORY_COLOUR } from "../data/uohNodes";
import "../About.css";
import "./NetworkStatus.css";

const API_URL = process.env.REACT_APP_API_URL;

function statusFromLastSeen(lastSeen) {
  if (!lastSeen) return { label: "No data", cls: "status-nodata" };
  const diffMs = Date.now() - new Date(lastSeen).getTime();
  const diffHours = diffMs / 3600000;
  if (diffHours < 24) return { label: "Online", cls: "status-online" };
  if (diffHours < 168) return { label: "Recent", cls: "status-recent" };
  return { label: "Stale", cls: "status-stale" };
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function relativeTime(iso) {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}yr ago`;
}

function NetworkStatus() {
  const [dbData, setDbData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/network-status`)
      .then((r) => r.json())
      .then((data) => {
        setDbData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load network status.");
        setLoading(false);
      });
  }, []);

  // Build a lookup from {locationId, siteId} → DB row
  const dbBySite = {};
  dbData.forEach((row) => {
    dbBySite[`${row.location_id}-${row.site_id}`] = row;
  });

  // Merge node metadata with DB data
  const rows = UOH_NODES.map((node) => {
    const db = node.dbLink
      ? dbBySite[`${node.dbLink.locationId}-${node.dbLink.siteId}`] || null
      : null;
    return { node, db };
  });

  // Summary counts
  const online  = rows.filter(({ db }) => db && statusFromLastSeen(db.last_seen).cls === "status-online").length;
  const recent  = rows.filter(({ db }) => db && statusFromLastSeen(db.last_seen).cls === "status-recent").length;
  const stale   = rows.filter(({ db }) => db && statusFromLastSeen(db.last_seen).cls === "status-stale").length;
  const noLink  = rows.filter(({ db }) => !db).length;

  return (
    <div className="ns-page">
      <h2>Network Status</h2>
      <p className="ns-subtitle">
        {UOH_NODES.length} monitoring nodes across the University of Hull campus.
        Data refreshed on page load.
      </p>

      {/* Summary pills */}
      <div className="ns-summary">
        <div className="ns-pill pill-online">{online} Online</div>
        <div className="ns-pill pill-recent">{recent} Recent</div>
        <div className="ns-pill pill-stale">{stale} Stale</div>
        <div className="ns-pill pill-nodata">{noLink} WeatherLink only</div>
      </div>

      {loading && <p className="ns-loading">Loading status data...</p>}
      {error   && <p className="ns-error">{error}</p>}

      {!loading && !error && (
        <div className="ns-table-wrap">
          <table className="ns-table">
            <thead>
              <tr>
                <th>Node</th>
                <th>Status</th>
                <th>Last data</th>
                <th>Installed</th>
                <th>Sensors</th>
                <th>Categories</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ node, db }) => {
                const status = db ? statusFromLastSeen(db.last_seen) : { label: "WeatherLink only", cls: "status-wl" };
                return (
                  <tr key={node.name}>
                    <td className="ns-name">
                      <span className="ns-dot" style={{ background: node.colour }} />
                      {node.label}
                      <span className="ns-rawname">{node.name}</span>
                    </td>
                    <td>
                      <span className={`ns-badge ${status.cls}`}>{status.label}</span>
                    </td>
                    <td className="ns-date">
                      {db?.last_seen ? (
                        <>
                          <span>{formatDate(db.last_seen)}</span>
                          <span className="ns-rel">{relativeTime(db.last_seen)}</span>
                        </>
                      ) : "—"}
                    </td>
                    <td className="ns-date">{formatDate(node.installed)}</td>
                    <td className="ns-count">{node.sensorCount}</td>
                    <td>
                      <div className="ns-cats">
                        {node.categories.map((cat) => (
                          <span
                            key={cat}
                            className="ns-cat"
                            style={{ background: CATEGORY_COLOUR[cat] ?? "#999" }}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {node.dbLink && (
                        <Link
                          to={`/dashboard?location_id=${node.dbLink.locationId}&site_id=${node.dbLink.siteId}`}
                          className="ns-link"
                        >
                          Data →
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default NetworkStatus;
