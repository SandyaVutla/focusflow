import React, { useState } from "react";
import { Bell, Search, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import { MOCK_DATA } from "../utils/constants";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const { pathname } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const userName = localStorage.getItem("userName") || MOCK_DATA.user.name;
  const initial = userName.charAt(0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast(`Searching for: ${searchQuery}`, { icon: "🔍" });
    }
  };

  const handleNotificationClick = () => {
    toast("You have no new notifications", { icon: "🔔" });
  };

  const handleProfileClick = () => {
    toast(`Logged in as ${userName}`, { icon: "👤" });
  };

  return (
    <nav
      style={{
        height: "64px",
        background: "#ffffff",
        borderBottom: "1px solid #eef2f7",
        padding: "0 24px",
      }}
      className="d-flex align-items-center justify-content-between"
    >
      {/* LEFT: Placeholder to push content right */}
      <div />

      {/* RIGHT: Search + Actions */}
      <div className="d-flex align-items-center gap-3">
        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="d-flex align-items-center gap-2 px-3"
          style={{
            height: "36px",
            background: "#f8fafc",
            borderRadius: "14px",
            border: "1px solid #e5e7eb",
          }}
        >
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "0.85rem",
              width: "140px",
            }}
          />
        </form>

        {/* Notifications */}
        <div
          onClick={handleNotificationClick}
          className="position-relative d-flex align-items-center justify-content-center"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "12px",
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            cursor: "pointer",
          }}
        >
          <Bell size={18} className="text-muted" />
          <span
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "8px",
              height: "8px",
              background: "#fb7185",
              borderRadius: "50%",
            }}
          />
        </div>

        {/* Avatar */}
        <div
          onClick={handleProfileClick}
          className="d-flex align-items-center justify-content-center fw-semibold text-white"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "12px",
            background: "#2dd4bf",
            cursor: "pointer",
          }}
        >
          {initial}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
