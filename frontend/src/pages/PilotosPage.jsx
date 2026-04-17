import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function SortableTh({ label, sortKey, currentSort, onSort }) {
  const direction = currentSort.key === sortKey ? currentSort.direction : null;
  
  const handleClick = () => {
    if (currentSort.key === sortKey) {
      if (currentSort.direction === 'asc') {
        onSort({ key: sortKey, direction: 'desc' });
      } else {
        onSort({ key: null, direction: null });
      }
    } else {
      onSort({ key: sortKey, direction: 'asc' });
    }
  };

  return (
    <th onClick={handleClick} style={{ cursor: 'pointer', userSelect: 'none' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        {direction === 'asc' && <span>↑</span>}
        {direction === 'desc' && <span>↓</span>}
        {!direction && <span style={{ opacity: 0.3 }}>↕</span>}
      </span>
    </th>
  );
}

function PilotosPage() {
  const [pilotos, setPilotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPilot, setNewPilot] = useState({ name: '', phone: '', email: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/clients');
        setPilotos(data.data || data);
      } catch (e) {
        setError(e.response?.data?.message || 'Error cargando pilotos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar piloto?')) return;
    try {
      await api.delete(`/clients/${id}`);
      setPilotos(pilotos.filter(p => p.id !== id));
    } catch (e) {
      alert(e.response?.data?.message || 'Error eliminando');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPilot.name.trim() || !newPilot.phone.trim()) return;
    try {
      const { data } = await api.post('/clients', newPilot);
      setPilotos([...pilotos, data.data || data]);
      setNewPilot({ name: '', phone: '', email: '' });
      setShowModal(false);
    } catch (e) {
      alert(e.response?.data?.message || 'Error creando');
    }
  };

  const handleSort = (config) => {
    setSortConfig(config);
  };

  const sortedPilotos = useMemo(() => {
    return [...pilotos].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [pilotos, sortConfig]);

  return (
    <div className="content-grid">
      <div className="page-hero">
        <div>
          <h1 className="page-title">Pilotos</h1>
          <p className="page-description">Gestiona los pilotos registrados en el taller.</p>
        </div>
        <button className="button" onClick={() => setShowModal(true)}>+ Nuevo Piloto</button>
      </div>

      {loading && <div className="card">Cargando...</div>}
      {error && <div className="alert error">{error}</div>}

      {!loading && !error && (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <SortableTh label="ID" sortKey="id" currentSort={sortConfig} onSort={handleSort} />
                <SortableTh label="Nombre" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                <SortableTh label="Teléfono" sortKey="phone" currentSort={sortConfig} onSort={handleSort} />
                <SortableTh label="Email" sortKey="email" currentSort={sortConfig} onSort={handleSort} />
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedPilotos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.phone}</td>
                  <td>{p.email || '-'}</td>
                  <td><span className="badge">Activo</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="ghost small" onClick={() => navigate(`/pilotos/edit/${p.id}`)}>Editar</button>
                      <button className="danger small" onClick={() => handleDelete(p.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!sortedPilotos.length && (
                <tr><td colSpan="6" className="muted" style={{ textAlign: 'center', padding: 28 }}>No hay pilotos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Piloto</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-stack">
                  <div>
                    <label>Nombre</label>
                    <input value={newPilot.name} onChange={e => setNewPilot({...newPilot, name: e.target.value})} placeholder="Nombre completo" required />
                  </div>
                  <div>
                    <label>Teléfono</label>
                    <input value={newPilot.phone} onChange={e => setNewPilot({...newPilot, phone: e.target.value})} placeholder="Teléfono" required />
                  </div>
                  <div>
                    <label>Email</label>
                    <input type="email" value={newPilot.email} onChange={e => setNewPilot({...newPilot, email: e.target.value})} placeholder="Email (opcional)" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="button">Crear Piloto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PilotosPage;
