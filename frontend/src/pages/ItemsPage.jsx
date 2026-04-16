import React, { useEffect, useState } from 'react';
import api from '../services/api';

function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="content-grid">
      <div className="page-hero">
        <div>
          <h1 className="page-title">Items de Checklist</h1>
          <p className="page-description">Lista de verificación para servicios del taller.</p>
        </div>
      </div>

      {loading && <div className="card">Cargando...</div>}
      {error && <div className="alert error">{error}</div>}

      {!loading && !error && (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td><span className="badge">{item.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <button className="ghost small">Editar</button>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr><td colSpan="4" className="muted" style={{ textAlign: 'center', padding: 28 }}>No hay items registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ItemsPage;