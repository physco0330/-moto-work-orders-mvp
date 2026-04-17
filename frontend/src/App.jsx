import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import CreateWorkOrderPage from './pages/CreateWorkOrderPage';
import WorkOrderDetailPage from './pages/WorkOrderDetailPage';
import UsersPage from './pages/UsersPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout';
import { ToastProvider } from './components/Toast';
import { useAuth } from './context/AuthContext';
import PilotosPage from './pages/PilotosPage';
import EditPilotPage from './pages/EditPilotPage';
import MotocicletasPage from './pages/MotocicletasPage';
import ItemsPage from './pages/ItemsPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import OrdersByStatusPage from './pages/OrdersByStatusPage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="app-shell center">Cargando sesion...</div>;
  }

  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/work-orders" element={<Navigate to="/dashboard" replace />} />
            <Route path="/work-orders/new" element={<CreateWorkOrderPage />} />
            <Route path="/work-orders/:id" element={<WorkOrderDetailPage />} />
            <Route path="/pilotos" element={<PilotosPage />} />
            <Route path="/pilotos/edit/:id" element={<EditPilotPage />} />
            <Route path="/motocicletas" element={<MotocicletasPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
            <Route path="/work-orders/pendientes" element={<OrdersByStatusPage status="pendientes" />} />
            <Route path="/work-orders/proceso" element={<OrdersByStatusPage status="proceso" />} />
            <Route path="/work-orders/terminados" element={<OrdersByStatusPage status="terminados" />} />
            <Route path="/work-orders/historial" element={<OrdersByStatusPage status="historial" />} />
            <Route element={<RoleRoute roles={['ADMIN']} />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
