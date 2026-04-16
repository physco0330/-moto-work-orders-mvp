import React from 'react';
import { Link } from 'react-router-dom';

function ActivityList({ activities }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="activity-list-new">
      <div className="activity-list-header">
        <h3>Actividad Reciente</h3>
        <span className="activity-filter">Hoy</span>
      </div>
      <div className="activity-list-items">
        {activities.map((item, index) => (
          <div key={index} className="activity-item-new">
            <div className="activity-item-icon">🏍️</div>
            <div className="activity-item-info">
              <span className="activity-item-name">{item.pilotName}</span>
              <span className="activity-item-desc">{item.serviceType} - {formatDate(item.date)}</span>
            </div>
            <span className="activity-item-badge">{item.hours}h</span>
          </div>
        ))}
      </div>
      <Link to="/work-orders/historial" className="activity-list-footer">
        Ver todo el historial →
      </Link>
    </div>
  );
}

export default ActivityList;