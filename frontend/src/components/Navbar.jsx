import { NavLink, useNavigate } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import '@styles/navbar.css';
import { useState } from "react";

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('usuario')) || '';
    const userRole = user?.rol;
    const [mobileOpen, setMobileOpen] = useState(false);

    const logoutSubmit = () => {
        try {
            logout();
            navigate('/auth');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const closeMobile = () => setMobileOpen(false);

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="nav-left">
                    <NavLink to="/home" className="logo">
                        <span className="logo-mark">✶</span>
                        <span className="logo-text">Proyecto ISW</span>
                    </NavLink>
                </div>

                <div className={`nav-center ${mobileOpen ? 'open' : ''}`}>
                    <ul>
                        <li>
                            <NavLink to="/home" className={({isActive}) => isActive ? 'active' : ''} onClick={closeMobile}>
                                Inicio
                            </NavLink>
                        </li>

                        {(userRole === 'administrador' || userRole === 'coordinador') && (
                            <li>
                                <NavLink to="/users" className={({isActive}) => isActive ? 'active' : ''} onClick={closeMobile}>
                                    Usuarios
                                </NavLink>
                            </li>
                        )}

                        {(userRole === 'administrador' || userRole === 'coordinador') && (
                            <li>
                                <NavLink to="/admin/requests" className={({isActive}) => isActive ? 'active' : ''} onClick={closeMobile}>
                                    Solicitudes
                                </NavLink>
                            </li>
                        )}

                        <li>
                            <button className="link-like" onClick={() => { logoutSubmit(); closeMobile(); }}>
                                Cerrar sesión
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="nav-right">
                    {/* Optionally show username or other controls here */}
                </div>

                <button className={`hamburger ${mobileOpen ? 'is-open' : ''}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;