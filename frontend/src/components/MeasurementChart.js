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

function MeasurementChart({ sensorId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sensorId) {
      setLoading(true);
      fetch(`${API_URL}/measurements?sensor_id=${sensorId}`)
        .then((res) => res.json())
        .then((data) => {
          const arr = Array.isArray(data) ? data.reverse() : [];
          setData(arr);
        })
        .catch((err) => {
          console.error("Error fetching measurements:", err);
          setData([]);
        })
        .finally(() => setLoading(false));
    } else {
      setData([]);
    }
  }, [sensorId]);

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Measurements</h3>

      {loading && <p>Loading measurements...</p>}
      {!loading && data.length === 0 && <p>No data available for this sensor.</p>}

      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(label) =>
                new Date(label).toLocaleString()
              }
            />
            <Line type="monotone" dataKey="value" stroke="#0077ff" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default MeasurementChart;
