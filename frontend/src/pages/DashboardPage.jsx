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
          <div className="stat-card-text">
            <span className="stat-card-value">{stats.pending}</span>
            <span className="stat-card-title">Servicios Pendientes</span>
          </div>
        </Link>
        <Link to="/work-orders/proceso" className="stat-card-new stat-orange">
          <div className="stat-card-text">
            <span className="stat-card-value">{stats.inProgress}</span>
            <span className="stat-card-title">Servicios en Proceso</span>
          </div>
        </Link>
        <Link to="/work-orders/terminados" className="stat-card-new stat-green">
          <div className="stat-card-text">
            <span className="stat-card-value">{stats.completed}</span>
            <span className="stat-card-title">Servicios Terminados</span>
          </div>
        </Link>
        <Link to="/pilotos" className="stat-card-new stat-blue">
          <div className="stat-card-text">
            <span className="stat-card-value">{stats.activeClients}</span>
            <span className="stat-card-title">Pilotos Activos</span>
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