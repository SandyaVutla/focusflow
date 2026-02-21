import React, { useState, useEffect } from "react";
import { Droplets, Heart } from "lucide-react";
import { loadHealth, saveHealth, checkDailyGoals } from "../utils/storage";

const WATER_GOAL = 8;
const ML_PER_GLASS = 250;

const MOODS = [
  { key: "good", emoji: "😊", label: "Good" },
  { key: "okay", emoji: "😐", label: "Okay" },
  { key: "low", emoji: "😔", label: "Low" },
];

const CIRCUMFERENCE = 282; // 2π × r(45)

const Health = () => {
  const [glasses, setGlasses] = useState(0);
  const [mood, setMood] = useState(null);  // "good" | "okay" | "low"

  /* restore */
  useEffect(() => {
    const s = loadHealth();
    setGlasses(s.glasses ?? 0);
    setMood(s.mood ?? null);
  }, []);

  /* persist + broadcast so Dashboard updates instantly */
  useEffect(() => {
    saveHealth({ glasses, mood });
    checkDailyGoals();
  }, [glasses, mood]);

  const addWater = () => setGlasses(g => Math.min(g + 1, WATER_GOAL));
  const removeWater = () => setGlasses(g => Math.max(g - 1, 0));

  const pct = Math.round((glasses / WATER_GOAL) * 100);
  const strokeOffset = CIRCUMFERENCE * (1 - glasses / WATER_GOAL);
  const ml = glasses * ML_PER_GLASS;

  return (
    <div className="fade-in">
      {/* header */}
      <div className="hl-header">
        <h1 className="hl-title">Health</h1>
        <p className="hl-sub">Track your hydration and wellness habits.</p>
      </div>

      {/* two-column top row */}
      <div className="hl-top-row">

        {/* ── Water Intake card ── */}
        <div className="hl-card">
          <div className="hl-card-head">
            <div className="hl-icon hl-icon--blue"><Droplets size={18} /></div>
            <div>
              <div className="hl-card-title">Water Intake</div>
              <div className="hl-card-sub">Daily hydration goal</div>
            </div>
          </div>

          {/* ring */}
          <div className="hl-ring-wrap">
            <svg className="hl-ring-svg" viewBox="0 0 100 100">
              <circle className="hl-ring-track" cx="50" cy="50" r="45" />
              <circle
                className="hl-ring-arc"
                cx="50" cy="50" r="45"
                style={{
                  strokeDasharray: CIRCUMFERENCE,
                  strokeDashoffset: strokeOffset,
                  transition: "stroke-dashoffset 0.5s ease",
                }}
              />
            </svg>
            <div className="hl-ring-inner">
              <div className="hl-ring-count">{glasses} / {WATER_GOAL}</div>
              <div className="hl-ring-label">glasses today</div>
            </div>
          </div>

          {/* controls */}
          <div className="hl-water-controls">
            <button className="hl-minus-btn" onClick={removeWater} disabled={glasses === 0}>−</button>
            <button className="hl-add-btn" onClick={addWater} disabled={glasses === WATER_GOAL}>
              + Add Water
            </button>
          </div>

          <div className="hl-remind">Remember to stay hydrated!</div>
        </div>

        {/* ── Wellness Check card ── */}
        <div className="hl-card">
          <div className="hl-card-head">
            <div className="hl-icon hl-icon--pink"><Heart size={18} /></div>
            <div>
              <div className="hl-card-title">Wellness Check</div>
              <div className="hl-card-sub">How are you feeling today?</div>
            </div>
          </div>

          <p className="hl-reflect">Take a moment to reflect on your day.</p>

          <div className="hl-mood-row">
            {MOODS.map(m => (
              <button
                key={m.key}
                className={`hl-mood-btn${mood === m.key ? " hl-mood-btn--active" : ""}`}
                onClick={() => setMood(mood === m.key ? null : m.key)}
              >
                <span className="hl-mood-emoji">{m.emoji}</span>
                <span className="hl-mood-label">{m.label}</span>
              </button>
            ))}
          </div>

          {mood && (
            <div className="hl-mood-msg">
              {mood === "good" && "Great! Keep up the positive energy 🌟"}
              {mood === "okay" && "That's okay — small steps forward count 💪"}
              {mood === "low" && "Take it easy today, you're doing your best 🌿"}
            </div>
          )}
        </div>
      </div>

      {/* Today's Progress */}
      <div className="hl-progress-section">
        <h2 className="hl-section-title">Today's Progress</h2>
        <div className="hl-progress-row">
          <div className="hl-prog-card">
            <div className="hl-prog-val">{glasses}</div>
            <div className="hl-prog-lbl">Glasses</div>
          </div>
          <div className="hl-prog-card">
            <div className="hl-prog-val">{ml}</div>
            <div className="hl-prog-lbl">ml</div>
          </div>
          <div className="hl-prog-card">
            <div className="hl-prog-val">{pct}%</div>
            <div className="hl-prog-lbl">Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health;