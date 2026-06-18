import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-8 text-center">Cargando la aplicación...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se envían allowedRoles y el usuario no los tiene, redirigir a unauthorized o al home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
