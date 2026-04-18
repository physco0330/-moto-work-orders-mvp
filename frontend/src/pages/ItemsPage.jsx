import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import {
  Box, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent as DialogContentMui, DialogActions, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Chip, Fab, Switch
} from '@mui/material';
import TableCards from '../components/TableCards';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

function ItemsPage() {
  const { success, error: showError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [loadingAction, setLoadingAction] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState(null);

  useEffect(() => { loadData(); }, [page, pageSize]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/checklist-items', { params: { page, pageSize } });
      setItems(data.data || data);
      setPagination(data.pagination || null);
    } catch (e) {
      showError('Error al cargar items');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => setPage(newPage);
  const handleRowsPerPageChange = (newPageSize) => { setPageSize(newPageSize); setPage(1); };

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleToggleActive = async (item) => {
    setLoadingAction(item.id);
    try {
      await api.put(`/checklist-items/${item.id}`, { active: !item.active });
      setItems(items.map(i => i.id === item.id ? { ...i, active: !i.active } : i));
      success(item.active ? `"${item.name}" desactivado` : `"${item.name}" activado`);
    } catch (e) {
      showError(e.response?.data?.message || 'Error actualizando');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setLoadingAction('deleting');
    try {
      await api.delete(`/checklist-items/${deleteConfirm.id}`);
      setItems(items.filter(i => i.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      success('Ítem eliminado');
    } catch (e) {
      showError(e.response?.data?.message || 'Error eliminando');
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

  const renderItemCard = (item) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" color="text.secondary">ID</Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>#{item.id}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" color="text.secondary">Nombre</Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.name}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="caption" color="text.secondary">Estado</Typography>
        <Chip label={item.active ? 'Activo' : 'Inactivo'} size="small" sx={{ bgcolor: item.active ? '#dcfce7' : '#f3f4f6', color: item.active ? '#16a34a' : '#6b7280', fontWeight: 500 }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'center' }}>
        <IconButton size="small" onClick={() => handleToggleActive(item)} disabled={loadingAction === item.id} sx={{ minWidth: 48, minHeight: 48 }}>
          {item.active ? <DeleteIcon /> : <EditIcon />}
        </IconButton>
        <IconButton size="small" onClick={() => setDeleteConfirm({ id: item.id, name: item.name })} sx={{ minWidth: 48, minHeight: 48, color: 'error.main' }}>
          <DeleteIcon />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box><Typography variant="h4" sx={{ fontWeight: 700 }}>Ítems</Typography><Typography variant="body2" color="text.secondary">Lista de verificación para servicios del taller</Typography></Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowModal(true)} sx={{ display: { xs: 'none', sm: 'flex' } }}>Nuevo Ítem</Button>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 2, md: 2 } }}>
          <TableCards data={items} pagination={pagination} onPageChange={handlePageChange} onRowsPerPageChange={handleRowsPerPageChange} loading={loading} renderItem={renderItemCard} keyField="id" onActivate={handleToggleActive} onDelete={(item) => setDeleteConfirm({ id: item.id, name: item.name })}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                <TableCell sx={{ fontWeight: 600, width: 50 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 80 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 100 }} align="center">Activar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell>#{item.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                  <TableCell><Chip label={item.active ? 'Activo' : 'Inactivo'} size="small" sx={{ bgcolor: item.active ? '#dcfce7' : '#f3f4f6', color: item.active ? '#16a34a' : '#6b7280', fontWeight: 500, fontSize: '0.7rem' }} /></TableCell>
                  <TableCell align="center"><Switch checked={item.active} onChange={() => handleToggleActive(item)} disabled={loadingAction === item.id} color="success" size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableCards>
        </CardContent>
      </Card>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Nuevo Ítem</Typography>
          <IconButton onClick={() => setShowModal(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContentMui dividers>
          <Box sx={{ py: 1 }}><TextField label="Nombre del ítem" value={form.name} onChange={e => setForm({ name: e.target.value })} fullWidth autoFocus size="small" placeholder="Ej: Revisión de motor" /></Box>
        </DialogContentMui>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setShowModal(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleCreate} disabled={loadingAction === 'creating' || !form.name.trim()}>{loadingAction === 'creating' ? 'Creando...' : 'Crear Ítem'}</Button>
        </DialogActions>
      </Dialog>

      <Fab color="primary" sx={{ position: 'fixed', right: 24, bottom: 24, display: { xs: 'flex', sm: 'none' } }} onClick={() => setShowModal(true)}><AddIcon /></Fab>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>¿Eliminar ítem?</DialogTitle>
        <DialogContentMui>
          <Typography variant="body2" color="text.secondary">
            ¿Estás seguro de eliminar "{deleteConfirm?.name}"? Esta acción no se puede deshacer.
          </Typography>
        </DialogContentMui>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={loadingAction === 'deleting'}>
            {loadingAction === 'deleting' ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ItemsPage;