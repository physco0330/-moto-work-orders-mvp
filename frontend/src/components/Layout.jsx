import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout base con navegación y logout.
function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div>
            <div className="brand-title">Pavas Taller</div>
            <div className="brand-subtitle">Control de ordenes de trabajo</div>
          </div>
        </div>
        <nav className="nav">
          <NavLink to="/work-orders" data-icon="📋"><span className="desktop-only">Ordenes</span></NavLink>
          <NavLink to="/work-orders/new" data-icon="➕"><span className="desktop-only">Nueva orden</span></NavLink>
          {user?.role === 'ADMIN' && <NavLink to="/users" data-icon="👤"><span className="desktop-only">Usuarios</span></NavLink>}
        </nav>
        <div className="user-box">
          <span className="chip">{user?.name}</span>
          <span className="badge">{user?.role}</span>
          <button className="ghost" onClick={logout} data-icon="🚪">Salir</button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
