import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import {
  Box, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Fab, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bikesRes, clientsRes] = await Promise.all([
        api.get('/bikes'),
        api.get('/clients')
      ]);
      setMotos(bikesRes.data.data || bikesRes.data);
      setPilotos(clientsRes.data.data || clientsRes.data);
    } catch (e) {
      showError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditando(null);
    setForm({ brand: '', plate: '', model: '', year: '', hours: '', clientId: '' });
    setShowModal(true);
  };

  const openEdit = (moto) => {
    setEditando(moto);
    setForm({
      brand: moto.brand || '',
      plate: moto.plate || '',
      model: moto.model || '',
      year: moto.year || '',
      hours: moto.hours || '',
      clientId: moto.clientId || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.clientId || !form.brand || !form.plate || !form.model) {
      showError('Todos los campos marcados con * son obligatorios');
      return;
    }

    setLoadingAction(true);
    try {
      if (editando) {
        await api.put(`/bikes/${editando.id}`, form);
        setMotos(motos.map(m => m.id === editando.id ? { ...m, ...form } : m));
        success('Motocicleta actualizada');
      } else {
        const { data } = await api.post('/bikes', form);
        setMotos([...motos, data.data || data]);
        success('Motocicleta creada');
      }
      setShowModal(false);
      setEditando(null);
    } catch (e) {
      showError(e.response?.data?.message || 'Error guardando');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setLoadingAction(true);
    try {
      await api.delete(`/bikes/${deleteConfirm.id}`);
      setMotos(motos.filter(m => m.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      success('Motocicleta eliminada');
    } catch (e) {
      showError(e.response?.data?.message || 'Error eliminando');
    } finally {
      setLoadingAction(false);
    }
  };

  const filteredMotos = filterPilot
    ? motos.filter(m => m.clientId === parseInt(filterPilot))
    : motos;

  return (
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Motocicletas</Typography>
          <Typography variant="body2" color="text.secondary">Gestiona las motorcycles registradas en el taller</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          Nueva Motocicleta
        </Button>
      </Box>

      <Card sx={{ mb: 3, p: 2, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Filtrar por piloto</InputLabel>
          <Select
            value={filterPilot}
            label="Filtrar por piloto"
            onChange={(e) => setFilterPilot(e.target.value)}
          >
            <MenuItem value="">Todos los pilotos</MenuItem>
            {pilotos.map(p => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Placa</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Marca</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Modelo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Año</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Horas</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Piloto</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMotos.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>#{m.id}</TableCell>
                    <TableCell>
                      <Chip label={m.plate} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>{m.brand || '-'}</TableCell>
                    <TableCell>{m.model}</TableCell>
                    <TableCell>{m.year || '-'}</TableCell>
                    <TableCell>{m.hours || '0'}h</TableCell>
                    <TableCell>{m.client?.name || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(m)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteConfirm({ id: m.id, name: m.model })}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredMotos.length && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay motocicletas
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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editando ? 'Editar Motocicleta' : 'Nueva Motocicleta'}
          </Typography>
          <IconButton onClick={() => setShowModal(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Piloto</InputLabel>
              <Select
                value={form.clientId}
                label="Piloto"
                onChange={e => setForm({ ...form, clientId: e.target.value })}
              >
                {pilotos.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Marca"
              value={form.brand}
              onChange={e => setForm({ ...form, brand: e.target.value })}
              fullWidth
              required
              placeholder="Ej: Honda, Yamaha, KTM"
            />
            <TextField
              label="Placa"
              value={form.plate}
              onChange={e => setForm({ ...form, plate: e.target.value.toUpperCase() })}
              fullWidth
              required
              placeholder="Ej: ABC123"
              sx={{ '& input': { textTransform: 'uppercase' } }}
            />
            <TextField
              label="Modelo"
              value={form.model}
              onChange={e => setForm({ ...form, model: e.target.value })}
              fullWidth
              required
              placeholder="Ej: CRF 450R, YZ 250F"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Año"
                  type="number"
                  value={form.year}
                  onChange={e => setForm({ ...form, year: e.target.value })}
                  fullWidth
                  placeholder="Año de fabricación"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Horas"
                  type="number"
                  value={form.hours}
                  onChange={e => setForm({ ...form, hours: e.target.value })}
                  fullWidth
                  placeholder="Horas de uso"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={loadingAction}>
            {loadingAction ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>¿Eliminar motocicleta?</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de eliminar "{deleteConfirm?.name}"? Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={loadingAction}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Fab color="primary" sx={{ position: 'fixed', right: 24, bottom: 24 }} onClick={openNew}>
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default MotocicletasPage;