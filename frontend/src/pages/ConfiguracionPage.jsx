import React from 'react';
import { useAuth } from '../context/AuthContext';

function ConfiguracionPage() {
  const { user } = useAuth();

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