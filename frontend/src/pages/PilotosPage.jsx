import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

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
  const { success, error: showError } = useToast();
  const [pilotos, setPilotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPilot, setNewPilot] = useState({ name: '', phone: '', email: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [loadingAction, setLoadingAction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/clients');
      setPilotos(data.data || data);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Error cargando pilotos');
      showError('Error al cargar pilotos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoadingAction(id);
    try {
      await api.delete(`/clients/${id}`);
      setPilotos(pilotos.filter(p => p.id !== id));
      setDeleteConfirm(null);
      success('Piloto eliminado');
    } catch (e) {
      showError(e.response?.data?.message || 'Error eliminando');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPilot.name.trim() || !newPilot.phone.trim()) return;
    setLoadingAction('creating');
    try {
      const { data } = await api.post('/clients', newPilot);
      setPilotos([...pilotos, data.data || data]);
      setNewPilot({ name: '', phone: '', email: '' });
      setShowModal(false);
      success('Piloto creado exitosamente');
    } catch (e) {
      showError(e.response?.data?.message || 'Error creando');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSort = (config) => {
    setSortConfig(config);
  };

  const sortedPilotos = sortConfig.key
    ? [...pilotos].sort((a, b) => {
        let aVal = a[sortConfig.key] ?? '';
        let bVal = b[sortConfig.key] ?? '';
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase()) * (sortConfig.direction === 'asc' ? 1 : -1);
      })
    : pilotos;

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
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: '#22c55e',
                        color: '#fff'
                      }}
                    >
                      Activo
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="ghost small icon-btn" 
                        onClick={() => navigate(`/pilotos/edit/${p.id}`)}
                        title="Editar"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button 
                        className="danger small icon-btn" 
                        onClick={() => setDeleteConfirm({ id: p.id, name: p.name })}
                        disabled={loadingAction === p.id}
                        title="Eliminar"
                      >
                        {loadingAction === p.id ? (
                          <span style={{ width: 16, height: 16, border: '2px solid #ccc', borderTopColor: '#666', borderRadius: '50%', display: 'block', animation: 'spin 0.8s linear infinite' }} />
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        )}
                      </button>
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
                <button type="submit" className="button" disabled={loadingAction === 'creating'}>
                  {loadingAction === 'creating' ? 'Creando...' : 'Crear Piloto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
        title="¿Eliminar piloto?"
        message={`¿Estás seguro de eliminar a "${deleteConfirm?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </div>
  );
}

export default PilotosPage;
