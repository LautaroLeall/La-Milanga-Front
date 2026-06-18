import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import StockManager from './pages/StockManager';
import POS from './pages/POS';
import Dashboard from './pages/Dashboard';

// Componente placeholder para acceso denegado
const Unauthorized = () => (
  <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
    <h1 className="text-4xl font-bold text-red-500 mb-4">403 - Acceso Denegado</h1>
    <p>No tienes el rol necesario para ver esta pantalla.</p>
    <Link to="/dashboard" className="mt-6 text-orange-500 hover:text-orange-400 underline">Volver al inicio</Link>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Rutas Protegidas (Requieren estar logueado) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          
          {/* Rutas Protegidas (Admin y Cajero) */}
          <Route element={<ProtectedRoute allowedRoles={['Admin', 'Cajero']} />}>
            <Route path="/pos" element={<POS />} />
          </Route>

          {/* Rutas Protegidas (Admin y Stock) */}
          <Route element={<ProtectedRoute allowedRoles={['Admin', 'Stock']} />}>
            <Route path="/stock" element={<StockManager />} />
          </Route>

          {/* Redirect por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
