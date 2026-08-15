"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import {
  QUESTIONS,
  SERVER_NAME,
  EXPECTATIONS,
  REQUIREMENTS,
} from "./questions";

const STORAGE_KEY = "selfmod-application-draft";

// Generates a fresh random batch of floating particles (10-12 of them).
function makeParticles() {
  const count = 10 + Math.floor(Math.random() * 3); // 10, 11, or 12
  return Array.from({ length: count }, (_, i) => ({
    id: `${Date.now()}-${i}-${Math.random()}`,
    left: Math.random() * 100, // % across the screen
    size: 10 + Math.random() * 14, // 10-24px
    duration: 5 + Math.random() * 6, // 5-11s to cross the screen
    delay: -(Math.random() * 11), // negative delay so they start mid-flight, staggered
    drift: Math.round((Math.random() - 0.5) * 90), // -45px to 45px horizontal drift
    opacity: 0.65 + Math.random() * 0.35, // 0.65-1
  }));
}

// forwardRef so the page can drive scroll-linked parallax and the
// ambient brightness pulse directly on this layer.
const ParticleField = forwardRef(function ParticleField(
  { particles },
  ref
) {
  return (
    <div className="particles" ref={ref} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--drift": `${p.drift}px`,
            "--peak-opacity": p.opacity,
          }}
        />
      ))}
    </div>
  );
});

// Static, low-opacity skyline silhouette anchored to the bottom of the
// screen. Purely decorative, drawn as flat vector rectangles.
function SkylineBackdrop() {
  return (
    <svg
      className="skyline"
      viewBox="0 0 1440 240"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g className="skyline-buildings">
        <rect x="0" y="120" width="60" height="120" />
        <rect x="65" y="60" width="45" height="180" />
        <rect x="115" y="150" width="70" height="90" />
        <rect x="190" y="30" width="50" height="210" />
        <rect x="245" y="100" width="55" height="140" />
        <rect x="305" y="140" width="40" height="100" />
        <rect x="350" y="40" width="65" height="200" />
        <rect x="420" y="110" width="48" height="130" />
        <rect x="473" y="70" width="58" height="170" />
        <rect x="536" y="145" width="42" height="95" />
        <rect x="583" y="20" width="72" height="220" />
        <rect x="660" y="130" width="50" height="110" />
        <rect x="715" y="80" width="60" height="160" />
        <rect x="780" y="150" width="45" height="90" />
        <rect x="830" y="50" width="68" height="190" />
        <rect x="903" y="110" width="52" height="130" />
        <rect x="960" y="90" width="40" height="150" />
        <rect x="1005" y="30" width="64" height="210" />
        <rect x="1074" y="140" width="48" height="100" />
        <rect x="1127" y="65" width="58" height="175" />
        <rect x="1190" y="120" width="44" height="120" />
        <rect x="1239" y="40" width="70" height="200" />
        <rect x="1314" y="100" width="50" height="140" />
        <rect x="1369" y="145" width="71" height="95" />
      </g>
    </svg>
  );
}

export default function Page() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const [serverError, setServerError] = useState("");
  const [particles, setParticles] = useState([]);
  const [ripples, setRipples] = useState([]);
  const loaded = useRef(false);
  const cursorGlowRef = useRef(null);
  const particlesRef = useRef(null);

  // Particles are randomized client-side only, to avoid server/client mismatch.
  useEffect(() => {
    setParticles(makeParticles());
  }, []);

  // Soft glow that trails the cursor, desktop only (mouse + hover capable).
  useEffect(() => {
    const isDesktop = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    if (!isDesktop) return;

    const glow = cursorGlowRef.current;
    if (!glow) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let rafId;

    function handleMove(e) {
      targetX = e.clientX;
      targetY = e.clientY;
    }

    function tick() {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      glow.style.transform = `translate(${currentX}px, ${currentY}px)`;
      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", handleMove);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Scroll-linked parallax on the particle layer (drifts at a fraction of
  // scroll speed) plus a brief brightness pulse while actively scrolling.
  // Reads particlesRef.current fresh each time, since the ref target swaps
  // between the form view and the success view.
  useEffect(() => {
    let ticking = false;
    let pulseTimeout;

    function onScroll() {
      const layer = particlesRef.current;
      if (!layer) return;

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          if (particlesRef.current) {
            const offset = window.scrollY * 0.06;
            particlesRef.current.style.transform = `translateY(${offset}px)`;
          }
          ticking = false;
        });
      }

      layer.classList.add("scroll-pulse");
      clearTimeout(pulseTimeout);
      pulseTimeout = setTimeout(() => {
        particlesRef.current?.classList.remove("scroll-pulse");
      }, 350);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(pulseTimeout);
    };
  }, []);

  // Spawns a short-lived ripple span at the click point on the submit button.
  function spawnRipple(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.8;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = `${Date.now()}-${Math.random()}`;
    setRipples((r) => [...r, { id, x, y, size }]);
    setTimeout(() => {
      setRipples((r) => r.filter((rp) => rp.id !== id));
    }, 650);
  }

  // Load any saved draft from this device on first render.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setValues(JSON.parse(saved));
    } catch {}
    loaded.current = true;
  }, []);

  // Save the draft whenever answers change (after the initial load).
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    } catch {}
  }, [values]);

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

      // Application sent, so clear the saved draft.
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
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
      <>
        <SkylineBackdrop />
        <ParticleField particles={particles} ref={particlesRef} />
        <div className="cursor-glow" ref={cursorGlowRef} aria-hidden="true" />
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
            admins have your responses and will let you know if you've made it! 
            You can now close this page.
          </p>
        </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SkylineBackdrop />
      <ParticleField particles={particles} ref={particlesRef} />
      <div className="cursor-glow" ref={cursorGlowRef} aria-hidden="true" />
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
        <p
          style={{
            textAlign: "center",
            color: "#6b7080",
            fontSize: 12,
            margin: "0 0 14px",
          }}
        >
          Your progress saves automatically on this device.
        </p>
        <button
          className="submit"
          type="button"
          onClick={(e) => {
            spawnRipple(e);
            handleSubmit();
          }}
          disabled={status === "submitting"}
        >
          {ripples.map((r) => (
            <span
              key={r.id}
              className="ripple"
              style={{
                left: `${r.x}px`,
                top: `${r.y}px`,
                width: `${r.size}px`,
                height: `${r.size}px`,
              }}
            />
          ))}
          {status === "submitting" ? "Sending…" : "Submit application"}
        </button>
        <p className="disclaimer">
          Your answers are sent privately to the {SERVER_NAME} moderators.
        </p>
      </div>
      </main>
    </>
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
