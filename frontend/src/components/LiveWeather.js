import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

const CARDS = [
  { key: "Temp",        label: "Temperature",   icon: "🌡️" },
  { key: "Hum",         label: "Humidity",       icon: "💧" },
  { key: "Wind Speed",  label: "Wind Speed",     icon: "💨" },
  { key: "Dew Point",   label: "Dew Point",      icon: "🌫️" },
  { key: "Barometer",   label: "Pressure",       icon: "📉",  extra: "Bar Trend" },
  { key: "Solar Rad",   label: "Solar Rad",      icon: "☀️" },
  { key: "UV Index",    label: "UV Index",       icon: "🔆" },
  { key: "Rain Rate",   label: "Rain Rate",      icon: "🌧️" },
];

function windDegToCompass(deg) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function formatTimestamp(ms) {
  const d = new Date(ms);
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const mins = Math.round((Date.now() - ms) / 60000);
  const age = mins < 1 ? "just now" : mins === 1 ? "1 min ago" : `${mins} mins ago`;
  return `${date}, ${time} (${age})`;
}

function LiveWeather() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [age, setAge] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/live`)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setData(d);
        setAge(formatTimestamp(d.lastReceived));
      })
      .catch(() => setError("Could not load live conditions."))
      .finally(() => setLoading(false));
  }, []);

  // Keep the "X mins ago" label ticking
  useEffect(() => {
    if (!data) return;
    const id = setInterval(() => setAge(formatTimestamp(data.lastReceived)), 30000);
    return () => clearInterval(id);
  }, [data]);

  if (loading) return <p style={{ color: "#666" }}>Loading live conditions…</p>;
  if (error)   return <p style={{ color: "red" }}>{error}</p>;

  const r = data.readings;

  return (
    <div>
      <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: 12 }}>
        Last updated: {age}
      </p>
      <div className="live-weather-grid">
        {CARDS.map(({ key, label, icon, extra }) => {
          const reading = r[key];
          if (!reading) return null;
          let display = reading.value;
          let unit = reading.unit || "";
          if (key === "Wind Speed") {
            const dir = r["Wind Direction"];
            if (dir) display = `${reading.value} (${windDegToCompass(Number(dir.value))})`;
          }
          const sub = extra && r[extra] ? r[extra].value : null;
          return (
            <div key={key} className="live-weather-card">
              <span className="live-weather-icon">{icon}</span>
              <span className="live-weather-label">{label}</span>
              <span className="live-weather-value">
                {display}{unit ? ` ${unit}` : ""}
              </span>
              {sub && <span className="live-weather-sub">{sub}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LiveWeather;
