import React, { useEffect, useState } from 'react';
import api from '../services/api';

function MotocicletasPage() {
  const [motos, setMotos] = useState([]);
  const [pilotos, setPilotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filterPilot, setFilterPilot] = useState('');
  const [form, setForm] = useState({ model: '', year: '', hours: '', clientId: '' });

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
      setError(e.response?.data?.message || 'Error cargando');
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditando(null);
    setForm({ model: '', year: '', hours: '', clientId: '' });
    setShowModal(true);
  };

  const openEdit = (moto) => {
    setEditando(moto);
    setForm({ 
      model: moto.model || '', 
      year: moto.year || '', 
      hours: moto.hours || '',
      clientId: moto.clientId || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editando) {
        await api.put(`/bikes/${editando.id}`, form);
        setMotos(motos.map(m => m.id === editando.id ? { ...m, ...form } : m));
      } else {
        const { data } = await api.post('/bikes', form);
        setMotos([...motos, data.data || data]);
      }
      setShowModal(false);
      setEditando(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Error guardando');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar moto?')) return;
    try {
      await api.delete(`/bikes/${id}`);
      setMotos(motos.filter(m => m.id !== id));
    } catch (e) {
      alert(e.response?.data?.message || 'Error eliminando');
    }
  };

  const filteredMotos = filterPilot 
    ? motos.filter(m => m.clientId === parseInt(filterPilot))
    : motos;

  return (
    <div className="content-grid">
      <div className="page-hero">
        <div>
          <h1 className="page-title">Motocicletas</h1>
          <p className="page-description">Gestiona las motorcycles registradas en el taller.</p>
        </div>
        <button className="button" onClick={openNew}>+ Nueva Motocicleta</button>
      </div>

      <div className="filters" style={{ marginBottom: 16 }}>
        <select 
          value={filterPilot} 
          onChange={(e) => setFilterPilot(e.target.value)}
          style={{ maxWidth: 250 }}
        >
          <option value="">Todos los pilotos</option>
          {pilotos.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {loading && <div className="card">Cargando...</div>}
      {error && <div className="alert error">{error}</div>}

      {!loading && !error && (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Modelo</th>
                <th>Año</th>
                <th>Horas</th>
                <th>Piloto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMotos.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.model}</td>
                  <td>{m.year || '-'}</td>
                  <td>{m.hours || '0'}h</td>
                  <td>{m.client?.name || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="ghost small" onClick={() => openEdit(m)}>Editar</button>
                      <button className="danger small" onClick={() => handleDelete(m.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredMotos.length && (
                <tr><td colSpan="6" className="muted" style={{ textAlign: 'center', padding: 28 }}>No hay motocicletas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editando ? 'Editar Motocicleta' : 'Nueva Motocicleta'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-stack">
                <div>
                  <label>Piloto</label>
                  <select 
                    value={form.clientId} 
                    onChange={e => setForm({...form, clientId: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar piloto...</option>
                    {pilotos.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Modelo</label>
                  <input value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="Ej: CRF 450R, YZ 250F" required />
                </div>
                <div>
                  <label>Año</label>
                  <input type="number" value={form.year || ''} onChange={e => setForm({...form, year: e.target.value})} placeholder="Año de fabricación" />
                </div>
                <div>
                  <label>Horas</label>
                  <input type="number" value={form.hours || ''} onChange={e => setForm({...form, hours: e.target.value})} placeholder="Horas de uso" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="button" onClick={handleSave}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MotocicletasPage;