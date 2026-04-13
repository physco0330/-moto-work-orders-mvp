import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protege rutas por rol y muestra acceso denegado cuando aplica.
function RoleRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="app-shell center">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <div className="card">Acceso denegado</div>;

  return <Outlet />;
}

export default RoleRoute;
