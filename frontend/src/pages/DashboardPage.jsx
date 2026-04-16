import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Chart from 'chart.js/auto';

function DashboardPage() {
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0, activeClients: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (chartData.length > 0 && !loading) {
      renderChart();
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData, loading]);

  const loadDashboardData = async () => {
    try {
      // Get orders for stats
      const ordersRes = await api.get('/work-orders', { params: { pageSize: 100 } });
      const orders = ordersRes.data.data || [];
      
      // Calculate stats
      const pending = orders.filter(o => o.status === 'RECIBIDA').length;
      const inProgress = orders.filter(o => ['DIAGNOSTICO', 'EN_PROCESO'].includes(o.status)).length;
      const completed = orders.filter(o => ['LISTA', 'ENTREGADA'].includes(o.status)).length;
      
      // Get unique clients
      const clientIds = new Set(orders.map(o => o.bike?.clientId).filter(Boolean));
      
      setStats({ pending, inProgress, completed, activeClients: clientIds.size });

      // Generate last 7 days chart data
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

      // Recent activity (last 5 orders)
      setRecentActivity(orders.slice(0, 5));

    } catch (e) {
      console.error('Error loading dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.map(d => d.day),
        datasets: [{
          label: 'Servicios',
          data: chartData.map(d => d.count),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2563eb',
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { grid: { display: false } }
        }
      }
    });
  };

  if (loading) {
    return <div className="content center">Cargando...</div>;
  }

  return (
    <div className="content-grid">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-label">Pendientes</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>
        <div className="stat-card stat-progress">
          <div className="stat-icon">🔧</div>
          <div className="stat-info">
            <span className="stat-label">En Proceso</span>
            <span className="stat-value">{stats.inProgress}</span>
          </div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-label">Terminados</span>
            <span className="stat-value">{stats.completed}</span>
          </div>
        </div>
        <div className="stat-card stat-clients">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-label">Pilotos</span>
            <span className="stat-value">{stats.activeClients}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card chart-card">
        <div className="card-header">
          <h3>Tendencia de servicios</h3>
          <span className="badge">Últimos 7 días</span>
        </div>
        <div className="chart-container">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/work-orders/new" className="action-button primary">
          <span className="action-icon">➕</span>
          <span>Nueva Orden</span>
        </Link>
        <Link to="/work-orders?status=RECIBIDA" className="action-button">
          <span className="action-icon">📋</span>
          <span>Pendientes</span>
        </Link>
        <Link to="/work-orders?status=EN_PROCESO" className="action-button">
          <span className="action-icon">🔧</span>
          <span>En Proceso</span>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3>Actividad Reciente</h3>
        </div>
        <div className="activity-list">
          {recentActivity.map(order => (
            <Link key={order.id} to={`/work-orders/${order.id}`} className="activity-item">
              <div className="activity-info">
                <span className="activity-plate">{order.bike?.plate || 'Sin placa'}</span>
                <span className="activity-client">{order.bike?.client?.name || 'Sin cliente'}</span>
              </div>
              <StatusBadge status={order.status} />
            </Link>
          ))}
          {recentActivity.length === 0 && (
            <p className="muted" style={{ padding: 20, textAlign: 'center' }}>No hay actividad reciente</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;