import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>
      
      <aside className={`sidebar-fixed ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/logo-skm3.jpg" alt="Pavas" className="logo-img" />
        </div>
        
        <nav className="sidebar-menu">
          <NavLink to="/dashboard" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="menu-icon">📊</span>
            <span className="menu-text">Dashboard</span>
          </NavLink>
          
          <NavLink to="/pilotos" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="menu-icon">🏍️</span>
            <span className="menu-text">Pilotos</span>
          </NavLink>
          
          <NavLink to="/motocicletas" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="menu-icon">🛵</span>
            <span className="menu-text">Motocicletas</span>
          </NavLink>
          
          <NavLink to="/items" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="menu-icon">✅</span>
            <span className="menu-text">Items</span>
          </NavLink>
          
          <div className="menu-divider">Órdenes</div>
          
          <NavLink to="/work-orders/pendientes" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="menu-icon">⏳</span>
            <span className="menu-text">Pendientes</span>
          </NavLink>
          
          <NavLink to="/work-orders/proceso" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="menu-icon">🔧</span>
            <span className="menu-text">En Proceso</span>
          </NavLink>
          
          <NavLink to="/work-orders/terminados" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="menu-icon">✅</span>
            <span className="menu-text">Terminados</span>
          </NavLink>
          
          <NavLink to="/work-orders/historial" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="menu-icon">📋</span>
            <span className="menu-text">Historial</span>
          </NavLink>
          
          <div className="menu-divider">Sistema</div>
          
          <NavLink to="/work-orders" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="menu-icon">📋</span>
            <span className="menu-text">Órdenes</span>
          </NavLink>
          
          {user?.role === 'ADMIN' && (
            <NavLink to="/users" className="menu-item" onClick={() => setSidebarOpen(false)}>
              <span className="menu-icon">👥</span>
              <span className="menu-text">Usuarios</span>
            </NavLink>
          )}
          
          <NavLink to="/configuracion" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="menu-icon">⚙️</span>
            <span className="menu-text">Mi Configuración</span>
          </NavLink>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role === 'ADMIN' ? 'Administrador' : 'Mecánico'}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
      
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;