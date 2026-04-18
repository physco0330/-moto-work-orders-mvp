import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import {
  Box, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Fab, Switch, FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';

function ItemsPage() {
  const { success, error: showError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [loadingAction, setLoadingAction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/checklist-items');
      setItems(data.data || data);
    } catch (e) {
      showError('Error al cargar items');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (item) => {
    setLoadingAction(item.id);
    try {
      await api.put(`/checklist-items/${item.id}`, { active: !item.active });
      setItems(items.map(i => i.id === item.id ? { ...i, active: !i.active } : i));
      success(item.active ? ` "${item.name}" desactivado` : ` "${item.name}" activado`);
    } catch (e) {
      showError(e.response?.data?.message || 'Error actualizando');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setLoadingAction('creating');
    try {
      const { data } = await api.post('/checklist-items', { name: form.name });
      setItems([...items, data.data || data]);
      setForm({ name: '' });
      setShowModal(false);
      success('Ítem creado exitosamente');
    } catch (e) {
      showError(e.response?.data?.message || 'Error creando');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Ítems</Typography>
          <Typography variant="body2" color="text.secondary">Lista de verificación para servicios del taller</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowModal(true)}>
          Nuevo Ítem
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
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Activar/Desactivar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>#{item.id}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.active ? 'Activo' : 'Inactivo'} 
                        size="small" 
                        sx={{ 
                          bgcolor: item.active ? '#dcfce7' : '#f3f4f6', 
                          color: item.active ? '#16a34a' : '#6b7280'
                        }} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={item.active}
                        onChange={() => handleToggleActive(item)}
                        disabled={loadingAction === item.id}
                        color="success"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {!items.length && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay items registrados
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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Nuevo Ítem</Typography>
          <IconButton onClick={() => setShowModal(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Nombre del ítem"
              value={form.name}
              onChange={e => setForm({ name: e.target.value })}
              fullWidth
              autoFocus
              placeholder="Ej: Revisión de motor"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate} disabled={loadingAction === 'creating' || !form.name.trim()}>
            {loadingAction === 'creating' ? 'Creando...' : 'Crear Ítem'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>¿Eliminar ítem?</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de eliminar "{deleteConfirm?.name}"? Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={() => {}} disabled={loadingAction}>
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

export default ItemsPage;