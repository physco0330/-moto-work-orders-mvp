import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let param = {};
        if (status) param.status = STATUS_MAP[status];
        const { data } = await api.get('/work-orders', { params: { ...param, pageSize: 50 } });
        setOrders(data.data || []);
      } catch (e) {
        setError(e.response?.data?.message || 'Error cargando órdenes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [status]);

  const handleSort = (config) => {
    setSortConfig(config);
  };

  const sortedOrders = React.useMemo(() => {
    return [...orders].sort((a, b) => {
      let aVal = getNestedValue(a, sortConfig.key);
      let bVal = getNestedValue(b, sortConfig.key);
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
  }, [orders, sortConfig]);

  return (
    <div className="content-grid">
      <div className="page-hero">
        <div>
          <h1 className="page-title">{TITLE_MAP[status] || 'Órdenes'}</h1>
          <p className="page-description">Lista de órdenes de trabajo según su estado.</p>
        </div>
        <Link to="/work-orders/new" className="button">Nueva Orden</Link>
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
                </tr>
              ))}
              {!sortedOrders.length && (
                <tr><td colSpan="5" className="muted" style={{ textAlign: 'center', padding: 28 }}>No hay órdenes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export default OrdersByStatusPage;
