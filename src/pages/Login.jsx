import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Utensils } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import '../styles/pages/Login.css';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(form.username, form.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Credenciales incorrectas');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box anim-page">

        {/* Logo */}
        <div className="login-header">
          <div className="login-logo-wrap">
            <Utensils size={30} className="login-logo-icon" />
          </div>
          <h1 className="font-display login-title">
            La Milanga
          </h1>
          <p className="login-subtitle">Sistema de Gestión Interna</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">

          {error && (
            <div className="anim-toast login-error-toast">
              {error}
            </div>
          )}

          {/* Usuario */}
          <div className="form-group">
            <label className="field-label">Usuario o Email</label>
            <input
              type="text"
              autoComplete="username"
              placeholder="admin / tu@email.com"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
              className="field-input"
            />
          </div>

          {/* Contraseña */}
          <div className="form-group-last">
            <label className="field-label">Contraseña</label>
            <div className="input-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                className="field-input input-with-icon"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="password-toggle"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-login"
          >
            {loading ? (
              <>
                <div className="spinner spinner-small" />
                Ingresando...
              </>
            ) : (
              'Ingresar al sistema'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
