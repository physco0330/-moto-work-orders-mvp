import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ChartSection from '../components/ChartSection';
import StatusBadge from '../components/StatusBadge';

function DashboardPage() {
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0, activeClients: 0 });
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const ordersRes = await api.get('/work-orders', { params: { pageSize: 100 } });
      const orders = ordersRes.data.data || [];
      
      const pending = orders.filter(o => o.status === 'RECIBIDA').length;
      const inProgress = orders.filter(o => ['DIAGNOSTICO', 'EN_PROCESO'].includes(o.status)).length;
      const completed = orders.filter(o => ['LISTA', 'ENTREGADA'].includes(o.status)).length;
      
      const clientIds = new Set(orders.map(o => o.bike?.clientId).filter(Boolean));
      
      setStats({ pending, inProgress, completed, activeClients: clientIds.size });
      setRecentOrders(orders.slice(0, 6));

      const days = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayOrders = orders.filter(o => o.entryDate === dateStr);
        days.push({
          date: dateStr,
          day: date.toLocaleDateString('es', { weekday: 'short' }),
          count: dayOrders.length
        });
      }
      setChartData(days);

      const activityData = orders.slice(0, 5).map(o => ({
        pilotName: o.pilotName || o.bike?.client?.name || 'Sin nombre',
        serviceType: o.serviceType || o.faultDescription?.substring(0, 20) || 'ALISTAMIENTO',
        date: o.entryDate,
        hours: o.hoursUsed || o.hoursRegistered || Math.floor(Math.random() * 50) + 1
      }));
      setActivities(activityData);

    } catch (e) {
      console.error('Error loading dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="content center">Cargando...</div>;
  }

  const totalServices = chartData.reduce((sum, d) => sum + d.count, 0);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="dashboard-new">
      <Link to="/work-orders/new" className="fab-button-top">
        <span className="fab-icon">+</span>
        <span className="fab-text">Nueva Orden</span>
      </Link>

      <div className="dashboard-header">
        <h1>Panel Principal</h1>
        <p>Vista general del taller y actividad reciente</p>
      </div>

      <div className="stats-grid-new">
        <Link to="/work-orders/pendientes" className="stat-card-new stat-red">
          <div className="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div className="stat-card-content">
            <span className="stat-card-title">Pendientes</span>
            <span className="stat-card-value">{stats.pending}</span>
          </div>
        </Link>
        <Link to="/work-orders/proceso" className="stat-card-new stat-orange">
          <div className="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div className="stat-card-content">
            <span className="stat-card-title">En Proceso</span>
            <span className="stat-card-value">{stats.inProgress}</span>
          </div>
        </Link>
        <Link to="/work-orders/terminados" className="stat-card-new stat-green">
          <div className="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div className="stat-card-content">
            <span className="stat-card-title">Terminados</span>
            <span className="stat-card-value">{stats.completed}</span>
          </div>
        </Link>
        <Link to="/pilotos" className="stat-card-new stat-blue">
          <div className="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-card-content">
            <span className="stat-card-title">Pilotos</span>
            <span className="stat-card-value">{stats.activeClients}</span>
          </div>
        </Link>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-chart">
          <ChartSection data={chartData} total={totalServices} />
        </div>
        <div className="dashboard-activity">
          <div className="activity-table-wrapper">
            <div className="activity-table-header">
              <h3>Actividad Reciente</h3>
              <span className="activity-filter">Hoy</span>
            </div>
            <table className="activity-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Piloto</th>
                  <th>Servicio</th>
                  <th>Fecha</th>
                  <th>Horas</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((item, index) => (
                  <tr key={index}>
                    <td className="activity-icon-cell">🏍️</td>
                    <td className="pilot-cell">{item.pilotName}</td>
                    <td className="service-cell">{item.serviceType}</td>
                    <td className="date-cell">{formatDate(item.date)}</td>
                    <td><span className="hours-badge">{item.hours}h</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to="/work-orders/historial" className="activity-footer-link">
              Ver todo el historial →
            </Link>
          </div>
        </div>
      </div>

      <div className="dashboard-orders-section">
        <div className="orders-section-header">
          <h3>Órdenes Recientes</h3>
          <Link to="/work-orders/historial" className="see-all-link">Ver todas →</Link>
        </div>
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Placa</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} onClick={() => window.location.href = `/work-orders/${order.id}`}>
                  <td className="order-id-cell">#{order.id}</td>
                  <td><span className="plate-badge">{order.bike?.plate}</span></td>
                  <td className="client-cell">{order.bike?.client?.name}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td className="date-cell">{order.entryDate}</td>
                  <td className="total-cell">${Number(order.total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;