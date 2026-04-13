import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('admin@taller.com');
  const [password, setPassword] = useState('Admin12345!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/work-orders', { replace: true });
    } catch (e) {
      setError(e.response?.data?.message || 'No se pudo iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-layout">
        <aside className="auth-visual">
          <div>
            <div className="auth-kicker">Taller de motos | control operacional</div>
            <h1 className="auth-title">Gestiona ordenes con una experiencia mas limpia y profesional.</h1>
            <p className="auth-copy">
              Centraliza recepcion, diagnostico, avance, entrega e historial de cada moto con control por roles.
            </p>
          </div>

          <div className="auth-points">
            <div className="feature">
              <strong>Ordenes vivas</strong>
              <span>Seguimiento claro del estado y del total en todo momento.</span>
            </div>
            <div className="feature">
              <strong>Acceso seguro</strong>
              <span>Sesiones con JWT y permisos por rol para ADMIN y MECANICO.</span>
            </div>
            <div className="feature">
              <strong>Historial</strong>
              <span>Auditoria de cambios con usuario, fecha y nota.</span>
            </div>
            <div className="feature">
              <strong>Operacion rapida</strong>
              <span>Flujo pensado para el taller y para capturar informacion sin friccion.</span>
            </div>
          </div>
        </aside>

        <section className="auth-panel">
          <form className="card auth-card" onSubmit={handleSubmit}>
            <div className="brand" style={{ marginBottom: 18 }}>
              <div className="brand-mark">P</div>
              <div>
                <div className="brand-title">Bienvenido</div>
                <div className="brand-subtitle">Inicia sesion para continuar</div>
              </div>
            </div>

            <h2 className="auth-title" style={{ fontSize: 'clamp(28px, 3vw, 38px)', marginTop: 0 }}>Ingresar</h2>
            <p className="auth-copy" style={{ marginBottom: 22 }}>Acceso al sistema de ordenes del taller.</p>

            <div className="form-stack">
              <label>
                Email
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
              </label>
              <label>
                Contraseña
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
              </label>
            </div>

            {error && <div className="alert error" style={{ marginTop: 14 }}>{error}</div>}

            <button style={{ width: '100%', marginTop: 16 }} disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
