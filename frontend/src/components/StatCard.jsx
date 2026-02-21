import React from "react";

const StatCard = ({ title, value, subtitle, icon: Icon, variant, children }) => {
  return (
    <div className="stat-card">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="stat-title">{title}</div>
          <div className="stat-value">{value}</div>
          {subtitle && <div className="stat-sub">{subtitle}</div>}
        </div>

        {Icon && (
          <div className={`stat-icon icon-${variant}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      {children}
    </div>
  );
};

export default StatCard;
