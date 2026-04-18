import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Tooltip
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useToast } from '../components/Toast';

const STATUS_MAP = {
  pendientes: 'RECIBIDA',
  proceso: 'EN_PROCESO',
  terminados: 'LISTA',
  historial: 'ENTREGADA'
};

const TITLE_MAP = {
  pendientes: 'Órdenes Pendientes',
  proceso: 'Órdenes en Proceso',
  terminados: 'Órdenes Terminadas',
  historial: 'Historial'
};

const STATUS_COLORS = {
  RECIBIDA: 'warning',
  DIAGNOSTICO: 'info',
  EN_PROCESO: 'primary',
  LISTA: 'success',
  ENTREGADA: 'default',
  CANCELADA: 'error'
};

function OrdersByStatusPage() {
  const status = window.location.pathname.split('/').pop();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success } = useToast();
  const navigate = useNavigate();
  const showActions = status === 'terminados';

  useEffect(() => {
    loadOrders();
  }, [status]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const param = STATUS_MAP[status] ? { status: STATUS_MAP[status] } : {};
      const { data } = await api.get('/work-orders', { params: { ...param, pageSize: 100 } });
      setOrders(data?.data || data || []);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = (order) => {
    success(`Enviando correo a ${order.bike?.client?.email || 'cliente'}`);
  };

  const handlePDF = (order) => {
    success(`Generando PDF #${order.id}`);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        {TITLE_MAP[status] || 'Órdenes'}
      </Typography>

      {loading ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography>Cargando...</Typography>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Placa</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell>
                  {showActions && <TableCell sx={{ fontWeight: 600 }} align="center">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
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
                      <Chip label={order.status} color={STATUS_COLORS[order.status]} size="small" />
                    </TableCell>
                    <TableCell>{order.entryDate}</TableCell>
                    <TableCell align="right">${Number(order.total || 0).toFixed(2)}</TableCell>
                    {showActions && (
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Email">
                          <IconButton size="small" onClick={() => handleEmail(order)}>
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="PDF">
                          <IconButton size="small" onClick={() => handlePDF(order)}>
                            <PictureAsPdfIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={showActions ? 6 : 5} align="center" sx={{ py: 4 }}>
                      No hay órdenes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}

export default OrdersByStatusPage;