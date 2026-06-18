import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { showAlert } from '../utils/alert';
import '../styles/components/Navbar.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Cajero', 'Stock'] },
  { to: '/pos', label: 'Caja (POS)', icon: ShoppingCart, roles: ['Admin', 'Cajero'] },
  { to: '/stock', label: 'Inventario', icon: Package, roles: ['Admin', 'Stock'] },
];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    showAlert.fire({
      title: '¿Cerrar sesión?',
      text: 'Tendrás que volver a ingresar tus credenciales.',
      icon: 'question',
      iconColor: '#f97316',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444', // Rojo para salir
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  };
  const visible = NAV_ITEMS.filter(i => i.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>
          La <span>Milanga</span>
        </h1>
        <p>Sistema de Gestión</p>
      </div>

      <nav className="sidebar-nav">
        {visible.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="sidebar-user-text">
            <p className="sidebar-user-name">
              {user?.username}
            </p>
            <p className="sidebar-user-role">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="nav-link nav-link-logout">
          <LogOut size={17} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
