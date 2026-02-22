import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  Heart,
  Sparkles,
  BarChart3,
  LogOut,
} from "lucide-react";
import classNames from "classnames";
import { MOCK_DATA } from "../utils/constants";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear ALL user data (auth + productivity)
    localStorage.clear();

    // Redirect to login
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/tasks", label: "Tasks", icon: CheckSquare },
    { path: "/focus", label: "Focus Timer", icon: Timer },
    { path: "/health", label: "Health", icon: Heart },
    { path: "/motivation", label: "Motivation", icon: Sparkles },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">◎</div>
        <span className="logo-text">FocusFlow</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              classNames("sidebar-link", {
                active: isActive,
              })
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">
            {(localStorage.getItem("userName") || MOCK_DATA.user.name).charAt(0)}
          </div>
          <div>
            <div className="name">{localStorage.getItem("userName") || MOCK_DATA.user.name}</div>
            <div className="plan">{MOCK_DATA.user.plan}</div>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
