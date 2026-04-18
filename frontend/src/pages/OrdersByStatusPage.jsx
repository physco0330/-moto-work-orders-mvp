import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, IconButton, Tooltip
} from '@mui/material';
import TableCards from '../components/TableCards';
import EmailIcon from '@mui/icons-material/Email';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useToast } from '../components/Toast';
import { downloadWorkOrderPDF } from '../utils/pdfGenerator';

const STATUS_MAP = {
  pendientes: 'RECIBIDA',
  proceso: 'EN_PROCESO',
  terminados: 'LISTA',
  historial: ['ENTREGADA', 'LISTA']
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState(null);
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const showActions = status === 'terminados';

  useEffect(() => { loadOrders(); }, [status, page, pageSize]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let param = { page, pageSize };
      if (status === 'historial') {
        param = { statusIn: 'LISTA,ENTREGADA' };
      } else if (STATUS_MAP[status]) {
        param.status = STATUS_MAP[status];
      }
      const { data } = await api.get('/work-orders', { params: param });
      setOrders(data.data || data.data?.data || []);
      setPagination(data.pagination || null);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => setPage(newPage);
  const handleRowsPerPageChange = (newPageSize) => { setPageSize(newPageSize); setPage(1); };

  const handleEmail = (order) => {
    success(`Enviando correo a ${order.bike?.client?.email || 'cliente'}`);
  };

  const handlePDF = async (order) => {
    try {
      const [checklistRes, systemItemsRes] = await Promise.all([
        api.get(`/work-orders/${order.id}/checklist`),
        api.get('/checklist-items')
      ]);
      const checklistItems = checklistRes.data?.data || checklistRes.data || [];
      const systemItems = systemItemsRes.data?.data || systemItemsRes.data || [];
      downloadWorkOrderPDF(order, checklistItems, systemItems);
      success('PDF generado correctamente');
    } catch (e) {
      showError('Error al generar PDF');
    }
  };

  const handleViewOrder = (order) => {
    navigate(`/work-orders/${order.id}`);
  };

  const renderOrderCard = (order) => (
    <Box onClick={() => handleViewOrder(order)} sx={{ cursor: 'pointer' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="caption" color="text.secondary">Orden</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>#{order.id}</Typography></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="caption" color="text.secondary">Placa</Typography><Chip label={order.bike?.plate || '-'} size="small" variant="outlined" /></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="caption" color="text.secondary">Estado</Typography><Chip label={order.status} color={STATUS_COLORS[order.status]} size="small" /></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="caption" color="text.secondary">Fecha</Typography><Typography variant="body2">{order.entryDate}</Typography></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}><Typography variant="caption" color="text.secondary">Total</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>${Number(order.total || 0).toFixed(2)}</Typography></Box>
      {showActions && (
        <Box sx={{ display: 'flex', gap: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'center' }}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEmail(order); }} sx={{ minWidth: 48, minHeight: 48 }}><EmailIcon /></IconButton>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handlePDF(order); }} sx={{ minWidth: 48, minHeight: 48 }}><PictureAsPdfIcon /></IconButton>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleViewOrder(order); }} sx={{ minWidth: 48, minHeight: 48 }}>👉</IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>{TITLE_MAP[status] || 'Órdenes'}</Typography>

      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 2, md: 2 } }}>
          <TableCards data={orders} pagination={pagination} onPageChange={handlePageChange} onRowsPerPageChange={handleRowsPerPageChange} loading={loading} renderItem={renderOrderCard} keyField="id">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                <TableCell sx={{ fontWeight: 600, width: 50 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 70 }}>Placa</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 70 }} align="right">Total</TableCell>
                {showActions && <TableCell sx={{ fontWeight: 600, width: 70 }} align="center">Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }} onClick={() => navigate(`/work-orders/${order.id}`)}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell><Chip label={order.bike?.plate || '-'} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} /></TableCell>
                  <TableCell><Chip label={order.status} color={STATUS_COLORS[order.status]} size="small" sx={{ fontWeight: 500, fontSize: '0.7rem' }} /></TableCell>
                  <TableCell>{order.entryDate}</TableCell>
                  <TableCell align="right">${Number(order.total || 0).toFixed(2)}</TableCell>
                  {showActions && (
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Email"><IconButton size="small" onClick={() => handleEmail(order)}><EmailIcon /></IconButton></Tooltip>
                      <Tooltip title="PDF"><IconButton size="small" onClick={() => handlePDF(order)}><PictureAsPdfIcon /></IconButton></Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </TableCards>
        </CardContent>
      </Card>
    </Box>
  );
}

export default OrdersByStatusPage;