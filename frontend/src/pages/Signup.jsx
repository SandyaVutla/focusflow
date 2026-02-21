import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import apiClient from "../api/axios";
import { toast } from "react-hot-toast";

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(""); // Clear error on change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Basic Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await apiClient.post("/api/auth/signup", {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });
            // Success: Redirect to login
            toast.success("Account created successfully! Please sign in.");
            navigate("/login");
        } catch (err) {
            console.error("Signup error:", err.response?.data || err.message);
            const errorMsg = typeof err.response?.data === 'string'
                ? err.response.data
                : (err.response?.data?.message || "Signup failed. Please check your connection.");
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
                    <h2 className="fw-bold mb-1" style={{ fontSize: "1.5rem" }}>Create your account</h2>
                    <p className="text-muted small">Start building your focus streak today</p>
                </div>

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    {/* Full Name */}
                    <div className="form-group">
                        <label className="form-label small fw-semibold text-muted">Full Name</label>
                        <div className="position-relative">
                            <User
                                size={18}
                                className="position-absolute translate-middle-y text-muted"
                                style={{ left: "12px", top: "50%" }}
                            />
                            <input
                                type="text"
                                name="name"
                                className="form-control ps-5 py-2"
                                style={{ backgroundColor: "rgba(255, 255, 255, 0.5)", border: "1px solid rgba(255, 255, 255, 0.4)" }}
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label small fw-semibold text-muted">Email Address</label>
                        <div className="position-relative">
                            <Mail
                                size={18}
                                className="position-absolute translate-middle-y text-muted"
                                style={{ left: "12px", top: "50%" }}
                            />
                            <input
                                type="email"
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

                    {/* Password */}
                    <div className="form-group">
                        <label className="form-label small fw-semibold text-muted">Password</label>
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

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label className="form-label small fw-semibold text-muted">Confirm Password</label>
                        <div className="position-relative">
                            <Lock
                                size={18}
                                className="position-absolute translate-middle-y text-muted"
                                style={{ left: "12px", top: "50%" }}
                            />
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-control ps-5 py-2"
                                style={{ backgroundColor: "rgba(255, 255, 255, 0.5)", border: "1px solid rgba(255, 255, 255, 0.4)" }}
                                placeholder="••••••••"
                                value={formData.confirmPassword}
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
                                <Loader2 size={18} className="animate-spin" /> Creating account...
                            </span>
                        ) : (
                            "Create Account"
                        )}
                    </button>

                    <p className="text-center small text-muted mt-3 mb-0">
                        Already have an account?{" "}
                        <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: "#2dd4bf" }}>
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;
