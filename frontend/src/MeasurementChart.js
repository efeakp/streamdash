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

const API_URL = "http://localhost:8001";

function MeasurementChart({ sensorId }) {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (sensorId) {
      fetch(`${API_URL}/measurements?sensor_id=${sensorId}`)
        .then((res) => res.json())
        .then((data) => {
          // Ensure data is an array and sorted
          const measurements = Array.isArray(data) ? data.reverse() : [];
          setData(measurements);
          setFilteredData(measurements); // show all initially
        })
        .catch((err) => {
          console.error("Error fetching measurements:", err);
          setData([]);
          setFilteredData([]);
        });
    }
  }, [sensorId]);

  // Filter whenever startDate, endDate or data changes
  useEffect(() => {
    let filtered = data;

    if (startDate) {
      filtered = filtered.filter(
        (d) => new Date(d.timestamp) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(
        (d) => new Date(d.timestamp) <= new Date(endDate)
      );
    }

    setFilteredData(filtered);
  }, [startDate, endDate, data]);

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Measurements</h3>

      {/* Date Range Filter */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ marginRight: 5 }}>Start Date: </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginRight: 15 }}
        />
        <label style={{ marginRight: 5 }}>End Date: </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#0077ff" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MeasurementChart;
