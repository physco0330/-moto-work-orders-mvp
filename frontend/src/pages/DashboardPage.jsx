import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, IconButton, Tooltip, Avatar
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/PendingActions';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const STATUS_LABELS = {
  RECIBIDA: 'Pendiente',
  DIAGNOSTICO: 'Diagnóstico',
  EN_PROCESO: 'En Proceso',
  LISTA: 'Terminada',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada'
};

const STATUS_COLORS_MAP = {
  RECIBIDA: '#f59e0b',
  DIAGNOSTICO: '#8b5cf6',
  EN_PROCESO: '#3b82f6',
  LISTA: '#22c55e',
  ENTREGADA: '#06b6d4',
  CANCELADA: '#ef4444'
};

function DashboardPage() {
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0, activeClients: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, clientsRes] = await Promise.all([
        api.get('/work-orders', { params: { pageSize: 100 } }),
        api.get('/clients')
      ]);
      
      const allOrders = ordersRes.data?.data || ordersRes.data || [];
      const allClients = clientsRes.data?.data || clientsRes.data || [];
      
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('es', { weekday: 'short' });
        last7Days.push({ date: dateStr, day: dayName, count: 0 });
      }
      
      allOrders.forEach(order => {
        if (order.entryDate) {
          const orderDate = order.entryDate.split('T')[0];
          const dayData = last7Days.find(d => d.date === orderDate);
          if (dayData) dayData.count++;
        }
      });
      
      const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

      setOrders(allOrders);
      setChartData(last7Days);
      setStats({
        pending: allOrders.filter(o => o.status === 'RECIBIDA').length,
        inProgress: allOrders.filter(o => o.status === 'EN_PROCESO').length,
        completed: allOrders.filter(o => o.status === 'LISTA' || o.status === 'ENTREGADA').length,
        activeClients: allClients.length,
        totalRevenue
      });
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Pendientes', 
      value: stats.pending, 
      icon: <PendingIcon sx={{ fontSize: 28 }} />, 
      color: '#f59e0b', 
      bg: '#fffbeb', 
      border: '#fde68a',
      link: '/work-orders/pendientes',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    { 
      title: 'En Proceso', 
      value: stats.inProgress, 
      icon: <BuildIcon sx={{ fontSize: 28 }} />, 
      color: '#3b82f6', 
      bg: '#eff6ff', 
      border: '#bfdbfe',
      link: '/work-orders/proceso',
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    },
    { 
      title: 'Terminados', 
      value: stats.completed, 
      icon: <CheckCircleIcon sx={{ fontSize: 28 }} />, 
      color: '#22c55e', 
      bg: '#f0fdf4', 
      border: '#bbf7d0',
      link: '/work-orders/terminados',
      gradient: 'linear-gradient(135deg, #22c55e, #16a34a)'
    },
    { 
      title: 'Pilotos', 
      value: stats.activeClients, 
      icon: <PeopleIcon sx={{ fontSize: 28 }} />, 
      color: '#8b5cf6', 
      bg: '#f5f3ff', 
      border: '#ddd6fe',
      link: '/pilotos',
      gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
    }
  ];

  const recentOrders = orders.slice(0, 8);

  return (
    <Box className="dashboard-new">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Panel Principal
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Vista general del taller y actividad reciente
          </Typography>
        </Box>
        <button 
          className="fab-button-top"
          onClick={() => navigate('/work-orders/new')}
          style={{ position: 'relative', top: 0, right: 0 }}
        >
          <AddIcon sx={{ fontSize: 20 }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Nueva Orden</span>
        </button>
      </Box>

      <div className="stats-grid-new">
        {statCards.map((card, i) => (
          <Link 
            key={i} 
            to={card.link} 
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div className={`stat-card-new ${['stat-orange', 'stat-blue', 'stat-green', 'stat-blue'][i]}`}
              style={{ borderLeftColor: card.color, borderLeftWidth: 4, borderLeftStyle: 'solid' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box sx={{
                  width: 52, height: 52, borderRadius: 3, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', bgcolor: card.bg,
                  color: card.color, boxShadow: `0 4px 12px ${card.color}22`
                }}>
                  {card.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.85rem' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2, mt: 0.5 }}>
                    {card.value}
                  </Typography>
                </Box>
                <ArrowForwardIcon sx={{ color: '#cbd5e1', fontSize: 20 }} />
              </Box>
            </div>
          </Link>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-chart">
          <div className="chart-header">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Tendencia de Servicios
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                Últimos 7 días
              </Typography>
            </Box>
            <div className="chart-total">
              Total: {chartData.reduce((sum, d) => sum + d.count, 0)} servicios
            </div>
          </div>
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: 13 
                  }}
                  formatter={(value) => [value, 'Servicios']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                />
                <Bar dataKey="count" name="Servicios" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#2563eb' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </div>

        <div className="dashboard-activity">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Actividad Reciente
            </Typography>
            <div className="activity-filter">Hoy</div>
          </Box>
          <div className="activity-list-items">
            {orders.slice(0, 6).map((order) => (
              <div 
                key={order.id} 
                className="activity-item-new"
                onClick={() => navigate(`/work-orders/${order.id}`)}
              >
                <div className="activity-item-icon" style={{
                  background: order.status === 'LISTA' || order.status === 'ENTREGADA' 
                    ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' 
                    : order.status === 'EN_PROCESO' 
                      ? 'linear-gradient(135deg, #dbeafe, #bfdbfe)'
                      : 'linear-gradient(135deg, #fef3c7, #fde68a)'
                }}>
                  {order.status === 'LISTA' || order.status === 'ENTREGADA' 
                    ? <CheckCircleIcon sx={{ fontSize: 22, color: '#22c55e' }} />
                    : order.status === 'EN_PROCESO' 
                      ? <BuildIcon sx={{ fontSize: 22, color: '#3b82f6' }} />
                      : <PendingIcon sx={{ fontSize: 22, color: '#f59e0b' }} />
                  }
                </div>
                <div className="activity-item-info">
                  <div className="activity-item-name">
                    #{order.id} - {order.bike?.plate || '-'}
                  </div>
                  <div className="activity-item-desc">
                    {order.bike?.brand} {order.bike?.model} · {STATUS_LABELS[order.status] || order.status}
                  </div>
                </div>
                <div style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: `${STATUS_COLORS_MAP[order.status]}18`,
                  color: STATUS_COLORS_MAP[order.status]
                }}>
                  {STATUS_LABELS[order.status] || order.status}
                </div>
              </div>
            ))}
            {orders.length === 0 && !loading && (
              <Box sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>
                <Typography variant="body2">No hay órdenes recientes</Typography>
              </Box>
            )}
          </div>
          <Link to="/work-orders/historial" style={{ textDecoration: 'none' }}>
            <div className="activity-list-footer">
              Ver todas las órdenes →
            </div>
          </Link>
        </div>
      </div>

      <div className="dashboard-orders-section">
        <div className="orders-section-header">
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Órdenes Recientes
          </Typography>
          <Link to="/work-orders/historial" className="see-all-link" style={{ textDecoration: 'none' }}>
            Ver todas →
          </Link>
        </div>
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Piloto</th>
                <th>Placa</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} onClick={() => navigate(`/work-orders/${order.id}`)}>
                  <td className="order-id-cell">#{order.id}</td>
                  <td className="client-cell">{order.bike?.client?.name || order.pilotName || '-'}</td>
                  <td><span className="plate-badge">{order.bike?.plate || '-'}</span></td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: `${STATUS_COLORS_MAP[order.status]}18`,
                      color: STATUS_COLORS_MAP[order.status]
                    }}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="date-cell">{order.entryDate ? new Date(order.entryDate).toLocaleDateString('es') : '-'}</td>
                  <td className="total-cell">${Number(order.total || 0).toFixed(2)}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                    No hay órdenes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Box sx={{ 
        position: 'fixed', 
        bottom: { xs: 90, md: 24 }, 
        right: 24, 
        zIndex: 50 
      }}>
        <button 
          className="fab-button"
          onClick={() => navigate('/work-orders/new')}
        >
          +
        </button>
      </Box>
    </Box>
  );
}

export default DashboardPage;