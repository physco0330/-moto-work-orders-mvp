import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function EditPilotPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    loadPilot();
  }, [id]);

  const loadPilot = async () => {
    try {
      const { data } = await api.get(`/clients/${id}`);
      setForm({ name: data.name || '', phone: data.phone || '', email: data.email || '' });
    } catch (e) {
      setError('Error cargando piloto');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/clients/${id}`, form);
      navigate('/pilotos');
    } catch (e) {
      alert(e.response?.data?.message || 'Error guardando');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card">Cargando...</div>;

  return (
    <div className="content-grid">
      <div className="page-hero">
        <div>
          <h1 className="page-title">Editar Piloto</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit} className="form-stack">
          <div>
            <label>Nombre</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <label>Teléfono</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="ghost" onClick={() => navigate('/pilotos')}>Cancelar</button>
            <button type="submit" className="button primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPilotPage;