import React from 'react';

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    red: 'stat-red',
    orange: 'stat-orange',
    green: 'stat-green',
    blue: 'stat-blue',
  };

  return (
    <div className={`stat-card-new ${colorClasses[color]}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-content">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-value">{value}</span>
      </div>
    </div>
  );
}

export default StatCard;