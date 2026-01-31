// src/pages/About.js

import React from 'react';
import styles from '../About.css';

const About = () => {
  return (
    <div className={styles.aboutPage}>
      {/* Hero / Intro */}
      <section className={styles.aboutHero}>
        <h1>StreamDash</h1>
        <p className={styles.tagline}>
          Real‑time SuDS Monitoring & Data Platform at the University of Hull.
        </p>
        <p>
          StreamDash is a student‑led dashboard built to monitor sustainable drainage
          systems (SuDS) on campus, visualising live data to support research, education,
          and sustainable infrastructure design.
        </p>
      </section>

      {/* Mission */}
      <section className={styles.aboutMission}>
        <h2>Our Mission</h2>
        <p>
          We believe that water doesn’t have to be a problem if managed intelligently,
          it can be a resource. Our mission is to make SuDS data <strong>machine‑ready</strong>,
          empowering students, researchers, and decision‑makers to build smarter, more resilient
          drainage systems.
        </p>
        <ul>
          <li>Support machine learning & AI‑driven research on hydrological behaviour</li>
          <li>Enhance educational opportunities in sustainability, environmental science & data science</li>
          <li>Promote evidence‑based design and deployment of SuDS across campus and beyond</li>
        </ul>
      </section>

      {/* Story / Background */}
      <section className={styles.aboutStory}>
        <h2>Why We Started</h2>
        <p>
          StreamDash was born from a student sustainability initiative funded by the UPP Student
          Sustainability Fund. A dedicated team of students proposed a data‑driven platform
          to visualise how surface water behaves on the University of Hull campus.
        </p>
        <p>
          At the same time, the University’s SuDSlab project was instrumenting its grounds with a
          network of sensors measuring flow, rainfall, soil moisture, and more. StreamDash brings
          all that data into a user-friendly interface so that it's not just collected — it’s used.
        </p>
      </section>

      {/* What We Monitor / How It Works */}
      <section className={styles.aboutWhat}>
        <h2>What We Monitor & How It Works</h2>
        <p>Our system integrates with the SuDSlab sensor network to capture:</p>
        <ul>
          <li>Water flow and depth via flow meters / depth gauges</li>
          <li>Soil moisture and conductivity</li>
          <li>Rainfall, temperature, and other weather station data</li>
          <li>Groundwater and hydrological dynamics across campus SuDS assets</li>
        </ul>
        <p>
          Data is streamed at high temporal resolution (every 5–15 minutes) to our dashboard,
          making the dataset <em>machine‑ready</em> for advanced analysis — including predictive
          modelling with AI / ML.
        </p>
      </section>

      {/* Impact & Use Cases */}
      <section className={styles.aboutImpact}>
        <h2>Our Impact & Use Cases</h2>

        <h3>For Researchers & Students</h3>
        <p>
          Use StreamDash as a data source for machine learning, hydrological modelling, or data science
          projects. Access both live and historical data for experiments, forecasts, or analysis.
        </p>

        <h3>For Campus Planning</h3>
        <p>
          Inform the design or improvement of SuDS across campus. Use real‑world data to guide decisions
          on how drainage features perform under different conditions.
        </p>

        <h3>For Education & Community Engagement</h3>
        <p>
          Provide real-world data for teaching modules. Use StreamDash as a case study to raise awareness
          around sustainable water management.
        </p>
      </section>

      {/* Credibility / Partners */}
      <section className={styles.aboutPartners}>
        <h2>Credibility & Partnerships</h2>
        <p>
          StreamDash is built on data from the <strong>SuDSlab</strong> network at the University of Hull.
          SuDSlab is part of Hull’s broader sustainable drainage research infrastructure, making StreamDash
          a bridge between raw environmental data and practical, usable insight.
        </p>
      </section>

      {/* Vision / Long-Term Goals */}
      <section className={styles.aboutVision}>
        <h2>Long-Term Vision</h2>
        <ul>
          <li><strong>Scale & Replicate:</strong> Expand to other universities or partners.</li>
          <li><strong>ML / AI Integration:</strong> Build predictive models for SuDS performance.</li>
          <li><strong>Open Data:</strong> Provide cleaned, anonymised datasets for the research community.</li>
          <li><strong>Community Engagement:</strong> Use the dashboard for outreach, education, and planning.</li>
        </ul>
      </section>

      {/* Contact */}
      <section className={styles.aboutContact}>
        <h2>Contact & Links</h2>
        <p>
          SuDSlab Project Page:{" "}
          <a href="https://www.hull.ac.uk/research/projects/sudslab">SuDSlab – University of Hull</a><br />
          Open‑access Monitoring Manual:{" "}
          <a href="https://zenodo.org/records/15575166">SuDS Monitoring Manual</a><br />
          University Sustainability Report:{" "}
          <a href="https://www.hull.ac.uk/choose-hull/university-and-region/sustainability/docs/sustainability-report-23-24.pdf">
            Hull Sustainability Report
          </a>
        </p>
      </section>
    </div>
  );
};

export default About;
