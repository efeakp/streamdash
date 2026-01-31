import React, { useEffect, useState } from "react";
import parametersData from "./parameters.json"; 

function Parameters() {
  const [parameters, setParameters] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Load the parameters data
    setParameters(parametersData);
  }, []);

  // Filtered list based on search input
  const filteredParameters = parameters.filter((param) =>
    (param.Parameter + " " + param.Description)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "20px", textAlign: "left" }}>
      <h2>Parameters & Descriptions</h2>
      <p>
        Below is a list of sensor parameters collected by the SuDS monitoring
        network, along with their descriptions and units.
      </p>

      {/* Search box */}
      <input
        type="text"
        placeholder="Search parameters..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "8px",
          width: "100%",
          maxWidth: "400px",
          margin: "10px 0 20px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
            backgroundColor: "#fff",
            minWidth: "400px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#0077ff", color: "#fff" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>
                Parameter
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredParameters.length > 0 ? (
              filteredParameters.map((param, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                  }}
                >
                  <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>
                    {param.Parameter}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>
                    {param.Description}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="2"
                  style={{
                    textAlign: "left",
                    padding: "15px",
                    border: "1px solid #ddd",
                    color: "#777",
                  }}
                >
                  No parameters match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Parameters;
