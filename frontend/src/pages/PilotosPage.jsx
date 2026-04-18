import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import {
  Box, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent as DialogContentMui, DialogActions, IconButton, Chip, Fab,
  Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import TableCards from '../components/TableCards';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function PilotosPage() {
  const { success, error: showError } = useToast();
  const [pilotos, setPilotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [loadingAction, setLoadingAction] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!form.phone.trim()) newErrors.phone = 'El teléfono es requerido';
    if (!form.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'El email debe tener un formato válido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/clients', { params: { page, pageSize: 10 } });
      setPilotos(data.data || data);
      setPagination(data.pagination || null);
    } catch (e) {
      showError('Error al cargar pilotos');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setLoadingAction(true);
    try {
      await api.delete(`/clients/${deleteConfirm.id}`);
      setPilotos(pilotos.map(p => p.id === deleteConfirm.id ? { ...p, active: !p.active } : p));
      setDeleteConfirm(null);
      success('Piloto actualizado');
    } catch (e) {
      showError(e.response?.data?.message || 'Error actualizando');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setLoadingAction(true);
    try {
      const { data } = await api.post('/clients', form);
      setPilotos([...pilotos, data.data || data]);
      setForm({ name: '', phone: '', email: '' });
      setErrors({});
      setShowModal(false);
      success('Piloto creado exitosamente');
    } catch (e) {
      showError(e.response?.data?.message || 'Error creando');
    } finally {
      setLoadingAction(false);
    }
  };

  const renderPilotoCard = (p) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" color="text.secondary">Nombre</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.name}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" color="text.secondary">Teléfono</Typography>
        <Typography variant="body2">{p.phone}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" color="text.secondary">Email</Typography>
        <Typography variant="body2">{p.email || '-'}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">Estado</Typography>
        <Chip 
          label={p.active !== false ? 'Activo' : 'Inactivo'} 
          size="small" 
          sx={{ bgcolor: p.active !== false ? '#dcfce7' : '#f3f4f6', color: p.active !== false ? '#16a34a' : '#6b7280', fontWeight: 500 }} 
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>Pilotos</Typography>
          <Typography variant="body2" color="text.secondary">Gestiona los pilotos registrados en el taller</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowModal(true)} sx={{ display: { xs: 'none', sm: 'flex' } }}>Nuevo Piloto</Button>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 2, md: 2 } }}>
          <TableCards data={pilotos} pagination={pagination} onPageChange={handlePageChange} loading={loading}
            onEdit={(p) => navigate(`/pilotos/edit/${p.id}`)} onDelete={(p) => setDeleteConfirm({ id: p.id, name: p.name })}
            renderItem={renderPilotoCard} keyField="id">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                <TableCell sx={{ fontWeight: 600, width: 50 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 110 }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 80 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 80 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pilotos.map((p) => (
                <TableRow key={p.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell>#{p.id}</TableCell>
                  <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PersonIcon sx={{ fontSize: 16 }} />{p.name}</Box></TableCell>
                  <TableCell>{p.phone}</TableCell>
                  <TableCell>{p.email || '-'}</TableCell>
                  <TableCell><Chip label={p.active !== false ? 'Activo' : 'Inactivo'} size="small" sx={{ bgcolor: p.active !== false ? '#dcfce7' : '#f3f4f6', color: p.active !== false ? '#16a34a' : '#6b7280', fontWeight: 500, fontSize: '0.7rem' }} /></TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <IconButton size="small" onClick={() => navigate(`/pilotos/edit/${p.id}`)}><EditIcon /></IconButton>
                      <IconButton size="small" onClick={() => setDeleteConfirm({ id: p.id, name: p.name })}>{p.active !== false ? <DeleteIcon /> : <CheckCircleIcon />}</IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableCards>
        </CardContent>
      </Card>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Nuevo Piloto</Typography>
          <IconButton onClick={() => setShowModal(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContentMui dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
            <TextField label="Nombre completo" value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }} fullWidth required autoFocus size="small" error={!!errors.name} helperText={errors.name} />
            <TextField label="Teléfono" value={form.phone} onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }} fullWidth required size="small" error={!!errors.phone} helperText={errors.phone} />
            <TextField label="Email" type="email" value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }} fullWidth required size="small" error={!!errors.email} helperText={errors.email} />
          </Box>
        </DialogContentMui>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setShowModal(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleCreate} disabled={loadingAction}>{loadingAction ? 'Creando...' : 'Crear Piloto'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{pilotos.find(p => p.id === deleteConfirm?.id)?.active !== false ? '¿Desactivar piloto?' : '¿Activar piloto?'}</DialogTitle>
        <DialogContentMui>
          <Typography variant="body2" color="text.secondary">¿Estás seguro de {pilotos.find(p => p.id === deleteConfirm?.id)?.active !== false ? 'desactivar' : 'activar'} a "{deleteConfirm?.name}"?</Typography>
        </DialogContentMui>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleDelete} disabled={loadingAction} color={pilotos.find(p => p.id === deleteConfirm?.id)?.active !== false ? 'error' : 'success'}>
            {pilotos.find(p => p.id === deleteConfirm?.id)?.active !== false ? 'Desactivar' : 'Activar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Fab color="primary" sx={{ position: 'fixed', right: 24, bottom: 24, display: { xs: 'flex', sm: 'none' } }} onClick={() => setShowModal(true)}><AddIcon /></Fab>
    </Box>
  );
}

export default PilotosPage;