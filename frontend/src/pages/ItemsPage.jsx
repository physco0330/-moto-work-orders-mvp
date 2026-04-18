import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import {
  Box, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Fab, Switch, TableSortLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

function ItemsPage() {
  const { success, error: showError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [loadingAction, setLoadingAction] = useState(null);
  const [orderBy, setOrderBy] = useState('id');
  const [order, setOrder] = useState('desc');

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

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedItems = [...items].sort((a, b) => {
    let aVal = a[orderBy] ?? '';
    let bVal = b[orderBy] ?? '';
    if (typeof aVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return order === 'asc' 
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

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
            Ítems
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lista de verificación para servicios del taller
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setShowModal(true)}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          Nuevo Ítem
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
                  <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 120 }} align="center">
                    Activar / Desactivar
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>#{item.id}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.active ? 'Activo' : 'Inactivo'} 
                        size="small" 
                        sx={{ 
                          bgcolor: item.active ? '#dcfce7' : '#f3f4f6', 
                          color: item.active ? '#16a34a' : '#6b7280',
                          fontSize: '0.75rem'
                        }} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={item.active}
                        onChange={() => handleToggleActive(item)}
                        disabled={loadingAction === item.id}
                        color="success"
                        size="small"
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

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Nuevo Ítem</Typography>
          <IconButton onClick={() => setShowModal(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ py: 1 }}>
            <TextField
              label="Nombre del ítem"
              value={form.name}
              onChange={e => setForm({ name: e.target.value })}
              fullWidth
              autoFocus
              size="small"
              placeholder="Ej: Revisión de motor"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setShowModal(false)} color="inherit">Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleCreate} 
            disabled={loadingAction === 'creating' || !form.name.trim()}
          >
            {loadingAction === 'creating' ? 'Creando...' : 'Crear Ítem'}
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

export default ItemsPage;