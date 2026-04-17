import React, { useEffect, useState } from 'react';
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

function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/checklist-items');
        setItems(data.data || data);
      } catch (e) {
        setError(e.response?.data?.message || 'Error cargando items');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleActive = async (item) => {
    try {
      await api.put(`/checklist-items/${item.id}`, { active: !item.active });
      setItems(items.map(i => i.id === item.id ? { ...i, active: !i.active } : i));
    } catch (e) {
      alert(e.response?.data?.message || 'Error actualizando');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    try {
      const { data } = await api.post('/checklist-items', { name: newItem.name });
      setItems([...items, data.data || data]);
      setNewItem({ name: '' });
      setShowModal(false);
    } catch (e) {
      alert(e.response?.data?.message || 'Error creando');
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
                  <td><span className="badge">{item.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="ghost small" onClick={() => handleToggleActive(item)}>
                        {item.active ? 'Desactivar' : 'Activar'}
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
                <button type="submit" className="button">Crear Ítem</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemsPage;
