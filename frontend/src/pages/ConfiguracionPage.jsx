import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../components/Toast';

function ConfiguracionPage() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(null);

  const handleReset = async () => {
    const confirmReset = window.confirm('¿Estás seguro de resetear la base de datos? Se eliminarán TODOS los registros.');
    if (!confirmReset) return;
    
    const secondConfirm = window.confirm('Esta acción NO se puede deshacer. ¿Continuar?');
    if (!secondConfirm) return;
    
    setLoading('reset');
    try {
      await api.post('/util/reset');
      success('Base de datos reseteada');
      window.location.reload();
    } catch (e) {
      showError(e.response?.data?.message || 'Error al resetear');
    } finally {
      setLoading(null);
    }
  };

  const handleSeed = async () => {
    const confirmSeed = window.confirm('¿Generar datos de prueba? Esto agregará registros de ejemplo.');
    if (!confirmSeed) return;
    
    setLoading('seed');
    try {
      await api.post('/util/seed');
      success('Datos de prueba generados');
      window.location.reload();
    } catch (e) {
      showError(e.response?.data?.message || 'Error al generar datos');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="content-grid">
      <div className="page-hero">
        <div>
          <h1 className="page-title">Mi Configuración</h1>
          <p className="page-description">Administra tu información personal y preferencias.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Información del Usuario</h2>
        </div>
        
        <div className="form-stack">
          <div className="grid two">
            <div>
              <label>Nombre</label>
              <input type="text" value={user?.name || ''} readOnly />
            </div>
            <div>
              <label>Email</label>
              <input type="email" value={user?.email || ''} readOnly />
            </div>
          </div>
          
          <div className="grid two">
            <div>
              <label>Rol</label>
              <input type="text" value={user?.role === 'ADMIN' ? 'Administrador' : 'Mecánico'} readOnly />
            </div>
            <div>
              <label>Estado</label>
              <input type="text" value="Activo" readOnly />
            </div>
          </div>
        </div>
      </div>

      

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Cambiar Contraseña</h2>
        </div>
        
        <div className="form-stack">
          <div>
            <label>Contraseña Actual</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <div className="grid two">
            <div>
              <label>Nueva Contraseña</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <div>
              <label>Confirmar Contraseña</label>
              <input type="password" placeholder="••••••••" />
            </div>
          </div>
          <button className="button" style={{ maxWidth: 200 }}>Actualizar Contraseña</button>
        </div>
      </div>
    </div>
  );
}

export default ConfiguracionPage;