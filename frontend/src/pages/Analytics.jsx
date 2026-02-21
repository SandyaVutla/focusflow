import React, { useState, useEffect } from "react";
import {
    BarChart3,
    TrendingUp,
    Target,
    Clock,
    Droplets,
    Flame,
    Calendar,
    Zap,
    CheckCircle2,
    Lock
} from "lucide-react";
import apiClient from "../api/axios";
import { toast } from "react-hot-toast";

const Analytics = () => {
    const [view, setView] = useState("weekly"); // 'weekly' or 'monthly'
    const [stats, setStats] = useState([]);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [view]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = view === "weekly" ? "/stats/weekly" : "/stats/monthly";
            const [statsRes, streakRes] = await Promise.all([
                apiClient.get(endpoint),
                apiClient.get("/stats/streak")
            ]);
            setStats(statsRes.data);
            setStreak(streakRes.data.streak);
        } catch (error) {
            console.error("Error fetching analytics data:", error);
            toast.error("Failed to load analytics reports");
        } finally {
            setLoading(false);
        }
    };

    // ── Calculate Aggregates ──
    const totalFocus = stats.reduce((acc, s) => acc + s.focusMinutes, 0);
    const totalTasks = stats.reduce((acc, s) => acc + s.tasksCompleted, 0);
    const avgWater = stats.length ? (stats.reduce((acc, s) => acc + s.waterGlasses, 0) / stats.length).toFixed(1) : 0;

    // Weighted completion rate for tasks
    const completionRate = stats.length
        ? Math.min(Math.round((stats.reduce((acc, s) => acc + (s.tasksTotal > 0 ? (s.tasksCompleted / s.tasksTotal) : 0), 0) / stats.length) * 100), 100)
        : 0;

    // Goals met count
    const goalsMetCount = stats.filter(s => s.goalsMet).length;

    return (
        <div className="fade-in db-page pb-5">
            {/* ── HEADER ── */}
            <header className="db-header mb-2">
                <div>
                    <h1 className="db-greeting">Analytics & Reports</h1>
                    <p className="db-date">Monitor your productivity and health trends</p>
                </div>
                <div className="db-header-actions">
                    <div className="btn-group bg-white p-1 rounded-pill shadow-sm border">
                        <button
                            className={`btn btn-sm rounded-pill px-4 fw-bold ${view === 'weekly' ? 'btn-teal text-white' : 'btn-light border-0 text-muted'}`}
                            onClick={() => setView('weekly')}
                        >
                            Weekly
                        </button>
                        <button
                            className={`btn btn-sm rounded-pill px-4 fw-bold ${view === 'monthly' ? 'btn-teal text-white' : 'btn-light border-0 text-muted'}`}
                            onClick={() => setView('monthly')}
                        >
                            Monthly
                        </button>
                    </div>
                </div>
            </header>

            {/* ── SUMMARY ROW (Consistency with Dashboard Stats) ── */}
            <div className="db-stats-row mb-2">
                <div className="db-stat-card db-stat--teal border-0">
                    <div className="db-stat-icon"><Clock size={20} /></div>
                    <div className="db-stat-value">{(totalFocus / 60).toFixed(1)}h</div>
                    <div className="db-stat-label">Total Focus</div>
                    <div className="db-stat-sub">Active minutes logged</div>
                </div>
                <div className="db-stat-card db-stat--blue border-0">
                    <div className="db-stat-icon"><Target size={20} /></div>
                    <div className="db-stat-value">{totalTasks}</div>
                    <div className="db-stat-label">Tasks Done</div>
                    <div className="db-stat-sub">Across all categories</div>
                </div>
                <div className="db-stat-card db-stat--indigo border-0">
                    <div className="db-stat-icon"><Droplets size={20} /></div>
                    <div className="db-stat-value">{avgWater}</div>
                    <div className="db-stat-label">Avg Water</div>
                    <div className="db-stat-sub">Glasses per day</div>
                </div>
                <div className="db-stat-card db-stat--orange border-0">
                    <div className="db-stat-icon"><Flame size={20} /></div>
                    <div className="db-stat-value">{streak}</div>
                    <div className="db-stat-label">Current Streak</div>
                    <div className="db-stat-sub">Consecutive goals met</div>
                </div>
            </div>

            {/* ── MAIN CHARTS ── */}
            <div className="row g-4">
                {/* Focus & Activity Trend Chart */}
                <div className="col-lg-8">
                    <div className="db-card h-100 border-0 shadow-sm glass-card p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="db-card-title"><BarChart3 size={18} className="text-teal" /> Focus Trend</h5>
                            <span className="small text-muted fw-medium bg-light px-3 py-1 rounded-pill">
                                {view === 'weekly' ? 'Last 7 Days' : 'Last 30 Days'}
                            </span>
                        </div>

                        <div className="analytics-chart-container" style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', paddingBottom: '30px' }}>
                            {loading ? (
                                <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center gap-3">
                                    <div className="spinner-border text-teal" role="status"></div>
                                    <span className="text-muted small fw-medium">Loading reports...</span>
                                </div>
                            ) : stats.length === 0 ? (
                                <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted gap-2">
                                    <div className="bg-light p-3 rounded-circle"><Calendar size={32} opacity={0.3} /></div>
                                    <span className="fw-medium">No activity data found for this period</span>
                                </div>
                            ) : (
                                stats.map((s, i) => {
                                    const maxMinutes = Math.max(...stats.map(st => st.focusMinutes), 60);
                                    const height = (s.focusMinutes / maxMinutes) * 100;
                                    return (
                                        <div key={i} className="flex-fill d-flex flex-column align-items-center group" style={{ height: '100%' }}>
                                            <div className="w-100 chart-bar transition-all"
                                                style={{
                                                    height: `${Math.max(height, 5)}%`,
                                                    background: s.goalsMet
                                                        ? 'linear-gradient(180deg, #2dd4bf 0%, #0ea5e9 100%)'
                                                        : 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)',
                                                    borderRadius: '6px 6px 4px 4px',
                                                    boxShadow: s.goalsMet ? '0 4px 12px rgba(45, 212, 191, 0.2)' : 'none'
                                                }}>
                                                <div className="chart-tooltip-refined">
                                                    <div className="fw-bold">{s.focusMinutes}m</div>
                                                    <div className="small opacity-75">{s.date}</div>
                                                </div>
                                            </div>
                                            <span className="chart-label-date mt-2">
                                                {s.date.split('-').slice(2)}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="mt-2 d-flex gap-4 justify-content-center border-top pt-4">
                            <div className="d-flex align-items-center gap-2 small text-muted fw-medium">
                                <span className="d-inline-block rounded-circle" style={{ width: 10, height: 10, background: 'linear-gradient(180deg, #2dd4bf 0%, #0ea5e9 100%)' }} /> Goal Met
                            </div>
                            <div className="d-flex align-items-center gap-2 small text-muted fw-medium">
                                <span className="d-inline-block rounded-circle" style={{ width: 10, height: 10, background: '#cbd5e1' }} /> Incomplete
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Performance Gauge */}
                <div className="col-lg-4">
                    <div className="db-card h-100 border-0 shadow-sm glass-card p-4">
                        <h5 className="db-card-title mb-4"><Zap size={18} className="text-teal" /> Efficiency Score</h5>

                        <div className="text-center my-4 py-2">
                            <div className="gauge-container mx-auto">
                                <svg width="180" height="180" viewBox="0 0 160 160">
                                    <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                                    <circle
                                        cx="80" cy="80" r="70"
                                        fill="none"
                                        stroke="url(#gaugeGradient)"
                                        strokeWidth="14"
                                        strokeDasharray={440}
                                        strokeDashoffset={440 - (440 * completionRate) / 100}
                                        strokeLinecap="round"
                                        transform="rotate(-90 80 80)"
                                        style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                                    />
                                    <defs>
                                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#2dd4bf" />
                                            <stop offset="100%" stopColor="#0ea5e9" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="gauge-score">
                                    <div className="score-val text-teal">{completionRate}%</div>
                                    <div className="score-label">Productivity</div>
                                </div>
                            </div>
                        </div>

                        <div className="performance-insights mt-4 space-y-3">
                            <div className="insight-item d-flex align-items-center justify-content-between p-3 bg-light rounded-xl mb-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-teal"><CheckCircle2 size={18} /></div>
                                    <span className="small fw-semibold text-muted">Days with Goals Met</span>
                                </div>
                                <span className="h6 mb-0 fw-bold">{goalsMetCount} / {stats.length}</span>
                            </div>

                            <div className="insight-tip p-3 rounded-xl" style={{ backgroundColor: 'rgba(45, 212, 191, 0.05)', border: '1px dashed rgba(45, 212, 191, 0.3)' }}>
                                <p className="small text-teal fw-medium mb-0 m-0">
                                    <TrendingUp size={14} className="me-2" />
                                    {completionRate > 70
                                        ? "Great job! You're consistently hitting your targets."
                                        : "Try setting smaller focus blocks to improve your daily score."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
