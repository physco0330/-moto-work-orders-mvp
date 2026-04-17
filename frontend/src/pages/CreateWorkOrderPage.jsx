import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SectionTitle from '../components/SectionTitle';

function CreateWorkOrderPage() {
  const navigate = useNavigate();
  const [plateSearch, setPlateSearch] = useState('');
  const [bike, setBike] = useState(null);
  const [client, setClient] = useState({ name: '', phone: '', email: '' });
  const [bikeData, setBikeData] = useState({ plate: '', brand: '', model: '', cylinder: '' });
  const [faultDescription, setFaultDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [pilotos, setPilotos] = useState([]);
  const [selectedPilotId, setSelectedPilotId] = useState('');
  const [pilotName, setPilotName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [hoursRegistered, setHoursRegistered] = useState(0);
  const [systemItems, setSystemItems] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [ownItems, setOwnItems] = useState([]);
  const [newOwnItem, setNewOwnItem] = useState('');

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [clientsRes, itemsRes] = await Promise.all([
          api.get('/clients'),
          api.get('/checklist-items'),
        ]);
        setPilotos(clientsRes.data.data || clientsRes.data);
        setSystemItems(Array.isArray(itemsRes.data) ? itemsRes.data : (itemsRes.data?.data || []));
      } catch (e) {
        console.error('Error cargando datos:', e);
      }
    };
    loadInitial();
  }, []);

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

  const removeOwnItem = (index) => {
    setOwnItems(ownItems.filter((_, i) => i !== index));
  };

  const findBike = async () => {
    setLoading(true);
    setMessage('');
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
      } else {
        setMessage('No se encontro la moto. Puedes registrarla manualmente.');
      }
    } catch (e) {
      setMessage(e.response?.data?.message || 'No se pudo buscar la moto');
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
    setLoading(true);
    setMessage('');
    try {
      const payload = bike?.id
        ? { 
            motoId: bike.id, 
            faultDescription,
            pilotName: pilotName || null,
            serviceType: serviceType || null,
            hoursRegistered: Number(hoursRegistered) || 0,
            ownItems,
            checklistItemIds: checklistItems,
          }
        : {
            client,
            bike: { ...bikeData, cylinder: bikeData.cylinder === '' ? null : Number(bikeData.cylinder) },
            faultDescription,
            pilotName: pilotName || null,
            serviceType: serviceType || null,
            hoursRegistered: Number(hoursRegistered) || 0,
            ownItems,
            checklistItemIds: checklistItems,
          };

      const { data } = await api.post('/work-orders', payload);
      navigate(`/work-orders/${data.id}`);
    } catch (e) {
      setMessage(e.response?.data?.message || 'No se pudo crear la orden');
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
            Moto
            <div className="inline-form">
              <input 
                value={plateSearch} 
                onChange={(e) => setPlateSearch(e.target.value)} 
                placeholder="Ingresa la placa"
                style={{ flex: 1 }}
              />
              <button type="button" onClick={findBike} disabled={loading}>Buscar</button>
            </div>
          </label>
          {bike && <div className="alert success">Moto encontrada: {bike.plate} - {bike.client?.name}</div>}
          
          {!bike && (
            <>
              {/* <label>Cliente
                <input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} placeholder="Nombre" />
              </label>
              <label>Telefono
                <input value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} placeholder="Telefono" />
              </label>
              <label>Placa
                <input value={bikeData.plate} onChange={(e) => setBikeData({ ...bikeData, plate: e.target.value })} placeholder="Placa" />
              </label>
              <label>Marca
                <input value={bikeData.brand} onChange={(e) => setBikeData({ ...bikeData, brand: e.target.value })} placeholder="Marca" />
              </label>
              <label>Modelo
                <input value={bikeData.model} onChange={(e) => setBikeData({ ...bikeData, model: e.target.value })} placeholder="Modelo" />
              </label>
              <label>Cilindraje
                <input type="number" value={bikeData.cylinder} onChange={(e) => setBikeData({ ...bikeData, cylinder: e.target.value })} placeholder="Cilindraje" />
              </label> */}
            </>
          )}

          <label>Piloto *
            <select value={selectedPilotId} onChange={handlePilotChange} required>
              <option value="">Seleccionar piloto...</option>
              {pilotos.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label>Horas de Uso
            <input type="number" value={hoursRegistered} onChange={(e) => setHoursRegistered(e.target.value)} placeholder="Horas" />
          </label>
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>Tipo de Servicio</h3>
          <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} style={{ width: '100%' }}>
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
            />
            <button type="button" onClick={addOwnItem}>Agregar</button>
          </div>
          <div className="own-items-list">
            {ownItems.map((item, index) => (
              <div key={index} className="own-item-row">
                <span>{item}</span>
                <button type="button" className="danger small" onClick={() => removeOwnItem(index)}>Eliminar</button>
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
              />
              <span>{item.name}</span>
            </label>
          ))}
          {!systemItems.length && <p className="muted">No hay items disponibles</p>}
        </div>
      </div>

      <div>
        {message && <div className="alert">{message}</div>}
        <button disabled={loading} onClick={handleSubmit}>{loading ? 'Guardando...' : 'Crear orden'}</button>
      </div>
    </div>
  );
}

export default CreateWorkOrderPage;
