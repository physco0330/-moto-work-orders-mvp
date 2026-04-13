import React, { useEffect, useState } from 'react';
import api from '../services/api';
import SectionTitle from '../components/SectionTitle';
import { useAuth } from '../context/AuthContext';

function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MECANICO' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'No se pudo cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.post('/users', form);
      setForm({ name: '', email: '', password: '', role: 'MECANICO' });
      setMessage('Usuario creado');
      await load();
    } catch (e2) {
      setError(e2.response?.data?.message || 'No se pudo crear el usuario');
    }
  };

  const toggleActive = async (target) => {
    try {
      setError('');
      await api.patch(`/users/${target.id}`, { active: !target.active });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'No se pudo actualizar el usuario');
    }
  };

  const changeRole = async (target, role) => {
    try {
      setError('');
      await api.patch(`/users/${target.id}`, { role });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'No se pudo cambiar el rol');
    }
  };

  return (
    <div>
      <SectionTitle title="Usuarios" subtitle="Administracion de accesos del sistema" />

      <div className="grid two">
        <form className="card form-stack" onSubmit={createUser}>
          <h3>Crear usuario</h3>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre" required />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" required />
          <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Contraseña" type="password" required />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="MECANICO">Mecanico</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button>Crear</button>
          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}
        </form>

        <div className="card">
          <h3>Listado</h3>
          {loading ? 'Cargando...' : users.map((u) => (
            <div className="item-row" key={u.id}>
              <div>
                <strong>{u.name}</strong>
                <div className="muted">{u.email}</div>
                <div className="muted">{u.role} | {u.active ? 'Activo' : 'Inactivo'}</div>
                {u.id === currentUser?.id && <div className="badge">Sesion actual</div>}
              </div>
              <div className="inline-actions">
                <button type="button" onClick={() => toggleActive(u)}>{u.active ? 'Desactivar' : 'Activar'}</button>
                <button type="button" onClick={() => changeRole(u, u.role === 'ADMIN' ? 'MECANICO' : 'ADMIN')}>Cambiar rol</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UsersPage;
