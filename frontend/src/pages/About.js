import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import uppBadge from "../assets/upp_badge.png";
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

function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M+";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K+";
  return n.toString();
}

const About = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

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

      {/* Map */}
      <section className="about-map">
        <h2>Monitoring Sites</h2>
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
