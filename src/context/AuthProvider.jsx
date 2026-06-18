import { useState, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

/**
 * Decodifica el payload de un JWT sin librería externa.
 * No verifica la firma — solo extrae los datos del cliente.
 */
const decodeJWT = (token) => {
  try {
    const payload = token.split('.')[1];
    // Base64url → Base64 → JSON
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const isTokenExpired = (decoded) => {
  if (!decoded?.exp) return true;
  return Date.now() >= decoded.exp * 1000;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('token');

    if (!token) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    // 1. Decodificar JWT localmente (instantáneo, sin red)
    const decoded = decodeJWT(token);

    if (!decoded || isTokenExpired(decoded)) {
      // Token inválido o expirado → limpiar sesión
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    // 2. Restaurar sesión inmediatamente desde localStorage (sin esperar al servidor)
    //    Evita el destello blanco de "no autenticado" en iOS / Render cold start
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        if (!cancelled) Promise.resolve().then(() => setUser(JSON.parse(cachedUser)));
      } catch {
        // JSON corrupto — ignorar y seguir con la validación remota
      }
    }

    // 3. Validar en segundo plano con el servidor
    //    Si el backend responde, actualizar el usuario.
    //    Si falla por red (cold start, timeout) → NO cerrar sesión.
    //    Solo cerrar sesión en 401 (token explícitamente rechazado).
    Promise.resolve().then(() => setLoading(false)); // No bloquear la UI mientras llega la respuesta

    api.get('/auth/me')
      .then(res => {
        if (!cancelled) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      })
      .catch(err => {
        // Solo desloguear si el servidor dice explícitamente que el token es inválido (401)
        if (!cancelled && err?.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
        // Cualquier otro error (red, timeout, 500) → mantener la sesión local
      });

    return () => { cancelled = true; };
  }, []);

  const login = async (username, password) => {
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user)); // caché local
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Error al iniciar sesión' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
