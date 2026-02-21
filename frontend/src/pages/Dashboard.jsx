import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, Clock, Droplets, Flame, Target,
  ArrowRight, TrendingUp, Zap
} from "lucide-react";
import { toast } from "react-hot-toast";
import apiClient from "../api/axios";
import { MOCK_DATA } from "../utils/constants";
import { loadTasks, loadHealth, loadMotivation, loadTimer, saveTimer, saveMotivation, saveHealth } from "../utils/storage";

/* ─── helpers ─── */
const TOTAL_TIME = 25 * 60;
const QUOTES = [
  { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { quote: "Do the hard jobs first. The easy jobs look after themselves.", author: "Dale Carnegie" },
  { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
];

function getTodayStr() { return new Date().toISOString().split("T")[0]; }
function getDayName(offset = 0) {
  const d = new Date(); d.setDate(d.getDate() - offset);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

const Dashboard = () => {
  const navigate = useNavigate();
  const today = getTodayStr();
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [summary, setSummary] = useState(null);
  const [todayTasksList, setTodayTasksList] = useState([]);

  /* ── backend sync ── */
  useEffect(() => {
    if (!token) return;

    const fetchDashboardData = async () => {
      try {
        const [summaryRes, tasksRes] = await Promise.all([
          apiClient.get("/api/dashboard/summary"),
          apiClient.get(`/api/tasks?date=${today}`)
        ]);

        setSummary(summaryRes.data);
        setTodayTasksList(tasksRes.data);

        // Sync storage with backend data to keep other pages (like Stats/Timer) consistent
        const s = summaryRes.data;
        const localMot = loadMotivation();
        saveMotivation({ ...localMot, streak: s.currentStreak, best: s.bestStreak });

        const localHealth = loadHealth();
        saveHealth({ ...localHealth, glasses: s.waterIntakeToday });

        const localTimer = loadTimer();
        saveTimer({ ...localTimer, focusMinutesToday: s.focusMinutesToday, focusDate: today });

      } catch (err) {
        console.error("Dashboard data fetch failed:", err.message);
      }
    };
    fetchDashboardData();

    // Diagnostic Interval: Check if token "disappears"
    const diag = setInterval(() => {
      const t = localStorage.getItem("token");
      console.log(`[AUTH-DIAG] ${new Date().toLocaleTimeString()} - Token present: ${!!t}`);
      if (!t) console.error("[AUTH-DIAG] TOKEN LOST FROM LOCAL STORAGE!");
    }, 1000);

    return () => clearInterval(diag);
  }, [today, token]);

  /* ── live clock ── */
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ── rotating quote ── */
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [fadeQ, setFadeQ] = useState(true);
  const rotateQuote = () => {
    setFadeQ(false);
    setTimeout(() => { setQuoteIdx(i => (i + 1) % QUOTES.length); setFadeQ(true); }, 300);
  };

  /* ── TASKS — local state + backend fallback ── */
  const [localTaskData, setLocalTaskData] = useState(() => loadTasks());
  useEffect(() => {
    const refresh = () => setLocalTaskData(loadTasks());
    window.addEventListener("tasksUpdated", refresh);
    window.addEventListener("focus", refresh);
    return () => { window.removeEventListener("tasksUpdated", refresh); window.removeEventListener("focus", refresh); };
  }, []);

  // Use summary from backend as primary source of truth, fallback to local
  const completedCount = summary ? summary.tasksCompletedToday : (localTaskData.completed || []).filter(t => t.dueDate === today).length;
  const totalToday = summary ? summary.totalTasksToday : ((localTaskData.tasks || []).filter(t => t.dueDate === today).length + (localTaskData.completed || []).filter(t => t.dueDate === today).length);
  const pendingCount = summary ? summary.pendingTasks : (localTaskData.tasks || []).filter(t => t.dueDate === today).length;

  const PRIO = { high: 0, medium: 1, low: 2 };
  // Use real tasks from backend list if available
  const displayTasks = todayTasksList.length > 0 ? todayTasksList.filter(t => t.status === "ACTIVE") : (localTaskData.tasks || []).filter(t => t.dueDate === today);
  const topPending = [...displayTasks].sort((a, b) => (PRIO[a.priority] ?? 3) - (PRIO[b.priority] ?? 3)).slice(0, 3);

  /* ── HEALTH — local state + backend fallback ── */
  const [localHealthData, setLocalHealthData] = useState(() => loadHealth());
  useEffect(() => {
    const refresh = () => setLocalHealthData(loadHealth());
    window.addEventListener("healthUpdated", refresh);
    window.addEventListener("focus", refresh);
    return () => { window.removeEventListener("healthUpdated", refresh); window.removeEventListener("focus", refresh); };
  }, []);

  const glasses = summary ? summary.waterIntakeToday : (localHealthData.glasses ?? 0);
  const waterGoal = 8;

  /* ── MOTIVATION — local state + backend fallback ── */
  const [localMotData, setLocalMotData] = useState(() => loadMotivation());
  useEffect(() => {
    const refresh = () => setLocalMotData(loadMotivation());
    window.addEventListener("motivationUpdated", refresh);
    window.addEventListener("focus", refresh);
    return () => { window.removeEventListener("motivationUpdated", refresh); window.removeEventListener("focus", refresh); };
  }, []);

  const currentStreak = summary ? summary.currentStreak : (localMotData.streak ?? 0);
  const bestStreak = summary ? summary.bestStreak : (localMotData.best ?? 0);

  /* ── FOCUS TIMER — live via "timerUpdated" event ── */
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_TIME);
  const [focusMinutesToday, setFocusMinutesToday] = useState(0);

  useEffect(() => {
    const t = loadTimer();
    setSecondsLeft(t.secondsLeft ?? TOTAL_TIME);
    setIsRunning(t.isRunning ?? false);
    // focus minutes today (clear if stale date)
    const fDate = t.focusDate ?? null;
    const initialFocus = fDate === today ? (t.focusMinutesToday ?? 0) : 0;
    setFocusMinutesToday(summary ? summary.focusMinutesToday : initialFocus);
  }, [summary]);

  /* sync from timerUpdated (Focus page changed the timer) */
  useEffect(() => {
    const refresh = () => {
      const t = loadTimer();
      setSecondsLeft(t.secondsLeft ?? TOTAL_TIME);
      const fDate = t.focusDate ?? null;
      setFocusMinutesToday(fDate === today ? (t.focusMinutesToday ?? 0) : 0);
    };
    window.addEventListener("timerUpdated", refresh);
    return () => window.removeEventListener("timerUpdated", refresh);
  }, []);

  /* dashboard-local tick */
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { setIsRunning(false); return TOTAL_TIME; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  /* persist dashboard timer changes back to shared storage */
  useEffect(() => {
    saveTimer({ secondsLeft, isRunning });
  }, [secondsLeft, isRunning]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const circumference = 264;
  const progressOffset = circumference * (1 - secondsLeft / TOTAL_TIME);

  /* ── greeting ── */
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  /* ── composite daily progress (3 goals, each 0-100, averaged) ── */
  const taskGoalPct = Math.min(completedCount / 4, 1) * 100;
  const waterGoalPct = Math.min(glasses / 5, 1) * 100;
  const focusGoalPct = Math.min(focusMinutesToday / 60, 1) * 100;
  const progressPct = Math.round((taskGoalPct + waterGoalPct + focusGoalPct) / 3);

  /* ── weekly bars (real data from backend) ── */
  const [weeklyBars, setWeeklyBars] = useState([]);
  useEffect(() => {
    const fetchWeekly = async () => {
      try {
        const res = await apiClient.get("/api/stats/weekly");
        const data = res.data; // List of DailyStats

        // Map last 7 days from backend or 0 if missing
        const bars = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(); date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          const stat = data.find(s => s.date === dateStr);

          // Calculate a percentage based on focus goal (60 min)
          const focusPct = stat ? Math.min(Math.round((stat.focusMinutes / 60) * 100), 100) : 0;

          bars.push({
            day: i === 0 ? "Today" : getDayName(i),
            pct: focusPct,
            isToday: i === 0
          });
        }
        setWeeklyBars(bars);
      } catch (err) {
        console.error("Weekly bars sync failed:", err.message);
      }
    };
    fetchWeekly();
  }, [focusMinutesToday]); // Refresh when focus minutes change

  const userName = localStorage.getItem("userName") || MOCK_DATA.user.name;
  const firstName = userName.split(" ")[0];

  return (
    <div className="fade-in db-page">

      {/* ── HEADER ── */}
      <div className="db-header">
        <div>
          <h1 className="db-greeting">{greeting}, {firstName} 👋</h1>
          <p className="db-date">
            {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            {" · "}
            <span className="db-time">{now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
          </p>
        </div>

        <div className="db-header-actions">
          <button className="db-cta" onClick={() => navigate("/tasks")}>
            <Zap size={15} /> View Tasks
          </button>
        </div>
      </div>

      {/* ── TODAY'S GOAL BANNER ── */}
      <div className="db-goal-banner">
        <div className="db-goal-left">
          <div className="db-goal-icon"><Target size={18} /></div>
          <div>
            <div className="db-goal-title">Today's Progress</div>
            <div className="db-goal-sub">
              {completedCount}/4 tasks · {glasses}/5 glasses · {focusMinutesToday}/60 min focus
            </div>
          </div>
        </div>
        <div className="db-goal-right">
          <div className="db-goal-bar-wrap">
            <div className="db-goal-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="db-goal-pct">{progressPct}%</span>
          <span className={`db-goal-pill ${progressPct >= 60 ? "on-track" : "behind"}`}>
            {progressPct >= 80 ? "🔥 Crushing it" : progressPct >= 50 ? "✅ On track" : "⚡ Keep going"}
          </span>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="db-stats-row">
        <div className="db-stat-card db-stat--teal">
          <div className="db-stat-icon"><CheckCircle size={20} /></div>
          <div className="db-stat-value">{completedCount}</div>
          <div className="db-stat-label">Completed Today</div>
          <div className="db-stat-sub">{pendingCount} pending</div>
        </div>

        <div className="db-stat-card db-stat--blue">
          <div className="db-stat-icon"><Clock size={20} /></div>
          <div className="db-stat-value">{`${String(Math.floor((TOTAL_TIME - secondsLeft) / 60)).padStart(2, "0")}m`}</div>
          <div className="db-stat-label">Focus Today</div>
          <div className="db-stat-sub">{isRunning ? "⏳ Session active" : "Session paused"}</div>
        </div>

        <div className="db-stat-card db-stat--indigo">
          <div className="db-stat-icon"><Droplets size={20} /></div>
          <div className="db-stat-value">{glasses}/{waterGoal}</div>
          <div className="db-stat-label">Water Intake</div>
          <div className="db-stat-sub">glasses today</div>
        </div>

        <div className="db-stat-card db-stat--orange">
          <div className="db-stat-icon"><Flame size={20} /></div>
          <div className="db-stat-value">{currentStreak}</div>
          <div className="db-stat-label">Day Streak</div>
          <div className="db-stat-sub">Best: {bestStreak} days</div>
        </div>
      </div>

      {/* ── MID ROW: Quick Focus + Pending Tasks ── */}
      <div className="db-mid-row">

        {/* Quick Focus */}
        <div className="db-card db-focus-card">
          <div className="db-card-header">
            <span className="db-card-title">Quick Focus</span>
            <button className="db-link" onClick={() => navigate("/focus")}>Full Timer <ArrowRight size={13} /></button>
          </div>

          <div className="db-focus-body">
            <div className="focus-ring-wrapper">
              <svg className="focus-ring-svg" viewBox="0 0 100 100">
                <circle className="ring-bg" cx="50" cy="50" r="42" />
                <circle className="ring-progress" cx="50" cy="50" r="42"
                  style={{ strokeDasharray: circumference, strokeDashoffset: progressOffset }} />
              </svg>
              <div className="focus-time-text">{minutes}:{seconds}</div>
            </div>

            <div className="db-focus-right">
              <p className={`focus-status${isRunning ? " focus-status--running" : ""}`}>
                {isRunning ? "Focus session in progress" : "Session paused"}
              </p>
              <button
                className={`focus-action-btn ${isRunning ? "pause" : "play"}`}
                onClick={() => setIsRunning(p => !p)}
                aria-label="Toggle focus"
              />
              {secondsLeft < TOTAL_TIME && (
                <button className="db-reset-btn" onClick={() => { setIsRunning(false); setSecondsLeft(TOTAL_TIME); }}>
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="db-card db-tasks-card">
          <div className="db-card-header">
            <span className="db-card-title">Today's Tasks</span>
            <button className="db-link" onClick={() => navigate("/tasks")}>View All <ArrowRight size={13} /></button>
          </div>

          {topPending.length === 0 ? (
            <div className="db-empty-tasks">
              <CheckCircle size={32} color="#2dd4bf" />
              <p>All done for today! 🎉</p>
            </div>
          ) : (
            <div className="db-task-list">
              {topPending.map(task => (
                <div key={task.id} className={`db-task-row db-task--${task.priority}`}>
                  <span className={`db-task-dot db-task-dot--${task.priority}`} />
                  <div className="db-task-info">
                    <span className="db-task-title">{task.title}</span>
                    <span className="db-task-sub">{task.category} · {task.time}</span>
                  </div>
                </div>
              ))}
              {todayTasks.length > 3 && (
                <div className="db-task-more" onClick={() => navigate("/tasks")}>
                  +{todayTasks.length - 3} more tasks →
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM ROW: Weekly bars + Quote ── */}
      <div className="db-bottom-row">

        {/* Weekly Activity */}
        <div className="db-card db-weekly-card">
          <div className="db-card-header">
            <span className="db-card-title"><TrendingUp size={15} /> Weekly Activity</span>
            <span className="db-card-sub">Last 7 days</span>
          </div>
          <div className="db-bar-chart">
            {weeklyBars.map(({ day, pct, isToday }) => (
              <div key={day} className="db-bar-col">
                <div className="db-bar-track">
                  <div className={`db-bar-fill${isToday ? " db-bar-fill--today" : ""}`} style={{ height: `${pct}%` }} />
                </div>
                <span className={`db-bar-label${isToday ? " db-bar-label--today" : ""}`}>{day}</span>
              </div>
            ))}
          </div>
          <div className="db-weekly-pills">
            <span className="db-wpill">📈 Avg {weeklyBars.length > 0 ? Math.round(weeklyBars.reduce((s, d) => s + d.pct, 0) / weeklyBars.length) : 0}%</span>
            <span className="db-wpill">🏆 Best: {weeklyBars.length > 0 ? weeklyBars.reduce((best, d) => d.pct > best.pct ? d : best).day : "Today"}</span>
            <span className="db-wpill">🔥 {currentStreak} day streak</span>
          </div>
        </div>

        {/* Daily Spark */}
        <div className="db-card db-quote-card">
          <div className="db-card-header">
            <span className="db-card-title"><Zap size={14} /> Daily Spark</span>
          </div>
          <div className={`db-quote-body${fadeQ ? "" : " db-quote-fade"}`}>
            <p className="db-quote-text">"{QUOTES[quoteIdx].quote}"</p>
            <div className="db-quote-author">— {QUOTES[quoteIdx].author}</div>
          </div>
          <button className="db-quote-btn" onClick={rotateQuote}>Next quote →</button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
