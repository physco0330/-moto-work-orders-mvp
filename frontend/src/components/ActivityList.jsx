import React from 'react';
import { Link } from 'react-router-dom';
import ActivityItem from './ActivityItem';

function ActivityList({ activities }) {
  return (
    <div className="activity-list-new">
      <div className="activity-list-header">
        <h3>Actividad Reciente</h3>
        <span className="activity-filter">Hoy</span>
      </div>
      <div className="activity-list-items">
        {activities.map((item, index) => (
          <ActivityItem
            key={index}
            pilotName={item.pilotName}
            serviceType={item.serviceType}
            date={item.date}
            hours={item.hours}
          />
        ))}
      </div>
      <Link to="/work-orders/historial" className="activity-list-footer">
        Ver todo el historial →
      </Link>
    </div>
  );
}

export default ActivityList;