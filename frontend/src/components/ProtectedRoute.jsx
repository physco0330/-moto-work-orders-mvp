import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Bloquea acceso si no hay sesion valida.
function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="app-shell center">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export default ProtectedRoute;
