import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

// Componente placeholder para el Dashboard
const DashboardPlaceholder = () => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Bienvenido a La Milanga</h1>
      <p className="text-gray-400">Sesión iniciada con éxito. Pronto implementaremos los módulos.</p>
    </div>
  </div>
);

// Componente placeholder para acceso denegado
const Unauthorized = () => (
  <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
    <h1 className="text-4xl font-bold text-red-500 mb-4">403 - Acceso Denegado</h1>
    <p>No tienes el rol necesario para ver esta pantalla.</p>
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
            {/* Rutas compartidas o con rol específico se agregarán aquí */}
            <Route path="/dashboard" element={<DashboardPlaceholder />} />
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
