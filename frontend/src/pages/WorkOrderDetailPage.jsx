import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

function WorkOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [allowed, setAllowed] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [systemItems, setSystemItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [newItem, setNewItem] = useState({ type: 'REPUESTO', description: '', count: 1, unitValue: 0 });
  const [actionError, setActionError] = useState('');
  const [historyMeta, setHistoryMeta] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  const [historyFilters, setHistoryFilters] = useState({ userId: '', startDate: '', endDate: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [newOwnItem, setNewOwnItem] = useState('');
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [orderRes, historyRes, transitionsRes, checklistRes, systemItemsRes] = await Promise.all([
        api.get(`/work-orders/${id}`),
        api.get(`/work-orders/${id}/history`, {
          params: { page: historyMeta.page, pageSize: historyMeta.pageSize, ...historyFilters },
        }),
        api.get(`/work-orders/${id}/transitions`),
        api.get(`/work-orders/${id}/checklist`),
        api.get('/checklist-items'),
      ]);
      setOrder(orderRes.data);
      setHistory(historyRes.data.data || []);
      setHistoryMeta(historyRes.data.meta || historyMeta);
      setAllowed(transitionsRes.data.allowed || []);
      setChecklistItems(checklistRes.data || []);
      setSystemItems(systemItemsRes.data || []);
      setEditForm({
        serviceType: orderRes.data.serviceType || '',
        pilotName: orderRes.data.pilotName || '',
        hoursRegistered: orderRes.data.hoursRegistered || 0,
        hoursUsed: orderRes.data.hoursUsed || 0,
      });
    } catch (e) {
      setError(e.response?.data?.message || 'No se pudo cargar la orden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id, historyMeta.page, historyMeta.pageSize, historyFilters.userId, historyFilters.startDate, historyFilters.endDate]);

  const changeStatus = async (toStatus) => {
    try {
      setActionError('');
      await api.patch(`/work-orders/${id}/status`, { toStatus, note });
      setNote('');
      await load();
    } catch (e) {
      setActionError(e.response?.data?.message || 'No se pudo cambiar el estado');
    }
  };

  const handleSaveEdit = async () => {
    try {
      await api.patch(`/work-orders/${id}`, editForm);
      setShowEditModal(false);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Error guardando');
    }
  };

  const toggleChecklistItem = async (itemId, checked) => {
    try {
      await api.post(`/work-orders/${id}/checklist`, { checklistItemId: itemId, checked });
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Error actualizando checklist');
    }
  };

  const addOwnItem = async () => {
    if (!newOwnItem.trim()) return;
    try {
      const item = { description: newOwnItem, type: 'PROPIO', count: 1, unitValue: 0 };
      await api.post(`/work-orders/${id}/items`, item);
      setNewOwnItem('');
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Error agregando item');
    }
  };

  const addItem = async (event) => {
    event.preventDefault();
    try {
      setActionError('');
      await api.post(`/work-orders/${id}/items`, {
        ...newItem,
        count: Number(newItem.count),
        unitValue: Number(newItem.unitValue),
      });
      setNewItem({ type: 'REPUESTO', description: '', count: 1, unitValue: 0 });
      await load();
    } catch (e) {
      setActionError(e.response?.data?.message || 'No se pudo añadir el item');
    }
  };

  const removeItem = async (itemId) => {
    try {
      setActionError('');
      await api.delete(`/work-orders/items/${itemId}`);
      await load();
    } catch (e) {
      setActionError(e.response?.data?.message || 'No se pudo eliminar el item');
    }
  };

  if (loading) return <div className="card">Cargando detalle...</div>;
  if (error) return <div className="alert error">{error}</div>;
  if (!order) return null;

  const isPendiente = order.status === 'RECIBIDA' || order.status === 'DIAGNOSTICO';

  return (
    <div className="detail-layout">
      <div className="detail-hero">
        <div>
          <div className="page-hero" style={{ marginBottom: 8 }}>
            <div>
              <h1 className="page-title">Servicio #{order.id}</h1>
              <p className="page-description">{order.entryDate}</p>
            </div>
          </div>
          <div className="detail-meta">
            <span className="chip">{order.bike?.plate}</span>
            <span className="badge">{order.bike?.client?.name}</span>
            <StatusBadge status={order.status} />
          </div>
        </div>
        <div className="summary-card" style={{ minWidth: 180 }}>
          <span className="summary-label">Total</span>
          <span className="summary-value">${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="summary-card">
          <span className="summary-label">Piloto</span>
          <span className="summary-value" style={{ fontSize: 18 }}>{order.pilotName || '-'}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Horas</span>
          <span className="summary-value" style={{ fontSize: 18 }}>{order.hoursRegistered}h</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">H. registradas</span>
          <span className="summary-value" style={{ fontSize: 18 }}>{order.hoursUsed}h</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Tipo</span>
          <span className="summary-value" style={{ fontSize: 18 }}>{order.serviceType || '-'}</span>
        </div>
      </div>

      {isPendiente && (
        <div className="card" style={{ marginBottom: 16 }}>
          <button className="button" onClick={() => setShowEditModal(true)}>Editar Servicio</button>
        </div>
      )}

      {activeTab === 'overview' && isPendiente && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="card-title">Checklist de Items del Sistema</h3>
          <div className="checklist-grid">
            {systemItems.map((item) => {
              const checkedItem = checklistItems.find(c => c.checklistItemId === item.id);
              return (
                <label key={item.id} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={checkedItem?.checked || false}
                    onChange={(e) => toggleChecklistItem(item.id, e.target.checked)}
                  />
                  <span>{item.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {isPendiente && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="card-title">Items Propios del Servicio</h3>
          <div className="inline-form" style={{ marginBottom: 12 }}>
            <input
              value={newOwnItem}
              onChange={(e) => setNewOwnItem(e.target.value)}
              placeholder="Nombre del ítem"
            />
            <button type="button" onClick={addOwnItem}>Agregar</button>
          </div>
          <div className="own-items-list">
            {order.items?.filter(i => i.type === 'PROPIO').map((item) => (
              <div key={item.id} className="own-item-row">
                <span>{item.description}</span>
                <button className="danger small" onClick={() => removeItem(item.id)}>Eliminar</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {actionError && <div className="alert error">{actionError}</div>}

      <div className="tab-row">
        <button type="button" className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Resumen</button>
        <button type="button" className={`tab-button ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>Items</button>
        <button type="button" className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Historial</button>
      </div>

      {activeTab === 'overview' && (
        <div className="detail-grid">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Cliente y moto</h3>
              </div>
            </div>
            <div className="layout-spread">
              <div className="stat-row">
                <div className="stat-pill"><span className="muted small">Cliente</span><strong>{order.bike?.client?.name}</strong></div>
                <div className="stat-pill"><span className="muted small">Teléfono</span><strong>{order.bike?.client?.phone}</strong></div>
              </div>
              <div className="stat-row">
                <div className="stat-pill"><span className="muted small">Moto</span><strong>{order.bike?.brand} {order.bike?.model}</strong></div>
                <div className="stat-pill"><span className="muted small">Placa</span><strong>{order.bike?.plate}</strong></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Cambiar Estado</h3>
              </div>
            </div>
            <div className="inline-actions" style={{ marginBottom: 12 }}>
              {allowed.map((status) => (
                <button key={status} type="button" onClick={() => changeStatus(status)}>{status}</button>
              ))}
            </div>
            <label>
              Nota
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows="3" placeholder="Motivo del cambio" />
            </label>
          </div>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="detail-grid">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Items de la orden</h3>
              </div>
            </div>

            <form className="form-stack" onSubmit={addItem} style={{ marginBottom: 16 }}>
              <select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}>
                <option value="REPUESTO">Repuesto</option>
                <option value="MANO_OBRA">Mano de obra</option>
              </select>
              <input value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Descripción" required />
              <div className="grid two">
                <input type="number" min="1" value={newItem.count} onChange={(e) => setNewItem({ ...newItem, count: e.target.value })} placeholder="Cantidad" />
                <input type="number" min="0" step="0.01" value={newItem.unitValue} onChange={(e) => setNewItem({ ...newItem, unitValue: e.target.value })} placeholder="Valor" />
              </div>
              <button>Añadir item</button>
            </form>

            <div className="stack">
              {order.items?.map((item) => (
                <div className="item-row" key={item.id}>
                  <div>
                    <strong>{item.description}</strong>
                    <div className="muted">{item.type} x{item.count} - ${Number(item.unitValue).toFixed(2)}</div>
                  </div>
                  {user?.role === 'ADMIN' && (
                    <button className="danger" type="button" onClick={() => removeItem(item.id)}>Eliminar</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Resumen</h3>
              </div>
            </div>
            <div className="summary-grid" style={{ gridTemplateColumns: '1fr', marginBottom: 0 }}>
              <div className="summary-card">
                <span className="summary-label">Total</span>
                <span className="summary-value">${Number(order.total).toFixed(2)}</span>
              </div>
              <div className="summary-card">
                <span className="summary-label">Items</span>
                <span className="summary-value">{order.items?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="detail-grid">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Historial</h3>
              </div>
            </div>
            <div className="filters" style={{ marginBottom: 16 }}>
              <input type="number" placeholder="userId" value={historyFilters.userId} onChange={(e) => setHistoryFilters((current) => ({ ...current, userId: e.target.value }))} />
              <input type="date" value={historyFilters.startDate} onChange={(e) => setHistoryFilters((current) => ({ ...current, startDate: e.target.value }))} />
              <input type="date" value={historyFilters.endDate} onChange={(e) => setHistoryFilters((current) => ({ ...current, endDate: e.target.value }))} />
              <button type="button" className="ghost" onClick={() => setHistoryFilters({ userId: '', startDate: '', endDate: '' })}>Limpiar</button>
            </div>
            <div className="timeline">
              {history.map((event) => (
                <div className="timeline-item" key={event.id}>
                  <div className="dot" />
                  <div>
                    <strong>{event.fromStatus || 'CREACIÓN'} → {event.toStatus}</strong>
                    <div className="muted">{new Date(event.createdAt).toLocaleString()}</div>
                    {event.note && <div>{event.note}</div>}
                    <div className="muted">Por: {event.changedBy?.name}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pagination">
              <button type="button" disabled={historyMeta.page <= 1} onClick={() => setHistoryMeta((current) => ({ ...current, page: current.page - 1 }))}>Anterior</button>
              <span>Página {historyMeta.page} de {historyMeta.totalPages || 1}</span>
              <button type="button" disabled={historyMeta.page >= (historyMeta.totalPages || 1)} onClick={() => setHistoryMeta((current) => ({ ...current, page: current.page + 1 }))}>Siguiente</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Servicio</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-stack">
                <div>
                  <label>Tipo de Servicio</label>
                  <input value={editForm.serviceType} onChange={e => setEditForm({...editForm, serviceType: e.target.value})} />
                </div>
                <div>
                  <label>Piloto</label>
                  <input value={editForm.pilotName} onChange={e => setEditForm({...editForm, pilotName: e.target.value})} />
                </div>
                <div className="grid two">
                  <div>
                    <label>Horas registradas</label>
                    <input type="number" value={editForm.hoursRegistered} onChange={e => setEditForm({...editForm, hoursRegistered: e.target.value})} />
                  </div>
                  <div>
                    <label>Horas de Uso</label>
                    <input type="number" value={editForm.hoursUsed} onChange={e => setEditForm({...editForm, hoursUsed: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="ghost" onClick={() => setShowEditModal(false)}>Cancelar</button>
              <button className="button" onClick={handleSaveEdit}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkOrderDetailPage;