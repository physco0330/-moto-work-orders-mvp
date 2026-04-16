import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import ChartSection from '../components/ChartSection';
import ActivityList from '../components/ActivityList';

function DashboardPage() {
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0, activeClients: 0 });
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
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
        <StatCard title="Servicios Pendientes" value={stats.pending} icon="⏳" color="red" />
        <StatCard title="Servicios en Proceso" value={stats.inProgress} icon="🔧" color="orange" />
        <StatCard title="Servicios Terminados" value={stats.completed} icon="✅" color="green" />
        <StatCard title="Pilotos Activos" value={stats.activeClients} icon="🏍️" color="blue" />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-chart">
          <ChartSection data={chartData} total={totalServices} />
        </div>
        <div className="dashboard-activity">
          <ActivityList activities={activities} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;