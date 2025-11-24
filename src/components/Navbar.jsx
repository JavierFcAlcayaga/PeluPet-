import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { cart } from '../utils/cart';

const Navbar = () => {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(cart.getCount());
  const [user, setUser] = useState(null);

  useEffect(() => {
    const updateCount = () => setCartCount(cart.getCount());
    updateCount();
    window.addEventListener('cart:updated', updateCount);
    return () => window.removeEventListener('cart:updated', updateCount);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const u = raw ? JSON.parse(raw) : null;
      setUser(u);

      // Si hay token y el usuario no tiene role (o no existe), refrescar desde /auth/me
      const token = localStorage.getItem('token');
      if (token && (!u || !u.role)) {
        authAPI.getCurrentUser()
          .then((meRes) => {
            if (meRes?.data) {
              localStorage.setItem('user', JSON.stringify(meRes.data));
              setUser(meRes.data);
            }
          })
          .catch(() => {
            // Silenciar errores aquí para no romper la navegación
          });
      }
    } catch {
      setUser(null);
    }
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    try {
      authAPI.logout();
    } catch {}
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <header id="encabezado-principal">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          {/* Logo de la peluquería */}
          <Link className="navbar-brand fw-bold text-primary" to="/">
            <img src="/img/Logo.png" alt="Logo Peluquería Canina" height="40" width="120" />
          </Link>
          
          {/* Botón hamburguesa para dispositivos móviles */}
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navegacion-principal" 
            aria-controls="navegacion-principal" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          {/* Enlaces de navegación */}
          <div className="collapse navbar-collapse" id="navegacion-principal">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActive('/') ? 'active' : ''}`} 
                  to="/"
                  aria-current={isActive('/') ? 'page' : undefined}
                >
                  Inicio
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActive('/servicios') ? 'active' : ''}`} 
                  to="/servicios"
                  aria-current={isActive('/servicios') ? 'page' : undefined}
                >
                  Servicios
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActive('/nosotros') ? 'active' : ''}`} 
                  to="/nosotros"
                  aria-current={isActive('/nosotros') ? 'page' : undefined}
                >
                  Nosotros
                </Link>
              </li>
              {/* Blog oculto temporalmente */}
              {false && (
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/blog') ? 'active' : ''}`} 
                    to="/blog"
                    aria-current={isActive('/blog') ? 'page' : undefined}
                  >
                    Blog
                  </Link>
                </li>
              )}
              {user && (
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/reservas') ? 'active' : ''}`} 
                    to="/reservas"
                    aria-current={isActive('/reservas') ? 'page' : undefined}
                  >
                    Reservar
                  </Link>
                </li>
              )}
              {user?.role?.toLowerCase() === 'admin' && (
                <>
                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${isActive('/admin') ? 'active' : ''}`} 
                      to="/admin"
                      aria-current={isActive('/admin') ? 'page' : undefined}
                    >
                      Admin
                    </Link>
                  </li>
                </>
              )}
              {user && (
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/perfil') ? 'active' : ''}`} 
                    to="/perfil"
                    aria-current={isActive('/perfil') ? 'page' : undefined}
                  >
                    Perfil
                  </Link>
                </li>
              )}
              {user && (
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/mis-reservas') ? 'active' : ''}`} 
                    to="/mis-reservas"
                    aria-current={isActive('/mis-reservas') ? 'page' : undefined}
                  >
                    Mis Reservas
                  </Link>
                </li>
              )}
            </ul>
            
            {/* Enlaces de usuario */}
            <div className="d-flex align-items-center">
              <Link to="/carrito" className="btn btn-outline-secondary me-3 position-relative">
                <i className="bi bi-cart"></i>
                <span className="ms-2">Carrito</span>
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                    <span className="visually-hidden">items en carrito</span>
                  </span>
                )}
              </Link>
              {!user && (
                <>
                  <Link to="/login" className="btn btn-outline-primary me-2">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Registrarse
                  </Link>
                </>
              )}
              {user && (
                <>
                  <Link to="/perfil" className="btn btn-outline-primary me-2">
                    {user.name || 'Mi Perfil'}
                  </Link>
                  <button type="button" className="btn btn-outline-danger" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;