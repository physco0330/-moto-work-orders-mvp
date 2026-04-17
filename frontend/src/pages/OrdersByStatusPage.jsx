import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

const STATUS_MAP = {
  pendientes: 'RECIBIDA',
  proceso: 'EN_PROCESO',
  terminados: 'LISTA',
  historial: 'ENTREGADA',
};

const TITLE_MAP = {
  pendientes: 'Órdenes Pendientes',
  proceso: 'Órdenes en Proceso',
  terminados: 'Órdenes Terminadas',
  historial: 'Historial de Órdenes',
};

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

function OrdersByStatusPage({ status, type }) {
  const { success, error: showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [viewOrder, setViewOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    load();
  }, [status]);

  const load = async () => {
    setLoading(true);
    try {
      let param = {};
      if (status) param.status = STATUS_MAP[status];
      const { data } = await api.get('/work-orders', { params: { ...param, pageSize: 50 } });
      const ordersData = data?.data || data;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Error cargando órdenes');
      showError('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (config) => {
    setSortConfig(config);
  };

  const handleView = async (order) => {
    setLoadingAction('view');
    try {
      const [orderRes, checklistRes, transitionsRes] = await Promise.all([
        api.get(`/work-orders/${order.id}`),
        api.get(`/work-orders/${order.id}/checklist`),
        api.get(`/work-orders/${order.id}/transitions`)
      ]);
      setOrderDetails({
        ...orderRes.data,
        checklistItems: checklistRes.data || [],
        allowed: transitionsRes.data?.allowed || []
      });
      setViewOrder(order);
    } catch (e) {
      showError('Error cargando detalles');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleChangeStatus = async (newStatus) => {
    if (!newStatus) return;
    setLoadingAction('status');
    try {
      await api.patch(`/work-orders/${viewOrder.id}/status`, { toStatus: newStatus, note: '' });
      success(`Estado cambiado a ${newStatus}`);
      setViewOrder(null);
      setOrderDetails(null);
      load();
    } catch (e) {
      showError(e.response?.data?.message || 'Error cambiando estado');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEmail = (order) => {
    success(`Enviando reporte por correo a ${order.bike?.client?.email || 'cliente'}`);
  };

  const handlePDF = (order) => {
    success(`Generando PDF para orden #${order.id}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedOrders = sortConfig.key
    ? [...orders].sort((a, b) => {
        let aVal = getNestedValue(a, sortConfig.key) ?? '';
        let bVal = getNestedValue(b, sortConfig.key) ?? '';
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase()) * (sortConfig.direction === 'asc' ? 1 : -1);
      })
    : orders;

  const showActions = status === 'terminados';

  return (
    <div className="content-grid">
      <div className="page-hero">
        <div>
          <h1 className="page-title">{TITLE_MAP[status] || 'Órdenes'}</h1>
          <p className="page-description">Lista de órdenes de trabajo según su estado.</p>
        </div>
      </div>

      {loading && <div className="card">Cargando...</div>}
      {error && <div className="alert error">{error}</div>}

      {!loading && !error && (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <SortableTh label="ID" sortKey="id" currentSort={sortConfig} onSort={handleSort} />
                <SortableTh label="Placa" sortKey="bike.plate" currentSort={sortConfig} onSort={handleSort} />
                <SortableTh label="Estado" sortKey="status" currentSort={sortConfig} onSort={handleSort} />
                <SortableTh label="Fecha" sortKey="entryDate" currentSort={sortConfig} onSort={handleSort} />
                <SortableTh label="Total" sortKey="total" currentSort={sortConfig} onSort={handleSort} />
                {showActions && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td><Link to={`/work-orders/${order.id}`} className="chip">{order.bike?.plate}</Link></td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{order.entryDate}</td>
                  <td>${Number(order.total || 0).toFixed(2)}</td>
                  {showActions && (
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="ghost small icon-btn" 
                          onClick={() => handleEmail(order)}
                          title="Enviar correo"
                          style={{ color: '#3b82f6' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                        </button>
                        <button 
                          className="ghost small icon-btn" 
                          onClick={() => handlePDF(order)}
                          title="Generar PDF"
                          style={{ color: '#ef4444' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {!sortedOrders.length && (
                <tr>
                  <td colSpan={showActions ? 6 : 5} className="muted" style={{ textAlign: 'center', padding: 28 }}>
                    No hay órdenes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewOrder && orderDetails && (
        <div className="modal-overlay" onClick={() => { setViewOrder(null); setOrderDetails(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>Servicio #{viewOrder.id}</h3>
              <button className="modal-close" onClick={() => { setViewOrder(null); setOrderDetails(null); }}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 16, color: '#6b7280', fontSize: 14 }}>
                {formatDate(viewOrder.entryDate)}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
                    {viewOrder.serviceType || 'ALISTAMIENTO'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <StatusBadge status={viewOrder.status} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>Piloto</div>
                  <div style={{ fontWeight: 'bold' }}>{viewOrder.bike?.client?.name || viewOrder.pilotName || '-'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ background: '#f3f4f6', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>Horas</div>
                  <div style={{ fontWeight: 'bold', fontSize: 18 }}>{viewOrder.hoursUsed || 0}h</div>
                </div>
                <div style={{ background: '#f3f4f6', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>H. registradas</div>
                  <div style={{ fontWeight: 'bold', fontSize: 18 }}>{viewOrder.hoursRegistered || 0}h</div>
                </div>
                <div style={{ background: '#f3f4f6', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>Total</div>
                  <div style={{ fontWeight: 'bold', fontSize: 18 }}>${Number(viewOrder.total || 0).toFixed(2)}</div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h4 style={{ marginBottom: 12, fontSize: 14, color: '#374151' }}>
                  Checklist ({orderDetails.checklistItems?.length || 0})
                </h4>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12, maxHeight: 200, overflowY: 'auto' }}>
                  {orderDetails.checklistItems?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #e5e7eb' }}>
                      <input type="checkbox" checked={item.completed || false} readOnly />
                      <span style={{ color: item.completed ? '#22c55e' : '#6b7280' }}>{item.name}</span>
                    </div>
                  ))}
                  {!orderDetails.checklistItems?.length && (
                    <div style={{ color: '#9ca3af', textAlign: 'center', padding: 12 }}>Sin items</div>
                  )}
                </div>
              </div>

              {orderDetails.allowed?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ marginBottom: 12, fontSize: 14, color: '#374151' }}>
                    Cambiar Estado
                  </h4>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {orderDetails.allowed.map((newStatus) => (
                      <button 
                        key={newStatus} 
                        className="button" 
                        onClick={() => handleChangeStatus(newStatus)}
                        disabled={loadingAction === 'status'}
                        style={{ backgroundColor: newStatus === 'LISTA' ? '#22c55e' : newStatus === 'ENTREGADA' ? '#3b82f6' : '#f59e0b' }}
                      >
                        {newStatus === 'DIAGNOSTICO' ? 'Iniciar Diagnóstico' : 
                         newStatus === 'EN_PROCESO' ? 'En Proceso' : 
                         newStatus === 'LISTA' ? 'Marcar Lista' : 
                         newStatus === 'ENTREGADA' ? 'Entregada' : newStatus}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="ghost" onClick={() => { setViewOrder(null); setOrderDetails(null); }}>Cerrar</button>
              {showActions && (
                <>
                  <button className="button" style={{ backgroundColor: '#3b82f6' }} onClick={() => handleEmail(viewOrder)}>
                    Enviar correo
                  </button>
                  <button className="button" style={{ backgroundColor: '#ef4444' }} onClick={() => handlePDF(viewOrder)}>
                    Generar PDF
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersByStatusPage;
