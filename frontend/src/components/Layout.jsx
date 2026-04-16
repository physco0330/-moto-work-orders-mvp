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
          <img src="/mecanica/logo-pavas.jpeg" alt="Pavas" className="logo-img" />
        </div>
        
        <nav className="sidebar-menu">
          <NavLink to="/dashboard" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="menu-icon">📊</span>
            <span className="menu-text">Dashboard</span>
          </NavLink>
          
          <NavLink to="/work-orders" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="menu-icon">📋</span>
            <span className="menu-text">Órdenes</span>
          </NavLink>
          
          <NavLink to="/work-orders/new" className="menu-item" onClick={() => setSidebarOpen(false)}>
            <span className="menu-icon">➕</span>
            <span className="menu-text">Nueva</span>
          </NavLink>
          
          {user?.role === 'ADMIN' && (
            <NavLink to="/users" className="menu-item" onClick={() => setSidebarOpen(false)}>
              <span className="menu-icon">👥</span>
              <span className="menu-text">Usuarios</span>
            </NavLink>
          )}
        </nav>
        
        <div className="sidebar-footer">
          <div className="brand-name">PAVAS TALLER</div>
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