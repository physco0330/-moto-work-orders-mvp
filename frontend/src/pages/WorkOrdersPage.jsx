import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import { STATUS } from '../constants/status';

function WorkOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

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
        setPagination(data.pagination);
      } catch (e) {
        setError(e.response?.data?.message || 'Error cargando ordenes');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [status, plate, page]);

  const updateFilters = (next) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (!next.page) params.delete('page');
    setSearchParams(params);
  };

  const stats = {
    total: pagination.total || 0,
    recibidas: orders.filter((order) => order.status === 'RECIBIDA').length,
    enProceso: orders.filter((order) => order.status === 'EN_PROCESO' || order.status === 'DIAGNOSTICO').length,
    listas: orders.filter((order) => order.status === 'LISTA' || order.status === 'ENTREGADA').length,
  };

  return (
    <div className="content-grid">
      <div className="page-hero">
        <div>
          <h1 className="page-title">Ordenes de trabajo</h1>
          <p className="page-description">Consulta, filtra y administra las ordenes del taller con una vista mas limpia y enfocada.</p>
        </div>
        <Link className="button" to="/work-orders/new">Nueva orden</Link>
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
                <th>Placa</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/work-orders/${order.id}`} className="chip">{order.bike?.plate}</Link>
                  </td>
                  <td>{order.bike?.client?.name}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{order.entryDate}</td>
                  <td>${Number(order.total).toFixed(2)}</td>
                </tr>
              ))}
              {!orders.length && (
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
