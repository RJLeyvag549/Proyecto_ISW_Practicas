import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import logoUBB from '@assets/logoUbb.png';
import iconoPerfil from '@assets/iconoPerfil.webp';
import '@styles/NavbarSuperior.css';

const NavbarSuperior = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('usuario')) || {};
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleViewProfile = () => {
    navigate('/perfil');
  };

  return (
    <nav className="navbar-superior">
      <div className="navbar-logo">
        <img src={logoUBB} alt="UBB" />
      </div>

      <div className="navbar-user" ref={dropdownRef}>
        <button className="user-btn" onClick={toggleDropdown}>
          <img src={iconoPerfil} alt="Perfil" className="user-icon" />
          {user?.nombreCompleto || 'Usuario'} ({user?.rol || 'Rol'})
        </button>

        {dropdownOpen && (
          <ul className="dropdown-menu">
            {user?.rol === 'estudiante' && (
              <li onClick={handleViewProfile}>Ver Perfil</li>
            )}
            <li onClick={handleLogout}>Cerrar sesión</li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default NavbarSuperior;
