/* ==========================================================
   FocusFlow — shared localStorage layer
   All pages import keys / loaders / savers from here.
   Savers also dispatch a custom window event so the Dashboard
   (and any other subscriber) can update in real-time.
   ========================================================== */

export const KEYS = {
    TASKS: "focusflow_tasks_v2",
    TIMER: "focusflow_timer",
    HEALTH: "focusflow_health",
    MOTIVATION: "focusflow_motivation",
};

/* ─── generic helpers ─── */
function read(key) { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; } }
function write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { } }
function broadcast(name) { window.dispatchEvent(new Event(name)); }

/* ─── TASKS ─── */
export function loadTasks() {
    const d = read(KEYS.TASKS);
    return { tasks: [], completed: [], ...d };
}
export function saveTasks(data) {
    write(KEYS.TASKS, data);
    broadcast("tasksUpdated");
}

/* ─── TIMER ─── */
export function loadTimer() {
    const d = read(KEYS.TIMER);
    return {
        modeIdx: 0,
        secondsLeft: 25 * 60,
        isRunning: false,
        isDone: false,
        sessions: 0,
        focusMinutesToday: 0,
        focusDate: null,
        ...d,
    };
}
export function saveTimer(data) {
    write(KEYS.TIMER, data);
    broadcast("timerUpdated");
}

/* ─── HEALTH ─── */
const TODAY = () => new Date().toISOString().split("T")[0];

export function loadHealth() {
    const d = read(KEYS.HEALTH);
    if (!d || d.date !== TODAY()) return { date: TODAY(), glasses: 0, mood: null };
    return d;
}
export function saveHealth(data) {
    write(KEYS.HEALTH, { date: TODAY(), ...data });
    broadcast("healthUpdated");
}

/* ─── MOTIVATION ─── */
export function loadMotivation() {
    const d = read(KEYS.MOTIVATION);
    return { qIdx: 0, liked: [], starred: [], streak: 0, best: 0, lastVisit: null, streakAwardedDate: null, ...d };
}
export function saveMotivation(data) {
    write(KEYS.MOTIVATION, data);
    broadcast("motivationUpdated");
}

/* ─── DAILY GOAL CHECK ─────────────────────────────────────────
   Goals: ≥4 tasks completed today  +  ≥5 glasses  +  ≥60 focus mins
   Increments streak once per calendar day, saves + broadcasts.
   ─────────────────────────────────────────────────────────────── */
export function checkDailyGoals() {
    const today = TODAY();
    const mot = loadMotivation();

    // Already awarded streak today — skip
    if (mot.streakAwardedDate === today) return;

    // Count tasks completed today (completed tasks live in taskData.completed)
    const taskData = loadTasks();
    const doneToday = (taskData.completed || []).filter(t => t.dueDate === today).length;

    // Water
    const health = loadHealth();
    const glasses = health.glasses ?? 0;

    // Focus minutes (reset if stale date)
    const timer = loadTimer();
    const focusMins = timer.focusDate === today ? (timer.focusMinutesToday ?? 0) : 0;

    // All 3 goals met?
    if (doneToday >= 4 && glasses >= 5 && focusMins >= 60) {
        const newStreak = mot.streak + 1;
        const newBest = Math.max(newStreak, mot.best);
        saveMotivation({ ...mot, streak: newStreak, best: newBest, streakAwardedDate: today });
    }
}
