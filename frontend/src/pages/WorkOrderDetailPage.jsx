import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

function WorkOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [allowed, setAllowed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [newItem, setNewItem] = useState({ type: 'REPUESTO', description: '', count: 1, unitValue: 0 });
  const [actionError, setActionError] = useState('');
  const [historyMeta, setHistoryMeta] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  const [historyFilters, setHistoryFilters] = useState({ userId: '', startDate: '', endDate: '' });
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [orderRes, historyRes, transitionsRes] = await Promise.all([
        api.get(`/work-orders/${id}`),
        api.get(`/work-orders/${id}/history`, {
          params: {
            page: historyMeta.page,
            pageSize: historyMeta.pageSize,
            ...historyFilters,
          },
        }),
        api.get(`/work-orders/${id}/transitions`),
      ]);
      setOrder(orderRes.data);
      setHistory(historyRes.data.data || []);
      setHistoryMeta(historyRes.data.meta || historyMeta);
      setAllowed(transitionsRes.data.allowed || []);
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

  const changeHistoryPage = (nextPage) => {
    setHistoryMeta((current) => ({ ...current, page: nextPage }));
  };

  const clearHistoryFilters = () => {
    setHistoryFilters({ userId: '', startDate: '', endDate: '' });
    setHistoryMeta((current) => ({ ...current, page: 1 }));
  };

  if (loading) return <div className="card">Cargando detalle...</div>;
  if (error) return <div className="alert error">{error}</div>;
  if (!order) return null;

  return (
    <div className="detail-layout">
      <div className="detail-hero">
        <div>
          <div className="page-hero" style={{ marginBottom: 8 }}>
            <div>
              <h1 className="page-title">Orden #{order.id}</h1>
              <p className="page-description">{order.faultDescription}</p>
            </div>
          </div>
          <div className="detail-meta">
            <span className="chip">{order.bike?.plate}</span>
            <span className="badge">{order.bike?.client?.name}</span>
            <StatusBadge status={order.status} />
          </div>
        </div>
        <div className="summary-card" style={{ minWidth: 220 }}>
          <span className="summary-label">Total actual</span>
          <span className="summary-value">${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      {actionError && <div className="alert error">{actionError}</div>}

      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">Items</span>
          <span className="summary-value">{order.items?.length || 0}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Historial</span>
          <span className="summary-value">{historyMeta.total}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Fecha ingreso</span>
          <span className="summary-value" style={{ fontSize: 20 }}>{order.entryDate}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Rol activo</span>
          <span className="summary-value" style={{ fontSize: 20 }}>{user?.role}</span>
        </div>
      </div>

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
                <p className="card-copy">Datos principales de la orden y la unidad ingresada.</p>
              </div>
            </div>
            <div className="layout-spread">
              <div className="stat-row">
                <div className="stat-pill"><span className="muted small">Cliente</span><strong>{order.bike?.client?.name}</strong></div>
                <div className="stat-pill"><span className="muted small">Telefono</span><strong>{order.bike?.client?.phone}</strong></div>
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
                <h3 className="card-title">Acciones de estado</h3>
                <p className="card-copy">Usa solo transiciones válidas. Cada cambio queda auditado.</p>
              </div>
            </div>
            <div className="inline-actions" style={{ marginBottom: 12 }}>
              {allowed.map((status) => (
                <button key={status} type="button" onClick={() => changeStatus(status)}>{status}</button>
              ))}
            </div>
            <label>
              Nota de cambio
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows="4" placeholder="Motivo o comentario de la transición" />
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
                <p className="card-copy">Agrega repuestos o mano de obra y el total se recalcula de forma automática.</p>
              </div>
            </div>

            <form className="form-stack" onSubmit={addItem} style={{ marginBottom: 16 }}>
              <select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}>
                <option value="REPUESTO">Repuesto</option>
                <option value="MANO_OBRA">Mano de obra</option>
              </select>
              <input value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Descripcion" required />
              <div className="grid two">
                <input type="number" min="1" value={newItem.count} onChange={(e) => setNewItem({ ...newItem, count: e.target.value })} />
                <input type="number" min="0" step="0.01" value={newItem.unitValue} onChange={(e) => setNewItem({ ...newItem, unitValue: e.target.value })} />
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
                <h3 className="card-title">Resumen financiero</h3>
                <p className="card-copy">Totales y proyeccion actual de la orden.</p>
              </div>
            </div>
            <div className="summary-grid" style={{ gridTemplateColumns: '1fr', marginBottom: 0 }}>
              <div className="summary-card">
                <span className="summary-label">Total actual</span>
                <span className="summary-value">${Number(order.total).toFixed(2)}</span>
              </div>
              <div className="summary-card">
                <span className="summary-label">Items registrados</span>
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
                <h3 className="card-title">Historial de estados</h3>
                <p className="card-copy">Linea de tiempo con usuario, estado anterior, estado nuevo y nota.</p>
              </div>
            </div>
            <div className="filters" style={{ marginBottom: 16 }}>
              <input
                type="number"
                min="1"
                placeholder="Filtrar por userId"
                value={historyFilters.userId}
                onChange={(e) => setHistoryFilters((current) => ({ ...current, userId: e.target.value }))}
              />
              <input
                type="date"
                value={historyFilters.startDate}
                onChange={(e) => setHistoryFilters((current) => ({ ...current, startDate: e.target.value }))}
              />
              <input
                type="date"
                value={historyFilters.endDate}
                onChange={(e) => setHistoryFilters((current) => ({ ...current, endDate: e.target.value }))}
              />
              <button type="button" className="ghost" onClick={clearHistoryFilters}>Limpiar</button>
            </div>
            <div className="timeline">
              {history.map((event) => (
                <div className="timeline-item" key={event.id}>
                  <div className="dot" />
                  <div>
                    <strong>{event.fromStatus || 'CREACION'} → {event.toStatus}</strong>
                    <div className="muted">{new Date(event.createdAt).toLocaleString()}</div>
                    {event.note && <div>{event.note}</div>}
                    <div className="muted">Por: {event.changedBy?.name}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pagination">
              <button type="button" disabled={historyMeta.page <= 1} onClick={() => changeHistoryPage(historyMeta.page - 1)}>Anterior</button>
              <span>Página {historyMeta.page} de {historyMeta.totalPages || 1}</span>
              <button type="button" disabled={historyMeta.page >= (historyMeta.totalPages || 1)} onClick={() => changeHistoryPage(historyMeta.page + 1)}>Siguiente</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Auditoria</h3>
                <p className="card-copy">El historial es la fuente de verdad para el seguimiento de la orden.</p>
              </div>
            </div>
            <div className="layout-spread">
              <div className="stat-pill"><span className="muted small">Eventos visibles</span><strong>{history.length}</strong></div>
              <div className="stat-pill"><span className="muted small">Eventos totales</span><strong>{historyMeta.total}</strong></div>
              <div className="stat-pill"><span className="muted small">Pagina actual</span><strong>{historyMeta.page}</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkOrderDetailPage;
