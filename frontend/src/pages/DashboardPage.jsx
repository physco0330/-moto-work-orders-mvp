import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Fab, Chip
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AddIcon from '@mui/icons-material/Add';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
      
      setOrders(allOrders);
      setChartData(last7Days);
      setStats({
        pending: allOrders.filter(o => o.status === 'RECIBIDA').length,
        inProgress: allOrders.filter(o => o.status === 'EN_PROCESO').length,
        completed: allOrders.filter(o => o.status === 'LISTA' || o.status === 'ENTREGADA').length,
        activeClients: allClients.length
      });
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      RECIBIDA: 'warning',
      DIAGNOSTICO: 'info',
      EN_PROCESO: 'primary',
      LISTA: 'success',
      ENTREGADA: 'default',
      CANCELADA: 'error'
    };
    return colors[status] || 'default';
  };

  const statCards = [
    { title: 'Pendientes', value: stats.pending, icon: <PendingIcon />, color: '#f59e0b', bg: '#fef3c7', link: '/work-orders/pendientes' },
    { title: 'En Proceso', value: stats.inProgress, icon: <BuildIcon />, color: '#3b82f6', bg: '#dbeafe', link: '/work-orders/proceso' },
    { title: 'Terminados', value: stats.completed, icon: <CheckCircleIcon />, color: '#22c55e', bg: '#dcfce7', link: '/work-orders/terminados' },
    { title: 'Pilotos', value: stats.activeClients, icon: <PeopleIcon />, color: '#8b5cf6', bg: '#ede9fe', link: '/pilotos' }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Card 
              component={Link}
              to={card.link}
              sx={{ 
                textDecoration: 'none',
                borderRadius: 3,
                borderLeft: `4px solid ${card.color}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }
              }}
            >
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {card.value}
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: card.bg,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {React.cloneElement(card.icon, { sx: { fontSize: 28 } })}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Tendencia de Servicios - Últimos 7 Días
          </Typography>
          <Box sx={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [value, 'Servicios']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                />
                <Bar dataKey="count" name="Servicios" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#6366f1" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Órdenes Recientes
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Placa</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.slice(0, 10).map((order) => (
                  <TableRow 
                    key={order.id} 
                    hover 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/work-orders/${order.id}`)}
                  >
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>
                      <Chip label={order.bike?.plate || '-'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={order.status} color={getStatusColor(order.status)} size="small" />
                    </TableCell>
                    <TableCell>{order.entryDate}</TableCell>
                    <TableCell align="right">${Number(order.total || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay órdenes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Fab 
        component={Link} 
        to="/work-orders/new"
        color="primary"
        sx={{ position: 'fixed', right: 24, bottom: 24 }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default DashboardPage;