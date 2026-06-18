import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import SEO from '../components/SEO';
import { Utensils, ArrowLeft, Home } from 'lucide-react';
import '../styles/pages/NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const goHome = () => navigate(user ? '/dashboard' : '/login', { replace: true });

  return (
    <>
      <SEO title="404 — Página no encontrada" />

      <div className="not-found-container">

        {/* Logo */}
        <div className="not-found-logo-wrap">
          <Utensils size={30} className="not-found-logo-icon" />
        </div>

        {/* 404 */}
        <p className="not-found-code">
          404
        </p>

        <h1 className="not-found-title">
          Página no encontrada
        </h1>

        <p className="not-found-desc">
          La dirección que ingresaste no existe o fue movida.
          Verificá la URL y volvé a intentarlo.
        </p>

        {/* Acciones */}
        <div className="not-found-actions">
          <button
            onClick={() => navigate(-1)}
            className="btn-outline"
          >
            <ArrowLeft size={16} /> Volver atrás
          </button>

          <button
            onClick={goHome}
            className="btn-solid"
          >
            <Home size={16} /> Ir al inicio
          </button>
        </div>
      </div>
    </>
  );
};

export default NotFound;
