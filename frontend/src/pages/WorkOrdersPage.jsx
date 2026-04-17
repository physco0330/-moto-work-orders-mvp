import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import { STATUS } from '../constants/status';

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

function WorkOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSort, setLocalSort] = useState({ key: 'id', direction: 'desc' });

  const status = searchParams.get('status') || '';
  const plate = searchParams.get('plate') || '';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/work-orders', { params: { status, plate, page, pageSize: 10 } });
        setOrders(data.data);
        setPagination({ ...data.pagination, stats: data.stats });
      } catch (e) {
        setError(e.response?.data?.message || 'Error cargando ordenes');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [status, plate, page]);

  const stats = {
    total: pagination.stats?.total || pagination.total || 0,
    recibidas: pagination.stats?.recibidas || 0,
    enProceso: pagination.stats?.enProceso || 0,
    listas: pagination.stats?.listas || 0,
  };

  const updateFilters = (next) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (!next.page) params.delete('page');
    setSearchParams(params);
  };

  const handleSort = (config) => {
    setLocalSort(config);
    const params = new URLSearchParams(searchParams);
    if (config.key) {
      params.set('sortBy', config.key);
      params.set('sortOrder', config.direction);
    } else {
      params.delete('sortBy');
      params.delete('sortOrder');
    }
    setSearchParams(params);
  };

  const sortedOrders = useMemo(() => {
    if (!localSort.key) return orders;
    return [...orders].sort((a, b) => {
      let aVal = getNestedValue(a, localSort.key);
      let bVal = getNestedValue(b, localSort.key);
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return localSort.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return localSort.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return localSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, localSort]);

  const columns = [
    { key: 'id', label: 'ID', sortKey: 'id' },
    { key: 'plate', label: 'Placa', sortKey: 'bike.plate' },
    { key: 'status', label: 'Estado', sortKey: 'status' },
    { key: 'entryDate', label: 'Fecha', sortKey: 'entryDate' },
    { key: 'total', label: 'Total', sortKey: 'total' },
  ];

  return (
    <div className="content-grid">
      <div className="page-hero">
        <div>
          <h1 className="page-title">Ordenes de trabajo</h1>
          <p className="page-description">Consulta, filtra y administra las ordenes del taller con una vista mas limpia y enfocada.</p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">Total ordenes</span>
          <span className="summary-value">{stats.total}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Recibidas</span>
          <span className="summary-value">{stats.recibidas}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">En proceso</span>
          <span className="summary-value">{stats.enProceso}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Cerradas</span>
          <span className="summary-value">{stats.listas}</span>
        </div>
      </div>

      <div className="card toolbar-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Filtros</h2>
            <p className="card-copy">Busca por placa y acota el estado para encontrar ordenes mas rapido.</p>
          </div>
        </div>

        <div className="filters">
          <div className="search-box">
            <input
              className="search-field"
              value={plate}
              onChange={(e) => updateFilters({ plate: e.target.value, page: 1 })}
              placeholder="Buscar por placa"
            />
          </div>
          <select value={status} onChange={(e) => updateFilters({ status: e.target.value, page: 1 })}>
            <option value="">Todos los estados</option>
            {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="ghost" type="button" onClick={() => updateFilters({ plate: '', status: '', page: 1 })}>
            Limpiar
          </button>
        </div>
      </div>

      {loading && <div className="card">Cargando ordenes...</div>}
      {error && <div className="alert error">{error}</div>}

      {!loading && !error && (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <SortableTh label="ID" sortKey="id" currentSort={localSort} onSort={handleSort} />
                <SortableTh label="Placa" sortKey="bike.plate" currentSort={localSort} onSort={handleSort} />
                <SortableTh label="Estado" sortKey="status" currentSort={localSort} onSort={handleSort} />
                <SortableTh label="Fecha" sortKey="entryDate" currentSort={localSort} onSort={handleSort} />
                <SortableTh label="Total" sortKey="total" currentSort={localSort} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>
                    <Link to={`/work-orders/${order.id}`} className="chip">{order.bike?.plate}</Link>
                  </td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{order.entryDate}</td>
                  <td>${Number(order.total).toFixed(2)}</td>
                </tr>
              ))}
              {!sortedOrders.length && (
                <tr><td colSpan="5" className="muted" style={{ textAlign: 'center', padding: 28 }}>No hay ordenes para mostrar</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={(nextPage) => updateFilters({ page: nextPage })} />
    </div>
  );
}

export default WorkOrdersPage;
