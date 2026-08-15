"use client";

import { useState } from "react";
import {
  QUESTIONS,
  SERVER_NAME,
  EXPECTATIONS,
  REQUIREMENTS,
} from "./questions";

export default function Page() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const [serverError, setServerError] = useState("");

  function update(name, val) {
    setValues((v) => ({ ...v, [name]: val }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function validate() {
    const next = {};
    for (const q of QUESTIONS) {
      if (q.required && !String(values[q.name] || "").trim()) {
        next[q.name] = "This one's required.";
      }
    }
    setErrors(next);
    return next;
  }

  async function handleSubmit() {
    setServerError("");
    const found = validate();
    if (Object.keys(found).length) {
      const firstBad = QUESTIONS.find((q) => found[q.name]);
      if (firstBad) {
        document
          .getElementById(firstBad.name)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(data.error || "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }

      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError(
        "We couldn't reach the server. Check your connection and try again."
      );
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <main className="page">
        <div className="success">
          <div className="success-badge">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1>Application sent</h1>
          <p>
            Thanks for applying to the {SERVER_NAME} staff team. The
            moderators have your answers and will reach out on Discord if
            they'd like to talk further. You can close this page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="header">
        <div className="badge">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2L4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3z"
              fill="currentColor"
              opacity="0.28"
            />
            <path
              d="M12 2L4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M8.5 12l2.4 2.4L15.6 9.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="eyebrow">{SERVER_NAME} · Staff</p>
        <h1>Moderator Application</h1>
        <p>
          You're applying to be a moderator for {SERVER_NAME}. Please read each
          question carefully, and answer to the best of your ability.
        </p>
      </header>

      {/* Read-only notice: expectations and requirements */}
      <section className="notice">
        <div className="notice-head">
          <div className="notice-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M12 11v5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="12" cy="7.6" r="1.1" fill="currentColor" />
            </svg>
          </div>
          <div>
            <p className="eyebrow">Before you apply</p>
            <h2 className="notice-title">Please read this first</h2>
          </div>
        </div>

        <div className="notice-groups">
          <div className="notice-group">
            <p className="notice-subhead">What we expect</p>
            <ul className="notice-list">
              {EXPECTATIONS.map((item, i) => (
                <li key={i}>
                  <span className="marker check" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="notice-group">
            <p className="notice-subhead">Requirements</p>
            <ul className="notice-list">
              {REQUIREMENTS.map((item, i) => (
                <li key={i}>
                  <span className="marker dot" aria-hidden="true"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Questions */}
      <div className="card">
        {QUESTIONS.map((q) => (
          <Question
            key={q.name}
            q={q}
            value={values[q.name]}
            error={errors[q.name]}
            onChange={update}
          />
        ))}
      </div>

      {/* Honeypot: real people never see or fill this. Bots often do. */}
      <input
        className="hp"
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={values._gotcha || ""}
        onChange={(e) => update("_gotcha", e.target.value)}
      />

      <div className="submit-row">
        {serverError && <div className="server-error">{serverError}</div>}
        <button
          className="submit"
          type="button"
          onClick={handleSubmit}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Submit application"}
        </button>
        <p className="disclaimer">
          Your answers are sent privately to the {SERVER_NAME} moderators.
        </p>
      </div>
    </main>
  );
}

function Question({ q, value, error, onChange }) {
  const isText = q.type === "text";
  const showCount = q.type === "textarea" && q.maxLength;
  const current = String(value || "");

  return (
    <div className={`q ${error ? "error" : ""}`.trim()}>
      <div className="q-num">{q.number}</div>
      <div className="q-body">
        <label htmlFor={q.name}>
          {q.label}
          {q.required && <span className="req">*</span>}
          {showCount && (
            <span className="count">
              {current.length}/{q.maxLength}
            </span>
          )}
        </label>
        {isText ? (
          <input
            id={q.name}
            name={q.name}
            type="text"
            value={current}
            maxLength={q.maxLength}
            placeholder={q.placeholder}
            onChange={(e) => onChange(q.name, e.target.value)}
          />
        ) : (
          <textarea
            id={q.name}
            name={q.name}
            value={current}
            maxLength={q.maxLength}
            placeholder={q.placeholder}
            onChange={(e) => onChange(q.name, e.target.value)}
          />
        )}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
