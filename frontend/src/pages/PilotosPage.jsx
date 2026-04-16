import React, { useEffect, useState } from 'react';
import api from '../services/api';

function PilotosPage() {
  const [pilotos, setPilotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/clients');
        setPilotos(data.data || data);
      } catch (e) {
        setError(e.response?.data?.message || 'Error cargando pilotos');
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
          <h1 className="page-title">Pilotos</h1>
          <p className="page-description">Gestiona los pilotos registrados en el taller.</p>
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
                <th>Teléfono</th>
                <th>Email</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pilotos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.phone}</td>
                  <td>{p.email || '-'}</td>
                  <td><span className="badge">Activo</span></td>
                </tr>
              ))}
              {!pilotos.length && (
                <tr><td colSpan="5" className="muted" style={{ textAlign: 'center', padding: 28 }}>No hay pilotos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PilotosPage;