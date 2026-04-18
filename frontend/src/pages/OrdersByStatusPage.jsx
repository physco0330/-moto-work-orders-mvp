import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TableSortLabel, Typography, Chip, IconButton, Tooltip, TablePagination,
  TableFooter
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

const STATUS_MAP = {
  pendientes: 'RECIBIDA',
  proceso: 'EN_PROCESO',
  terminados: 'LISTA',
  historial: 'ENTREGADA',
};

const TITLE_MAP = {
  pendientes: 'Órdenes Pendientes',
  proceso: 'Órdenes en Proceso',
  terminados: 'Órdenes Terminadas',
  historial: 'Historial de Órdenes',
};

const STATUS_COLORS = {
  RECIBIDA: 'warning',
  DIAGNOSTICO: 'info',
  EN_PROCESO: 'primary',
  LISTA: 'success',
  ENTREGADA: 'default',
  CANCELADA: 'error',
};

function OrdersByStatusPage() {
  const { status } = React.useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return { status: params.get('status') };
  }, []);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const { success, error: showError } = useToast();
  const [viewOrder, setViewOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const showActions = status === 'terminados';

  const load = async () => {
    setLoading(true);
    try {
      let param = {};
      if (status) param.status = STATUS_MAP[status];
      const { data } = await api.get('/work-orders', { params: { ...param, pageSize: 100 } });
      const ordersData = data?.data || data;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Error cargando órdenes');
      showError('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const handleSort = (sortKey) => {
    if (sortConfig.key === sortKey) {
      if (sortConfig.direction === 'asc') {
        setSortConfig({ key: sortKey, direction: 'desc' });
      } else {
        setSortConfig({ key: null, direction: null });
      }
    } else {
      setSortConfig({ key: sortKey, direction: 'asc' });
    }
  };

  const sortedOrders = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return orders;
    return [...orders].sort((a, b) => {
      const aVal = getNestedValue(a, sortConfig.key) || '';
      const bVal = getNestedValue(b, sortConfig.key) || '';
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [orders, sortConfig]);

  const handleView = async (order) => {
    setLoadingAction('view');
    try {
      const [orderRes, checklistRes, transitionsRes] = await Promise.all([
        api.get(`/work-orders/${order.id}`),
        api.get(`/work-orders/${order.id}/checklist`),
        api.get(`/work-orders/${order.id}/transitions`)
      ]);
      setOrderDetails({
        ...orderRes.data,
        checklistItems: checklistRes.data || [],
        allowed: transitionsRes.data?.allowed || []
      });
      setViewOrder(order);
    } catch (e) {
      showError('Error cargando detalles');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEmail = (order) => {
    success(`Enviando reporte por correo a ${order.bike?.client?.email || 'cliente'}`);
  };

  const handlePDF = (order) => {
    success(`Generando PDF para orden #${order.id}`);
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {TITLE_MAP[status] || 'Órdenes'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lista de órdenes según su estado
          </Typography>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography>Cargando...</Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 2, color: 'error.main', mb: 2 }}>
          {error}
        </Box>
      )}

      {!loading && !error && (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 1 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel active={sortConfig.key === 'id'} direction={sortConfig.key === 'id' ? sortConfig.direction : 'asc'} onClick={() => handleSort('id')}>
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sortConfig.key === 'bike.plate'} direction={sortConfig.key === 'bike.plate' ? sortConfig.direction : 'asc'} onClick={() => handleSort('bike.plate')}>
                    Placa
                  </TableSortLabel>
                </TableCell>
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
                <TableCell align="right">
                  <TableSortLabel active={sortConfig.key === 'total'} direction={sortConfig.key === 'total' ? sortConfig.direction : 'asc'} onClick={() => handleSort('total')}>
                    Total
                  </TableSortLabel>
                </TableCell>
                {showActions && <TableCell align="center">Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                <TableRow key={order.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/work-orders/${order.id}`)}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    <Chip label={order.bike?.plate || '-'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={order.status} color={STATUS_COLORS[order.status] || 'default'} size="small" />
                  </TableCell>
                  <TableCell>{order.entryDate}</TableCell>
                  <TableCell align="right">${Number(order.total || 0).toFixed(2)}</TableCell>
                  {showActions && (
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Enviar correo">
                        <IconButton size="small" onClick={() => handleEmail(order)} sx={{ color: 'primary.main' }}>
                          <EmailIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Generar PDF">
                        <IconButton size="small" onClick={() => handlePDF(order)} sx={{ color: 'error.main' }}>
                          <PictureAsPdfIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {!sortedOrders.length && (
                <TableRow>
                  <TableCell colSpan={showActions ? 6 : 5} align="center" sx={{ py: 4 }}>
                    No hay órdenes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  count={orders.length}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default OrdersByStatusPage;