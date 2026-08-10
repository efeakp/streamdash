import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./FeedbackWidget.css";

const API_URL = process.env.REACT_APP_API_URL;

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="fb-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`fb-star ${n <= (hovered || value) ? "active" : ""}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function FeedbackWidget() {
  const location = useLocation();
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [rating, setRating]   = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus]   = useState(null); // null | "sending" | "done" | "error"

  function reset() {
    setName(""); setEmail(""); setRating(0); setMessage(""); setStatus(null);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(reset, 300);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    name.trim() || null,
          email:   email.trim() || null,
          rating:  rating || null,
          message: message.trim(),
          page:    location.pathname,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        className="fb-trigger"
        onClick={() => setOpen(true)}
        aria-label="Give feedback"
        title="Give feedback"
      >
        💬 Feedback
      </button>

      {/* Backdrop */}
      {open && <div className="fb-backdrop" onClick={handleClose} />}

      {/* Modal */}
      {open && (
        <div className="fb-modal" role="dialog" aria-modal="true" aria-label="Feedback form">
          <div className="fb-modal-header">
            <h3>Share your feedback</h3>
            <button className="fb-close" onClick={handleClose} aria-label="Close">✕</button>
          </div>

          {status === "done" ? (
            <div className="fb-success">
              <div className="fb-success-icon">✓</div>
              <p>Thank you for your feedback!</p>
              <button className="fb-btn-secondary" onClick={handleClose}>Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="fb-form">
              <label className="fb-label">
                How would you rate your experience?
                <StarRating value={rating} onChange={setRating} />
              </label>

              <label className="fb-label">
                Message <span className="fb-required">*</span>
                <textarea
                  className="fb-textarea"
                  rows={4}
                  placeholder="What do you think? Any suggestions or issues?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </label>

              <div className="fb-row">
                <label className="fb-label">
                  Name <span className="fb-optional">(optional)</span>
                  <input
                    className="fb-input"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="fb-label">
                  Email <span className="fb-optional">(optional)</span>
                  <input
                    className="fb-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </div>

              {status === "error" && (
                <p className="fb-error">Something went wrong — please try again.</p>
              )}

              <div className="fb-footer">
                <span className="fb-page-hint">Page: {location.pathname}</span>
                <button
                  type="submit"
                  className="fb-submit"
                  disabled={!message.trim() || status === "sending"}
                >
                  {status === "sending" ? "Sending…" : "Send feedback"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
