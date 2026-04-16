import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function MotocicletasPage() {
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ plate: '', brand: '', model: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/bikes');
        setMotos(data.data || data);
      } catch (e) {
        setError(e.response?.data?.message || 'Error cargando motocicletas');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openEdit = (moto) => {
    setEditando(moto);
    setForm({ plate: moto.plate, brand: moto.brand, model: moto.model });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await api.put(`/bikes/${editando.id}`, form);
      setMotos(motos.map(m => m.id === editando.id ? { ...m, ...form } : m));
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

  return (
    <div className="content-grid">
      <div className="page-hero">
        <div>
          <h1 className="page-title">Motocicletas</h1>
          <p className="page-description">Gestiona las motorcycles registradas en el taller.</p>
        </div>
      </div>

      {loading && <div className="card">Cargando...</div>}
      {error && <div className="alert error">{error}</div>}

      {!loading && !error && (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Cliente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {motos.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td><Link to={`/work-orders?plate=${m.plate}`} className="chip">{m.plate}</Link></td>
                  <td>{m.brand}</td>
                  <td>{m.model}</td>
                  <td>{m.client?.name || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="ghost small" onClick={() => openEdit(m)}>Editar</button>
                      <button className="danger small" onClick={() => handleDelete(m.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!motos.length && (
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
              <h3>Editar Motocicleta</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-stack">
                <div>
                  <label>Placa</label>
                  <input value={form.plate} onChange={e => setForm({...form, plate: e.target.value})} />
                </div>
                <div>
                  <label>Marca</label>
                  <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
                </div>
                <div>
                  <label>Modelo</label>
                  <input value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
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