import { NavLink, useNavigate } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import '@styles/navbar.css';

const NavbarInferior = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('usuario')) || {};
  const userRole = user?.rol;

  const logoutSubmit = () => {
    try {
      logout();
      navigate('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="navbar-inferior">
      <ul className="inferior-list">
        
        {userRole === 'administrador' && (
          <>
            <li><NavLink to="/admin/internships">Ofertas de Práctica</NavLink></li>
            <li><NavLink to="/admin/applications">Solicitudes de Práctica</NavLink></li>
            <li><NavLink to="/users">Usuarios Registrados</NavLink></li>
          </>
        )}
        
        {userRole === 'estudiante' && (
          <>
            <li><NavLink to="/perfil">Mi Perfil</NavLink></li>
            <li><NavLink to="/available-internships">Ofertas Disponibles</NavLink></li>
            <li><NavLink to="/my-applications">Mis Solicitudes</NavLink></li>
          </>
        )}

        {userRole !== 'administrador' && userRole !== 'estudiante' && (
          <li><NavLink to="/perfil">Mi Perfil</NavLink></li>
        )}
        
        <li>
          <button onClick={logoutSubmit} className="logout-link">
            Cerrar sesión
          </button>
        </li>

      </ul>
    </nav>
  );
};

export default NavbarInferior;
