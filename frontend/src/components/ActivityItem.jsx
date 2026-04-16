import React from 'react';
import { Link } from 'react-router-dom';

function ActivityItem({ pilotName, serviceType, date, hours, onClick }) {
  return (
    <div className="activity-item-new" onClick={onClick}>
      <div className="activity-item-icon">🏍️</div>
      <div className="activity-item-info">
        <span className="activity-item-name">{pilotName}</span>
        <span className="activity-item-desc">{serviceType} - {date}</span>
      </div>
      <span className="activity-item-badge">{hours}h</span>
    </div>
  );
}

export default ActivityItem;