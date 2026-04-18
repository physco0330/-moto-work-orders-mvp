import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import {
  Box, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent as DialogContentMui, DialogActions, IconButton, Chip, Fab,
  FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import TableCards from '../components/TableCards';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

function MotocicletasPage() {
  const { success, error: showError } = useToast();
  const [motos, setMotos] = useState([]);
  const [pilotos, setPilotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filterPilot, setFilterPilot] = useState('');
  const [form, setForm] = useState({ brand: '', plate: '', model: '', year: '', hours: '', clientId: '' });
  const [loadingAction, setLoadingAction] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState(null);

  useEffect(() => { loadData(); }, [page, pageSize, filterPilot]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize };
      if (filterPilot) params.clientId = filterPilot;
      const [bikesRes, clientsRes] = await Promise.all([
        api.get('/bikes', { params }),
        api.get('/clients')
      ]);
      setMotos(bikesRes.data.data || bikesRes.data);
      setPagination(bikesRes.data.pagination || null);
      setPilotos(clientsRes.data.data || clientsRes.data);
    } catch (e) { showError('Error al cargar datos'); }
    finally { setLoading(false); }
  };

  const handlePageChange = (newPage) => setPage(newPage);
  const handleRowsPerPageChange = (newPageSize) => { setPageSize(newPageSize); setPage(1); };

  const openNew = () => { setEditando(null); setForm({ brand: '', plate: '', model: '', year: '', hours: '', clientId: '' }); setShowModal(true); };
  const openEdit = (moto) => { setEditando(moto); setForm({ brand: moto.brand || '', plate: moto.plate || '', model: moto.model || '', year: moto.year || '', hours: moto.hours || '', clientId: moto.clientId || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.clientId || !form.brand || !form.plate || !form.model) { showError('Todos los campos marcados con * son obligatorios'); return; }
    setLoadingAction(true);
    try {
      if (editando) { await api.put(`/bikes/${editando.id}`, form); setMotos(motos.map(m => m.id === editando.id ? { ...m, ...form } : m)); success('Motocicleta actualizada'); }
      else { const { data } = await api.post('/bikes', form); setMotos([...motos, data.data || data]); success('Motocicleta creada'); }
      setShowModal(false);
    } catch (e) { showError(e.response?.data?.message || 'Error guardando'); }
    finally { setLoadingAction(false); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setLoadingAction(true);
    try { await api.delete(`/bikes/${deleteConfirm.id}`); setMotos(motos.filter(m => m.id !== deleteConfirm.id)); setDeleteConfirm(null); success('Motocicleta eliminada'); }
    catch (e) { showError(e.response?.data?.message || 'Error eliminando'); }
    finally { setLoadingAction(false); }
  };

  const renderMotoCard = (m) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="caption" color="text.secondary">Placa</Typography><Chip label={m.plate} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} /></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="caption" color="text.secondary">Marca</Typography><Typography variant="body2">{m.brand || '-'}</Typography></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="caption" color="text.secondary">Modelo</Typography><Typography variant="body2">{m.model}</Typography></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="caption" color="text.secondary">Año</Typography><Typography variant="body2">{m.year || '-'}</Typography></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="caption" color="text.secondary">Horas</Typography><Typography variant="body2">{m.hours || 0}h</Typography></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="caption" color="text.secondary">Piloto</Typography><Typography variant="body2">{m.client?.name || '-'}</Typography></Box>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box><Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>Motocicletas</Typography><Typography variant="body2" color="text.secondary">Gestiona las motocicletas</Typography></Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew} sx={{ display: { xs: 'none', sm: 'flex' } }}>Nueva</Button>
      </Box>

      <Card sx={{ mb: 3, p: 2, borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }} size="small">
          <InputLabel>Filtrar</InputLabel>
          <Select value={filterPilot} label="Filtrar" onChange={(e) => { setFilterPilot(e.target.value); setPage(1); }}>
            <MenuItem value="">Todos</MenuItem>
            {pilotos.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 2, md: 2 } }}>
          <TableCards data={motos} pagination={pagination} onPageChange={handlePageChange} onRowsPerPageChange={handleRowsPerPageChange} loading={loading}
            onEdit={openEdit} onDelete={(m) => setDeleteConfirm({ id: m.id, name: m.model })} renderItem={renderMotoCard} keyField="id">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                <TableCell sx={{ fontWeight: 600, width: 50 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 70 }}>Placa</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 70 }}>Marca</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 90 }}>Modelo</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 50 }}>Año</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 50 }}>Horas</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 90 }}>Piloto</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 70 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {motos.map((m) => (
                <TableRow key={m.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell>#{m.id}</TableCell>
                  <TableCell><Chip label={m.plate} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} /></TableCell>
                  <TableCell>{m.brand || '-'}</TableCell>
                  <TableCell>{m.model}</TableCell>
                  <TableCell>{m.year || '-'}</TableCell>
                  <TableCell>{m.hours || 0}h</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{m.client?.name || '-'}</TableCell>
                  <TableCell align="center"><Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}><IconButton size="small" onClick={() => openEdit(m)}><EditIcon /></IconButton><IconButton size="small" onClick={() => setDeleteConfirm({ id: m.id, name: m.model })}><DeleteIcon /></IconButton></Box></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableCards>
        </CardContent>
      </Card>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{editando ? 'Editar' : 'Nueva'} Motocicleta</Typography>
          <IconButton onClick={() => setShowModal(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContentMui dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Piloto *</InputLabel>
              <Select value={form.clientId} label="Piloto *" onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                {pilotos.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Placa *" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })} fullWidth required size="small" />
            <TextField label="Marca *" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} fullWidth required size="small" />
            <TextField label="Modelo *" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} fullWidth required size="small" />
            <TextField label="Año" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} fullWidth size="small" type="number" />
            <TextField label="Horas" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} fullWidth size="small" type="number" />
          </Box>
        </DialogContentMui>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setShowModal(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={loadingAction}>{loadingAction ? '...' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>¿Eliminar?</DialogTitle>
        <DialogContentMui><Typography variant="body2" color="text.secondary">¿Eliminar "{deleteConfirm?.name}"?</Typography></DialogContentMui>
        <DialogActions><Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button><Button variant="contained" onClick={handleDelete} disabled={loadingAction}>Eliminar</Button></DialogActions>
      </Dialog>

      <Fab color="primary" sx={{ position: 'fixed', right: 24, bottom: 24, display: { xs: 'flex', sm: 'none' } }} onClick={openNew}><AddIcon /></Fab>
    </Box>
  );
}

export default MotocicletasPage;