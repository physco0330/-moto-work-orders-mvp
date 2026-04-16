import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import ChartSection from '../components/ChartSection';
import ActivityList from '../components/ActivityList';
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

  return (
    <div className="dashboard-new">
      <div className="dashboard-header">
        <h1>Panel Principal</h1>
        <p>Vista general del taller y actividad reciente</p>
      </div>

      <div className="stats-grid-new">
        <Link to="/work-orders/pendientes" className="stat-card-new stat-red">
          <div className="stat-card-icon">⏳</div>
          <div className="stat-card-content">
            <span className="stat-card-title">Pendientes</span>
            <span className="stat-card-value">{stats.pending}</span>
          </div>
        </Link>
        <Link to="/work-orders/proceso" className="stat-card-new stat-orange">
          <div className="stat-card-icon">🔧</div>
          <div className="stat-card-content">
            <span className="stat-card-title">En Proceso</span>
            <span className="stat-card-value">{stats.inProgress}</span>
          </div>
        </Link>
        <Link to="/work-orders/terminados" className="stat-card-new stat-green">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-content">
            <span className="stat-card-title">Terminados</span>
            <span className="stat-card-value">{stats.completed}</span>
          </div>
        </Link>
        <Link to="/pilotos" className="stat-card-new stat-blue">
          <div className="stat-card-icon">🏍️</div>
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
          <ActivityList activities={activities} />
        </div>
      </div>

      <div className="dashboard-orders-section">
        <div className="orders-section-header">
          <h3>Órdenes Recientes</h3>
          <Link to="/work-orders/historial" className="see-all-link">Ver todas →</Link>
        </div>
        <div className="orders-grid">
          {recentOrders.map(order => (
            <Link key={order.id} to={`/work-orders/${order.id}`} className="order-card-mini">
              <div className="order-card-header">
                <span className="order-id">#{order.id}</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="order-card-body">
                <span className="order-plate">{order.bike?.plate}</span>
                <span className="order-client">{order.bike?.client?.name}</span>
              </div>
              <div className="order-card-footer">
                <span>{order.entryDate}</span>
                <span className="order-total">${Number(order.total || 0).toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Link to="/work-orders/new" className="fab-button">
        <span>+</span>
      </Link>
    </div>
  );
}

export default DashboardPage;