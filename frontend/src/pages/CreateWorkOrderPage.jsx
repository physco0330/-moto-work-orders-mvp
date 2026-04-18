import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SectionTitle from '../components/SectionTitle';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

function CreateWorkOrderPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [pilotos, setPilotos] = useState([]);
  const [selectedPilot, setSelectedPilot] = useState(null);
  const [allBikes, setAllBikes] = useState([]);
  const [selectedBike, setSelectedBike] = useState(null);
  const [serviceType, setServiceType] = useState('');
  const [hoursUsed, setHoursUsed] = useState(0);
  const [ownItems, setOwnItems] = useState([]);
  const [newOwnItem, setNewOwnItem] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const [clientsRes, bikesRes] = await Promise.all([
        api.get('/clients'),
        api.get('/bikes', { params: { pageSize: 100 } })
      ]);
      setPilotos(clientsRes.data.data || clientsRes.data);
      setAllBikes(bikesRes.data?.data || bikesRes.data || []);
    } catch (e) {
      showError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handlePilotSelect = (event, selectedPilot) => {
    if (selectedPilot) {
      setSelectedPilot(selectedPilot);
      const pilotBikes = allBikes.filter(b => b.clientId === selectedPilot.id || b.client?.id === selectedPilot.id);
      if (pilotBikes.length > 0) {
        setSelectedBike(pilotBikes[0]);
        setHoursUsed(pilotBikes[0].hours || 0);
        success(`Moto cargada: ${pilotBikes[0].plate} - ${pilotBikes[0].hours || 0} horas`);
      } else {
        setSelectedBike(null);
        setHoursUsed(0);
      }
    } else {
      setSelectedPilot(null);
      setSelectedBike(null);
      setHoursUsed(0);
    }
  };

  const handleBikeSelect = (event, selectedBike) => {
    if (selectedBike) {
      setSelectedBike(selectedBike);
      setHoursUsed(selectedBike.hours || 0);
      success(`Moto seleccionada: ${selectedBike.plate}`);
    } else {
      setSelectedBike(null);
      setHoursUsed(0);
    }
  };

  const addOwnItem = () => {
    if (!newOwnItem.trim()) return;
    setOwnItems([...ownItems, newOwnItem]);
    setNewOwnItem('');
  };

  const confirmRemoveOwnItem = (index, itemName) => {
    setDeleteConfirm({ type: 'ownItem', index, name: itemName });
  };

  const removeOwnItem = () => {
    if (!deleteConfirm) return;
    setOwnItems(ownItems.filter((_, i) => i !== deleteConfirm.index));
    setDeleteConfirm(null);
    success('Item eliminado');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedPilot) {
      showError('Debes seleccionar un piloto');
      return;
    }
    
    if (!selectedBike) {
      showError('Debes seleccionar una moto');
      return;
    }
    
    setLoading(true);
    try {
      const payload = { 
        motoId: selectedBike.id, 
        pilotName: selectedPilot.name,
        serviceType: serviceType || null,
        hoursUsed: Number(hoursUsed) || 0,
        ownItems,
      };

      const { data } = await api.post('/work-orders', payload);
      success('Orden creada exitosamente');
      navigate(`/work-orders/${data.id}`);
    } catch (e) {
      showError(e.response?.data?.message || 'No se pudo crear la orden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionTitle title="Nuevo Servicio" subtitle="Completa el formulario de servicio" />

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Datos del servicio</h3>
        <div className="form-stack">
          <label>
            Piloto *
            <Autocomplete
              options={pilotos.filter(p => p.active !== false)}
              getOptionLabel={(option) => option.name || ''}
              onChange={handlePilotSelect}
              renderInput={(params) => (
                <TextField {...params} placeholder="Buscar piloto" size="small" />
              )}
              disabled={loading}
              sx={{ marginTop: 1 }}
            />
          </label>
          
          <label>
            Moto *
            <Autocomplete
              options={allBikes}
              getOptionLabel={(option) => option.plate || ''}
              onChange={handleBikeSelect}
              renderInput={(params) => (
                <TextField {...params} placeholder="Buscar moto por placa" size="small" />
              )}
              disabled={loading}
              sx={{ marginTop: 1 }}
              value={selectedBike}
            />
          </label>
          
          {selectedBike && (
            <div className="alert success">
              {selectedBike.plate} - {selectedBike.brand} {selectedBike.model} - {selectedBike.hours || 0} horas
            </div>
          )}
          
          <label>
            Horas de Uso *
            <input 
              type="number" 
              value={hoursUsed} 
              onChange={(e) => setHoursUsed(e.target.value)} 
              placeholder="Horas"
              disabled={loading} 
            />
          </label>
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>ALISTAMIENTO</h3>
          <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} style={{ width: '100%' }} disabled={loading}>
            <option value="">Tipo de Servicio *</option>
            <option value="ALISTAMIENTO">Alistamiento</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="REPARACION">Reparación</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        <div className="card">
          <h3>Ítems Propios del Servicio</h3>
          <div className="inline-form" style={{ marginBottom: 12 }}>
            <input
              value={newOwnItem}
              onChange={(e) => setNewOwnItem(e.target.value)}
              placeholder="Nombre del ítem"
              disabled={loading}
            />
            <button type="button" onClick={addOwnItem} disabled={loading || !newOwnItem.trim()}>
              {loading ? '...' : 'Agregar'}
            </button>
          </div>
          <div className="own-items-list">
            {ownItems.map((item, index) => (
              <div key={index} className="own-item-row">
                <span>{item}</span>
                <button 
                  type="button" 
                  className="danger small" 
                  onClick={() => confirmRemoveOwnItem(index, item)}
                  disabled={loading}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <button disabled={loading} onClick={handleSubmit}>
          {loading ? 'Creando...' : 'Crear orden'}
        </button>
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onConfirm={removeOwnItem}
        onCancel={() => setDeleteConfirm(null)}
        title="¿Eliminar item?"
        message={`¿Estás seguro de eliminar "${deleteConfirm?.name}"?`}
        confirmText="Eliminar"
      />
    </div>
  );
}

export default CreateWorkOrderPage;