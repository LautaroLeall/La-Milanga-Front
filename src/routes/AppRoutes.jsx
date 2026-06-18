import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import POS from '../pages/POS';
import StockManager from '../pages/StockManager';
import NotFound from '../pages/NotFound';
import SEO from '../components/SEO';
import '../styles/pages/Unauthorized.css';

// 403 — acceso denegado dentro de una ruta autenticada
const Unauthorized = () => (
  <>
    <SEO title="403 — Acceso denegado" />
    <div className="unauthorized-container">
      <h1 className="unauthorized-code">403</h1>
      <p className="unauthorized-desc">No tenés permiso para acceder a esta pantalla.</p>
      <a href="/dashboard" className="unauthorized-link">Volver al inicio →</a>
    </div>
  </>
);

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protegidas — todos los roles autenticados */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<><SEO title="Dashboard" /><Dashboard /></>} />
      </Route>

      {/* Protegidas — Admin y Cajero */}
      <Route element={<PrivateRoute allowedRoles={['Admin', 'Cajero']} />}>
        <Route path="/pos" element={<><SEO title="Caja (POS)" /><POS /></>} />
      </Route>

      {/* Protegidas — Admin y Stock */}
      <Route element={<PrivateRoute allowedRoles={['Admin', 'Stock']} />}>
        <Route path="/stock" element={<><SEO title="Inventario" /><StockManager /></>} />
      </Route>

      {/* Raíz → dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 — cualquier ruta desconocida */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
