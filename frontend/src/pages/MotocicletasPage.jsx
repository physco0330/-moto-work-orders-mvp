import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function MotocicletasPage() {
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/bikes');
        setMotos(data.data || data);
      } catch (e) {
        setError(e.response?.data?.message || 'Error cargando motocicletas');
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
          <h1 className="page-title">Motocicletas</h1>
          <p className="page-description">Gestiona las motorcycles registradas en el taller.</p>
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
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Cliente</th>
              </tr>
            </thead>
            <tbody>
              {motos.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td><Link to={`/work-orders?plate=${m.plate}`} className="chip">{m.plate}</Link></td>
                  <td>{m.brand}</td>
                  <td>{m.model}</td>
                  <td>{m.client?.name || '-'}</td>
                </tr>
              ))}
              {!motos.length && (
                <tr><td colSpan="5" className="muted" style={{ textAlign: 'center', padding: 28 }}>No hay motocicletas registradas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MotocicletasPage;