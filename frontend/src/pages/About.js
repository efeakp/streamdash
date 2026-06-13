import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import uppBadge from "../assets/upp_badge.png";
import LiveWeather from "../components/LiveWeather";
import { UOH_NODES, CATEGORY_COLOUR } from "../data/uohNodes";
import "../About.css";

const API_URL = process.env.REACT_APP_API_URL;

const FEATURES = [
  {
    title: "Dashboard",
    description: "Explore live sensor readings across all SuDS sites. Filter by location, site, sensor, and date range.",
    path: "/dashboard",
    icon: "📊",
  },
  {
    title: "Network",
    description: "Live health overview of all 22 campus sensor nodes — status, last data, installation dates, and categories.",
    path: "/network",
    icon: "🛰️",
  },
  {
    title: "Parameters",
    description: "Browse the full catalogue of monitored environmental parameters with descriptions and units.",
    path: "/parameters",
    icon: "📋",
  },
  {
    title: "Gallery",
    description: "Meet the student team and researchers behind the Streamdash project.",
    path: "/gallery",
    icon: "👥",
  },
];

function statusFromLastSeen(lastSeen) {
  if (!lastSeen) return { label: "No data", cls: "ns-badge status-nodata" };
  const diffHours = (Date.now() - new Date(lastSeen).getTime()) / 3600000;
  if (diffHours < 24)  return { label: "Online",  cls: "ns-badge status-online" };
  if (diffHours < 168) return { label: "Recent",  cls: "ns-badge status-recent" };
  return               { label: "Stale",   cls: "ns-badge status-stale" };
}

function relativeTime(iso) {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30)  return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}yr ago`;
}

function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M+";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K+";
  return n.toString();
}

const About = () => {
  const [stats, setStats] = useState(null);
  const [networkData, setNetworkData] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});

    fetch(`${API_URL}/network-status`)
      .then((res) => res.json())
      .then((data) => setNetworkData(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const dbBySite = {};
  networkData.forEach((row) => {
    dbBySite[`${row.location_id}-${row.site_id}`] = row;
  });

  const nodeRows = UOH_NODES.map((node) => ({
    node,
    db: node.dbLink ? dbBySite[`${node.dbLink.locationId}-${node.dbLink.siteId}`] || null : null,
  }));

  const onlineCount  = nodeRows.filter(({ db }) => db && statusFromLastSeen(db.last_seen).label === "Online").length;
  const recentCount  = nodeRows.filter(({ db }) => db && statusFromLastSeen(db.last_seen).label === "Recent").length;
  const staleCount   = nodeRows.filter(({ db }) => db && statusFromLastSeen(db.last_seen).label === "Stale").length;
  const wlOnlyCount  = nodeRows.filter(({ db }) => !db).length;

  return (
    <div className="about-page">

      {/* Hero */}
      <section className="about-hero">
        <h1>Real-time SuDS Monitoring</h1>
        <p className="about-hero-sub">
          A student-driven living lab for sustainability, data, and innovation
          at the University of Hull — transforming the campus into a real-time
          environmental testbed.
        </p>
        <Link to="/dashboard" className="about-hero-cta">
          Go to Dashboard →
        </Link>
      </section>

      {/* Stats bar */}
      {stats && (
        <section className="about-stats">
          <div className="about-stat">
            <span className="about-stat-number">{formatNumber(stats.locations)}</span>
            <span className="about-stat-label">Locations</span>
          </div>
          <div className="about-stat">
            <span className="about-stat-number">{formatNumber(stats.sensors)}</span>
            <span className="about-stat-label">Sensors</span>
          </div>
          <div className="about-stat">
            <span className="about-stat-number">{formatNumber(stats.measurements)}</span>
            <span className="about-stat-label">Readings</span>
          </div>
        </section>
      )}

      {/* Feature cards */}
      <section className="about-cards">
        {FEATURES.map((f) => (
          <Link to={f.path} key={f.title} className="about-card">
            <span className="about-card-icon">{f.icon}</span>
            <h3 className="about-card-title">{f.title}</h3>
            <p className="about-card-desc">{f.description}</p>
          </Link>
        ))}
      </section>

      {/* Live conditions */}
      <section className="about-live">
        <h2>Live Conditions</h2>
        <LiveWeather />
      </section>

      {/* Map */}
      <section className="about-map">
        <h2>
          Monitoring Sites{" "}
          <Link to="/map" style={{ fontSize: "0.85rem", fontWeight: "normal", marginLeft: 10 }}>
            View interactive sensor map →
          </Link>
        </h2>
        <iframe
          title="SuDS Monitoring Sites"
          src="https://www.google.com/maps/d/embed?mid=1NBGFkfCjY_he4-ULN4hYiFnmJij_OVo"
          width="100%"
          height="420"
          style={{ border: 0, borderRadius: "8px" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      {/* Network status preview */}
      <section className="about-network">
        <h2>
          Network Status{" "}
          <Link to="/network" style={{ fontSize: "0.85rem", fontWeight: "normal", marginLeft: 10 }}>
            View full status →
          </Link>
        </h2>

        {/* Summary pills */}
        <div className="about-ns-pills">
          <span className="ns-pill pill-online">{onlineCount} Online</span>
          <span className="ns-pill pill-recent">{recentCount} Recent</span>
          <span className="ns-pill pill-stale">{staleCount} Stale</span>
          <span className="ns-pill pill-nodata">{wlOnlyCount} WeatherLink only</span>
        </div>

        {/* Compact node list */}
        <div className="about-ns-grid">
          {nodeRows.map(({ node, db }) => {
            const status = db ? statusFromLastSeen(db.last_seen) : { label: "WeatherLink only", cls: "ns-badge status-wl" };
            return (
              <div key={node.name} className="about-ns-card">
                <div className="about-ns-card-top">
                  <span className="ns-dot" style={{ background: node.colour, flexShrink: 0 }} />
                  <span className="about-ns-label">{node.label}</span>
                  <span className={status.cls}>{status.label}</span>
                </div>
                <div className="about-ns-card-cats">
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
                {db?.last_seen && (
                  <div className="about-ns-lastseen">Last data: {relativeTime(db.last_seen)}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* About text */}
      <section className="about-body">
        <p>
          Streamdash integrates live sensor networks, interactive dashboards,
          and geospatial analytics to empower students and researchers to
          experiment with real environmental data, develop new insights, and
          prototype solutions that support climate resilience.
        </p>
        <p>
          Our mission is to bridge sustainability learning with hands-on digital
          innovation — helping students translate ideas into impact while
          contributing to a more sustainable campus and community.
        </p>
      </section>

      {/* Links + badge */}
      <section className="about-footer-section">
        <div className="about-links">
          <h3>Links</h3>
          <p>
            <a href="https://www.hull.ac.uk/research/projects/sudslab" target="_blank" rel="noopener noreferrer">
              SuDSlab – University of Hull
            </a>
          </p>
          <p>
            <a href="https://zenodo.org/records/15575166" target="_blank" rel="noopener noreferrer">
              Open-access SuDS Monitoring Manual
            </a>
          </p>
        </div>
        <img src={uppBadge} alt="UPP Sustainability Design Winner Badge" className="about-badge" />
      </section>

    </div>
  );
};

export default About;
