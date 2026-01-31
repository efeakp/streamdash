// src/pages/About.js

import React from "react";
import uppBadge from "../assets/upp_badge.png";

const About = () => {
  return (
    <div className="about-container" style={{ padding: "40px" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <img
          src={uppBadge}
          alt="UPP Sustainability Design Winner Badge"
          style={{ width: "250px", height: "auto" }}
        />
      </div>

      <h2>About Streamdash</h2>

      <p>
        Streamdash is a student-driven Living Lab for sustainability, data, and
        innovation at the University of Hull. Created as part of the UPP
        Foundation's Student Sustainability Fund Challenge, the platform
        transforms the campus into a real-time testbed where students can
        explore how our environment responds to weather, water, and climate
        pressures.
      </p>

      <p>
        By integrating live sensor networks, interactive dashboards, and
        geospatial analytics, Streamdash empowers students and researchers to
        experiment with real environmental data, develop new insights, and
        prototype solutions that support climate resilience.
      </p>

      <p>
        Our mission is to bridge sustainability learning with hands-on digital
        innovation helping students translate ideas into impact while
        contributing to a more sustainable campus and community.
      </p>

      <h2>Links</h2>
      <p>
         SuDSlab Project Page:{" "}
         <a href="https://www.hull.ac.uk/research/projects/sudslab">SuDSlab – University of Hull</a><br />
         Open‑access Monitoring Manual:{" "}
         <a href="https://zenodo.org/records/15575166">SuDS Monitoring Manual</a><br />
       </p>
    </div>
  );
};

export default About;
