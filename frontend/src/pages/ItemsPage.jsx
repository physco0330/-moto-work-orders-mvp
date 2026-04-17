import React, { useEffect, useState } from 'react';
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

function ItemsPage() {
  const { success, error: showError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [viewItem, setViewItem] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/checklist-items');
      setItems(data.data || data);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Error cargando items');
      showError('Error al cargar items');
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    setLoadingAction('creating');
    try {
      const { data } = await api.post('/checklist-items', { name: newItem.name });
      setItems([...items, data.data || data]);
      setNewItem({ name: '' });
      setShowModal(false);
      success('Ítem creado exitosamente');
    } catch (e) {
      showError(e.response?.data?.message || 'Error creando');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSort = (config) => {
    setSortConfig(config);
  };

  const sortedItems = sortConfig.key
    ? [...items].sort((a, b) => {
        let aVal = a[sortConfig.key] ?? '';
        let bVal = b[sortConfig.key] ?? '';
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase()) * (sortConfig.direction === 'asc' ? 1 : -1);
      })
    : items;

  return (
    <div className="content-grid">
      <div className="page-hero">
        <div>
          <h1 className="page-title">Ítems</h1>
          <p className="page-description">Lista de verificación para servicios del taller.</p>
        </div>
        <button className="button" onClick={() => setShowModal(true)}>+ Nuevo Ítem</button>
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
                <SortableTh label="Estado" sortKey="active" currentSort={sortConfig} onSort={handleSort} />
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: item.active ? '#22c55e' : '#9ca3af',
                        color: '#fff'
                      }}
                    >
                      {item.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="ghost small icon-btn" 
                        onClick={() => handleToggleActive(item)}
                        disabled={loadingAction === item.id}
                        title={item.active ? 'Desactivar' : 'Activar'}
                        style={{ color: item.active ? '#f59e0b' : '#22c55e' }}
                      >
                        {loadingAction === item.id ? (
                          <span style={{ width: 16, height: 16, border: '2px solid #ccc', borderTopColor: '#666', borderRadius: '50%', display: 'block', animation: 'spin 0.8s linear infinite' }} />
                        ) : item.active ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!sortedItems.length && (
                <tr><td colSpan="4" className="muted" style={{ textAlign: 'center', padding: 28 }}>No hay items registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Ítem</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-stack">
                  <div>
                    <label>Nombre del ítem</label>
                    <input 
                      value={newItem.name} 
                      onChange={e => setNewItem({ name: e.target.value })} 
                      placeholder="Ej: Revisión de motor"
                      autoFocus
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="button" disabled={loadingAction === 'creating'}>
                  {loadingAction === 'creating' ? 'Creando...' : 'Crear Ítem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ítem del Sistema</h3>
              <button className="modal-close" onClick={() => setViewItem(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span 
                  className="badge" 
                  style={{ 
                    backgroundColor: viewItem.active ? '#22c55e' : '#9ca3af',
                    color: '#fff'
                  }}
                >
                  {viewItem.active ? 'Activo' : 'Inactivo'}
                </span>
                <strong>{viewItem.name}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={viewItem.active} readOnly />
                <label style={{ margin: 0 }}>{viewItem.name}</label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="ghost" onClick={() => setViewItem(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemsPage;
