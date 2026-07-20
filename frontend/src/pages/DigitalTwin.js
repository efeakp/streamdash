import React, { useEffect, useState, useCallback } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import "./DigitalTwin.css";

const API_URL = process.env.REACT_APP_API_URL;
const DEPTHS = [10, 20, 30, 40, 50, 60];

function SliderInput({ label, value, min, max, step = 0.1, unit, onChange }) {
  return (
    <div className="dt-slider-row">
      <div className="dt-slider-label">
        <span>{label}</span>
        <span className="dt-slider-val">{value.toFixed(1)} {unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="dt-slider"
      />
    </div>
  );
}

export default function DigitalTwin() {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [meta, setMeta] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCurrent, setLoadingCurrent] = useState(false);

  // Scenario inputs
  const [rain1h,  setRain1h]  = useState(0);
  const [rain6h,  setRain6h]  = useState(0);
  const [rain24h, setRain24h] = useState(0);
  const [temp,    setTemp]    = useState(15);
  const [hum,     setHum]     = useState(75);
  const [sm, setSm] = useState({ 10: 30, 20: 30, 30: 30, 40: 30, 50: 30, 60: 30 });

  // Baseline (actual current readings)
  const [baseline, setBaseline] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/twin/nodes`)
      .then((r) => r.json())
      .then((data) => {
        setNodes(data);
        if (data.length > 0) setSelectedNode(data[0]);
      })
      .catch(() => {});
  }, []);

  // Load current readings when node changes
  useEffect(() => {
    if (!selectedNode) return;
    setLoadingCurrent(true);
    setBaseline(null);
    fetch(`${API_URL}/twin/current?node=${selectedNode.node_name.toLowerCase().replace(" ", "_")}`)
      .then((r) => r.json())
      .then((data) => {
        setBaseline(data);
        // Pre-fill sliders with current actuals
        if (data.Temp !== undefined)  setTemp(parseFloat(data.Temp.toFixed(1)));
        if (data.Hum  !== undefined)  setHum(parseFloat(data.Hum.toFixed(1)));
        if (data.Rain !== undefined)  setRain1h(parseFloat(data.Rain.toFixed(2)));
        const newSm = { ...sm };
        DEPTHS.forEach((d) => {
          const k = `SoilMoisture_${d}cm`;
          if (data[k] !== undefined) newSm[d] = parseFloat(data[k].toFixed(2));
        });
        setSm(newSm);
        setMeta(selectedNode);
      })
      .catch(() => {})
      .finally(() => setLoadingCurrent(false));
  }, [selectedNode]); // intentionally omit setSm — only re-run when node changes

  const predict = useCallback(() => {
    if (!selectedNode) return;
    const slug = selectedNode.node_name.toLowerCase().replace(" ", "_");
    const params = new URLSearchParams({
      node: slug,
      rain_1h: rain1h, rain_6h: rain6h, rain_24h: rain24h,
      temp, hum,
      sm_10: sm[10], sm_20: sm[20], sm_30: sm[30],
      sm_40: sm[40], sm_50: sm[50], sm_60: sm[60],
    });
    setLoading(true);
    fetch(`${API_URL}/twin/predict?${params}`)
      .then((r) => r.json())
      .then((data) => setPredictions(data.predictions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedNode, rain1h, rain6h, rain24h, temp, hum, sm]);

  // Radar chart data
  const radarData = DEPTHS.map((d) => {
    const key = `SoilMoisture_${d}cm`;
    return {
      depth: `${d}cm`,
      Current: baseline ? parseFloat((baseline[key] ?? 0).toFixed(2)) : sm[d],
      Predicted: predictions ? predictions[key]?.predicted ?? null : null,
    };
  });

  // Feature importance bar chart
  const fiData = meta
    ? Object.entries(meta.feature_importance || {})
        .map(([k, v]) => ({ name: k.replace("SoilMoisture_", "SM_").replace("SoilTemperature_", "ST_"), value: parseFloat((v * 100).toFixed(1)) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
    : [];

  // Model accuracy table
  const metricsRows = meta
    ? Object.entries(meta.metrics || {}).map(([target, m]) => ({
        target: target.replace("SoilMoisture_", ""),
        mae: m.mae,
        r2: m.r2,
        n: m.n_samples,
      }))
    : [];

  return (
    <div className="dt-page">
      <h2>Digital Twin — Soil Moisture Surrogate Model</h2>
      <p className="dt-subtitle">
        Predict how soil moisture will respond to different weather scenarios at each depth.
        Adjust the inputs and run a simulation.
      </p>

      {/* Node selector */}
      <div className="dt-node-row">
        <label className="dt-label">Select node:</label>
        <div className="dt-node-buttons">
          {nodes.map((n) => (
            <button
              key={n.node_name}
              className={`dt-node-btn${selectedNode?.node_name === n.node_name ? " active" : ""}`}
              onClick={() => setSelectedNode(n)}
            >
              {n.node_name}
            </button>
          ))}
        </div>
      </div>

      <div className="dt-layout">
        {/* ---- Left: Scenario inputs ---- */}
        <div className="dt-panel dt-inputs">
          <h3>Scenario Inputs</h3>
          {loadingCurrent && <p className="dt-hint">Loading current readings…</p>}

          <div className="dt-section-label">Weather</div>
          <SliderInput label="Rainfall (last 1h)"  value={rain1h}  min={0} max={50}  step={0.5} unit="mm" onChange={setRain1h}  />
          <SliderInput label="Rainfall (last 6h)"  value={rain6h}  min={0} max={100} step={0.5} unit="mm" onChange={setRain6h}  />
          <SliderInput label="Rainfall (last 24h)" value={rain24h} min={0} max={200} step={1}   unit="mm" onChange={setRain24h} />
          <SliderInput label="Temperature"         value={temp}    min={-5} max={40} step={0.5} unit="°C" onChange={setTemp}    />
          <SliderInput label="Humidity"            value={hum}     min={0}  max={100} step={1}  unit="%"  onChange={setHum}     />

          <div className="dt-section-label">Current Soil Moisture</div>
          {DEPTHS.map((d) => (
            <SliderInput
              key={d}
              label={`Depth ${d}cm`}
              value={sm[d]}
              min={0} max={100} step={0.5} unit="%"
              onChange={(v) => setSm((prev) => ({ ...prev, [d]: v }))}
            />
          ))}

          <button className="dt-run-btn" onClick={predict} disabled={loading}>
            {loading ? "Running…" : "Run Simulation →"}
          </button>
        </div>

        {/* ---- Right: Results ---- */}
        <div className="dt-panel dt-results">
          <h3>Predicted Soil Moisture Profile</h3>
          {!predictions && (
            <p className="dt-hint">Adjust the sliders and click Run Simulation to see predictions.</p>
          )}
          {predictions && (
            <>
              {/* Depth cards */}
              <div className="dt-depth-grid">
                {DEPTHS.map((d) => {
                  const key = `SoilMoisture_${d}cm`;
                  const pred = predictions[key];
                  const actual = baseline?.[key];
                  const delta = pred && actual != null ? pred.predicted - actual : null;
                  return (
                    <div key={d} className="dt-depth-card">
                      <div className="dt-depth-label">{d}cm</div>
                      <div className="dt-depth-val">{pred?.predicted ?? "—"}%</div>
                      <div className="dt-depth-std">±{pred?.std ?? "—"}%</div>
                      {delta !== null && (
                        <div className={`dt-depth-delta ${delta > 0 ? "up" : delta < 0 ? "down" : ""}`}>
                          {delta > 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Radar chart */}
              <div className="dt-chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="depth" />
                    <Radar name="Current" dataKey="Current" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                    <Radar name="Predicted" dataKey="Predicted" stroke="#0077ff" fill="#0077ff" fillOpacity={0.5} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* Feature importance */}
          {fiData.length > 0 && (
            <>
              <h3 style={{ marginTop: 24 }}>Feature Importance</h3>
              <p className="dt-hint">What the model learned matters most for predicting soil moisture.</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={fiData} layout="vertical" margin={{ left: 60, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" unit="%" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="value" fill="#0077ff" radius={[0, 4, 4, 0]} name="Importance" />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}

          {/* Model accuracy */}
          {metricsRows.length > 0 && (
            <>
              <h3 style={{ marginTop: 24 }}>Model Accuracy</h3>
              <table className="dt-metrics-table">
                <thead>
                  <tr><th>Sensor</th><th>MAE</th><th>R²</th><th>Training samples</th></tr>
                </thead>
                <tbody>
                  {metricsRows.map((r) => (
                    <tr key={r.target}>
                      <td>{r.target}</td>
                      <td>{r.mae}%</td>
                      <td className={r.r2 >= 0.9 ? "dt-good" : r.r2 >= 0.7 ? "dt-ok" : "dt-warn"}>{r.r2}</td>
                      <td>{r.n.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
