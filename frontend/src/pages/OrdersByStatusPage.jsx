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

function OrdersByStatusPage({ status, type }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
                <th>ID</th>
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
                  <td>{order.id}</td>
                  <td><Link to={`/work-orders/${order.id}`} className="chip">{order.bike?.plate}</Link></td>
                  <td>{order.bike?.client?.name}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{order.entryDate}</td>
                  <td>${Number(order.total || 0).toFixed(2)}</td>
                </tr>
              ))}
              {!orders.length && (
                <tr><td colSpan="6" className="muted" style={{ textAlign: 'center', padding: 28 }}>No hay órdenes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OrdersByStatusPage;