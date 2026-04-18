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
  
  const [plateSearch, setPlateSearch] = useState('');
  const [bike, setBike] = useState(null);
  const [allBikes, setAllBikes] = useState([]);
  const [client, setClient] = useState({ name: '', phone: '', email: '' });
  const [bikeData, setBikeData] = useState({ plate: '', brand: '', model: '', cylinder: '' });
  const [faultDescription, setFaultDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [pilotos, setPilotos] = useState([]);
  const [selectedPilotId, setSelectedPilotId] = useState('');
  const [pilotName, setPilotName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [hoursRegistered, setHoursRegistered] = useState(0);
  const [systemItems, setSystemItems] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [ownItems, setOwnItems] = useState([]);
  const [newOwnItem, setNewOwnItem] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const [clientsRes, itemsRes, bikesRes] = await Promise.all([
        api.get('/clients'),
        api.get('/checklist-items'),
        api.get('/bikes', { params: { pageSize: 100 } })
      ]);
      setPilotos(clientsRes.data.data || clientsRes.data);
      setSystemItems(Array.isArray(itemsRes.data) ? itemsRes.data : (itemsRes.data?.data || []));
      setAllBikes(bikesRes.data?.data || bikesRes.data || []);
    } catch (e) {
      showError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleBikeSelect = (event, selectedBike) => {
    if (selectedBike) {
      setBike(selectedBike);
      setClient({
        name: selectedBike.client?.name || '',
        phone: selectedBike.client?.phone || '',
        email: selectedBike.client?.email || '',
      });
      setBikeData({
        plate: selectedBike.plate || '',
        brand: selectedBike.brand || '',
        model: selectedBike.model || '',
        cylinder: selectedBike.cylinder || '',
      });
      setHoursRegistered(selectedBike.hours || 0);
      success(`Moto seleccionada: ${selectedBike.plate}`);
    } else {
      setBike(null);
      setBikeData({ plate: '', brand: '', model: '', cylinder: '' });
      setHoursRegistered(0);
    }
  };

  const toggleChecklistItem = (itemId) => {
    if (checklistItems.includes(itemId)) {
      setChecklistItems(checklistItems.filter(id => id !== itemId));
    } else {
      setChecklistItems([...checklistItems, itemId]);
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

  const findBike = async () => {
    if (!plateSearch.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.get('/bikes', { params: { plate: plateSearch } });
      const found = data[0] || null;
      setBike(found);
      if (found) {
        setClient({
          name: found.client?.name || '',
          phone: found.client?.phone || '',
          email: found.client?.email || '',
        });
        setBikeData({
          plate: found.plate || '',
          brand: found.brand || '',
          model: found.model || '',
          cylinder: found.cylinder || '',
        });
        success(`Moto encontrada: ${found.plate}`);
      } else {
        success('No se encontro la moto. Puedes registrarla manualmente.');
      }
    } catch (e) {
      showError(e.response?.data?.message || 'No se pudo buscar la moto');
    } finally {
      setLoading(false);
    }
  };

  const handlePilotChange = (e) => {
    const id = e.target.value;
    setSelectedPilotId(id);
    if (id) {
      const piloto = pilotos.find(p => p.id.toString() === id);
      setPilotName(piloto?.name || '');
    } else {
      setPilotName('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedPilotId) {
      showError('Debes seleccionar un piloto');
      return;
    }
    
    setLoading(true);
    try {
      let payload;
      
      if (bike?.id) {
        payload = { 
          motoId: bike.id, 
          faultDescription,
          pilotName: pilotName || null,
          serviceType: serviceType || null,
          hoursRegistered: Number(hoursRegistered) || 0,
          ownItems,
          checklistItemIds: checklistItems,
        };
      } else {
        const selectedPilot = pilotos.find(p => p.id.toString() === selectedPilotId);
        
        if (!bikeData.plate || !bikeData.model) {
          showError('Debes ingresar la placa y modelo de la moto');
          setLoading(false);
          return;
        }
        
        payload = {
          client: {
            name: selectedPilot?.name || pilotName,
            phone: selectedPilot?.phone || '',
            email: selectedPilot?.email || '',
          },
          bike: { 
            ...bikeData, 
            plate: bikeData.plate.toUpperCase(),
            cylinder: bikeData.cylinder === '' ? null : Number(bikeData.cylinder)
          },
          faultDescription,
          pilotName: selectedPilot?.name || pilotName || null,
          serviceType: serviceType || null,
          hoursRegistered: Number(hoursRegistered) || 0,
          ownItems,
          checklistItemIds: checklistItems,
        };
      }

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
      <SectionTitle title="Nuevo Servicio" subtitle="Completa el formulario de alistamiento o reparacion" />

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Datos del servicio</h3>
        <div className="form-stack">
          <label>
            Moto (buscar por placa)
            <Autocomplete
              options={allBikes}
              getOptionLabel={(option) => option.plate || ''}
              onChange={handleBikeSelect}
              renderInput={(params) => (
                <TextField {...params} placeholder="Buscar moto por placa" size="small" />
              )}
              disabled={loading}
              sx={{ marginTop: 1 }}
            />
          </label>
          {bike && <div className="alert success">Moto encontrada: {bike.plate} - {bike.client?.name}</div>}
          
          {!bike && (
            <div className="grid two" style={{ marginTop: 12 }}>
              <label>Placa *
                <input 
                  value={bikeData.plate} 
                  onChange={(e) => setBikeData({...bikeData, plate: e.target.value})} 
                  placeholder="Ej: ABC123"
                  disabled={loading}
                />
              </label>
              <label>Modelo *
                <input 
                  value={bikeData.model} 
                  onChange={(e) => setBikeData({...bikeData, model: e.target.value})} 
                  placeholder="Ej: CRF 450R"
                  disabled={loading}
                />
              </label>
            </div>
          )}

          <label>Piloto *
            <select value={selectedPilotId} onChange={handlePilotChange} required disabled={loading}>
              <option value="">Seleccionar piloto...</option>
              {pilotos.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label>Horas de Uso
            <input type="number" value={hoursRegistered} onChange={(e) => setHoursRegistered(e.target.value)} placeholder="Horas" disabled={loading} />
          </label>
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>Tipo de Servicio</h3>
          <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} style={{ width: '100%' }} disabled={loading}>
            <option value="">Seleccionar tipo...</option>
            <option value="ALISTAMIENTO">Alistamiento</option>
            <option value="REPARACION">Reparacion</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        <div className="card">
          <h3>Items Propios del Servicio</h3>
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

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Checklist de Ítems del Sistema</h3>
        <div className="checklist-grid">
          {systemItems.map(item => (
            <label key={item.id} className="checklist-item">
              <input
                type="checkbox"
                checked={checklistItems.includes(item.id)}
                onChange={() => toggleChecklistItem(item.id)}
                disabled={loading}
              />
              <span>{item.name}</span>
            </label>
          ))}
          {!systemItems.length && <p className="muted">No hay items disponibles</p>}
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
