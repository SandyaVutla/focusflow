import React, { useState, useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";

/* ─── constants ─── */
const TOTAL = 25 * 60;           // 25 min in seconds
const CIRCUMFERENCE = 264;       // matches SVG r=42
const QF_KEY = "focusflow_quick_focus";

function load() {
    try {
        const raw = localStorage.getItem(QF_KEY);
        if (raw) return JSON.parse(raw);
    } catch { }
    return null;
}

function save(state) {
    try { localStorage.setItem(QF_KEY, JSON.stringify(state)); } catch { }
}

/* ─── component ─── */
const QuickFocus = () => {
    const [secondsLeft, setSecondsLeft] = useState(TOTAL);
    const [isRunning, setIsRunning] = useState(false);
    const [completed, setCompleted] = useState(false);
    const intervalRef = useRef(null);

    /* restore from localStorage on mount */
    useEffect(() => {
        const s = load();
        if (s) {
            setSecondsLeft(s.secondsLeft ?? TOTAL);
            setIsRunning(s.isRunning ?? false);
            setCompleted(s.completed ?? false);
        }
    }, []);

    /* persist whenever state changes */
    useEffect(() => {
        save({ secondsLeft, isRunning, completed });
    }, [secondsLeft, isRunning, completed]);

    /* tick */
    useEffect(() => {
        if (!isRunning) { clearInterval(intervalRef.current); return; }
        intervalRef.current = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    setIsRunning(false);
                    setCompleted(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    /* helpers */
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    const offset = CIRCUMFERENCE * (secondsLeft / TOTAL);   // offset shrinks as time passes
    const strokeOffset = CIRCUMFERENCE - offset;             // so filled arc grows

    const handleToggle = () => {
        if (completed) return;        // prevent start when done
        setIsRunning(r => !r);
    };

    const handleReset = () => {
        if (isRunning) return;        // prevent accidental reset while running
        clearInterval(intervalRef.current);
        setSecondsLeft(TOTAL);
        setIsRunning(false);
        setCompleted(false);
    };

    const label = completed
        ? "Session complete 🎉"
        : isRunning
            ? "Focus session in progress"
            : secondsLeft < TOTAL
                ? "Session paused"
                : "Quick focus ready";

    const btnLabel = isRunning ? "Pause" : secondsLeft < TOTAL && !completed ? "Resume" : "Start Focus";

    return (
        <div className="fade-in">
            {/* ── page header ── */}
            <div className="qf-header">
                <h1 className="qf-page-title">Quick Focus</h1>
                <p className="qf-page-sub">Instant 25-minute focus session — no setup needed.</p>
            </div>

            {/* ── main card ── */}
            <div className="qf-card">

                {/* ring */}
                <div className={`qf-ring-wrap${completed ? " qf-ring--done" : ""}`}>
                    <svg className="qf-ring-svg" viewBox="0 0 100 100">
                        {/* track */}
                        <circle className="qf-ring-track" cx="50" cy="50" r="42" />
                        {/* progress arc */}
                        <circle
                            className={`qf-ring-arc${completed ? " qf-ring-arc--done" : ""}`}
                            cx="50" cy="50" r="42"
                            style={{
                                strokeDasharray: CIRCUMFERENCE,
                                strokeDashoffset: strokeOffset,
                                transition: isRunning ? "stroke-dashoffset 1s linear" : "stroke-dashoffset 0.3s ease",
                            }}
                        />
                    </svg>

                    {/* centre text */}
                    <div className="qf-ring-inner">
                        <div className="qf-time">{mm}:{ss}</div>
                        <div className="qf-status">{label}</div>
                    </div>
                </div>

                {/* controls */}
                <div className="qf-controls">
                    {/* reset */}
                    <button
                        className="qf-reset-btn"
                        onClick={handleReset}
                        disabled={isRunning}
                        title={isRunning ? "Stop the timer before resetting" : "Reset timer"}
                    >
                        <RotateCcw size={18} />
                    </button>

                    {/* start / pause / resume */}
                    <button
                        className={`qf-play-btn${completed ? " qf-play-btn--done" : ""}`}
                        onClick={handleToggle}
                        disabled={completed}
                        aria-label={btnLabel}
                    >
                        {isRunning
                            ? <span className="qf-pause-icon" />
                            : <span className="qf-play-icon" />
                        }
                    </button>
                </div>

                <div className="qf-hint">⚡ Auto-logs focus session to your daily stats</div>
            </div>
        </div>
    );
};

export default QuickFocus;
