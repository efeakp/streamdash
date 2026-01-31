import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import Parameters from "./data/Parameters"; 
import logo from "./assets/logo.jpg"; // place your logo in src/assets/

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkStyle = ({ isActive }) => ({
    display: "block",
    margin: "8px 0",
    color: "#fff",
    textDecoration: isActive ? "underline" : "none",
    fontWeight: isActive ? "bold" : "normal",
  });

  return (
    <Router>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Header */}
        <header
          style={{
            background: "#0077ff",
            padding: "10px 20px",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Logo & Title */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <img src={logo} alt="StreamDash Logo" style={{ height: 40, marginRight: 10 }} />
              <h1 style={{ margin: 0 }}>StreamDash</h1>
            </div>

            {/* Hamburger button (mobile only) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "24px",
                cursor: "pointer",
                display: "block",
              }}
              className="hamburger"
            >
              ☰
            </button>
          </div>

          {/* Navigation */}
          <nav
            style={{
              display: menuOpen ? "block" : "none",
              marginTop: 10,
            }}
            className="nav-links"
          >
            <NavLink to="/" end style={navLinkStyle} onClick={() => setMenuOpen(false)}>
              About
            </NavLink>
            <NavLink to="/about" style={navLinkStyle} onClick={() => setMenuOpen(false)}>
              Dashboard
            </NavLink>
            <NavLink to="/parameters" style={navLinkStyle} onClick={() => setMenuOpen(false)}>
              Parameters
            </NavLink>
            <NavLink to="/gallery" style={navLinkStyle} onClick={() => setMenuOpen(false)}>
              Gallery
            </NavLink>
          </nav>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, padding: 20 }}>
          <Routes>
            <Route path="/" element={<About />} />
            <Route path="/about" element={<Home />} />
            <Route path="/parameters" element={<Parameters />} />
            <Route path="/gallery" element={<Gallery />} /> {/* 👈 new route */}
          </Routes>
        </main>

        {/* Footer */}
        <footer style={{ background: "#f5f5f5", textAlign: "center", padding: "10px 0" }}>
          Student Sustainability Project funded by UPP Foundation
        </footer>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media(min-width: 768px) {
          .hamburger {
            display: none !important;
          }
          .nav-links {
            display: flex !important;
            gap: 20px;
          }
          .nav-links a {
            margin: 0 !important;
          }
        }
      `}</style>
    </Router>
  );
}

export default App;
