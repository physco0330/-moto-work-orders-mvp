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
          <NavLink to="/work-orders">Ordenes</NavLink>
          <NavLink to="/work-orders/new">Nueva orden</NavLink>
          {user?.role === 'ADMIN' && <NavLink to="/users">Usuarios</NavLink>}
        </nav>
        <div className="user-box">
          <span className="chip">{user?.name}</span>
          <span className="badge">{user?.role}</span>
          <button className="ghost" onClick={logout}>Salir</button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
