import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import StockManager from './pages/StockManager';
import POS from './pages/POS';

// Componente placeholder para el Dashboard
const DashboardPlaceholder = () => (
  <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold mb-4">Bienvenido a La Milanga</h1>
      <p className="text-gray-400">Sesión iniciada con éxito. Selecciona un módulo:</p>
    </div>
    <div className="flex gap-4">
      <Link to="/pos" className="px-6 py-3 bg-orange-600 hover:bg-orange-700 border border-orange-500 rounded-xl transition-colors font-bold">
        🛒 Punto de Venta (Caja)
      </Link>
      <Link to="/stock" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors">
        📦 Gestión de Inventario
      </Link>
    </div>
  </div>
);

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
            <Route path="/dashboard" element={<DashboardPlaceholder />} />
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
