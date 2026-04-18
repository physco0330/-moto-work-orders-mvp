import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button
} from '@mui/material';
import TableCards from '../components/TableCards';
import EmailIcon from '@mui/icons-material/Email';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import UndoIcon from '@mui/icons-material/Undo';
import { useToast } from '../components/Toast';
import { downloadWorkOrderPDF } from '../utils/pdfGenerator';
import { ConfirmDialog } from '../components/ConfirmDialog';

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

const REGRESS_MAP = {
  LISTA: { to: 'EN_PROCESO', label: 'Devolver a Proceso' },
  EN_PROCESO: { to: 'RECIBIDA', label: 'Devolver a Pendiente' },
  DIAGNOSTICO: { to: 'RECIBIDA', label: 'Devolver a Pendiente' }
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
  const [emailConfirm, setEmailConfirm] = useState(null);
  const [pdfConfirm, setPdfConfirm] = useState(null);
  const [regressConfirm, setRegressConfirm] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

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

  const handleEmailClick = (order) => {
    setEmailConfirm(order);
  };

  const handleEmailSend = async () => {
    const order = emailConfirm;
    setEmailConfirm(null);
    setLoadingAction('email-' + order.id);
    try {
      await api.post('/email/send-work-order-notification', {
        orderId: order.id,
        emailType: 'status_update'
      });
      success(`Email enviado a ${order.bike?.client?.email || 'cliente'}`);
    } catch (e) {
      showError(e.response?.data?.message || 'Error enviando email');
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePDFClick = (order) => {
    setPdfConfirm(order);
  };

  const handlePDF = async () => {
    const order = pdfConfirm;
    setPdfConfirm(null);
    setLoadingAction('pdf-' + order.id);
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
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRegressStatus = (order) => {
    setRegressConfirm(order);
  };

  const handleRegressConfirm = async () => {
    const order = regressConfirm;
    setRegressConfirm(null);
    const regress = REGRESS_MAP[order.status];
    if (!regress) return;
    setLoadingAction('regress-' + order.id);
    try {
      await api.patch(`/work-orders/${order.id}/status`, { toStatus: regress.to });
      success(`Estado cambiado a ${regress.to}`);
      await loadOrders();
    } catch (e) {
      showError(e.response?.data?.message || 'Error al cambiar estado');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleViewOrder = (order) => {
    navigate(`/work-orders/${order.id}`);
  };

  const canShowActions = (order) => {
    return order.status === 'LISTA' || order.status === 'EN_PROCESO' || order.status === 'DIAGNOSTICO';
  };

  const renderOrderCard = (order) => (
    <Box onClick={() => handleViewOrder(order)} sx={{ cursor: 'pointer' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="caption" color="text.secondary">Orden</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>#{order.id}</Typography></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="caption" color="text.secondary">Placa</Typography><Chip label={order.bike?.plate || '-'} size="small" variant="outlined" /></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="caption" color="text.secondary">Estado</Typography><Chip label={order.status} color={STATUS_COLORS[order.status]} size="small" /></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="caption" color="text.secondary">Fecha</Typography><Typography variant="body2">{order.entryDate}</Typography></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}><Typography variant="caption" color="text.secondary">Total</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>${Number(order.total || 0).toFixed(2)}</Typography></Box>
      {canShowActions(order) && (
        <Box sx={{ display: 'flex', gap: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'center' }}>
          {order.status === 'LISTA' && (
            <>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEmailClick(order); }} disabled={loadingAction === 'email-' + order.id} sx={{ minWidth: 48, minHeight: 48 }}><EmailIcon /></IconButton>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handlePDFClick(order); }} disabled={loadingAction === 'pdf-' + order.id} sx={{ minWidth: 48, minHeight: 48 }}><PictureAsPdfIcon /></IconButton>
            </>
          )}
          {REGRESS_MAP[order.status] && (
            <Tooltip title={REGRESS_MAP[order.status].label}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleRegressStatus(order); }} disabled={loadingAction === 'regress-' + order.id} sx={{ minWidth: 48, minHeight: 48, color: '#f59e0b' }}><UndoIcon /></IconButton>
            </Tooltip>
          )}
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
                <TableCell sx={{ fontWeight: 600, width: 100 }} align="center">Acciones</TableCell>
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
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    {order.status === 'LISTA' && (
                      <>
                        <Tooltip title="Enviar Email"><IconButton size="small" onClick={() => handleEmailClick(order)} disabled={loadingAction === 'email-' + order.id}><EmailIcon /></IconButton></Tooltip>
                        <Tooltip title="Generar PDF"><IconButton size="small" onClick={() => handlePDFClick(order)} disabled={loadingAction === 'pdf-' + order.id}><PictureAsPdfIcon /></IconButton></Tooltip>
                      </>
                    )}
                    {REGRESS_MAP[order.status] && (
                      <Tooltip title={REGRESS_MAP[order.status].label}>
                        <IconButton size="small" onClick={() => handleRegressStatus(order)} disabled={loadingAction === 'regress-' + order.id} sx={{ color: '#f59e0b' }}><UndoIcon /></IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableCards>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={!!emailConfirm}
        onConfirm={handleEmailSend}
        onCancel={() => setEmailConfirm(null)}
        title="Enviar Email"
        message={`¿Enviar notificación por email a ${emailConfirm?.bike?.client?.email || 'cliente'}?`}
        confirmText="Enviar"
        type="info"
      />

      <ConfirmDialog
        isOpen={!!pdfConfirm}
        onConfirm={handlePDF}
        onCancel={() => setPdfConfirm(null)}
        title="Generar PDF"
        message={`¿Generar PDF para la orden #${pdfConfirm?.id}?`}
        confirmText="Generar"
        type="info"
      />

      <ConfirmDialog
        isOpen={!!regressConfirm}
        onConfirm={handleRegressConfirm}
        onCancel={() => setRegressConfirm(null)}
        title={REGRESS_MAP[regressConfirm?.status]?.label || 'Devolver estado'}
        message={`¿Devolver la orden #${regressConfirm?.id} de ${regressConfirm?.status} a ${REGRESS_MAP[regressConfirm?.status]?.to}?`}
        confirmText="Confirmar"
        type="warning"
      />
    </Box>
  );
}

export default OrdersByStatusPage;