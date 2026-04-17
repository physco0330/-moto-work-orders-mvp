import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

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

function MotocicletasPage() {
  const { success, error: showError } = useToast();
  const [motos, setMotos] = useState([]);
  const [pilotos, setPilotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filterPilot, setFilterPilot] = useState('');
  const [form, setForm] = useState({ model: '', year: '', hours: '', clientId: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [loadingAction, setLoadingAction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Error cargando');
      showError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditando(null);
    setForm({ plate: '', model: '', year: '', hours: '', clientId: '' });
    setShowModal(true);
  };

  const openEdit = (moto) => {
    setEditando(moto);
    setForm({ 
      plate: moto.plate || '',
      model: moto.model || '', 
      year: moto.year || '', 
      hours: moto.hours || '',
      clientId: moto.clientId || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setLoadingAction('saving');
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
      setLoadingAction(null);
    }
  };

  const handleDelete = async (id) => {
    setLoadingAction(id);
    try {
      await api.delete(`/bikes/${id}`);
      setMotos(motos.filter(m => m.id !== id));
      setDeleteConfirm(null);
      success('Motocicleta eliminada');
    } catch (e) {
      showError(e.response?.data?.message || 'Error eliminando');
    } finally {
      setLoadingAction(null);
    }
  };

  const filteredMotos = filterPilot 
    ? motos.filter(m => m.clientId === parseInt(filterPilot))
    : motos;

  const handleSort = (config) => {
    setSortConfig(config);
  };

  const sortedMotos = sortConfig.key
    ? [...filteredMotos].sort((a, b) => {
        let aVal = getNestedValue(a, sortConfig.key) ?? '';
        let bVal = getNestedValue(b, sortConfig.key) ?? '';
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase()) * (sortConfig.direction === 'asc' ? 1 : -1);
      })
    : filteredMotos;

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
                <SortableTh label="ID" sortKey="id" currentSort={sortConfig} onSort={handleSort} />
                <SortableTh label="Modelo" sortKey="model" currentSort={sortConfig} onSort={handleSort} />
                <SortableTh label="Año" sortKey="year" currentSort={sortConfig} onSort={handleSort} />
                <SortableTh label="Horas" sortKey="hours" currentSort={sortConfig} onSort={handleSort} />
                <SortableTh label="Piloto" sortKey="client.name" currentSort={sortConfig} onSort={handleSort} />
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedMotos.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.model}</td>
                  <td>{m.year || '-'}</td>
                  <td>{m.hours || '0'}h</td>
                  <td>{m.client?.name || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="ghost small icon-btn" 
                        onClick={() => openEdit(m)}
                        title="Editar"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button 
                        className="danger small icon-btn" 
                        onClick={() => setDeleteConfirm({ id: m.id, name: m.model })}
                        disabled={loadingAction === m.id}
                        title="Eliminar"
                      >
                        {loadingAction === m.id ? (
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
              {!sortedMotos.length && (
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
                  <label>Placa *</label>
                  <input 
                    value={form.plate || ''} 
                    onChange={e => setForm({...form, plate: e.target.value.toUpperCase()})} 
                    placeholder="Ej: ABC123" 
                    required
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label>Modelo *</label>
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
              <button className="button" onClick={handleSave} disabled={loadingAction === 'saving'}>
                {loadingAction === 'saving' ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
        title="¿Eliminar motocicleta?"
        message={`¿Estás seguro de eliminar "${deleteConfirm?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </div>
  );
}

export default MotocicletasPage;
