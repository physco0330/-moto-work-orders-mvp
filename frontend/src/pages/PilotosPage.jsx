import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import {
  Box, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Fab, Grid
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
  const [loadingAction, setLoadingAction] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

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
    if (!form.name.trim() || !form.phone.trim()) return;
    setLoadingAction(true);
    try {
      const { data } = await api.post('/clients', form);
      setPilotos([...pilotos, data.data || data]);
      setForm({ name: '', phone: '', email: '' });
      setShowModal(false);
      success('Piloto creado exitosamente');
    } catch (e) {
      showError(e.response?.data?.message || 'Error creando');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Pilotos</Typography>
          <Typography variant="body2" color="text.secondary">Gestiona los pilotos registrados en el taller</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowModal(true)}>
          Nuevo Piloto
        </Button>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Teléfono</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pilotos.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>#{p.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        {p.name}
                      </Box>
                    </TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell>{p.email || '-'}</TableCell>
                    <TableCell>
                      <Chip label="Activo" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a' }} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => navigate(`/pilotos/edit/${p.id}`)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteConfirm({ id: p.id, name: p.name })}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!pilotos.length && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay pilotos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Nuevo Piloto</Typography>
          <IconButton onClick={() => setShowModal(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nombre"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              fullWidth
              required
              autoFocus
            />
            <TextField
              label="Teléfono"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate} disabled={loadingAction || !form.name.trim() || !form.phone.trim()}>
            {loadingAction ? 'Creando...' : 'Crear Piloto'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>¿Eliminar piloto?</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de eliminar a "{deleteConfirm?.name}"? Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={loadingAction}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Fab color="primary" sx={{ position: 'fixed', right: 24, bottom: 24 }} onClick={() => setShowModal(true)}>
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default PilotosPage;