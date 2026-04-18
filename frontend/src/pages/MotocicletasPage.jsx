import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import {
  Box, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Chip, Fab, Grid, FormControl, InputLabel,
  Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import TableCards from '../components/TableCards';
import PersonIcon from '@mui/icons-material/Person';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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
    } catch (e) {
      showError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => setPage(newPage);
  const handleRowsPerPageChange = (newPageSize) => { setPageSize(newPageSize); setPage(1); };

  const filteredMotos = filterPilot 
    ? motos.filter(m => m.clientId === parseInt(filterPilot))
    : motos;

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

  const renderMotoCard = (moto) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.lighter', color: 'primary.main' }}>
          <TwoWheelerIcon />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>{moto.model}</Typography>
          <Typography variant="body2" color="text.secondary">{moto.brand} {moto.year || ''}</Typography>
        </Box>
        <Chip label={moto.plate} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          {moto.client?.name || '-'}
        </Typography>
        <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 500 }}>
          {moto.hours || 0}h
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
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
            Motocicletas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona las motorcycles registradas en el taller
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={openNew}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          Nueva Motocicleta
        </Button>
      </Box>

      <Card sx={{ mb: 3, p: 2, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }} size="small">
          <InputLabel id="filter-pilot-label">Filtrar por piloto</InputLabel>
          <Select
            labelId="filter-pilot-label"
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

      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        <CardContent sx={{ p: { xs: 1, md: 2 } }}>
          <TableCards
            data={filteredMotos}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onEdit={openEdit}
            onDelete={(m) => setDeleteConfirm({ id: m.id, name: m.model })}
            renderItem={renderMotoCard}
            keyField="id"
          >
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
              {filteredMotos.map((m) => (
                <TableRow key={m.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell>#{m.id}</TableCell>
                  <TableCell>
                    <Chip label={m.plate} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell>{m.brand || '-'}</TableCell>
                  <TableCell>{m.model}</TableCell>
                  <TableCell>{m.year || '-'}</TableCell>
                  <TableCell>{m.hours || 0}h</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{m.client?.name || '-'}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <IconButton size="small" onClick={() => openEdit(m)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteConfirm({ id: m.id, name: m.model })}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {!filteredMotos.length && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No hay motocicletas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </TableCards>
        </CardContent>
      </Card>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editando ? 'Editar Motocicleta' : 'Nueva Motocicleta'}
          </Typography>
          <IconButton onClick={() => setShowModal(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
            <FormControl fullWidth required size="small">
              <InputLabel id="pilot-select-label">Piloto</InputLabel>
              <Select
                labelId="pilot-select-label"
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
              size="small"
              placeholder="Ej: Honda, Yamaha, KTM"
            />
            <TextField
              label="Placa"
              value={form.plate}
              onChange={e => setForm({ ...form, plate: e.target.value.toUpperCase() })}
              fullWidth
              required
              size="small"
              placeholder="Ej: ABC123"
              sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' } }}
            />
            <TextField
              label="Modelo"
              value={form.model}
              onChange={e => setForm({ ...form, model: e.target.value })}
              fullWidth
              required
              size="small"
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
                  size="small"
                  placeholder="Año"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Horas"
                  type="number"
                  value={form.hours}
                  onChange={e => setForm({ ...form, hours: e.target.value })}
                  fullWidth
                  size="small"
                  placeholder="Horas"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setShowModal(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={loadingAction}>
            {loadingAction ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>¿Eliminar motocicleta?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            ¿Estás seguro de eliminar "{deleteConfirm?.name}"? Esta acción no se puede deshacer.
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
        onClick={openNew}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default MotocicletasPage;