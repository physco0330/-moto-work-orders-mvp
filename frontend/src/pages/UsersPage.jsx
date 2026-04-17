import React, { useEffect, useState } from 'react';
import api from '../services/api';
import SectionTitle from '../components/SectionTitle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

function UsersPage() {
  const { user: currentUser } = useAuth();
  const { success, error: showError } = useToast();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MECANICO' });
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (e) {
      showError('No se pudo cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createUser = async (e) => {
    e.preventDefault();
    setLoadingAction('create');
    try {
      await api.post('/users', form);
      setForm({ name: '', email: '', password: '', role: 'MECANICO' });
      success('Usuario creado exitosamente');
      await load();
    } catch (e) {
      showError(e.response?.data?.message || 'No se pudo crear el usuario');
    } finally {
      setLoadingAction(null);
    }
  };

  const toggleActive = async (target) => {
    setLoadingAction(target.id);
    try {
      await api.patch(`/users/${target.id}`, { active: !target.active });
      success(`Usuario ${target.active ? 'desactivado' : 'activado'}`);
      await load();
    } catch (e) {
      showError(e.response?.data?.message || 'No se pudo actualizar el usuario');
    } finally {
      setLoadingAction(null);
    }
  };

  const changeRole = async (target, role) => {
    setLoadingAction(`role-${target.id}`);
    try {
      await api.patch(`/users/${target.id}`, { role });
      success(`Rol cambiado a ${role}`);
      await load();
    } catch (e) {
      showError(e.response?.data?.message || 'No se pudo cambiar el rol');
    } finally {
      setLoadingAction(null);
    }
  };

  const confirmToggleActive = (user) => {
    if (!user.active) {
      toggleActive(user);
    } else {
      setDeleteConfirm({ type: 'toggle', user, message: `¿Desactivar a "${user.name}"?` });
    }
  };

  const handleConfirm = async () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.type === 'toggle') {
      await toggleActive(deleteConfirm.user);
    }
    setDeleteConfirm(null);
  };

  return (
    <div>
      <SectionTitle title="Usuarios" subtitle="Administracion de accesos del sistema" />

      <div className="grid two">
        <form className="card form-stack" onSubmit={createUser}>
          <h3>Crear usuario</h3>
          <input 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            placeholder="Nombre" 
            required 
            disabled={loadingAction === 'create'}
          />
          <input 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
            placeholder="Email" 
            type="email" 
            required 
            disabled={loadingAction === 'create'}
          />
          <input 
            value={form.password} 
            onChange={(e) => setForm({ ...form, password: e.target.value })} 
            placeholder="Contraseña" 
            type="password" 
            required 
            disabled={loadingAction === 'create'}
          />
          <select 
            value={form.role} 
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            disabled={loadingAction === 'create'}
          >
            <option value="MECANICO">Mecanico</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" disabled={loadingAction === 'create'}>
            {loadingAction === 'create' ? 'Creando...' : 'Crear'}
          </button>
        </form>

        <div className="card">
          <h3>Listado</h3>
          {loading ? (
            <div className="muted">Cargando...</div>
          ) : (
            users.map((u) => (
              <div className="item-row" key={u.id}>
                <div>
                  <strong>{u.name}</strong>
                  <div className="muted">{u.email}</div>
                  <div className="muted">
                    <span className={`badge`} style={{ 
                      backgroundColor: u.role === 'ADMIN' ? '#3b82f6' : '#64748b',
                      color: '#fff',
                      marginRight: 8
                    }}>
                      {u.role}
                    </span>
                    <span className={`badge`} style={{ 
                      backgroundColor: u.active ? '#22c55e' : '#9ca3af',
                      color: '#fff'
                    }}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  {u.id === currentUser?.id && <div className="badge">Sesion actual</div>}
                </div>
                <div className="inline-actions">
                  <button 
                    type="button" 
                    onClick={() => confirmToggleActive(u)}
                    disabled={loadingAction === u.id || loadingAction === `role-${u.id}`}
                  >
                    {loadingAction === u.id ? '...' : u.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => changeRole(u, u.role === 'ADMIN' ? 'MECANICO' : 'ADMIN')}
                    disabled={loadingAction === u.id || loadingAction === `role-${u.id}`}
                  >
                    {loadingAction === `role-${u.id}` ? '...' : 'Cambiar rol'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onConfirm={handleConfirm}
        onCancel={() => setDeleteConfirm(null)}
        title="Confirmar acción"
        message={deleteConfirm?.message || '¿Estás seguro?'}
        confirmText="Confirmar"
        type="warning"
      />
    </div>
  );
}

export default UsersPage;
