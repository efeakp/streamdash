import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL;

function MeasurementChart({ sensorId, sensorName, unit, startDate, endDate }) {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sensorId) {
      setLoading(true);
      let url = `${API_URL}/measurements?sensor_id=${sensorId}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const results = Array.isArray(data.results) ? data.results : [];
          const filtered = results.filter((r) => r.value !== null && r.value !== undefined);
          setData(filtered);
          setCount(data.count ?? results.length);
        })
        .catch((err) => {
          console.error("Error fetching measurements:", err);
          setData([]);
        })
        .finally(() => setLoading(false));
    } else {
      setData([]);
    }
  }, [sensorId, startDate, endDate]);

  return (
    <div style={{ marginTop: 20 }}>
      <h3>{sensorName || "Measurements"}{unit ? ` (${unit})` : ""}</h3>

      {loading && <p>Loading measurements...</p>}
      {!loading && count === 0 && <p>No data available for this sensor.</p>}
      {!loading && count > 0 && data.length === 0 && (
        <p>No recorded values for this sensor yet ({count} rows, all null).</p>
      )}
      {!loading && data.length > 0 && (
        <p style={{ fontSize: "0.85rem", color: "#666" }}>{data.length} data points</p>
      )}

      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
            />
            <YAxis
              label={{
                value: unit || "",
                angle: -90,
                position: "insideLeft",
                offset: 10,
              }}
            />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleString()}
            />
            <Line type="monotone" dataKey="value" stroke="#0077ff" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default MeasurementChart;
