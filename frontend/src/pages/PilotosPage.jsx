import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import {
  Box, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Fab, Grid, TableSortLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';

function PilotosPage() {
  const { success, error: showError } = useToast();
  const [pilotos, setPilotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [loadingAction, setLoadingAction] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [orderBy, setOrderBy] = useState('id');
  const [order, setOrder] = useState('desc');
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
      newErrors.email = 'El email debe tener un formato válido (ej: ejemplo@correo.com)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/clients');
      setPilotos(data.data || data);
    } catch (e) {
      showError('Error al cargar pilotos');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedPilotos = [...pilotos].sort((a, b) => {
    let aVal = a[orderBy] ?? '';
    let bVal = b[orderBy] ?? '';
    if (typeof aVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return order === 'asc' 
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setLoadingAction(true);
    try {
      await api.delete(`/clients/${deleteConfirm.id}`);
      setPilotos(pilotos.filter(p => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      success('Piloto eliminado');
    } catch (e) {
      showError(e.response?.data?.message || 'Error eliminando');
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

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        mb: 3, 
        flexWrap: 'wrap', 
        gap: 2 
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
            Pilotos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona los pilotos registrados en el taller
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setShowModal(true)}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          Nuevo Piloto
        </Button>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 1, md: 2 } }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 600, minWidth: 60 }}>
                    <TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={() => handleSort('id')}>
                      ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>
                    <TableSortLabel active={orderBy === 'name'} direction={orderBy === 'name' ? order : 'asc'} onClick={() => handleSort('name')}>
                      Nombre
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
                    <TableSortLabel active={orderBy === 'phone'} direction={orderBy === 'phone' ? order : 'asc'} onClick={() => handleSort('phone')}>
                      Teléfono
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 160 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 100 }} align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedPilotos.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>#{p.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        {p.name}
                      </Box>
                    </TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell>{p.email || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => navigate(`/pilotos/edit/${p.id}`)} sx={{ '&:hover': { bgcolor: '#e0e7ff' } }}>
                        <EditIcon fontSize="small" sx={{ color: '#6366f1' }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteConfirm({ id: p.id, name: p.name })} sx={{ '&:hover': { bgcolor: '#fee2e2' } }}>
                        <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!pilotos.length && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay pilotos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Nuevo Piloto</Typography>
          <IconButton onClick={() => setShowModal(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
            <TextField
              label="Nombre completo"
              value={form.name}
              onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
              fullWidth
              required
              autoFocus
              size="small"
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Teléfono"
              value={form.phone}
              onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
              fullWidth
              required
              size="small"
              error={!!errors.phone}
              helperText={errors.phone}
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
              fullWidth
              required
              size="small"
              error={!!errors.email}
              helperText={errors.email}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setShowModal(false)} color="inherit">Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleCreate} 
            disabled={loadingAction}
          >
            {loadingAction ? 'Creando...' : 'Crear Piloto'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>¿Eliminar piloto?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            ¿Estás seguro de eliminar a "{deleteConfirm?.name}"? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={loadingAction}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Fab 
        color="primary" 
        sx={{ 
          position: 'fixed', 
          right: 24, 
          bottom: 24,
          display: { xs: 'flex', sm: 'none' }
        }} 
        onClick={() => setShowModal(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default PilotosPage;