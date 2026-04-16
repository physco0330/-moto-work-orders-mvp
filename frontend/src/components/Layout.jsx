import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <div className="brand">
          <div className="brand-mark">P</div>
          <div className="brand-title">Pavas Taller</div>
        </div>
        <button className="user-btn" onClick={handleLogout}>🚪</button>
      </header>

      <nav className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="user-name">{user?.name}</span>
          <span className="user-role">{user?.role}</span>
        </div>
        <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>📊 <span>Dashboard</span></NavLink>
        <NavLink to="/work-orders" onClick={() => setMenuOpen(false)}>📋 <span>Órdenes</span></NavLink>
        <NavLink to="/work-orders/new" onClick={() => setMenuOpen(false)}>➕ <span>Nueva</span></NavLink>
        {user?.role === 'ADMIN' && <NavLink to="/users" onClick={() => setMenuOpen(false)}>👥 <span>Usuarios</span></NavLink>}
        <button className="logout-btn" onClick={handleLogout}>🚪 <span>Salir</span></button>
      </nav>

      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

      <main className="content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <NavLink to="/dashboard" end>📊</NavLink>
        <NavLink to="/work-orders">📋</NavLink>
        <NavLink to="/work-orders/new">➕</NavLink>
        {user?.role === 'ADMIN' && <NavLink to="/users">👥</NavLink>}
      </nav>
    </div>
  );
}

export default Layout;