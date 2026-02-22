import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2, User } from "lucide-react";
import apiClient from "../api/axios";
import { API_BASE_URL } from "../config";
import { toast } from "react-hot-toast";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await apiClient.post("/api/auth/login", formData);
            const { token, name, userId } = response.data;

            console.log("[AUTH-DIAG] Login successful. Persisting tokens...");
            localStorage.setItem("token", token);
            localStorage.setItem("userName", name);
            localStorage.setItem("userId", userId);

            // Double check storage
            if (localStorage.getItem("token") === token) {
                console.log("[AUTH-DIAG] Token verified in storage. Navigating to dashboard.");
                toast.success(`Welcome back, ${name}!`);
                navigate("/dashboard", { replace: true });
            } else {
                console.error("[AUTH-DIAG] Token storage failed!");
                toast.error("Authentication synchronization failed. Please try again.");
            }
        } catch (err) {
            console.error(err.response?.data || err.message);
            const errorMsg = typeof err.response?.data === 'string'
                ? err.response.data
                : (err.response?.data?.message || "Login failed. Check your credentials.");
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="d-flex align-items-center justify-content-center"
            style={{
                minHeight: "100vh",
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2070")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed"
            }}
        >
            <div
                className="card p-4 shadow-lg border-0"
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    borderRadius: "1.5rem",
                    backgroundColor: "rgba(255, 255, 255, 0.65)",
                    backdropFilter: "blur(16px) saturate(180%)",
                    WebkitBackdropFilter: "blur(16px) saturate(180%)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 10px 40px 0 rgba(0, 0, 0, 0.1)"
                }}
            >
                <div className="text-center mb-4">
                    <div
                        className="d-inline-flex align-items-center justify-content-center mb-3"
                        style={{
                            width: "48px",
                            height: "48px",
                            background: "#2dd4bf",
                            borderRadius: "12px",
                            color: "white",
                        }}
                    >
                        <User size={24} />
                    </div>
                    <h2 className="fw-bold mb-1" style={{ fontSize: "1.5rem" }}>Welcome Back</h2>
                    <p className="text-muted small">Sign in to continue your focus journey</p>
                </div>

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    <div className="form-group">
                        <label className="form-label small fw-semibold text-muted">Email / Username</label>
                        <div className="position-relative">
                            <Mail
                                size={18}
                                className="position-absolute translate-middle-y text-muted"
                                style={{ left: "12px", top: "50%" }}
                            />
                            <input
                                type="text"
                                name="email"
                                className="form-control ps-5 py-2"
                                style={{ backgroundColor: "rgba(255, 255, 255, 0.5)", border: "1px solid rgba(255, 255, 255, 0.4)" }}
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="d-flex justify-content-between">
                            <label className="form-label small fw-semibold text-muted">Password</label>
                        </div>
                        <div className="position-relative">
                            <Lock
                                size={18}
                                className="position-absolute translate-middle-y text-muted"
                                style={{ left: "12px", top: "50%" }}
                            />
                            <input
                                type="password"
                                name="password"
                                className="form-control ps-5 py-2"
                                style={{ backgroundColor: "rgba(255, 255, 255, 0.5)", border: "1px solid rgba(255, 255, 255, 0.4)" }}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="text-danger small mt-1">{error}</div>}

                    <button
                        type="submit"
                        className="btn py-2 fw-semibold text-white mt-2"
                        style={{
                            background: "#2dd4bf",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(45, 212, 191, 0.2)",
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="d-flex align-items-center justify-content-center gap-2">
                                <Loader2 size={18} className="animate-spin" /> Signing in...
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </button>

                    <p className="text-center small text-muted mt-3 mb-0">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-decoration-none fw-semibold" style={{ color: "#2dd4bf" }}>
                            Join now
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
