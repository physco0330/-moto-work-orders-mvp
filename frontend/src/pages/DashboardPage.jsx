import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TableSortLabel, Chip, TablePagination, Fab
} from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

const STATUS_COLORS = {
  RECIBIDA: 'warning',
  DIAGNOSTICO: 'info',
  EN_PROCESO: 'primary',
  LISTA: 'success',
  ENTREGADA: 'default',
  CANCELADA: 'error',
};

function DashboardPage() {
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0, activeClients: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/work-orders', { params: { pageSize: 100 } }),
        api.get('/clients', { params: { search: '' } })
      ]);
      
      const orders = ordersRes.data?.data || ordersRes.data || [];
      const workOrders = statsRes.data?.data || statsRes.data || [];
      
      setStats({
        pending: workOrders.filter(o => o.status === 'RECIBIDA').length,
        inProgress: workOrders.filter(o => o.status === 'EN_PROCESO').length,
        completed: workOrders.filter(o => o.status === 'LISTA' || o.status === 'ENTREGADA').length,
        activeClients: orders.length
      });
      
      setRecentOrders(Array.isArray(workOrders) ? workOrders.slice(0, 50) : []);
    } catch (e) {
      console.error('Error loading dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (sortKey) => {
    if (sortConfig.key === sortKey) {
      setSortConfig(sortConfig.direction === 'asc' ? { key: sortKey, direction: 'desc' } : { key: null, direction: null });
    } else {
      setSortConfig({ key: sortKey, direction: 'asc' });
    }
  };

  const sortedOrders = [...recentOrders].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return b.id - a.id;
    const aVal = getNestedValue(a, sortConfig.key) || '';
    const bVal = getNestedValue(b, sortConfig.key) || '';
    return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const statCards = [
    { title: 'Servicios Pendientes', value: stats.pending, icon: <PendingActionsIcon />, color: '#f59e0b', link: '/work-orders/pendientes' },
    { title: 'Servicios en Proceso', value: stats.inProgress, icon: <BuildIcon />, color: '#3b82f6', link: '/work-orders/proceso' },
    { title: 'Servicios Terminados', value: stats.completed, icon: <CheckCircleIcon />, color: '#22c55e', link: '/work-orders/terminados' },
    { title: 'Pilotos Activos', value: stats.activeClients, icon: <PeopleIcon />, color: '#8b5cf6', link: '/pilotos' },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((card, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card 
              component={Link} 
              to={card.link}
              sx={{ 
                textDecoration: 'none',
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                borderLeft: `4px solid ${card.color}`
              }}
            >
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {card.value}
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: `${card.color}20`,
                  color: card.color 
                }}>
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Órdenes Recientes
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel active={sortConfig.key === 'id'} direction={sortConfig.key === 'id' ? sortConfig.direction : 'asc'} onClick={() => handleSort('id')}>
                      ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Placa</TableCell>
                  <TableCell>
                    <TableSortLabel active={sortConfig.key === 'status'} direction={sortConfig.key === 'status' ? sortConfig.direction : 'asc'} onClick={() => handleSort('status')}>
                      Estado
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel active={sortConfig.key === 'entryDate'} direction={sortConfig.key === 'entryDate' ? sortConfig.direction : 'asc'} onClick={() => handleSort('entryDate')}>
                      Fecha
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                  <TableRow hover key={order.id} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/work-orders/${order.id}`)}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>
                      <Chip label={order.bike?.plate || '-'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={order.status} color={STATUS_COLORS[order.status] || 'default'} size="small" />
                    </TableCell>
                    <TableCell>{order.entryDate}</TableCell>
                    <TableCell align="right">${Number(order.total || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {!sortedOrders.length && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      No hay órdenes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            count={sortedOrders.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>

      <Fab 
        component={Link} 
        to="/work-orders/new"
        color="primary"
        sx={{ 
          position: 'fixed', 
          right: 16, 
          bottom: 16,
          borderRadius: 3,
          boxShadow: 4
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default DashboardPage;