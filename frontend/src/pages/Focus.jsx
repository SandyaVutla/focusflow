import React, { useState, useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";
import { loadTimer, saveTimer, checkDailyGoals } from "../utils/storage";

const MODES = [
  { label: "25 min Focus", seconds: 25 * 60, break: 5 },
  { label: "50 min Deep Focus", seconds: 50 * 60, break: 10 },
  { label: "5 min Break", seconds: 5 * 60, break: 0 },
  { label: "15 min Long Break", seconds: 15 * 60, break: 0 },
];

const CIRCUMFERENCE = 339;

const Focus = () => {
  const [modeIdx, setModeIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].seconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [focusMinutesToday, setFocusMinutesToday] = useState(0);
  const [focusDate, setFocusDate] = useState(null);
  const intervalRef = useRef(null);
  const TODAY = () => new Date().toISOString().split("T")[0];

  /* restore */
  useEffect(() => {
    const saved = loadTimer();
    const idx = saved.modeIdx ?? 0;
    const today = new Date().toISOString().split("T")[0];
    setModeIdx(idx);
    setSecondsLeft(saved.secondsLeft ?? MODES[idx].seconds);
    setIsRunning(saved.isRunning ?? false);
    setIsDone(saved.isDone ?? false);
    // Reset daily focus counter if it's a new day
    const savedDate = saved.focusDate ?? null;
    setFocusDate(savedDate);
    setFocusMinutesToday(savedDate === today ? (saved.focusMinutesToday ?? 0) : 0);
  }, []);

  /* persist + broadcast timerUpdated */
  useEffect(() => {
    saveTimer({ modeIdx, secondsLeft, isRunning, isDone, focusMinutesToday, focusDate });
  }, [modeIdx, secondsLeft, isRunning, isDone, focusMinutesToday, focusDate]);

  /* when session completes — log focus minutes & check streak */
  const prevIsDone = useRef(false);
  useEffect(() => {
    if (isDone && !prevIsDone.current) {
      const today = new Date().toISOString().split("T")[0];
      const sessionMins = Math.floor(MODES[modeIdx].seconds / 60);
      const base = focusDate === today ? focusMinutesToday : 0;
      const newMins = base + sessionMins;
      setFocusMinutesToday(newMins);
      setFocusDate(today);
      // Check if all daily goals are now met
      setTimeout(() => checkDailyGoals(), 100);
    }
    prevIsDone.current = isDone;
  }, [isDone]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          setIsDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const TOTAL = MODES[modeIdx].seconds;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const strokeOffset = CIRCUMFERENCE - CIRCUMFERENCE * (secondsLeft / TOTAL);

  const status = isDone ? "Session complete 🎉"
    : isRunning ? "Session in progress"
      : secondsLeft < TOTAL ? "Session paused"
        : "Ready to focus";

  const handleToggle = () => { if (!isDone) setIsRunning(r => !r); };
  const handleReset = () => {
    if (isRunning) return;
    clearInterval(intervalRef.current);
    setSecondsLeft(MODES[modeIdx].seconds);
    setIsRunning(false);
    setIsDone(false);
  };
  const handleMode = (idx) => {
    clearInterval(intervalRef.current);
    setModeIdx(idx);
    setSecondsLeft(MODES[idx].seconds);
    setIsRunning(false);
    setIsDone(false);
  };

  return (
    <div className="fade-in">
      <div className="ft-header">
        <h1 className="ft-title">Focus Timer</h1>
        <p className="ft-sub">Stay focused with the Pomodoro technique.</p>
      </div>

      {/* Single full-width card */}
      <div className="ft-card ft-card--full">
        <div className={`ft-ring-wrap${isDone ? " ft-ring--done" : ""}`}>
          <svg className="ft-ring-svg" viewBox="0 0 120 120">
            <circle className="ft-ring-track" cx="60" cy="60" r="54" />
            <circle
              className={`ft-ring-arc${isDone ? " ft-ring-arc--done" : ""}`}
              cx="60" cy="60" r="54"
              style={{
                strokeDasharray: CIRCUMFERENCE,
                strokeDashoffset: strokeOffset,
                transition: isRunning ? "stroke-dashoffset 1s linear" : "stroke-dashoffset 0.35s ease",
              }}
            />
          </svg>
          <div className="ft-ring-inner">
            <div className="ft-time">{mm}:{ss}</div>
            <div className="ft-status">{status}</div>
          </div>
        </div>

        <div className="ft-controls">
          <button
            className="ft-reset-btn"
            onClick={handleReset}
            disabled={isRunning}
            title={isRunning ? "Stop session before resetting" : "Reset timer"}
          >
            <RotateCcw size={20} />
          </button>
          <button
            className={`ft-play-btn${isDone ? " ft-play-btn--done" : ""}`}
            onClick={handleToggle}
            disabled={isDone}
            aria-label={isRunning ? "Pause" : "Start"}
          >
            {isRunning
              ? <span className="ft-pause-icon" />
              : <span className="ft-play-icon" />
            }
          </button>
        </div>

        <div className="ft-modes">
          {MODES.map((m, i) => (
            <button
              key={m.label}
              className={`ft-mode-pill${i === modeIdx ? " ft-mode-pill--active" : ""}`}
              onClick={() => handleMode(i)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="ft-info">
          <span>{MODES[modeIdx].label.replace(" Focus", "").replace(" Break", " break")} session</span>
          {MODES[modeIdx].break > 0 && (
            <><span className="ft-dot">•</span><span>{MODES[modeIdx].break} min break</span></>
          )}
        </div>
      </div>
    </div>
  );
};

export default Focus;