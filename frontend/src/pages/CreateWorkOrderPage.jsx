import React, { useState } from 'react';
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const payload = bike?.id
        ? { motoId: bike.id, faultDescription }
        : {
            client,
            bike: { ...bikeData, cylinder: bikeData.cylinder === '' ? null : Number(bikeData.cylinder) },
            faultDescription,
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
      <SectionTitle title="Nueva orden" subtitle="Busca una moto existente o registra cliente y moto en el momento" />

      <div className="grid two">
        <div className="card">
          <h3>Buscar moto</h3>
          <div className="inline-form">
            <input value={plateSearch} onChange={(e) => setPlateSearch(e.target.value)} placeholder="Placa" />
            <button type="button" onClick={findBike} disabled={loading}>Buscar</button>
          </div>
          {bike && <div className="alert success">Moto encontrada: {bike.plate} - {bike.client?.name}</div>}
        </div>

        <form className="card form-stack" onSubmit={handleSubmit}>
          <h3>{bike ? 'Moto existente' : 'Registrar cliente y moto'}</h3>
          <label>Cliente
            <input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} placeholder="Nombre" required={!bike} />
          </label>
          <label>Telefono
            <input value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} placeholder="Telefono" required={!bike} />
          </label>
          <label>Email
            <input value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} placeholder="Email" />
          </label>

          {!bike && (
            <>
              <label>Placa
                <input value={bikeData.plate} onChange={(e) => setBikeData({ ...bikeData, plate: e.target.value })} required />
              </label>
              <label>Marca
                <input value={bikeData.brand} onChange={(e) => setBikeData({ ...bikeData, brand: e.target.value })} required />
              </label>
              <label>Modelo
                <input value={bikeData.model} onChange={(e) => setBikeData({ ...bikeData, model: e.target.value })} required />
              </label>
              <label>Cilindraje
                <input type="number" value={bikeData.cylinder} onChange={(e) => setBikeData({ ...bikeData, cylinder: e.target.value })} />
              </label>
            </>
          )}

          <label>Falla reportada
            <textarea value={faultDescription} onChange={(e) => setFaultDescription(e.target.value)} rows="5" required />
          </label>

          {message && <div className="alert">{message}</div>}
          <button disabled={loading}>{loading ? 'Guardando...' : 'Crear orden'}</button>
        </form>
      </div>
    </div>
  );
}

export default CreateWorkOrderPage;
