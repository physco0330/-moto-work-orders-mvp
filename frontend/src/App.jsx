import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import CreateWorkOrderPage from './pages/CreateWorkOrderPage';
import WorkOrderDetailPage from './pages/WorkOrderDetailPage';
import UsersPage from './pages/UsersPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="app-shell center">Cargando sesion...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/work-orders" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/work-orders" replace />} />
          <Route path="/work-orders" element={<WorkOrdersPage />} />
          <Route path="/work-orders/new" element={<CreateWorkOrderPage />} />
          <Route path="/work-orders/:id" element={<WorkOrderDetailPage />} />
          <Route element={<RoleRoute roles={['ADMIN']} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={user ? '/work-orders' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
