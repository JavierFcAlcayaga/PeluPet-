import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { authAPI, handleAPIError } from '../utils/api';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Ajustar el modo según la ruta (/login o /register)
  useEffect(() => {
    if (location.pathname === '/register') {
      setIsLogin(false);
    } else if (location.pathname === '/login') {
      setIsLogin(true);
    }
  }, [location.pathname]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Todos los campos son obligatorios');
      return false;
    }

    if (!isLogin) {
      if (!formData.name || !formData.phone) {
        setError('Todos los campos son obligatorios');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return false;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un correo válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });

        // Xano puede responder con { authToken } o con { authToken: { token } }
        // También hay instalaciones que usan { token }
        const token = 
          response?.data?.token || 
          response?.data?.authToken || 
          response?.data?.authToken?.token;

        if (token) {
          localStorage.setItem('token', token);

          // Obtener el usuario autenticado desde /auth/me
          try {
            const meRes = await authAPI.getCurrentUser();
            if (meRes?.data) {
              localStorage.setItem('user', JSON.stringify(meRes.data));
            }
          } catch (e) {
            console.error('Error al obtener el usuario actual:', e);
          }

          setSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
          setTimeout(() => {
            window.location.href = '/perfil';
          }, 1500);
        } else {
          throw new Error('Respuesta de login inválida: falta token/authToken');
        }
      } else {
        const response = await authAPI.register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
        
        if (response.data) {
          setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
          setIsLogin(true);
          setFormData({
            email: formData.email,
            password: '',
            name: '',
            phone: '',
            confirmPassword: ''
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      const errorMessage = handleAPIError(error);
      setError(errorMessage.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  return (
    <main>
      <div className="container-fluid py-5 px-3 px-lg-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-11 col-xl-10 col-xxl-9 mx-auto login-card">
            <div className="card shadow">
              <div className="card-body p-5" style={{writingMode: 'horizontal-tb', wordBreak: 'normal', whiteSpace: 'normal'}}>
                {/* Título del formulario */}
                <div className="text-center mb-4">
                  <h1 className="h3 fw-bold login-title">
                    {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  </h1>
                  <p className="text-muted">
                    {isLogin 
                      ? 'Accede a tu cuenta para gestionar tus citas y servicios'
                      : 'Únete a PeluPet y cuida a tu mascota con nosotros'
                    }
                  </p>
                </div>

                {/* Mensajes de estado */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError('')}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {success}
                  </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} noValidate>
                  {/* Campo: Nombre (solo registro) */}
                  {!isLogin && (
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Nombre Completo</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Tu nombre completo"
                        required={!isLogin}
                      />
                    </div>
                  )}

                  {/* Campo: Correo Electrónico */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Correo Electrónico</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>

                  {/* Campo: Teléfono (solo registro) */}
                  {!isLogin && (
                    <div className="mb-3">
                      <label htmlFor="phone" className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+56 9 1234 5678"
                        required={!isLogin}
                      />
                    </div>
                  )}

                  {/* Campo: Contraseña */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Tu contraseña"
                      required
                    />
                  </div>

                  {/* Campo: Confirmar Contraseña (solo registro) */}
                  {!isLogin && (
                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirma tu contraseña"
                        required={!isLogin}
                      />
                    </div>
                  )}

                  {/* Botón de envío */}
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isLogin ? 'Iniciando...' : 'Registrando...'}
                      </>
                    ) : (
                      <>
                        <i className={`bi ${isLogin ? 'bi-box-arrow-in-right' : 'bi-person-plus'} me-2`}></i>
                        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                      </>
                    )}
                  </button>

                  {/* Enlaces adicionales */}
                  <div className="text-center">
                    {isLogin && (
                      <div className="mb-2">
                        <a href="#" className="text-decoration-none small">¿Olvidaste tu contraseña?</a>
                      </div>
                    )}
                    <div>
                      <span className="text-muted small">
                        {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                      </span>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none small"
                        onClick={toggleMode}
                      >
                        {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
                      </button>
                    </div>
                  </div>
                </form>

                 {isLogin && (
                   <div className="mt-4 p-3 bg-light rounded">
                     <h6 className="fw-bold text-muted mb-2">Credenciales de Prueba:</h6>
                     <p className="small text-muted mb-1">
                       Email: javier@gmail.com<br />
                       Contraseña: javier123
                     </p>
                     <p className="small text-muted mb-0">
                       Usa estas credenciales para probar el inicio de sesión.
                     </p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginRegister;